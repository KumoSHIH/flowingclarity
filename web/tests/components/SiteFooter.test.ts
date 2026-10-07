import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SiteFooter from '../../app/components/SiteFooter.vue'

describe('SiteFooter', () => {
  it('renders the home footer by default', () => {
    const wrapper = mount(SiteFooter, {
      props: { message: '留一點空白，給自己。' },
    })

    expect(wrapper.element.tagName).toBe('FOOTER')
    expect(wrapper.classes()).toContain('site-footer--home')
    expect(wrapper.text()).toContain('FLOWING CLARITY')
    expect(wrapper.text()).toContain('留一點空白，給自己。')
  })

  it('supports the course footer presentation', () => {
    const wrapper = mount(SiteFooter, {
      props: {
        message: '循著需要，找到學習的方向。',
        variant: 'course',
      },
    })

    expect(wrapper.classes()).toContain('site-footer--course')
    expect(wrapper.text()).toContain('循著需要，找到學習的方向。')
  })
})
