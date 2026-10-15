import assert from 'node:assert/strict'
import { test } from 'node:test'
import { article } from '../schemaTypes/article.ts'
import { articleTag, articleDocumentIdIsSafe } from '../schemaTypes/articleTag.ts'
import { articlesPage, articlesPageId } from '../schemaTypes/articlesPage.ts'

test('article schemas expose the approved semantic contract', () => {
  assert.equal(articlesPageId, 'articles-page')
  assert.equal(articlesPageId.includes('.'), false)
  assert.deepEqual(articlesPage.fields.map(({ name }) => name), [
    'pageTitle', 'intro', 'allLabel', 'tagFilterLabel', 'resultsHeading', 'emptyMessage', 'noMatchesMessage',
  ])
  assert.deepEqual(articleTag.fields.map(({ name }) => name), ['name', 'slug', 'order', 'description'])
  assert.deepEqual(article.fields.map(({ name }) => name), [
    'title', 'slug', 'category', 'tags', 'excerpt', 'publishedAt', 'coverImage',
  ])
  assert.equal(article.fields.find(({ name }) => name === 'category').options.disableNew, true)
  assert.equal(article.fields.find(({ name }) => name === 'category').to[0].type, 'courseCategory')
  assert.equal(article.fields.find(({ name }) => name === 'tags').of[0].to[0].type, 'articleTag')
})

test('public article documents reject protected ids', () => {
  assert.equal(articleDocumentIdIsSafe({ _id: 'article-safe' }), true)
  assert.match(articleDocumentIdIsSafe({ _id: 'article.unsafe' }), /不得包含句點/)
  assert.equal(article.fields.some(({ name }) => name === 'isPublished'), false)
})
