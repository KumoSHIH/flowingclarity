import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createStructureBuilder } from 'sanity/structure'
import { structure } from '../structure.ts'

test('the Studio structure exposes singletons, fixed categories and course collections', () => {
  const S = createStructureBuilder({
    source: {
      projectId: 'test-project-id',
      dataset: 'production',
      schema: { get: () => undefined },
      document: { resolveNewDocumentOptions: () => [] },
    },
    perspectiveStack: [],
  })

  const root = structure(S, {}).serialize({ path: [] })

  assert.equal(root.id, 'content')
  assert.equal(root.items[0].id, 'home-banner')
  assert.equal(root.items[0].child.id, 'homeBanner')
  assert.equal(root.items[0].child.options.id, 'homeBanner')
  assert.equal(root.items[2].id, 'course-overview-page')
  assert.equal(root.items[2].child.options.id, 'courseOverviewPage')
  assert.equal(root.items[3].id, 'course-categories')
  assert.deepEqual(
    root.items[3].child.items.map(item => item.child.options.id),
    ['course-category-body', 'course-category-heart', 'course-category-life', 'course-category-beauty'],
  )
  assert.equal(root.items[4].id, 'courses')
  assert.equal(root.items[5].id, 'course-runs')
})
