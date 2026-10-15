import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  article,
  articleCategoryIds,
  articleCategoryReferenceIsCanonical,
} from '../schemaTypes/article.ts'
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
  const category = article.fields.find(({ name }) => name === 'category')
  assert.equal(category.options.disableNew, true)
  assert.equal(category.options.filter, '_id in $categoryIds')
  assert.deepEqual(category.options.filterParams.categoryIds, articleCategoryIds)
  assert.equal(category.to[0].type, 'courseCategory')
  assert.equal(article.fields.find(({ name }) => name === 'tags').of[0].to[0].type, 'articleTag')
})

test('article categories only allow the four canonical public documents', () => {
  assert.deepEqual(articleCategoryIds, [
    'course-category-body',
    'course-category-heart',
    'course-category-life',
    'course-category-beauty',
  ])
  assert.equal(articleCategoryReferenceIsCanonical({ _ref: 'course-category-body' }), true)
  assert.match(articleCategoryReferenceIsCanonical({ _ref: 'courseCategory.body' }), /四個正式主要分類/)
  assert.match(articleCategoryReferenceIsCanonical({ _ref: 'course-category-other' }), /四個正式主要分類/)
  assert.equal(articleCategoryReferenceIsCanonical(undefined), true)
})

test('public article documents reject protected ids', () => {
  assert.equal(articleDocumentIdIsSafe({ _id: 'article-safe' }), true)
  assert.match(articleDocumentIdIsSafe({ _id: 'article.unsafe' }), /不得包含句點/)
  assert.equal(article.fields.some(({ name }) => name === 'isPublished'), false)
})
