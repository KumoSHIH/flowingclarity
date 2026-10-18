import assert from 'node:assert/strict'
import { test } from 'node:test'
import { aboutPage, aboutPageId } from '../schemaTypes/aboutPage.ts'

test('about page is one public-safe singleton with semantic content groups', () => {
  assert.equal(aboutPageId, 'about-page')
  assert.equal(aboutPageId.includes('.'), false)
  assert.deepEqual(aboutPage.groups.map(group => group.name), ['intro', 'story', 'place', 'moments', 'contact', 'seo'])
  assert.equal(aboutPage.fields.some(field => ['leftColumn', 'rightColumn', 'card'].includes(field.name)), false)
  let validate
  aboutPage.validation({ custom(fn) { validate = fn; return this } })
  assert.equal(validate({}, { document: { _id: aboutPageId } }), true)
  assert.equal(validate({}, { document: { _id: `drafts.${aboutPageId}` } }), true)
  assert.notEqual(validate({}, { document: { _id: 'duplicate-about' } }), true)
})

test('about page requires three to ten sortable moments and semantic media fields', () => {
  const featured = aboutPage.fields.find(field => field.name === 'featuredMoments')
  const items = featured.fields.find(field => field.name === 'items')
  const calls = []
  items.validation({ required() { calls.push('required'); return this }, min(value) { calls.push(['min', value]); return this }, max(value) { calls.push(['max', value]); return this } })
  assert.deepEqual(calls, ['required', ['min', 3], ['max', 10]])
  assert.ok(aboutPage.fields.find(field => field.name === 'heroImage'))
  assert.ok(aboutPage.fields.find(field => field.name === 'placeAndTeam'))
})
