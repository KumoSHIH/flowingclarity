import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CourseOverview from '../../app/components/CourseOverview.vue'
import CoursePage from '../../app/pages/course.vue'

const SiteHeaderStub = defineComponent({
  props: { alwaysVisible: Boolean },
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" />',
})

describe('course page', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe = vi.fn()
      disconnect = vi.fn()
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('starts with the shared header and directory without a banner', async () => {
    const wrapper = mount(CoursePage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          CourseOverview,
        },
      },
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-site-header]').attributes('data-always-visible')).toBe('true')
    expect(wrapper.findComponent({ name: 'HomeBanner' }).exists()).toBe(false)
    expect(wrapper.get('main h1').text()).toBe('課程探索')
    expect(wrapper.findAll('.course-group')).toHaveLength(4)
  })
})
