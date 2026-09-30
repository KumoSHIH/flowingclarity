import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createStructureBuilder } from 'sanity/structure'
import { structure } from '../structure.ts'

test('the Studio structure has valid IDs and opens the singleton Banner', () => {
  const S = createStructureBuilder({
    source: {
      projectId: 'hnypuj6l',
      dataset: 'production',
      schema: { get: () => undefined },
    },
    perspectiveStack: [],
  })

  const root = structure(S, {}).serialize({ path: [] })

  assert.equal(root.id, 'content')
  assert.equal(root.items[0].id, 'home-banner')
  assert.equal(root.items[0].child.id, 'homeBanner')
  assert.equal(root.items[0].child.options.id, 'homeBanner')
})
