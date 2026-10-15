import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GoTopButton from '../../app/components/GoTopButton.vue'

describe('GoTopButton', () => {
  const scrollTo = vi.fn()
  const matchMedia = vi.fn()
  const wrappers: ReturnType<typeof mount>[] = []

  function render() {
    const wrapper = mount(GoTopButton)
    wrappers.push(wrapper)
    return wrapper
  }

  function setScrollY(value: number) {
    Object.defineProperty(window, 'scrollY', { configurable: true, value })
    window.dispatchEvent(new Event('scroll'))
  }

  beforeEach(() => {
    scrollTo.mockReset()
    matchMedia.mockReturnValue({ matches: false })
    vi.stubGlobal('scrollTo', scrollTo)
    vi.stubGlobal('matchMedia', matchMedia)
    setScrollY(0)
  })

  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount())
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('appears only after the reveal offset and exposes an accessible button', async () => {
    const wrapper = render()
    expect(wrapper.find('button').exists()).toBe(false)

    setScrollY(481)
    await wrapper.vm.$nextTick()

    const button = wrapper.get('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('回到頁面頂端')
    expect(button.get('svg').attributes('aria-hidden')).toBe('true')

    setScrollY(480)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('scrolls smoothly to the top by default', async () => {
    setScrollY(700)
    const wrapper = render()
    await wrapper.vm.$nextTick()
    await wrapper.get('button').trigger('click')

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' })
  })

  it('uses immediate scrolling when reduced motion is requested', async () => {
    matchMedia.mockReturnValue({ matches: true })
    setScrollY(700)
    const wrapper = render()
    await wrapper.vm.$nextTick()
    await wrapper.get('button').trigger('click')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('removes its scroll listener when unmounted', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const wrapper = render()
    wrapper.unmount()

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
