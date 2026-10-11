import { describe, expect, it } from 'vitest'
import { parseCourseDetail } from '../../shared/utils/courseDetail'
import { sanityCourseDetail } from '../fixtures/courseDetailSanity'

describe('course detail parser', () => {
  it('maps published course and run data into the frontend contract', () => {
    const content = parseCourseDetail(
      structuredClone(sanityCourseDetail),
      'japanese-facial-massage',
    )

    expect(content).toMatchObject({
      slug: 'japanese-facial-massage',
      hero: {
        title: '日式臉部按摩',
        actionLabel: '前往報名',
        actionUrl: 'https://forms.example.com/course',
      },
      body: expect.arrayContaining([
        expect.objectContaining({ key: 'gallery-weave', type: 'gallery', layout: 'weave' }),
      ]),
      schedule: {
        sessions: [{
          key: 'course-run-2027-spring',
          status: '開放報名',
          details: expect.arrayContaining(['2027/03/01–03/03', '高雄・場地確認後通知']),
        }],
      },
    })
    expect(content?.hero.meta).toEqual([
      { label: '形式', value: '實體課程' },
      { label: '地點', value: '高雄' },
      { label: '時間', value: '2027/03/01–03/03' },
      { label: '狀態', value: '開放報名' },
    ])
  })

  it('keeps registration disabled unless a published open run has a valid HTTPS URL', () => {
    const value = structuredClone(sanityCourseDetail)
    value.runs[0]!.registrationStatus = 'scheduled'
    value.runs[0]!.registrationUrl = 'javascript:alert(1)'

    const content = parseCourseDetail(value)
    expect(content?.hero.actionLabel).toBe('報名尚未開放')
    expect(content?.hero.actionUrl).toBeUndefined()
    expect(content?.registration.actionUrl).toBeUndefined()
  })

  it('keeps a video block but removes a non-YouTube playback target', () => {
    const value = structuredClone(sanityCourseDetail)
    const video = value.course.detail.body.find(block => block.type === 'video')
    if (video && video.type === 'video') video.url = 'https://example.com/not-youtube'

    const content = parseCourseDetail(value)
    expect(content?.body.find(block => block.type === 'video')).toMatchObject({ url: undefined })
  })

  it('preserves multiple gallery blocks in the editor-defined order', () => {
    const value = structuredClone(sanityCourseDetail)
    const galleryIndex = value.course.detail.body.findIndex(block => block.type === 'gallery')
    const gallery = value.course.detail.body[galleryIndex]!
    value.course.detail.body.splice(galleryIndex + 1, 0, {
      ...structuredClone(gallery),
      key: 'gallery-folio',
      layout: 'folio',
      title: '第二組圖文內容',
    })

    const galleries = parseCourseDetail(value)?.body.filter(block => block.type === 'gallery')
    expect(galleries?.map(block => block.layout)).toEqual(['weave', 'folio'])
  })

  it('normalizes Sanity schema type names returned by the live GROQ projection', () => {
    const value = structuredClone(sanityCourseDetail)
    for (const block of value.course.detail.body) {
      block.type = `courseDetail${block.type[0]!.toUpperCase()}${block.type.slice(1)}` as typeof block.type
    }

    expect(parseCourseDetail(value)?.body.map(block => block.type)).toEqual(
      sanityCourseDetail.course.detail.body.map(block => block.type),
    )
  })

  it('filters malformed runs while keeping a valid published detail page', () => {
    const value = structuredClone(sanityCourseDetail)
    value.runs.push({ ...value.runs[0]!, key: '', label: '' })

    expect(parseCourseDetail(value)?.schedule.sessions).toHaveLength(1)
  })

  it('filters an open run whose registration URL is not a valid HTTPS URL', () => {
    const value = structuredClone(sanityCourseDetail)
    value.runs[0]!.registrationUrl = 'javascript:alert(1)'

    const content = parseCourseDetail(value)
    expect(content?.schedule.sessions).toEqual([])
    expect(content?.hero.actionUrl).toBeUndefined()
    expect(content?.registration.actionUrl).toBeUndefined()
  })

  it('rejects hidden, malformed or mismatched course content', () => {
    const hidden = structuredClone(sanityCourseDetail)
    hidden.course.detailIsPublished = false
    expect(parseCourseDetail(hidden)).toBeNull()

    const malformed = structuredClone(sanityCourseDetail)
    const gallery = malformed.course.detail.body.find(block => block.type === 'gallery')
    if (gallery && gallery.type === 'gallery') gallery.items = []
    expect(parseCourseDetail(malformed)).toBeNull()

    const incompleteBlock = structuredClone(sanityCourseDetail)
    const teacherIndex = incompleteBlock.course.detail.body.findIndex(block => block.type === 'teacher')
    incompleteBlock.course.detail.body[teacherIndex] = {
      key: 'teacher',
      type: 'teacher',
      name: '缺少其他欄位',
    } as never
    expect(parseCourseDetail(incompleteBlock)).toBeNull()

    expect(parseCourseDetail(sanityCourseDetail, 'another-course')).toBeNull()
  })
})
