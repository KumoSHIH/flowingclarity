import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SiteHeader from '../../app/components/SiteHeader.vue'

describe('SiteHeader desktop visibility', () => {
  let observerCallback: IntersectionObserverCallback | null = null
  const disconnect = vi.fn()
  const observe = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }

      observe = observe
      disconnect = disconnect
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('appears after the reveal target leaves the viewport', async () => {
    const revealAfter = document.createElement('section')
    const wrapper = mount(SiteHeader, {
      attachTo: document.body,
      props: { revealAfter },
    })
    await wrapper.vm.$nextTick()

    const header = wrapper.get('header')
    expect(observe).toHaveBeenCalledWith(revealAfter)
    expect(header.classes()).not.toContain('is-visible')
    expect(header.attributes('aria-hidden')).toBe('true')

    observerCallback?.(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    await wrapper.vm.$nextTick()

    expect(header.classes()).toContain('is-visible')
    expect(header.attributes('aria-hidden')).toBe('false')

    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('can remain visible on pages without a reveal target', async () => {
    const wrapper = mount(SiteHeader, {
      props: { alwaysVisible: true },
    })
    await wrapper.vm.$nextTick()

    const header = wrapper.get('header')
    expect(header.classes()).toContain('is-visible')
    expect(header.attributes('aria-hidden')).toBe('false')
    expect(observe).not.toHaveBeenCalled()
  })
})
