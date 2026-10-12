import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DirectoryIntro from '../../app/components/DirectoryIntro.vue'

describe('DirectoryIntro', () => {
  it('renders the shared directory heading and description', () => {
    const wrapper = mount(DirectoryIntro, {
      props: {
        title: '近期活動',
        description: '從短期工作坊開始，找到適合參與的練習。',
      },
    })

    expect(wrapper.get('h1').text()).toBe('近期活動')
    expect(wrapper.get('.directory-intro__description').text()).toBe(
      '從短期工作坊開始，找到適合參與的練習。',
    )
  })
})
