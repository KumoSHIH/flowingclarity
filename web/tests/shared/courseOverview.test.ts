import { describe, expect, it } from 'vitest'
import { parseCourseOverview } from '../../shared/utils/courseOverview'

const rawOverview = {
  page: {
    pageTitle: '課程探索',
    directoryPrompt: '想從哪裡開始？',
    endingMessage: '找到想靠近的方向，再慢慢深入。',
  },
  categories: [
    { key: 'body', name: '愛身體', order: 1, summary: '從有意識的碰觸與覺察出發，練習聆聽身體，也重新辨認自己的界線。', courses: [] as unknown[] },
    { key: 'heart', name: '撫慰心', order: 2, summary: '透過關係與依附經驗的理解，為內在感受留出能被看見與承接的空間。', courses: [] as unknown[] },
    { key: 'life', name: '究生命', order: 3, summary: '藉由理解工具觀察生命裡反覆出現的節奏，整理當下的位置與可能方向。', courses: [] as unknown[] },
    { key: 'beauty', name: '展現美', order: 4, summary: '在顏色、形狀與創作的過程中安住，讓美感成為回到當下的一條路。', courses: [] as unknown[] },
  ],
}

const validCourse = {
  title: '頭薦骨',
  slug: 'craniosacral',
  deliveryModes: ['inPerson'],
  summary: '這是一段符合內容長度限制並用來驗證資料轉換流程的課程摘要文字。',
  image: {
    src: 'https://cdn.sanity.io/images/project/production/course.jpg',
    alt: '安靜明亮的課程空間',
    hotspot: { x: 0.25, y: 0.75 },
  },
  order: 1,
  isPublished: true,
}

describe('course overview parser', () => {
  it('maps fixed category keys to anchors and preserves valid published courses', () => {
    const value = structuredClone(rawOverview)
    value.categories[0]!.courses = [validCourse]

    const content = parseCourseOverview(value)
    expect(content?.categories.map(category => category.slug)).toEqual(['body', 'heart', 'life', 'beauty'])
    expect(content?.categories[0]?.courses[0]).toMatchObject({
      slug: 'craniosacral',
      image: { objectPosition: '25% 75%' },
    })
  })

  it('filters unpublished, malformed and duplicate-order courses without rejecting the page', () => {
    const value = structuredClone(rawOverview)
    value.categories[0]!.courses = [
      validCourse,
      { ...validCourse, slug: 'hidden', order: 2, isPublished: false },
      { ...validCourse, slug: 'bad slug', order: 2 },
      { ...validCourse, slug: 'duplicate-order' },
    ]

    expect(parseCourseOverview(value)?.categories[0]?.courses.map(course => course.slug)).toEqual([
      'craniosacral',
    ])
  })

  it('filters a duplicate course slug across categories', () => {
    const value = structuredClone(rawOverview)
    value.categories[0]!.courses = [validCourse]
    value.categories[1]!.courses = [{ ...validCourse, title: '另一門課程' }]

    const categories = parseCourseOverview(value)?.categories
    expect(categories?.[0]?.courses).toHaveLength(1)
    expect(categories?.[1]?.courses).toHaveLength(0)
  })

  it('omits an invalid optional image instead of rejecting its course', () => {
    const value = structuredClone(rawOverview)
    value.categories[0]!.courses = [{ ...validCourse, image: { src: 'javascript:bad', alt: '' } }]

    expect(parseCourseOverview(value)?.categories[0]?.courses[0]?.image).toBeUndefined()
  })

  it('rejects incomplete page content or a changed fixed category identity', () => {
    expect(parseCourseOverview(null)).toBeNull()
    expect(parseCourseOverview({ ...rawOverview, page: null })).toBeNull()

    const value = structuredClone(rawOverview)
    value.categories[0]!.name = '其他分類'
    expect(parseCourseOverview(value)).toBeNull()
  })
})
