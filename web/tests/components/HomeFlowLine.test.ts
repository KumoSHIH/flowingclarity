import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HomeFlowLine from '../../app/components/HomeFlowLine.vue'

describe('home flow line', () => {
  it('renders a decorative base line and animated current without exposing them to assistive technology', () => {
    const wrapper = mount(HomeFlowLine)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.findAll('path')).toHaveLength(3)
    expect(wrapper.find('.flow-line-base').exists()).toBe(true)
    expect(wrapper.findAll('.flow-line-current')).toHaveLength(2)
  })
})
