import assert from 'node:assert/strict'
import { test } from 'node:test'
import { homePage, homePageId } from '../schemaTypes/homePage.ts'
import { seedEditableSingletonDraft } from '../lib/seedEditableSingletonDraft.ts'
import { hiddenGlobalTemplateIds, protectedSingletonSchemaTypes } from '../lib/singletonSchemaTypes.ts'

test('home page is a public-safe singleton with semantic content groups', () => {
  assert.equal(homePageId, 'home-page')
  assert.equal(homePageId.includes('.'), false)
  assert.deepEqual(homePage.groups.map(group => group.name), ['introduction', 'events', 'courses', 'contact'])
  assert.equal(homePage.fields.some(field => ['leftColumn', 'rightColumn', 'card1'].includes(field.name)), false)
  let validate
  homePage.validation({ custom(fn) { validate = fn; return this } })
  assert.equal(validate({}, { document: { _id: homePageId } }), true)
  assert.equal(validate({}, { document: { _id: `drafts.${homePageId}` } }), true)
  assert.notEqual(validate({}, { document: { _id: 'duplicate-home' } }), true)
})

test('home page singleton can be seeded only as a minimal empty draft', async () => {
  const created = []
  const client = { getDocuments: async () => [null, null], create: async document => { created.push(document) } }
  const id = await seedEditableSingletonDraft(client, { publishedId: homePageId, schemaType: 'homePage' })
  assert.equal(id, 'drafts.home-page')
  assert.deepEqual(created, [{ _id: 'drafts.home-page', _type: 'homePage' }])
})

test('home page singleton cannot be created globally, duplicated, deleted, or unpublished', () => {
  assert.ok(protectedSingletonSchemaTypes.includes('homePage'))
  assert.ok(hiddenGlobalTemplateIds.includes('homePage'))
})
