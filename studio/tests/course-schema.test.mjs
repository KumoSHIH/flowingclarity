import assert from 'node:assert/strict'
import { test } from 'node:test'
import { course, validateCourseDetailPublication } from '../schemaTypes/course.ts'
import {
  courseCategory,
  courseCategoryDefinitions,
  validateCourseCategoryIdentity,
} from '../schemaTypes/courseCategory.ts'
import { courseOverviewPage } from '../schemaTypes/courseOverviewPage.ts'
import {
  courseDetailContent,
  courseDetailAudience,
  courseDetailCurriculum,
  courseDetailCurriculumUnit,
  courseDetailGallery,
  courseDetailGalleryItem,
  courseDetailRegistration,
  courseDetailSchedule,
  courseDetailText,
  courseDetailVideo,
  validateCourseDetailBody,
} from '../schemaTypes/courseDetail.ts'
import { courseRun } from '../schemaTypes/courseRun.ts'
import { schemaTypes } from '../schemaTypes/index.ts'

test('course content types are registered with their required semantic fields', () => {
  assert.deepEqual(
    schemaTypes.map(({ name }) => name),
    [
      'siteSettings',
      'homeBanner',
      'homePage',
      'courseOverviewPage',
      'courseCategory',
      'courseDetailIntroduction',
      'courseDetailText',
      'courseDetailGalleryItem',
      'courseDetailGallery',
      'courseDetailTeacher',
      'courseDetailQuote',
      'courseDetailCurriculumUnit',
      'courseDetailCurriculum',
      'courseDetailVideo',
      'courseDetailAudience',
      'courseDetailCarouselItem',
      'courseDetailCarousel',
      'courseDetailSchedule',
      'courseDetailRegistration',
      'courseDetailContent',
      'course',
      'courseDateRange',
      'courseStage',
      'courseRun',
      'eventsPage',
      'eventDetailText',
      'eventDetailFacilitator',
      'eventDetailAgendaItem',
      'eventDetailAgenda',
      'sharedTestimonialItem',
      'sharedTestimonialBlock',
      'eventDetailList',
      'eventDetailQuote',
      'eventDetailMediaItem',
      'eventDetailMedia',
      'eventDetailContent',
      'event',
      'sessionPage',
      'sessionRegion',
      'sessionCity',
      'sessionMethod',
      'sessionServiceLocation',
      'sessionContactItem',
      'sessionBookingAction',
      'sessionDetailSeo',
      'practitioner',
      'articlesPage',
      'articleTag',
      'articleContentImage',
      'articleRichTextSection',
      'articleSplitMediaSection',
      'articleWideImageSection',
      'article',
      'aboutPage',
    ],
  )
  assert.deepEqual(courseOverviewPage.fields.map(({ name }) => name), [
    'pageTitle',
    'directoryPrompt',
    'endingMessage',
  ])
  assert.deepEqual(courseCategory.fields.map(({ name }) => name), ['key', 'name', 'order', 'summary'])
  assert.deepEqual(course.fields.map(({ name }) => name), [
    'title',
    'slug',
    'category',
    'deliveryModes',
    'summary',
    'image',
    'detail',
    'order',
    'isPublished',
  ])
  assert.deepEqual(courseRun.fields.map(({ name }) => name), [
    'course',
    'label',
    'registrationStatus',
    'registrationUrl',
    'isPublished',
    'city',
    'venue',
    'timeLabel',
    'capacityLabel',
    'feeLabel',
    'notes',
    'stages',
  ])
  assert.deepEqual(courseDetailContent.fields.map(({ name }) => name), [
    'notice',
    'englishTitle',
    'body',
    'schedule',
    'testimonials',
    'highlights',
    'registration',
    'relatedArticles',
  ])
  assert.deepEqual(
    courseDetailContent.fields.find(({ name }) => name === 'body').of.map(({ type }) => type),
    [
      'courseDetailIntroduction',
      'courseDetailText',
      'courseDetailGallery',
      'courseDetailTeacher',
      'courseDetailQuote',
      'courseDetailCurriculum',
      'courseDetailVideo',
      'courseDetailAudience',
      'courseDetailCarousel',
    ],
  )
  assert.deepEqual(
    courseDetailGallery.fields.find(({ name }) => name === 'layout').options.list.map(({ value }) => value),
    ['collage', 'stages', 'weave', 'folio', 'dossier'],
  )
  assert.deepEqual(
    courseDetailGallery.fields.find(({ name }) => name === 'contentRole').options.list.map(({ value }) => value),
    ['general', 'curriculum'],
  )
  const multilineFields = schemaTypes
    .filter(({ name }) => name.startsWith('courseDetail'))
    .flatMap(({ fields = [] }) => fields.flatMap(field => [field, ...(field.of ?? [])]))
    .filter(({ type }) => type === 'text')
  assert.equal(multilineFields.length, 16)
  assert.equal(multilineFields.every(({ description }) => description === '可按 Enter 換行，前台會保留段落。'), true)
  const curriculumUnitTitle = courseDetailCurriculumUnit.fields.find(({ name }) => name === 'title')
  assert.equal(curriculumUnitTitle.type, 'text')
  assert.equal(curriculumUnitTitle.rows, 2)
})

