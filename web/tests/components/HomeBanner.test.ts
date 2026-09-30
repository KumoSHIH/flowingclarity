import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import HomeBanner from '../../app/components/HomeBanner.vue'

vi.mock('swiper/vue', () => ({
  Swiper: {
    name: 'Swiper',
    props: ['modules', 'effect', 'fadeEffect', 'speed', 'autoplay', 'loop', 'pagination'],
    template: '<div><slot /><slot name="container-end" /></div>',
  },
  SwiperSlide: { name: 'SwiperSlide', template: '<div><slot /></div>' },
}))

const banner = {
  title: '測試大標題',
  summary: '測試摘要',
  slides: [
    {
      id: 'first',
      image: '/first.jpg',
      imageAlt: '第一張圖片',
      description: '第一段敘述',
    },
    {
      id: 'second',
      image: '/second.jpg',
      imageAlt: '第二張圖片',
      description: '第二段敘述',
    },
  ],
}

describe('home banner', () => {
  it('keeps each image with its own description', () => {
    const wrapper = mount(HomeBanner, {
      props: { banner },
    })

    expect(wrapper.get('h1').text()).toBe('測試大標題')
    expect(wrapper.get('p').text()).toBe('測試摘要')
    expect(wrapper.findAll('img').map((image) => [image.attributes('src'), image.attributes('alt')]))
      .toEqual([['/first.jpg', '第一張圖片'], ['/second.jpg', '第二張圖片']])
    expect(wrapper.text()).toContain('第一段敘述')
    expect(wrapper.text()).toContain('第二段敘述')
    expect(wrapper.findAll('p').slice(1).every((caption) => caption.classes().includes('text-right'))).toBe(true)
    expect(wrapper.find('[data-signal-wave]').exists()).toBe(false)
    expect(wrapper.get('[data-home-banner]').classes()).toContain('home-banner')
    expect(wrapper.get('[data-banner-media]').classes()).toContain('lg:top-0')
  })

  it('automatically crossfades between slides without navigation buttons', () => {
    const wrapper = mount(HomeBanner, {
      props: { banner },
    })
    const swiper = wrapper.findComponent({ name: 'Swiper' })

    expect(swiper.props('effect')).toBe('fade')
    expect(swiper.props('fadeEffect')).toEqual({ mode: 'cross-fade' })
    expect(swiper.props('speed')).toBe(800)
    expect(swiper.props('autoplay')).toEqual({ delay: 2500, disableOnInteraction: false })
    expect(swiper.props('loop')).toBe(true)
    expect(wrapper.findAll('button')).toHaveLength(0)

  })

  it('does not autoplay but keeps the slide count when there is only one image', () => {
    const wrapper = mount(HomeBanner, {
      props: { banner: { ...banner, slides: [banner.slides[0]!] } },
    })

    const swiper = wrapper.findComponent({ name: 'Swiper' })
    expect(swiper.props('autoplay')).toBe(false)
    expect(swiper.props('loop')).toBe(false)
    expect(swiper.props('pagination')).toEqual(expect.objectContaining({ type: 'fraction' }))
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })
})
