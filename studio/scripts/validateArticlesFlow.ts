import { createClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'
import { seedEditableSingletonDraft } from '../lib/seedEditableSingletonDraft.ts'

const client = getCliClient({ apiVersion: '2026-03-01' })
const phase = process.argv.at(-1)
const validationStamp = '20261015'
const prefix = `articles-validation-${validationStamp}`

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
if (!projectId) throw new Error('SANITY_STUDIO_PROJECT_ID is required')

const anonymousClient = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-01',
  perspective: 'published',
  useCdn: false,
})

const categoryIds = [
  'course-category-body',
  'course-category-heart',
  'course-category-life',
  'course-category-beauty',
]
const tagKeys = [
  'craniosacral',
  'human-design',
  'family-constellations',
  'body-awareness',
  'emotional-care',
  'life-rhythm',
  'facial-care',
  'breathing',
  'relationships',
  'self-expression',
]

export const validationIds = {
  page: 'articles-page',
  pageDraft: 'drafts.articles-page',
  tags: tagKeys.map(key => `${prefix}-tag-${key}`),
  articles: Array.from({ length: 24 }, (_, index) => (
    `${prefix}-article-${String(index + 1).padStart(2, '0')}`
  )),
}

const tagDraftIds = validationIds.tags.map(id => `drafts.${id}`)
const articleDraftIds = validationIds.articles.map(id => `drafts.${id}`)
const publishedIds = [validationIds.page, ...validationIds.tags, ...validationIds.articles]
const draftIds = [validationIds.pageDraft, ...tagDraftIds, ...articleDraftIds]
const allValidationIds = [...publishedIds, ...draftIds]

const pageDraft = {
  _id: validationIds.pageDraft,
  _type: 'articlesPage',
  pageTitle: '文章分享',
  intro: '這是可辨識且會在驗收後清除的文章內容流程測試，用來確認草稿、發布、篩選與分頁。',
  allLabel: '全部文章',
  tagFilterLabel: '相關標籤',
  resultsHeading: '最新文章',
  emptyMessage: '目前還沒有已發布的文章，請稍後再回來看看。',
  noMatchesMessage: '目前沒有符合這組條件的文章，可以調整或清除篩選。',
}

const tagLabels = [
  '頭薦骨',
  '人類圖',
  '家族系統排列',
  '身體覺察',
  '情緒照顧',
  '生命節奏',
  '日式臉部按摩',
  '呼吸練習',
  '關係探索',
  '自我表達',
]

function reference(id: string) {
  return { _type: 'reference', _ref: id }
}

function weakReference(id: string) {
  return { _type: 'reference', _ref: id, _weak: true }
}

const tagDrafts = validationIds.tags.map((id, index) => ({
  _id: `drafts.${id}`,
  _type: 'articleTag',
  name: tagLabels[index],
  slug: { _type: 'slug', current: `${prefix}-${tagKeys[index]}` },
  order: index + 1,
  description: index === 2
    ? '這是自行新增、並非由課程自動同步的內容流程驗收標籤。'
    : `這是第 ${String(index + 1).padStart(2, '0')} 個文章內容流程驗收標籤。`,
}))

function buildArticle(index: number) {
  const id = validationIds.articles[index]!
  const number = index + 1
  const tagCount = index === 7 ? 8 : (index % 3) + 1
  const selectedTagIds = Array.from({ length: tagCount }, (_, offset) => (
    validationIds.tags[(index + offset) % validationIds.tags.length]!
  ))
  const longTitle = '從身體感受重新理解關係與生命節奏的文章內容流程完整驗收紀錄'
  const longExcerpt = '這段摘要用來確認文章內容達到契約上限附近時，桌面與手機版仍能自然換行，並保有清楚的分類、標籤、日期與閱讀入口。'.repeat(3).slice(0, 140)

  return {
    _id: `drafts.${id}`,
    _type: 'article',
    title: index === 9 ? longTitle.slice(0, 50) : `內容流程驗收文章 ${String(number).padStart(2, '0')}`,
    slug: { _type: 'slug', current: id },
    category: reference(categoryIds[index % categoryIds.length]!),
    tags: selectedTagIds.map(weakReference),
    excerpt: index === 10
      ? longExcerpt
      : `這是第 ${String(number).padStart(2, '0')} 篇可辨識且驗收後會清除的文章測試資料，用來確認公開列表、篩選與分頁行為。`,
    publishedAt: new Date(Date.UTC(2026, 9, 15 - index, 4, 0, 0)).toISOString(),
  }
}

const articleDrafts = Array.from({ length: 24 }, (_, index) => buildArticle(index))

function withoutSystemFields(document: Record<string, unknown>, id: string) {
  const { _rev, _createdAt, _updatedAt, ...content } = document
  return { ...content, _id: id }
}

