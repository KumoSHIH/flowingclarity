import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  deriveCourseRunDateBounds,
  validateCourseRunPublication,
  validateCourseRunStages,
} from '../schemaTypes/courseRun.ts'

const stages = [
  {
    title: '第一階',
    order: 1,
    dateRanges: [
      { startDate: '2026-01-21', endDate: '2026-01-25' },
      { startDate: '2026-01-28', endDate: '2026-02-01' },
    ],
  },
  {
    title: '第二階',
    order: 2,
    dateRanges: [{ startDate: '2026-06-19', endDate: '2026-06-23' }],
  },
]

test('validates ordered non-overlapping stages and derives their date bounds', () => {
  assert.equal(validateCourseRunStages(stages), true)
  assert.deepEqual(deriveCourseRunDateBounds(stages), {
    firstStartDate: '2026-01-21',
    lastEndDate: '2026-06-23',
  })
})

test('requires an HTTPS registration target before an open run can be public', () => {
  assert.equal(validateCourseRunPublication({
    _id: 'course-run-spring',
    isPublished: true,
    registrationStatus: 'open',
    registrationUrl: 'https://forms.example.com/course',
  }), true)
  assert.deepEqual(validateCourseRunPublication({
    _id: 'course-run-spring',
    isPublished: true,
    registrationStatus: 'open',
  }), {
    message: '此梯次已設為「開放報名」；公開前請填寫有效的 HTTPS 報名網址。',
    path: ['registrationUrl'],
  })
  assert.deepEqual(validateCourseRunPublication({
    _id: 'course-run-spring',
    isPublished: true,
    registrationStatus: 'open',
    registrationUrl: 'javascript:alert(1)',
  }), {
    message: '此梯次已設為「開放報名」；公開前請填寫有效的 HTTPS 報名網址。',
    path: ['registrationUrl'],
  })
  assert.equal(validateCourseRunPublication({
    _id: 'course.run.spring',
    isPublished: true,
    registrationStatus: 'scheduled',
  }), '公開前台文件的 ID 不得包含句點。')
  assert.equal(validateCourseRunPublication({
    isPublished: false,
    registrationStatus: 'open',
  }), true)
})

test('rejects duplicate stage order, inverted dates, overlap and out-of-order ranges', () => {
  assert.notEqual(validateCourseRunStages([
    stages[0],
    { ...stages[1], order: 1 },
  ]), true)
  assert.notEqual(validateCourseRunStages([{
    ...stages[0],
    dateRanges: [{ startDate: '2026-01-25', endDate: '2026-01-21' }],
  }]), true)
  assert.notEqual(validateCourseRunStages([{
    ...stages[0],
    dateRanges: [
      { startDate: '2026-01-21', endDate: '2026-01-25' },
      { startDate: '2026-01-25', endDate: '2026-01-28' },
    ],
  }]), true)
  assert.notEqual(validateCourseRunStages([
    stages[1],
    stages[0],
  ]), true)
})
