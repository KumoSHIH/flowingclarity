import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import HomeBanner from '../../app/components/HomeBanner.vue'
import IndexPage from '../../app/pages/index.vue'
import type { HomeBannerContent } from '../../shared/utils/homeBanner'

afterEach(() => vi.unstubAllGlobals())

it('connects the homepage API content to the Banner and retains fallback during loading or failure', async () => {
  const data = ref<HomeBannerContent | null>(null)
  const useFetch = vi.fn(() => ({ data }))
  vi.stubGlobal('useFetch', useFetch)
  vi.stubGlobal('IntersectionObserver', class {
    observe = vi.fn()
    disconnect = vi.fn()
  })
  vi.stubGlobal('matchMedia', () => ({
    matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }))
  const wrapper = mount(IndexPage, {
    global: {
      components: { HomeBanner },
      stubs: {
        SiteHeader: true,
        HomeIntroduction: true,
        HomeEvents: true,
        HomeCourses: true,
        HomeContact: true,
        SiteFooter: true,
      },
    },
  })
  try {
    expect(useFetch).toHaveBeenCalledWith('/api/home-banner')
    expect(wrapper.get('.hero-cta').attributes('href')).toBe('#courses')
    data.value = { title: 'CMS 標題', summary: 'CMS 敘述', buttonText: '立即探索', buttonLink: '/course' }
    await nextTick()
    expect(wrapper.get('h1').text()).toBe('CMS 標題')
    expect(wrapper.get('.hero-story-copy p').text()).toBe('CMS 敘述')
    expect(wrapper.get('.hero-cta').text()).toBe('立即探索')
    expect(wrapper.get('.hero-cta').attributes('href')).toBe('/course')
    data.value = null
    await nextTick()
    expect(wrapper.get('.hero-cta').attributes('href')).toBe('#courses')
  } finally {
    wrapper.unmount()
  }
})