test('course detail body supports ordered mixed blocks and requires core content', () => {
  const coreBlocks = [
    { _type: 'courseDetailIntroduction' },
    { _type: 'courseDetailGallery' },
    { _type: 'courseDetailCurriculum' },
    { _type: 'courseDetailAudience' },
  ]
  assert.equal(validateCourseDetailBody(coreBlocks), true)
  assert.equal(validateCourseDetailBody(coreBlocks.slice(0, 3)), true)
  assert.equal(validateCourseDetailBody(coreBlocks.slice(0, 2)), true)
  assert.match(validateCourseDetailBody(coreBlocks.slice(0, 1)), /圖文版型區塊/)
  assert.match(validateCourseDetailBody([
    ...coreBlocks,
    { _type: 'courseDetailGallery', contentRole: 'curriculum' },
  ]), /課程架構只能選擇一種/)
  assert.equal(courseDetailGallery.title, '圖文版型區塊')
  assert.equal(courseDetailCurriculum.title, '課程架構（摺疊列表）')
})

test('audience and curriculum blocks, video status copy and video cover are optional', () => {
  const body = courseDetailContent.fields.find(({ name }) => name === 'body')
  const statusLabel = courseDetailVideo.fields.find(({ name }) => name === 'statusLabel')
  const videoImage = courseDetailVideo.fields.find(({ name }) => name === 'image')
  const bodyCalls = []
  const calls = []
  body.validation({
    required() { bodyCalls.push('required'); return this },
    min(value) { bodyCalls.push(['min', value]); return this },
    max(value) { bodyCalls.push(['max', value]); return this },
    custom() { bodyCalls.push('custom'); return this },
  })
  statusLabel.validation({
    required() { calls.push('required'); return this },
    min(value) { calls.push(['min', value]); return this },
    max(value) { calls.push(['max', value]); return this },
  })

  assert.equal(bodyCalls.some(call => Array.isArray(call) && call[0] === 'min' && call[1] === 2), true)
  assert.equal(calls.includes('required'), false)
  assert.equal(videoImage.validation, undefined)
  assert.equal(courseDetailText.title, '文字段落')
})

test('gallery supporting copy and item titles are optional but keep length limits', () => {
  const fields = [
    courseDetailGallery.fields.find(({ name }) => name === 'note'),
    courseDetailGallery.fields.find(({ name }) => name === 'statement'),
    courseDetailGalleryItem.fields.find(({ name }) => name === 'title'),
  ]

  for (const field of fields) {
    const calls = []
    field.validation({
      required() { calls.push('required'); return this },
      min(value) { calls.push(['min', value]); return this },
      max(value) { calls.push(['max', value]); return this },
    })
    assert.equal(calls.includes('required'), false, `${field.name} should be optional`)
    assert.equal(calls.some(call => Array.isArray(call) && call[0] === 'max'), true)
  }
})

test('all fields named description are optional but keep length limits', () => {
  const fields = [
    courseDetailGalleryItem,
    courseDetailGallery,
    courseDetailCurriculum,
    courseDetailAudience,
    courseDetailSchedule,
    courseDetailRegistration,
  ].map(type => type.fields.find(({ name }) => name === 'description'))

  for (const field of fields) {
    const calls = []
    field.validation({
      required() { calls.push('required'); return this },
      min(value) { calls.push(['min', value]); return this },
      max(value) { calls.push(['max', value]); return this },
    })
    assert.equal(field.title, '說明（選填）')
    assert.equal(calls.includes('required'), false, `${field.name} should be optional`)
    assert.equal(calls.some(call => Array.isArray(call) && call[0] === 'min'), true)
    assert.equal(calls.some(call => Array.isArray(call) && call[0] === 'max'), true)
  }
})

test('course detail publication requires a public-safe id, image and complete detail object', () => {
  const valid = {
    _id: 'course-japanese-facial-massage',
    isPublished: true,
    image: { asset: { _ref: 'image-asset' } },
    detail: { introduction: {} },
  }
  assert.equal(validateCourseDetailPublication(valid), true)
  assert.equal(validateCourseDetailPublication({ ...valid, _id: 'course.detail' }), '公開前台文件的 ID 不得包含句點。')
  assert.deepEqual(validateCourseDetailPublication({ ...valid, image: undefined }), {
    message: '公開課程前，請設定「代表圖」。',
    path: ['image'],
  })
  assert.deepEqual(validateCourseDetailPublication({ ...valid, detail: undefined }), {
    message: '公開課程前，請完成「課程詳情」。',
    path: ['detail'],
  })
  assert.equal(validateCourseDetailPublication({ isPublished: false }), true)
})

test('fixed course category identity cannot drift from the confirmed product structure', () => {
  assert.deepEqual(
    Object.values(courseCategoryDefinitions).map(({ id }) => id),
    ['course-category-body', 'course-category-heart', 'course-category-life', 'course-category-beauty'],
  )
  assert.equal(Object.values(courseCategoryDefinitions).every(({ id }) => !id.includes('.')), true)
  assert.equal(validateCourseCategoryIdentity({ key: 'body', name: '愛身體', order: 1 }), true)
  assert.notEqual(validateCourseCategoryIdentity({ key: 'body', name: '其他名稱', order: 1 }), true)
  assert.notEqual(validateCourseCategoryIdentity({ key: 'unknown', name: '愛身體', order: 1 }), true)

  const category = course.fields.find(({ name }) => name === 'category')
  assert.equal(category.options.filter, '_id in $categoryIds')
  assert.deepEqual(category.options.filterParams.categoryIds, Object.values(courseCategoryDefinitions).map(({ id }) => id))
})

test('course images require alt text when an image is present', () => {
  const image = course.fields.find(({ name }) => name === 'image')
  const alt = image.fields.find(({ name }) => name === 'alt')
  let required = false
  alt.validation({
    required() { required = true; return this },
    min() { return this },
    max() { return this },
  })
  assert.equal(required, true)
})
