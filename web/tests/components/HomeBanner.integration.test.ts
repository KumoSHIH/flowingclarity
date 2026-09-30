import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import type Swiper from 'swiper'
import HomeBanner from '../../app/components/HomeBanner.vue'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it('keeps the counter in sync with real Swiper autoplay', async () => {
  vi.useFakeTimers()
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
  const wrapper = mount(HomeBanner, {
    attachTo: document.body,
    props: {
      banner: {
        title: '測試標題',
        summary: '測試摘要',
        slides: ['first', 'second'].map((id) => ({
          id, image: `/${id}.jpg`, imageAlt: id, description: id,
        })),
      },
    },
  })
  try {
    await nextTick()
    const swiper = (wrapper.get('.swiper').element as HTMLElement & { swiper: Swiper }).swiper
    expect(swiper.autoplay.running).toBe(true)
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('01 / 02')
    await vi.advanceTimersByTimeAsync(2600)
    await nextTick()
    expect(swiper.realIndex).toBe(1)
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('02 / 02')
    await vi.advanceTimersByTimeAsync(800)
    // Happy DOM does not run CSS transitions; signal the fade completion.
    swiper.slides.forEach((slide) => slide.dispatchEvent(new Event('transitionend', { bubbles: true })))
    await vi.advanceTimersByTimeAsync(2600)
    await nextTick()
    expect(swiper.realIndex).toBe(0)
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('01 / 02')
  } finally {
    wrapper.unmount()
  }
})
