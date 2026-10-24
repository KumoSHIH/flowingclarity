import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import IndexPage from '../../app/pages/index.vue'
import HomeBanner from '../../app/components/HomeBanner.vue'
import SiteFooterUnavailable from '../../app/components/SiteFooterUnavailable.vue'
import { siteSettingsFixture } from '../../app/fixtures/siteSettings'
import type { SiteSettingsResponse } from '../../shared/types/siteSettings'

afterEach(() => vi.unstubAllGlobals())
describe('shared site settings', () => {
  it('passes the same fetched settings to header, hero-menu and footer, and removes stale content on error', async () => {
    const data = ref<SiteSettingsResponse>({ state: 'ready', content: { ...siteSettingsFixture, brandName: 'CMS 品牌', navigationItems: siteSettingsFixture.navigationItems.map(item => ({ ...item, accessibleLabel: `${item.label} CMS` })) } })
    const fetchMock = vi.fn((url: string) => ({ data: url === '/api/site-settings' ? data : ref(null) }))
    vi.stubGlobal('useFetch', fetchMock)
    vi.stubGlobal('IntersectionObserver', class { observe() {}; disconnect() {} })
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
    const Header = defineComponent({ props: ['settings'], template: '<header>{{ settings?.brandName }}</header>' })
    const Footer = defineComponent({ props: ['content'], template: '<footer>{{ content.brandName }}</footer>' })
    const wrapper = mount(IndexPage, { global: { stubs: {
      SiteHeader: Header, SiteFooter: Footer, HomeBanner,
      HomeIntroduction: true, HomeEvents: true, HomeCourses: true, HomeContact: true, HomeSectionsState: true,
      SiteFooterUnavailable, NuxtLink: defineComponent({ props: ['to'], template: '<a :href="to"><slot /></a>' }),
    } } })
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/site-settings')).toHaveLength(1)
    expect(wrapper.findComponent(Header).props('settings')).toBe(data.value.content)
    expect(wrapper.findComponent(Footer).props('content')).toBe(data.value.content)
    expect(wrapper.get('.hero-menu a').attributes('aria-label')).toBe('近期活動 CMS')
    data.value = { state: 'error', content: null }
    await nextTick()
    expect(wrapper.findComponent(Footer).exists()).toBe(false)
    expect(wrapper.text()).not.toContain('CMS 品牌')
    expect(wrapper.findComponent(SiteFooterUnavailable).exists()).toBe(true)
    wrapper.unmount()
  })
})
