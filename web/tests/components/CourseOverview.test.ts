import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CourseOverview from '../../app/components/CourseOverview.vue'
import {
  courseOverviewCategoryEmptyFixture,
  courseOverviewEmptyFixture,
  courseOverviewFixture,
  courseOverviewLongContentFixture,
  courseOverviewMissingOptionalFixture,
} from '../../app/fixtures/courseOverview'

describe('CourseOverview', () => {
  const disconnect = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe = vi.fn()
      disconnect = disconnect
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('renders the four confirmed categories and published course links', async () => {
    const wrapper = mount(CourseOverview, {
      props: { content: courseOverviewFixture },
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.get('h1').text()).toBe('課程探索')
    expect(wrapper.findAll('.course-group h2').map(heading => heading.text())).toEqual([
      '愛身體',
      '撫慰心',
      '究生命',
      '展現美',
    ])
    expect(wrapper.findAll('.course-item')).toHaveLength(6)
    expect(wrapper.findAll('.course-item h3')).toHaveLength(6)
    expect(wrapper.findAll('.course-item').map(link => link.attributes('href'))).toEqual([
      '/course/craniosacral',
      '/course/rebalancing-massage',
      '/course/japanese-face-massage',
      '/course/childhood-attachment-healing',
      '/course/human-design',
      '/course/mandala-meditative-painting',
    ])
    expect(wrapper.text()).not.toContain('生命數字學')
    expect(wrapper.text()).not.toContain('直覺式塔羅')
  })

  it('keeps an empty category in the directory and explains its state', () => {
    const wrapper = mount(CourseOverview, {
      props: { content: courseOverviewCategoryEmptyFixture },
    })

    expect(wrapper.get('a[href="#heart"] .course-directory__count').text()).toContain('0 門')
    expect(wrapper.get('#heart').text()).toContain('這個方向目前沒有已發布的課程')
  })

  it('renders an explicit empty state without an empty directory', () => {
    const wrapper = mount(CourseOverview, {
      props: { content: courseOverviewEmptyFixture },
    })

    expect(wrapper.text()).toContain('目前沒有可瀏覽的課程')
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.find('.course-ending').exists()).toBe(false)
  })

  it('renders loading and error recovery states', async () => {
    const wrapper = mount(CourseOverview, {
      props: { content: courseOverviewFixture, status: 'loading' },
    })

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain('正在整理課程目錄')

    await wrapper.setProps({ status: 'error' })
    await wrapper.get('button').trigger('click')

    expect(wrapper.text()).toContain('課程目錄暫時無法載入')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('uses a non-text placeholder when optional images are missing', () => {
    const wrapper = mount(CourseOverview, {
      props: { content: courseOverviewMissingOptionalFixture },
    })

    expect(wrapper.findAll('.course-item__visual--empty')).toHaveLength(6)
    expect(wrapper.find('.course-ending').exists()).toBe(false)
  })

  it('renders the longest supported copy without truncating its text', () => {
    const wrapper = mount(CourseOverview, {
      props: { content: courseOverviewLongContentFixture },
    })

    expect(wrapper.text()).toContain('從身體感知開始的頭薦骨共振與日常自我照顧練習')
    expect(wrapper.text()).toContain('逐步辨認日常生活中容易被忽略的需要')
  })
})
