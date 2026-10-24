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
          location: '高雄・場地確認後通知',
          stages: [{ key: 'stage-1', title: '第一階', dateRanges: ['2027/03/01–03/03'] }],
          details: expect.arrayContaining([
            { label: '上課時間', value: '每日 09:30–18:30' },
            { label: '課程費用', value: '費用已核准' },
            { label: '招生名額', value: '名額 12 人' },
            { label: '參與條件', value: '需完成課前問卷' },
          ]),
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

  it('presents every stage and discontinuous date range without implying continuous attendance', () => {
    const value = structuredClone(sanityCourseDetail)
    value.runs[0]!.stages = [
      {
        title: '第一階',
        order: 1,
        dateRanges: [
          { startDate: '2026-11-11', endDate: '2026-11-12' },
          { startDate: '2026-11-15', endDate: '2026-11-15' },
        ],
      },
      {
        title: '第二階',
        order: 2,
        dateRanges: [{ startDate: '2026-11-21', endDate: '2026-11-22' }],
      },
    ]

    const content = parseCourseDetail(value)
    expect(content?.hero.meta.find(item => item.label === '時間')?.value).toBe(
      '第一階｜2026/11/11–11/12、2026/11/15\n第二階｜2026/11/21–11/22',
    )
    expect(content?.schedule.sessions[0]?.stages).toEqual([
      {
        key: 'stage-1',
        title: '第一階',
        dateRanges: ['2026/11/11–11/12', '2026/11/15'],
      },
      {
        key: 'stage-2',
        title: '第二階',
        dateRanges: ['2026/11/21–11/22'],
      },
    ])
    expect(content?.schedule.sessions[0]?.details.map(detail => detail.value))
      .not.toContain('2026/11/11–11/22')
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
    expect(content?.body.find(block => block.type === 'video')).toMatchObject({ embedUrl: undefined })
  })

  it('defaults missing video status copy and isolates malformed optional video blocks', () => {
    const missingStatus = structuredClone(sanityCourseDetail)
    const video = missingStatus.course.detail.body.find(block => block.type === 'video')
    if (!video || video.type !== 'video') throw new Error('Missing video fixture')
    delete video.statusLabel

    expect(parseCourseDetail(missingStatus)?.body.find(block => block.type === 'video')).toMatchObject({
      statusLabel: '觀看課程影片',
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    })

    const malformedVideo = structuredClone(sanityCourseDetail)
    const malformed = malformedVideo.course.detail.body.find(block => block.type === 'video')
    if (!malformed || malformed.type !== 'video') throw new Error('Missing video fixture')
    delete malformed.image

    const parsed = parseCourseDetail(malformedVideo)
    expect(parsed).not.toBeNull()
    expect(parsed?.body.some(block => block.type === 'video')).toBe(false)
  })

  it('keeps a complete page when optional audience and curriculum blocks are omitted', () => {
    const value = structuredClone(sanityCourseDetail)
    value.course.detail.body = value.course.detail.body.filter(
      block => block.type !== 'audience' && block.type !== 'curriculum',
    )

    const content = parseCourseDetail(value)
    expect(content).not.toBeNull()
    expect(content?.body.some(block => block.type === 'audience')).toBe(false)
    expect(content?.body.some(block => block.type === 'curriculum')).toBe(false)
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

  it('keeps a gallery when supporting copy and item titles are omitted', () => {
    const value = structuredClone(sanityCourseDetail)
    const gallery = value.course.detail.body.find(block => block.type === 'gallery')
    if (!gallery || gallery.type !== 'gallery') throw new Error('Missing gallery fixture')

    delete gallery.note
    delete gallery.statement
    delete gallery.items[0]!.title

    const parsed = parseCourseDetail(value)
    const parsedGallery = parsed?.body.find(block => block.type === 'gallery')
    expect(parsedGallery).toMatchObject({ type: 'gallery', note: undefined, statement: undefined })
    expect(parsedGallery?.items[0]?.title).toBeUndefined()
  })

  it('keeps every affected section when fields named description are omitted', () => {
    const value = structuredClone(sanityCourseDetail)
    const gallery = value.course.detail.body.find(block => block.type === 'gallery')
    const curriculum = value.course.detail.body.find(block => block.type === 'curriculum')
    const audience = value.course.detail.body.find(block => block.type === 'audience')
    if (!gallery || gallery.type !== 'gallery') throw new Error('Missing gallery fixture')
    if (!curriculum || curriculum.type !== 'curriculum') throw new Error('Missing curriculum fixture')
    if (!audience || audience.type !== 'audience') throw new Error('Missing audience fixture')

    const omitDescription = (target: object) => {
      delete (target as { description?: string }).description
    }
    omitDescription(gallery)
    omitDescription(gallery.items[0]!)
    omitDescription(curriculum)
    omitDescription(audience)
    omitDescription(value.course.detail.schedule)
    omitDescription(value.course.detail.registration)

    const parsed = parseCourseDetail(value)
    expect(parsed).not.toBeNull()
    expect(parsed?.body.find(block => block.type === 'gallery')).toMatchObject({
      type: 'gallery',
      description: undefined,
      items: [expect.objectContaining({ description: undefined })],
    })
    expect(parsed?.body.find(block => block.type === 'curriculum')).toMatchObject({
      type: 'curriculum',
      description: undefined,
    })
    expect(parsed?.body.find(block => block.type === 'audience')).toMatchObject({
      type: 'audience',
      description: undefined,
    })
    expect(parsed?.schedule.description).toBeUndefined()
    expect(parsed?.registration.description).toBeUndefined()
  })

  it('preserves editor-authored line breaks in curriculum unit titles', () => {
    const value = structuredClone(sanityCourseDetail)
    const curriculum = value.course.detail.body.find(block => block.type === 'curriculum')
    if (!curriculum || curriculum.type !== 'curriculum') throw new Error('Missing curriculum fixture')
    curriculum.units[0]!.title = '觸碰與支撐\n基礎練習'

    const parsedCurriculum = parseCourseDetail(value)?.body.find(block => block.type === 'curriculum')
    expect(parsedCurriculum?.type === 'curriculum' && parsedCurriculum.units[0]?.title)
      .toBe('觸碰與支撐\n基礎練習')
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
    value.runs.push({
      ...structuredClone(value.runs[0]!),
      key: 'malformed-stages',
      stages: [{ order: 1, dateRanges: [{ startDate: '2027-04-01', endDate: '2027-04-02' }] }],
    } as never)

    expect(parseCourseDetail(value)?.schedule.sessions).toHaveLength(1)
  })

  it('enforces one testimonial block and skips invalid or duplicate related articles', () => {
    const duplicateTestimonials = structuredClone(sanityCourseDetail)
    const testimonial = duplicateTestimonials.course.detail.body.find(block => block.type === 'testimonials')!
    duplicateTestimonials.course.detail.body.push({ ...testimonial, key: 'testimonials-copy' })
    expect(parseCourseDetail(duplicateTestimonials)).toBeNull()

    const related = structuredClone(sanityCourseDetail)
    related.course.detail.relatedArticles.push(
      { ...structuredClone(related.course.detail.relatedArticles[0]!), id: 'article-course-related' },
      { ...structuredClone(related.course.detail.relatedArticles[0]!), id: 'drafts.invalid-related' },
    )
    expect(parseCourseDetail(related)?.relatedArticles).toHaveLength(1)
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
    hidden.course.isPublished = false
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
