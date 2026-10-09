import assert from 'node:assert/strict'
import { test } from 'node:test'
import { course } from '../schemaTypes/course.ts'
import {
  courseCategory,
  courseCategoryDefinitions,
  validateCourseCategoryIdentity,
} from '../schemaTypes/courseCategory.ts'
import { courseOverviewPage } from '../schemaTypes/courseOverviewPage.ts'
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
    'order',
    'isPublished',
  ])
  assert.deepEqual(courseRun.fields.map(({ name }) => name), [
    'course',
    'label',
    'registrationStatus',
    'isPublished',
    'stages',
  ])
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
