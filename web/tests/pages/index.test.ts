import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import IndexPage from '../../app/pages/index.vue'

const componentStubs = {
  HomeBanner: true,
  HomeIntroduction: true,
  HomeEvents: true,
  HomeCourses: true,
  HomeContact: true,
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
    vi.unstubAllGlobals()
  })

  it('toggles the menu and page scroll lock', async () => {
    const wrapper = mount(IndexPage, {
      global: { stubs: componentStubs },
    })
    const brand = wrapper.get('.home-sticky-header__brand')
    const brandLogo = brand.get('.home-sticky-header__brand-logo')
    const toggle = wrapper.get('.home-sticky-header__menu-toggle')
    const navigation = wrapper.get('#home-primary-nav')

    expect(brand.attributes('href')).toBe('#course-map')
    expect(brand.attributes('aria-label')).toBe('普那生活空間首頁')
    expect(brandLogo.attributes('src')).toBe('/assets/logo-main.png')
    expect(brandLogo.attributes('alt')).toBe('')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(navigation.classes()).not.toContain('is-open')
    expect(document.documentElement.classList.contains('home-menu-open')).toBe(false)

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(navigation.classes()).toContain('is-open')
    expect(document.documentElement.classList.contains('home-menu-open')).toBe(true)

    await navigation.get('a').trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(navigation.classes()).not.toContain('is-open')
    expect(document.documentElement.classList.contains('home-menu-open')).toBe(false)

    wrapper.unmount()
  })
})
