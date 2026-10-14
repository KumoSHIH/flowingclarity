import assert from 'node:assert/strict'
import { test } from 'node:test'
import { practitioner, validatePractitionerPublication } from '../schemaTypes/practitioner.ts'
import { sessionPage, sessionPageId, validateSessionPageTitle } from '../schemaTypes/sessionPage.ts'
import { sessionMethod, sessionRegion } from '../schemaTypes/sessionTaxonomy.ts'

test('session schemas expose semantic fields and a public-safe singleton id', () => {
  assert.equal(sessionPageId, 'session-page')
  assert.equal(sessionPageId.includes('.'), false)
  assert.deepEqual(sessionPage.fields.map(({ name }) => name), [
    'pageTitle',
    'intro',
    'resultsHeading',
    'emptyMessage',
    'noMatchesMessage',
  ])
  assert.deepEqual(sessionRegion.fields.map(({ name }) => name), ['key', 'label', 'order'])
  assert.deepEqual(sessionMethod.fields.map(({ name }) => name), ['key', 'label', 'order'])
  assert.deepEqual(practitioner.fields.map(({ name }) => name), [
    'name',
    'englishName',
    'slug',
    'regions',
    'methods',
    'summary',
    'order',
    'isPublished',
  ])
})

test('session page title allows one authored line break and rejects HTML', () => {
  assert.equal(validateSessionPageTitle('尋找\n執行師'), true)
  assert.match(validateSessionPageTitle('尋找\n適合的\n執行師'), /一個換行/)
  assert.match(validateSessionPageTitle('尋找\n\n執行師'), /一個換行/)
  assert.match(validateSessionPageTitle('<br>尋找執行師'), /HTML/)
})

test('published practitioners require public-safe ids and taxonomy references', () => {
  assert.equal(validatePractitionerPublication({
    _id: 'practitioner-lin',
    isPublished: true,
  }), true)
  assert.match(validatePractitionerPublication({
    _id: 'practitioner.lin',
    isPublished: true,
  }), /不得包含句點/)
  assert.equal(validatePractitionerPublication({
    _id: 'practitioner.lin',
    isPublished: false,
  }), true)
  assert.equal(practitioner.fields.find(({ name }) => name === 'regions').of[0].to[0].type, 'sessionRegion')
  assert.equal(practitioner.fields.find(({ name }) => name === 'methods').of[0].to[0].type, 'sessionMethod')
})
