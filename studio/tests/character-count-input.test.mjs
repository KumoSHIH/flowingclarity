import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSchema } from 'sanity'
import {
  formatCharacterCount,
  formatCharacterHint,
  getCharacterLimits,
} from '../components/characterLimits.ts'
import { schemaTypes } from '../schemaTypes/index.ts'

const schema = createSchema({ name: 'character-count-test', types: schemaTypes })

const fieldType = (typeName, fieldName) => (
  schema.get(typeName).fields.find(field => field.name === fieldName).type
)

test('reads character limits from constrained string and text fields', () => {
  assert.deepEqual(getCharacterLimits(fieldType('event', 'title')), { min: 2, max: 40 })
  assert.deepEqual(getCharacterLimits(fieldType('article', 'excerpt')), { min: 30, max: 140 })
  assert.equal(getCharacterLimits(fieldType('event', 'registrationUrl')), undefined)
})

test('formats clear character guidance for each supported limit shape', () => {
  assert.equal(formatCharacterHint({ min: 2, max: 20 }), '請輸入 2–20 字。')
  assert.equal(formatCharacterHint({ max: 20 }), '最多輸入 20 字。')
  assert.equal(formatCharacterHint({ min: 2 }), '至少輸入 2 字。')
  assert.equal(formatCharacterHint({ exact: 5 }), '請輸入 5 字。')
})

test('shows the current character count with the upper limit when available', () => {
  assert.equal(formatCharacterCount('流動', { min: 2, max: 20 }), '2/20')
  assert.equal(formatCharacterCount(undefined, { max: 20 }), '0/20')
  assert.equal(formatCharacterCount('文字', { min: 4 }), '目前 2 字')
})
