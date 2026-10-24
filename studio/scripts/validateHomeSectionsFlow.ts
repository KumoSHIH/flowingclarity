import { createClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'
import { seedEditableSingletonDraft } from '../lib/seedEditableSingletonDraft.ts'
import { parseHomeSections } from '../../web/shared/utils/homeSections.ts'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
if (!projectId) throw new Error('SANITY_STUDIO_PROJECT_ID is required')

const client = getCliClient({ apiVersion: '2026-03-01' })
const anonymousClient = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-01',
  perspective: 'published',
  useCdn: false,
})

const stamp = '20261024'
const prefix = `home-validation-${stamp}`
const ids = {
  page: 'home-page',
  pageDraft: 'drafts.home-page',
  events: Array.from({ length: 4 }, (_, index) => `${prefix}-event-${index + 1}`),
  courses: Array.from({ length: 4 }, (_, index) => `${prefix}-course-${index + 1}`),
  runs: Array.from({ length: 4 }, (_, index) => `${prefix}-run-${index + 1}`),
}
const draftIds = [...ids.events, ...ids.courses, ...ids.runs].map(id => `drafts.${id}`)
const publishedIds = [...ids.events, ...ids.courses, ...ids.runs]
const allValidationIds = [ids.page, ids.pageDraft, ...publishedIds, ...draftIds]

