import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HomeBanner from '../../app/components/HomeBanner.vue'
import { fallbackHomeBanner } from '../../shared/utils/homeBanner'

const banner = {
  title: '測試大標題\n第二行標題',
  summary: '測試敘述',
  buttonText: '查看課程',
  buttonLink: 'https://example.com/courses',
}

describe('home banner content', () => {
  it('renders the four CMS fields and preserves title line breaks', () => {
    const wrapper = mount(HomeBanner, { props: { banner } })
    expect(wrapper.findAll('h1 span').map((line) => line.text())).toEqual(['測試大標題', '第二行標題'])
    expect(wrapper.get('.hero-story-copy p').text()).toBe(banner.summary)
    expect(wrapper.get('.hero-cta').text()).toBe(banner.buttonText)
    expect(wrapper.get('.hero-cta').attributes('href')).toBe(banner.buttonLink)
    expect(wrapper.findAll('.home-banner__plate')).toHaveLength(1)
    expect(wrapper.get('.home-banner__plate').attributes('alt')).toContain('玫瑰')
    const brand = wrapper.get('.atlas-brand')
    const brandLogo = brand.get('.atlas-brand__logo')
    expect(brand.attributes('aria-label')).toBe('普那生活空間首頁')
    expect(brandLogo.attributes('src')).toBe('/assets/logo-main-light.png')
    expect(brandLogo.attributes('alt')).toBe('')
    wrapper.unmount()
  })

  it('shows fallback content without published CMS content', () => {
    const wrapper = mount(HomeBanner, { props: { banner: null } })
    expect(wrapper.get('.hero-story-copy p').text()).toBe(fallbackHomeBanner.summary)
    expect(wrapper.get('.hero-cta').text()).toBe(fallbackHomeBanner.buttonText)
    expect(wrapper.get('.hero-cta').attributes('href')).toBe('#courses')
    wrapper.unmount()
  })

  it('keeps category selection independent of CMS content', async () => {
    const wrapper = mount(HomeBanner, { props: { banner } })
    await wrapper.get('.atlas-category--heart').trigger('click')
    expect(wrapper.get('.atlas-category--heart').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.atlas-category--body').attributes('aria-pressed')).toBe('false')
    expect(wrapper.get('.hero-cta').attributes('href')).toBe(banner.buttonLink)
    wrapper.unmount()
  })

  it('falls back instead of rendering an unsafe CMS link', () => {
    const wrapper = mount(HomeBanner, { props: { banner: { ...banner, buttonLink: 'javascript:alert(1)' } } })
    expect(wrapper.get('.hero-cta').attributes('href')).toBe('#courses')
    wrapper.unmount()
  })
})
