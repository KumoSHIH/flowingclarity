import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  article,
  articleCategoryIds,
  articleCategoryReferenceIsCanonical,
  relatedArticleReferenceFilter,
  validateArticleDetail,
} from '../schemaTypes/article.ts'
import {
  articleDetailSchemaTypes,
  articleLinkIsSafe,
} from '../schemaTypes/articleDetail.ts'
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
    'heroStyle', 'body', 'relatedArticles', 'seoTitle', 'seoDescription', 'shareImage',
  ])
  const category = article.fields.find(({ name }) => name === 'category')
  assert.equal(category.options.disableNew, true)
  assert.equal(category.options.filter, '_id in $categoryIds')
  assert.deepEqual(category.options.filterParams.categoryIds, articleCategoryIds)
  assert.equal(category.to[0].type, 'courseCategory')
  assert.equal(article.fields.find(({ name }) => name === 'tags').of[0].to[0].type, 'articleTag')
  assert.deepEqual(article.fields.find(({ name }) => name === 'body').of.map(({ type }) => type), [
    'articleRichTextSection', 'articleSplitMediaSection', 'articleWideImageSection',
  ])
  const relatedArticles = article.fields.find(({ name }) => name === 'relatedArticles')
  assert.equal(relatedArticles.of[0].title, '推薦文章')
  assert.equal(relatedArticles.of[0].to[0].type, 'article')
  assert.equal(relatedArticles.of[0].options.disableNew, true)
  assert.equal(relatedArticles.of[0].options.filter, relatedArticleReferenceFilter)
  assert.equal(article.preview.select.subtitle, 'category.name')
  assert.deepEqual(articleDetailSchemaTypes.map(({ name }) => name), [
    'articleContentImage', 'articleRichTextSection', 'articleSplitMediaSection', 'articleWideImageSection',
  ])
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

test('article detail validation enforces hero, body, self-reference, and safe links', () => {
  assert.equal(validateArticleDetail({
    _id: 'article-safe',
    heroStyle: 'split',
    body: [{ _type: 'articleRichTextSection' }],
  }), true)
  assert.deepEqual(validateArticleDetail({
    _id: 'drafts.article-safe',
    heroStyle: 'overlay',
    body: [],
    relatedArticles: [{ _ref: 'article-safe' }],
  }).map(({ path }) => path), [['coverImage'], ['body'], ['relatedArticles']])
  assert.equal(articleLinkIsSafe('/articles/example'), true)
  assert.equal(articleLinkIsSafe('https://example.com/article'), true)
  assert.match(articleLinkIsSafe('//example.com/article'), /只接受/)
  assert.match(articleLinkIsSafe('javascript:alert(1)'), /只接受/)
})

test('related article picker removes the current and already selected document pairs', () => {
  assert.deepEqual(relatedArticleReferenceFilter({
    document: {
      _id: 'drafts.article-current',
      relatedArticles: [
        { _ref: 'article-selected' },
        { _ref: 'drafts.article-another' },
      ],
    },
  }), {
    filter: '!(_id in $excludedIds)',
    params: {
      excludedIds: [
        'article-current',
        'drafts.article-current',
        'article-selected',
        'drafts.article-selected',
        'article-another',
        'drafts.article-another',
      ],
    },
    maxFieldDepth: 3,
  })
})

test('article portable text documents authored blank-line behavior', () => {
  const richText = articleDetailSchemaTypes.find(({ name }) => name === 'articleRichTextSection')
  const content = richText.fields.find(({ name }) => name === 'content')
  assert.match(content.description, /空白段落/)
})
