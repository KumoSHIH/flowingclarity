import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SiteFooter from '../../app/components/SiteFooter.vue'
import { siteSettingsFixture, minimalSiteSettingsFixture, longSiteSettingsFixture } from '../../app/fixtures/siteSettings'

const Link = defineComponent({ props: ['to'], template: '<a :href="to"><slot /></a>' })
let intersect: (entries: { isIntersecting: boolean }[]) => void
let motionChanged: () => void
let media: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> }
const disconnect = vi.fn()
const wrappers: ReturnType<typeof mount>[] = []
function render(content = siteSettingsFixture, currentPath = '/') {
  const wrapper = mount(SiteFooter, { props: { content, currentPath }, global: { stubs: { NuxtLink: Link } } })
  wrappers.push(wrapper)
  return wrapper
}
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof intersect) { intersect = callback }
    observe() {}
    disconnect = disconnect
  })
  media = { matches: false, addEventListener: vi.fn((_event, callback) => { motionChanged = callback }), removeEventListener: vi.fn() }
  vi.stubGlobal('matchMedia', vi.fn(() => media))
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('SiteFooter', () => {
  it('renders five shared destinations and contact actions', () => {
    const wrapper = render(siteSettingsFixture, '/course')
    expect(wrapper.element.tagName).toBe('FOOTER')
    expect(wrapper.findAll('nav a').map(link => link.attributes('href'))).toEqual(['/events', '/course', '/session', '/articles', '/about'])
    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
    expect(wrapper.get('[aria-current="page"]').text()).toBe('課程探索')
    expect(wrapper.get('a[href^="tel:"]').attributes('href')).toBe('tel:+886934031389')
    expect(wrapper.get('a[href^="mailto:"]').attributes('href')).toBe('mailto:nancypune@hotmail.com')
    expect(wrapper.find('a[href="#"]').exists()).toBe(false)
  })
  it('omits empty contact collections and retains readable branding without a logo', () => {
    const wrapper = render(minimalSiteSettingsFixture)
    expect(wrapper.find('address').exists()).toBe(false)
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain(minimalSiteSettingsFixture.brandName)
    expect(wrapper.findAll('nav a')).toHaveLength(5)
    expect(wrapper.find('[aria-current]').exists()).toBe(false)
  })
  it('falls back to brand text if the logo fails to load', async () => {
    const wrapper = render()
    await wrapper.get('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('.site-footer__brand-name').text()).toBe(siteSettingsFixture.brandName)
  })
  it('preserves long content and all supplied social links', () => {
    const wrapper = render(longSiteSettingsFixture)
    expect(wrapper.text()).toContain(longSiteSettingsFixture.contact!.email)
    expect(wrapper.findAll('address a[href^="https:"]')).toHaveLength(4)
  })
  it('runs only while intersecting and visible, responds to reduced motion, and cleans up', async () => {
    const removeListener = vi.spyOn(document, 'removeEventListener')
    const wrapper = render()
    expect(wrapper.classes()).not.toContain('is-flowing')
    intersect([{ isIntersecting: true }])
    await nextTick()
    expect(wrapper.classes()).toContain('is-flowing')
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    intersect([{ isIntersecting: true }])
    await nextTick()
    expect(wrapper.classes()).not.toContain('is-flowing')
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    media.matches = true
    motionChanged()
    await nextTick()
    expect(wrapper.find('.site-footer__dots').exists()).toBe(false)
    expect(wrapper.findAll('.site-footer__line')).toHaveLength(3)
    media.matches = false
    motionChanged()
    intersect([{ isIntersecting: false }])
    await nextTick()
    expect(wrapper.classes()).not.toContain('is-flowing')
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
    expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
