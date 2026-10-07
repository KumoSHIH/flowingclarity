import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import IndexPage from '../../app/pages/index.vue'
import SiteHeader from '../../app/components/SiteHeader.vue'

const componentStubs = {
  SiteHeader,
  HomeBanner: true,
  HomeIntroduction: true,
  HomeEvents: true,
  HomeCourses: true,
  HomeContact: true,
  SiteFooter: true,
}

describe('home page mobile navigation', () => {
  beforeEach(() => {
    vi.stubGlobal('useFetch', vi.fn(() => ({ data: ref(null) })))
    vi.stubGlobal('IntersectionObserver', class {
      observe = vi.fn()
      disconnect = vi.fn()
    })

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  afterEach(() => {
    document.documentElement.classList.remove('home-menu-open')
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('toggles the menu and page scroll lock', async () => {
    const wrapper = mount(IndexPage, {
      attachTo: document.body,
      global: { stubs: componentStubs },
    })
    const brand = wrapper.get('.home-sticky-header__brand')
    const brandLogo = brand.get('.home-sticky-header__brand-logo')
    const toggle = wrapper.get('.home-sticky-header__menu-toggle')
    const navigation = wrapper.get('#home-primary-nav')
    const links = navigation.findAll('a')

    expect(brand.attributes('href')).toBe('/')
    expect(brand.attributes('aria-label')).toBe('普那生活空間首頁')
    expect(brandLogo.attributes('src')).toBe('/assets/logo-main.png')
    expect(brandLogo.attributes('alt')).toBe('')
    expect(links.map(link => link.text())).toEqual([
      '近期活動',
      '課程探索',
      '個案諮詢',
      '文章分享',
      '關於我們',
    ])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/events',
      '/course',
      '/reservation',
      '/articles',
      '/about',
    ])
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(navigation.classes()).not.toContain('is-open')
    expect(document.documentElement.classList.contains('home-menu-open')).toBe(false)

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(navigation.classes()).toContain('is-open')
    expect(document.documentElement.classList.contains('home-menu-open')).toBe(true)
    expect(document.activeElement).toBe(links[0]?.element)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(navigation.classes()).not.toContain('is-open')
    expect(document.documentElement.classList.contains('home-menu-open')).toBe(false)
    expect(document.activeElement).toBe(toggle.element)

    await toggle.trigger('click')
    await links[0]?.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(navigation.classes()).not.toContain('is-open')
    expect(document.documentElement.classList.contains('home-menu-open')).toBe(false)

    wrapper.unmount()
  })
})