function strongReferences(document: Record<string, unknown>, id: string) {
  const makeStrong = (value: unknown) => Array.isArray(value)
    ? value.map(item => reference((item as { _ref: string })._ref.replace(/^drafts\./, '')))
    : []
  const category = document.category as { _ref?: string } | undefined
  return {
    ...withoutSystemFields(document, id),
    ...(category?._ref ? { category: reference(category._ref.replace(/^drafts\./, '')) } : {}),
    tags: makeStrong(document.tags),
  }
}

async function requireMissing() {
  const documents = await client.getDocuments(allValidationIds)
  if (documents.some(Boolean)) {
    throw new Error('Articles validation documents already exist; refusing to overwrite them.')
  }
  const existingArticleContent = await client.fetch<number>(
    'count(*[_type in ["articlesPage", "articleTag", "article"]])',
  )
  if (existingArticleContent !== 0) {
    throw new Error(`Existing Articles content detected (${existingArticleContent}); refusing to mix validation data.`)
  }
  const categories = await anonymousClient.fetch<{ _id: string, key: string }[]>(
    '*[_id in $ids && _type == "courseCategory"]{_id, key}',
    { ids: categoryIds },
  )
  if (categories.length !== 4) {
    throw new Error(`Expected four anonymously readable course categories, found ${categories.length}.`)
  }
}

async function requireDocuments(ids: string[]) {
  const documents = await client.getDocuments(ids)
  if (documents.some(document => !document)) {
    throw new Error(`Missing validation documents: ${ids.join(', ')}`)
  }
  return documents as Record<string, unknown>[]
}

async function createDrafts() {
  await requireMissing()
  let transaction = client.transaction().create(pageDraft)
  for (const tag of tagDrafts) transaction = transaction.create(tag)
  for (const article of articleDrafts) transaction = transaction.create(article)
  await transaction.commit()
  console.log(`created drafts: page 1, tags ${tagDrafts.length}, articles ${articleDrafts.length}`)
}

async function publishDrafts() {
  const documents = await requireDocuments(draftIds)
  let transaction = client.transaction()
  for (const [index, document] of documents.entries()) {
    const publishedId = publishedIds[index]!
    transaction = transaction
      .create(document._type === 'article'
        ? strongReferences(document, publishedId)
        : withoutSystemFields(document, publishedId))
      .delete(draftIds[index]!)
  }
  await transaction.commit()
  console.log(`published: page 1, tags ${validationIds.tags.length}, articles ${validationIds.articles.length}`)
}

async function createUpdateDrafts() {
  const [page, firstArticle] = await requireDocuments([
    validationIds.page,
    validationIds.articles[0]!,
  ])
  await client.transaction()
    .create({
      ...withoutSystemFields(page, validationIds.pageDraft),
      intro: '草稿更新標記：匿名訪客在再次發布前仍應看見上一個公開版本，而不是這段文字。',
    })
    .create({
      ...withoutSystemFields(firstArticle, articleDraftIds[0]!),
      title: '草稿更新驗收文章',
    })
    .commit()
  console.log('created update drafts: page 1, articles 1')
}

async function publishUpdates() {
  const [page, article] = await requireDocuments([
    validationIds.pageDraft,
    articleDraftIds[0]!,
  ])
  await client.transaction()
    .createOrReplace(withoutSystemFields(page, validationIds.page))
    .createOrReplace(strongReferences(article, validationIds.articles[0]!))
    .delete(validationIds.pageDraft)
    .delete(articleDraftIds[0]!)
    .commit()
  console.log('published updates: page 1, articles 1')
}

async function anonymousOverview() {
  return anonymousClient.fetch<{
    page: null | { intro?: string }
    categories: { _id: string }[]
    tags: { _id: string }[]
    articles: { _id: string, title?: string, categoryKey?: string, tagSlugs?: string[] }[]
  }>(`{
    "page": *[_id == "articles-page" && _type == "articlesPage"][0]{intro},
    "categories": *[_id in $categoryIds && _type == "courseCategory"]{_id},
    "tags": *[_id in $tagIds && _type == "articleTag"]{_id},
    "articles": *[_id in $articleIds && _type == "article"] | order(publishedAt desc, _id asc){
      _id,
      title,
      "categoryKey": category->key,
      "tagSlugs": tags[]->slug.current
    }
  }`, {
    categoryIds,
    tagIds: validationIds.tags,
    articleIds: validationIds.articles,
  })
}

async function verifyDraftIsolation() {
  const overview = await anonymousOverview()
  if (overview.page || overview.tags.length || overview.articles.length || overview.categories.length !== 4) {
    throw new Error('Anonymous published query exposed drafts or could not read category prerequisites.')
  }
  console.log('anonymous draft isolation verified; four published categories remain readable')
}

