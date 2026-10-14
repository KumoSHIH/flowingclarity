import assert from 'node:assert/strict'
import { test } from 'node:test'
import { seedEditableSingletonDraft } from '../lib/seedEditableSingletonDraft.ts'

function createClient(documents = []) {
  const created = []
  return {
    created,
    async getDocuments() {
      return documents
    },
    async create(document) {
      created.push(document)
      return document
    },
  }
}

test('seeds an empty editable draft for a missing public singleton', async () => {
  const client = createClient([null, null])

  const draftId = await seedEditableSingletonDraft(client, {
    publishedId: 'session-page',
    schemaType: 'sessionPage',
  })

  assert.equal(draftId, 'drafts.session-page')
  assert.deepEqual(client.created, [{
    _id: 'drafts.session-page',
    _type: 'sessionPage',
  }])
})

test('refuses to overwrite an existing singleton or use a protected published id', async () => {
  await assert.rejects(
    seedEditableSingletonDraft(createClient([{ _id: 'session-page' }, null]), {
      publishedId: 'session-page',
      schemaType: 'sessionPage',
    }),
    /already exists/,
  )
  await assert.rejects(
    seedEditableSingletonDraft(createClient([null, null]), {
      publishedId: 'session.page',
      schemaType: 'sessionPage',
    }),
    /public-safe/,
  )
})
