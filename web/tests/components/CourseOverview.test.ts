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
    window.history.replaceState(null, '', '/')
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

  it('renders each course as one light-panel link and updates the active directory item', async () => {
    const wrapper = mount(CourseOverview, {
      props: { content: courseOverviewFixture },
    })
    await wrapper.vm.$nextTick()

    const firstCourse = wrapper.get('.course-item')
    expect(firstCourse.findAll('a')).toHaveLength(0)
    expect(firstCourse.find('.course-item__visual').exists()).toBe(true)
    expect(firstCourse.find('.course-item__copy').exists()).toBe(true)

    const heartDirectoryLink = wrapper.get('a[href="#heart"]')
    await heartDirectoryLink.trigger('click')

    expect(heartDirectoryLink.attributes('aria-current')).toBe('location')
    expect(wrapper.get('a[href="#body"]').attributes('aria-current')).toBeUndefined()
  })

  it('initializes the active directory item from a valid URL hash', async () => {
    window.history.replaceState(null, '', '/course#heart')
    const wrapper = mount(CourseOverview, {
      props: { content: courseOverviewFixture },
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.get('a[href="#heart"]').attributes('aria-current')).toBe('location')
    expect(wrapper.get('a[href="#body"]').attributes('aria-current')).toBeUndefined()
  })

  it('excludes unpublished courses from links and directory counts', () => {
    const bodyCategory = courseOverviewFixture.categories[0]!
    const content = {
      ...courseOverviewFixture,
      categories: courseOverviewFixture.categories.map(category => category.key === 'body'
        ? {
            ...bodyCategory,
            courses: bodyCategory.courses.map((course, index) => ({
              ...course,
              isPublished: index !== 0,
            })),
          }
        : category),
    }
    const wrapper = mount(CourseOverview, {
      props: { content },
    })

    expect(wrapper.get('a[href="#body"] .course-directory__count').text()).toContain('2 門')
    expect(wrapper.find('a[href="/course/craniosacral"]').exists()).toBe(false)
  })

  it('splits four to eight courses into rows of no more than four panels', () => {
    const bodyCategory = courseOverviewFixture.categories[0]!
    const expandedContent = {
      ...courseOverviewFixture,
      categories: courseOverviewFixture.categories.map(category => category.key === 'body'
        ? {
            ...bodyCategory,
            courses: Array.from({ length: 8 }, (_, index) => ({
              ...bodyCategory.courses[index % bodyCategory.courses.length]!,
              title: `課程 ${index + 1}`,
              slug: `course-${index + 1}`,
              order: index + 1,
            })),
          }
        : category),
    }
    const wrapper = mount(CourseOverview, {
      props: { content: expandedContent },
    })

    const rows = wrapper.get('#body').findAll('.course-list')
    expect(rows).toHaveLength(2)
    expect(rows.map(row => row.findAll('li').length)).toEqual([4, 4])
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