async function verifyPublished(expectUpdate: boolean) {
  const overview = await anonymousOverview()
  if (!overview.page
    || overview.categories.length !== 4
    || overview.tags.length !== validationIds.tags.length
    || overview.articles.length !== validationIds.articles.length) {
    throw new Error(`Unexpected anonymous published counts: ${JSON.stringify({
      page: Boolean(overview.page),
      categories: overview.categories.length,
      tags: overview.tags.length,
      articles: overview.articles.length,
    })}`)
  }
  if (overview.articles.some(item => !item.categoryKey || !item.tagSlugs?.length)) {
    throw new Error('Anonymous query could not resolve one or more category or tag references.')
  }
  if (overview.articles[7]?.tagSlugs?.length !== 8) {
    throw new Error('The maximum eight-tag article did not preserve all published references.')
  }
  const hasUpdate = overview.page.intro?.startsWith('草稿更新標記') === true
    && overview.articles.some(item => item.title === '草稿更新驗收文章')
  if (hasUpdate !== expectUpdate) {
    throw new Error(expectUpdate ? 'Published update is missing.' : 'Draft update leaked into published results.')
  }
  console.log({
    anonymousPublished: true,
    updated: hasUpdate,
    categories: overview.categories.length,
    tags: overview.tags.length,
    articles: overview.articles.length,
  })
}

async function cleanup() {
  await client.delete({ query: '*[_id in $ids]', params: { ids: allValidationIds } })
  console.log(`deleted validation documents: ${allValidationIds.length}`)
}

async function verifyCleanup() {
  const documents = await client.getDocuments(allValidationIds)
  if (documents.some(Boolean)) throw new Error('One or more Articles validation documents remain after cleanup.')
  const overview = await anonymousOverview()
  if (overview.page || overview.tags.length || overview.articles.length) {
    throw new Error('Anonymous query still exposes Articles validation content after cleanup.')
  }
  console.log('authenticated and anonymous cleanup verified')
}

async function seedPageDraft() {
  const draftId = await seedEditableSingletonDraft(client, {
    publishedId: validationIds.page,
    schemaType: 'articlesPage',
  })
  console.log(`created editable page draft: ${draftId}`)
}

async function verifyPageDraft() {
  const [published, draft] = await client.getDocuments([validationIds.page, validationIds.pageDraft])
  if (published || draft?._type !== 'articlesPage') {
    throw new Error('Expected one unpublished Articles page draft and no published singleton.')
  }
  const contentFields = Object.keys(draft).filter(key => ![
    '_id',
    '_type',
    '_rev',
    '_createdAt',
    '_updatedAt',
  ].includes(key))
  if (contentFields.length) {
    throw new Error(`Seeded Articles page draft is not empty: ${contentFields.join(', ')}`)
  }
  const overview = await anonymousOverview()
  if (overview.page) throw new Error('Anonymous query exposed the seeded Articles page draft.')
  console.log('editable Articles page draft verified; anonymous published page remains empty')
}

async function inspect() {
  const documents = await client.getDocuments(allValidationIds)
  const existing = documents.filter(Boolean)
  const overview = await anonymousOverview()
  console.log({
    dataset,
    total: existing.length,
    published: existing.filter(document => !document!._id.startsWith('drafts.')).length,
    drafts: existing.filter(document => document!._id.startsWith('drafts.')).length,
    types: [...new Set(existing.map(document => document!._type))],
    anonymousPage: Boolean(overview.page),
    anonymousValidationTags: overview.tags.length,
    anonymousValidationArticles: overview.articles.length,
  })
}

if (phase === 'draft') await createDrafts()
else if (phase === 'verify-draft') await verifyDraftIsolation()
else if (phase === 'publish') await publishDrafts()
else if (phase === 'verify-published') await verifyPublished(false)
else if (phase === 'draft-update') await createUpdateDrafts()
else if (phase === 'verify-draft-update') await verifyPublished(false)
else if (phase === 'publish-update') await publishUpdates()
else if (phase === 'verify-published-update') await verifyPublished(true)
else if (phase === 'cleanup') await cleanup()
else if (phase === 'verify-cleanup') await verifyCleanup()
else if (phase === 'seed-page-draft') await seedPageDraft()
else if (phase === 'verify-page-draft') await verifyPageDraft()
else if (phase === 'inspect') await inspect()
else throw new Error('Use one phase: draft, verify-draft, publish, verify-published, draft-update, verify-draft-update, publish-update, verify-published-update, inspect, cleanup, verify-cleanup, seed-page-draft, verify-page-draft')
