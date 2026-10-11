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
  courseDetailGallery,
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
      'courseOverviewPage',
      'courseCategory',
      'courseDetailIntroduction',
      'courseDetailGalleryItem',
      'courseDetailGallery',
      'courseDetailTeacher',
      'courseDetailQuote',
      'courseDetailCurriculumUnit',
      'courseDetailCurriculum',
      'courseDetailVideo',
      'courseDetailAudience',
      'courseDetailSchedule',
      'courseDetailRegistration',
      'courseDetailContent',
      'course',
      'courseDateRange',
      'courseStage',
      'courseRun',
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
    'detailIsPublished',
    'detail',
    'order',
    'isPublished',
  ])
  assert.deepEqual(courseRun.fields.map(({ name }) => name), [
    'course',
    'label',
    'registrationStatus',
    'isPublished',
    'city',
    'venue',
    'timeLabel',
    'capacityLabel',
    'feeLabel',
    'registrationUrl',
    'notes',
    'stages',
  ])
  assert.deepEqual(courseDetailContent.fields.map(({ name }) => name), [
    'notice',
    'englishTitle',
    'body',
    'schedule',
    'registration',
  ])
  assert.deepEqual(
    courseDetailContent.fields.find(({ name }) => name === 'body').of.map(({ type }) => type),
    [
      'courseDetailIntroduction',
      'courseDetailGallery',
      'courseDetailTeacher',
      'courseDetailQuote',
      'courseDetailCurriculum',
      'courseDetailVideo',
      'courseDetailAudience',
    ],
  )
  assert.deepEqual(
    courseDetailGallery.fields.find(({ name }) => name === 'layout').options.list.map(({ value }) => value),
    ['collage', 'stages', 'weave', 'folio', 'dossier'],
  )
  const multilineFields = schemaTypes
    .filter(({ name }) => name.startsWith('courseDetail'))
    .flatMap(({ fields = [] }) => fields.flatMap(field => [field, ...(field.of ?? [])]))
    .filter(({ type }) => type === 'text')
  assert.equal(multilineFields.length, 13)
  assert.equal(multilineFields.every(({ description }) => description === '可按 Enter 換行，前台會保留段落。'), true)
})

test('course detail body supports ordered mixed blocks and requires core content', () => {
  const coreBlocks = [
    { _type: 'courseDetailIntroduction' },
    { _type: 'courseDetailGallery' },
    { _type: 'courseDetailCurriculum' },
    { _type: 'courseDetailAudience' },
  ]
  assert.equal(validateCourseDetailBody(coreBlocks), true)
  assert.match(validateCourseDetailBody(coreBlocks.slice(0, 3)), /適合對象/)
  assert.equal(courseDetailGallery.title, '圖文版型區塊')
})

test('course detail publication requires a public-safe id, image and complete detail object', () => {
  const detailPublishedField = course.fields.find(({ name }) => name === 'detailIsPublished')
  assert.equal(detailPublishedField.initialValue, false)
  assert.equal(detailPublishedField.validation, undefined)

  const valid = {
    _id: 'course-japanese-facial-massage',
    detailIsPublished: true,
    image: { asset: { _ref: 'image-asset' } },
    detail: { introduction: {} },
  }
  assert.equal(validateCourseDetailPublication(valid), true)
  assert.equal(validateCourseDetailPublication({ ...valid, _id: 'course.detail' }), '公開前台文件的 ID 不得包含句點。')
  assert.equal(validateCourseDetailPublication({ ...valid, image: undefined }), '公開課程內頁前必須設定代表圖。')
  assert.equal(validateCourseDetailPublication({ ...valid, detail: undefined }), '公開課程內頁前必須完成課程詳情內容。')
  assert.equal(validateCourseDetailPublication({ detailIsPublished: false }), true)
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
