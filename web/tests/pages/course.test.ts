import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CourseOverview from '../../app/components/CourseOverview.vue'
import CoursePage from '../../app/pages/course/index.vue'
import { courseOverviewFixture } from '../../app/fixtures/courseOverview'

const SiteHeaderStub = defineComponent({
  props: { alwaysVisible: Boolean },
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" />',
})

describe('course page', () => {
  const refresh = vi.fn()
  const useFetchMock = vi.fn(() => ({
    data: ref({ state: 'ready', content: courseOverviewFixture }),
    status: ref('success'),
    refresh,
  }))

  beforeEach(() => {
    useFetchMock.mockClear()
    refresh.mockClear()
    vi.stubGlobal('useFetch', useFetchMock)
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
          SiteFooter: true,
          SiteFooterUnavailable: true,
          CourseOverview,
        },
      },
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-site-header]').attributes('data-always-visible')).toBe('true')
    expect(wrapper.findComponent({ name: 'HomeBanner' }).exists()).toBe(false)
    expect(wrapper.get('main h1').text()).toBe('課程探索')
    expect(wrapper.findAll('.course-group')).toHaveLength(4)
    expect(useFetchMock).toHaveBeenCalledWith('/api/course-overview')
  })
})