const imageProjection = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt,
  hotspot
}`

const contentQuery = `{
  "page": *[_id == "home-page" && _type == "homePage"][0]{
    introductionLabel,
    introductionHeading,
    introductionParagraphs,
    "introductionImage": introductionImage${imageProjection},
    introductionCaption,
    eventsHeading,
    eventsIntroduction,
    eventsEmptyMessage,
    coursesHeading,
    coursesIntroduction,
    coursesEmptyMessage,
    contactHeading,
    contactIntroduction,
    contactButtonLabel
  },
  "settings": *[_id == "site-settings" && _type == "siteSettings"][0]{contact{email}},
  "events": *[_type == "event" && isPublished == true]{_id, title, eventType, startAt, endAt, scheduleNote, registrationStatus, order, isPublished},
  "courses": *[_type == "course" && isPublished == true]{
    _id,
    title,
    summary,
    isPublished,
    "categoryName": category->name,
    "image": image${imageProjection},
    "runs": *[_type == "courseRun" && isPublished == true && references(^._id)]{registrationStatus, isPublished, stages[]{dateRanges[]{startDate}}}
  }
}`

function taipeiDate(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 86_400_000)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

function addMonths(value: string, months: number) {
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  const target = new Date(Date.UTC(year, month - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  return new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay))).toISOString().slice(0, 10)
}

function withoutSystemFields(document: Record<string, unknown>, id: string) {
  const { _rev, _createdAt, _updatedAt, ...content } = document
  return { ...content, _id: id }
}

async function prerequisites() {
  const [asset, category, settings] = await Promise.all([
    client.fetch<{ _id: string } | null>('*[_type == "sanity.imageAsset"][0]{_id}'),
    client.fetch<{ _id: string } | null>('*[_type == "courseCategory" && _id match "course-category-*"][0]{_id}'),
    anonymousClient.fetch<{ email?: string } | null>('*[_id == "site-settings" && _type == "siteSettings"][0]{"email": contact.email}'),
  ])
  if (!asset?._id) throw new Error('Production has no reusable Sanity image asset; refusing to create validation content without an approved image.')
  if (!category?._id) throw new Error('Production has no public-safe course category; refusing to create an invalid validation course.')
  if (!settings?.email) throw new Error('Published site-settings has no contact email; homepage contact flow cannot be validated without changing shared production content.')
  return { assetId: asset._id, categoryId: category._id }
}

async function requireMissing() {
  const documents = await client.getDocuments(allValidationIds)
  const existing = documents.filter(Boolean)
  if (existing.length) {
    throw new Error(`Home validation stopped because protected or validation documents already exist: ${existing.map(document => document!._id).join(', ')}`)
  }
}

function buildDocuments(assetId: string, categoryId: string) {
  const image = { _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt: '首頁內容流程驗收使用的空間情境圖片' }
  const page = {
    _id: ids.pageDraft,
    _type: 'homePage',
    introductionLabel: '首頁驗收',
    introductionHeading: '首頁內容流程驗收標題',
    introductionParagraphs: [
      '這是可辨識且會在驗收完成後清除的首頁品牌介紹文字，不代表正式品牌內容。',
      '這段文字用來確認草稿、發布、圖片、排序與前台內容轉換流程皆能正常運作。',
    ],
    introductionImage: image,
    introductionCaption: 'CONTENT FLOW VALIDATION',
    eventsHeading: '近期活動',
    eventsIntroduction: '這是首頁活動區的內容流程驗收文字，完成後會從正式資料集中清除。',
    eventsEmptyMessage: '目前沒有近期活動，歡迎稍後再回來查看最新消息。',
    coursesHeading: '近期課程',
    coursesIntroduction: '這是首頁課程區的內容流程驗收文字，完成後會從正式資料集中清除。',
    coursesEmptyMessage: '目前沒有已確定日期的近期課程，歡迎稍後再回來查看。',
    contactHeading: '首頁聯絡流程驗收',
    contactIntroduction: '這是首頁聯絡區的流程驗收文字，按鈕沿用全站設定中的公開電子郵件。',
    contactButtonLabel: '寫信給我們',
  }
  const now = Date.now()
  const events = ids.events.map((id, index) => ({
    _id: `drafts.${id}`,
    _type: 'event',
    title: `首頁驗收活動 ${index + 1}`,
    slug: { _type: 'slug', current: id },
    eventType: index === 3 ? '補位測試' : '內容驗收',
    summary: '這是可辨識且會在首頁內容流程驗收後清除的活動測試資料，不代表正式活動。',
    startAt: new Date(now + (index + 1) * 3_600_000).toISOString(),
    endAt: new Date(now + (index + 2) * 3_600_000).toISOString(),
    deliveryMode: 'online',
    city: '線上',
    detail: { _type: 'eventDetailContent' },
    registrationStatus: 'scheduled',
    archiveVisible: true,
    order: index + 1,
    isPublished: true,
  }))
  const today = taipeiDate()
  const courseDates = [today, taipeiDate(1), taipeiDate(2), addMonths(today, 7)]
  const courses = ids.courses.map((id, index) => ({
    _id: `drafts.${id}`,
    _type: 'course',
    title: `首頁驗收課程 ${index + 1}`,
    slug: { _type: 'slug', current: id },
    category: { _type: 'reference', _ref: categoryId },
    deliveryModes: ['online'],
    summary: '這是可辨識且會在首頁內容流程驗收後清除的課程摘要，不代表正式課程或招生資訊。',
    image,
    detail: { _type: 'courseDetailContent' },
    order: 900 + index,
    isPublished: true,
  }))
  const runs = ids.runs.map((id, index) => ({
    _id: `drafts.${id}`,
    _type: 'courseRun',
    course: { _type: 'reference', _ref: ids.courses[index], _weak: true },
    label: `首頁驗收梯次 ${index + 1}`,
    registrationStatus: 'scheduled',
    isPublished: true,
    stages: [{
      _key: `stage-${index + 1}`,
      _type: 'courseStage',
      title: '完整課程',
      order: 1,
      dateRanges: [{ _key: `range-${index + 1}`, _type: 'courseDateRange', startDate: courseDates[index], endDate: courseDates[index] }],
    }],
  }))
  return { page, events, courses, runs }
}

async function inspect() {
  const documents = await client.getDocuments(allValidationIds)
  const existing = documents.filter(Boolean)
  const prereqs = await prerequisites()
  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    projectId,
    dataset,
    protectedHomePageExists: existing.some(document => document?._id === ids.page || document?._id === ids.pageDraft),
    validationDocuments: existing.map(document => document!._id),
    prerequisites: { reusableImageAsset: Boolean(prereqs.assetId), publicSafeCourseCategory: prereqs.categoryId, publishedContactEmail: true },
  }, null, 2))
}

async function createDrafts() {
  await requireMissing()
  const prereqs = await prerequisites()
  const documents = buildDocuments(prereqs.assetId, prereqs.categoryId)
  let transaction = client.transaction().create(documents.page)
  for (const document of [...documents.events, ...documents.courses, ...documents.runs]) transaction = transaction.create(document)
  await transaction.commit()
  console.log(`created homepage validation drafts: page 1, events ${documents.events.length}, courses ${documents.courses.length}, runs ${documents.runs.length}`)
}

async function anonymousRaw() {
  return anonymousClient.fetch<unknown>(contentQuery)
}

async function verifyDraftIsolation() {
  const raw = await anonymousRaw() as { page?: unknown, events?: { _id: string }[], courses?: { _id: string }[] }
  if (raw.page || raw.events?.some(item => ids.events.includes(item._id)) || raw.courses?.some(item => ids.courses.includes(item._id))) {
    throw new Error('Anonymous published query exposed one or more homepage validation drafts.')
  }
  console.log('anonymous draft isolation verified')
}

async function publishDrafts() {
  const documents = await client.getDocuments([ids.pageDraft, ...draftIds])
  if (documents.some(document => !document)) throw new Error('One or more homepage validation drafts are missing.')
  let transaction = client.transaction()
  for (const document of documents as Record<string, unknown>[]) {
    const draftId = document._id as string
    const published = withoutSystemFields(document, draftId.replace(/^drafts\./, ''))
    if (published._type === 'courseRun') {
      const reference = published.course as { _ref: string }
      published.course = { _type: 'reference', _ref: reference._ref }
    }
    transaction = transaction.create(published).delete(draftId)
  }
  await transaction.commit()
  console.log(`published homepage validation documents: ${documents.length}`)
}

async function verifyPublished(expectUpdate: boolean) {
  const raw = await anonymousRaw() as { page?: { introductionHeading?: string }, events?: { _id: string }[], courses?: { _id: string }[] }
  const content = parseHomeSections(raw)
  if (!content || !content.contact) throw new Error('Anonymous homepage projection does not satisfy the frontend content contract.')
  const directDocuments = await anonymousClient.fetch<{ _id: string }[]>('*[_id in $ids]{_id}', { ids: [ids.page, ...publishedIds] })
  if (directDocuments.length !== publishedIds.length + 1) {
    throw new Error(`Anonymous Data API returned ${directDocuments.length} of ${publishedIds.length + 1} published validation documents.`)
  }
  const hasUpdate = raw.page?.introductionHeading?.startsWith('草稿更新標記') === true
  if (hasUpdate !== expectUpdate) throw new Error(expectUpdate ? 'Published homepage update is missing.' : 'Homepage draft update leaked to anonymous visitors.')
  if (content.events.items.length > 3 || content.courses.items.length > 3
    || content.events.items.some(item => !/^\d{4}\/\d{2}$/.test(item.period))) {
    throw new Error('Frontend selection limits or numeric year/month formatting failed.')
  }
  const imageResponse = await fetch(content.introduction.image.src, { method: 'HEAD' })
  if (!imageResponse.ok) throw new Error('Homepage introduction image is not publicly readable from the Sanity CDN.')
  console.log(JSON.stringify({
    anonymousPublished: true,
    updated: hasUpdate,
    pageHeading: content.introduction.heading,
    eventCount: content.events.items.length,
    eventPeriods: content.events.items.map(item => item.period),
    courseCount: content.courses.items.length,
    courseMeta: content.courses.items.map(item => item.meta),
    contactReady: true,
    imagePubliclyReadable: true,
  }, null, 2))
}

async function createUpdateDraft() {
  const [page] = await client.getDocuments([ids.page])
  if (!page) throw new Error('Published home page is missing.')
  await client.create({
    ...withoutSystemFields(page as Record<string, unknown>, ids.pageDraft),
    introductionHeading: '草稿更新標記：公開前台暫時不應顯示',
  })
  console.log('created homepage update draft')
}

async function publishUpdate() {
  const [draft] = await client.getDocuments([ids.pageDraft])
  if (!draft) throw new Error('Homepage update draft is missing.')
  await client.transaction()
    .createOrReplace(withoutSystemFields(draft as Record<string, unknown>, ids.page))
    .delete(ids.pageDraft)
    .commit()
  console.log('published homepage update draft')
}

async function cleanup() {
  await client.delete({ query: '*[_id in $ids]', params: { ids: allValidationIds } })
  console.log(`deleted homepage validation documents: ${allValidationIds.length}`)
}

async function verifyCleanup() {
  const documents = await client.getDocuments(allValidationIds)
  if (documents.some(Boolean)) throw new Error('One or more homepage validation documents remain after cleanup.')
  const raw = await anonymousRaw() as { page?: unknown }
  if (raw.page) throw new Error('Anonymous query still exposes home-page after cleanup.')
  console.log('authenticated and anonymous homepage cleanup verified')
}

async function seedPageDraft() {
  const draftId = await seedEditableSingletonDraft(client, { publishedId: ids.page, schemaType: 'homePage' })
  console.log(`created editable homepage draft: ${draftId}`)
}

async function verifyPageDraft() {
  const [published, draft] = await client.getDocuments([ids.page, ids.pageDraft])
  if (published || draft?._type !== 'homePage') throw new Error('Expected one unpublished homePage draft and no published singleton.')
  const contentFields = Object.keys(draft).filter(key => !['_id', '_type', '_rev', '_createdAt', '_updatedAt'].includes(key))
  if (contentFields.length) throw new Error(`Seeded homePage draft is not empty: ${contentFields.join(', ')}`)
  const raw = await anonymousRaw() as { page?: unknown }
  if (raw.page) throw new Error('Anonymous query exposed the seeded homePage draft.')
  console.log('editable homePage draft verified; anonymous published page remains empty')
}

const phase = process.argv.at(-1)
if (phase === 'inspect') await inspect()
else if (phase === 'draft') await createDrafts()
else if (phase === 'verify-draft') await verifyDraftIsolation()
else if (phase === 'publish') await publishDrafts()
else if (phase === 'verify-published') await verifyPublished(false)
else if (phase === 'draft-update') await createUpdateDraft()
else if (phase === 'verify-draft-update') await verifyPublished(false)
else if (phase === 'publish-update') await publishUpdate()
else if (phase === 'verify-published-update') await verifyPublished(true)
else if (phase === 'cleanup') await cleanup()
else if (phase === 'verify-cleanup') await verifyCleanup()
else if (phase === 'seed-page-draft') await seedPageDraft()
else if (phase === 'verify-page-draft') await verifyPageDraft()
else throw new Error('Use one phase: inspect, draft, verify-draft, publish, verify-published, draft-update, verify-draft-update, publish-update, verify-published-update, cleanup, verify-cleanup, seed-page-draft, verify-page-draft')
