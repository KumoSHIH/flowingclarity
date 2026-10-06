import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  deriveCourseRunDateBounds,
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
