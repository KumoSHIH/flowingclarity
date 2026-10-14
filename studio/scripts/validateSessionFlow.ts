import { createClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'
import { seedEditableSingletonDraft } from '../lib/seedEditableSingletonDraft.ts'

const client = getCliClient({ apiVersion: '2026-03-01' })
const phase = process.argv.at(-1)
const validationStamp = '20261014'
const prefix = `session-validation-${validationStamp}`

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

export const validationIds = {
  page: 'session-page',
  pageDraft: 'drafts.session-page',
  regions: ['north', 'central', 'south'].map(key => `${prefix}-region-${key}`),
  methods: ['rebalance', 'craniosacral', 'facial', 'human-design'].map(key => `${prefix}-method-${key}`),
  practitioners: Array.from({ length: 48 }, (_, index) => (
    `${prefix}-practitioner-${String(index + 1).padStart(2, '0')}`
  )),
}

const taxonomyIds = [...validationIds.regions, ...validationIds.methods]
const taxonomyDraftIds = taxonomyIds.map(id => `drafts.${id}`)
const practitionerDraftIds = validationIds.practitioners.map(id => `drafts.${id}`)
const contentPublishedIds = [validationIds.page, ...validationIds.practitioners]
const allValidationIds = [
  validationIds.page,
  validationIds.pageDraft,
  ...taxonomyIds,
  ...taxonomyDraftIds,
  ...validationIds.practitioners,
  ...practitionerDraftIds,
]

const pageDraft = {
  _id: validationIds.pageDraft,
  _type: 'sessionPage',
  pageTitle: '尋找\n執行師',
  intro: '這是可辨識且會在驗收後清除的個案諮詢內容流程測試，用來確認草稿、發布與公開讀取。',
  resultsHeading: '執行師名錄',
  emptyMessage: '目前沒有已發布的執行師資料，請稍後再回來查看。',
  noMatchesMessage: '目前沒有符合條件的執行師，請清除部分篩選後再試一次。',
}

const regionLabels = ['北部', '中部', '南部']
const methodLabels = ['身心再平衡按摩', '生物動能頭薦骨', '日式臉部按摩', '人類圖']

const taxonomyDocuments = [
  ...validationIds.regions.map((id, index) => ({
    _id: id,
    _type: 'sessionRegion',
    key: `${prefix}-region-${['north', 'central', 'south'][index]}`,
    label: regionLabels[index],
    order: index + 1,
  })),
  ...validationIds.methods.map((id, index) => ({
    _id: id,
    _type: 'sessionMethod',
    key: `${prefix}-method-${['rebalance', 'craniosacral', 'facial', 'human-design'][index]}`,
    label: methodLabels[index],
    order: index + 1,
  })),
]

function reference(id: string) {
  return { _type: 'reference', _ref: id }
}

function buildPractitioner(index: number) {
  const id = validationIds.practitioners[index]!
  const number = index + 1
  const regionIds = [validationIds.regions[index % validationIds.regions.length]!]
  if (index % 7 === 0) regionIds.push(validationIds.regions[(index + 1) % validationIds.regions.length]!)
  const methodIds = [validationIds.methods[index % validationIds.methods.length]!]
  if (index % 3 === 0) methodIds.push(validationIds.methods[(index + 1) % validationIds.methods.length]!)
  const longName = '個案諮詢內容流程驗收執行師'.slice(0, 20)

  return {
    _id: `drafts.${id}`,
    _type: 'practitioner',
    name: index === 9 ? longName : `驗收執行師 ${String(number).padStart(2, '0')}`,
    englishName: index === 0 ? undefined : index === 10 ? 'Validation Practitioner Long Name' : 'Validation Practitioner',
    slug: { _type: 'slug', current: id },
    regions: regionIds.map(reference),
    methods: methodIds.map(reference),
    summary: index === 0
      ? undefined
      : index === 11
        ? '這段文字用來確認執行師服務取向摘要達到內容契約上限時，公開頁面仍能自然換行並保持完整閱讀。'.repeat(3).slice(0, 100)
        : `這是第 ${String(number).padStart(2, '0')} 筆可辨識且驗收後會清除的執行師測試資料，不代表正式服務或人物資訊。`,
    order: number,
    isPublished: true,
  }
}

const practitionerDrafts = Array.from({ length: 48 }, (_, index) => buildPractitioner(index))

function withoutSystemFields(document: Record<string, unknown>, id: string) {
  const { _rev, _createdAt, _updatedAt, ...content } = document
  return { ...content, _id: id }
}

function strongPractitioner(document: Record<string, unknown>, id: string) {
  const strongReferences = (value: unknown) => Array.isArray(value)
    ? value.map(reference => ({
        _type: 'reference',
        _ref: (reference as { _ref: string })._ref,
      }))
    : []
  return {
    ...withoutSystemFields(document, id),
    regions: strongReferences(document.regions),
    methods: strongReferences(document.methods),
  }
}

async function requireMissing() {
  const documents = await client.getDocuments(allValidationIds)
  if (documents.some(Boolean)) {
    throw new Error('Session validation documents already exist; refusing to overwrite them.')
  }
  const existingSessionContent = await client.fetch<number>(
    'count(*[_type in ["sessionPage", "sessionRegion", "sessionMethod", "practitioner"]])',
  )
  if (existingSessionContent !== 0) {
    throw new Error(`Existing Session content detected (${existingSessionContent}); refusing to mix validation data.`)
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
  let taxonomyTransaction = client.transaction()
  for (const taxonomy of taxonomyDocuments) taxonomyTransaction = taxonomyTransaction.create(taxonomy)
  await taxonomyTransaction.commit()
  let contentTransaction = client.transaction().create(pageDraft)
  for (const practitioner of practitionerDrafts) contentTransaction = contentTransaction.create(practitioner)
  await contentTransaction.commit()
  console.log(`created published taxonomies ${taxonomyDocuments.length}; drafts: page 1, practitioners ${practitionerDrafts.length}`)
}

async function publishDrafts() {
  const draftIds = [validationIds.pageDraft, ...practitionerDraftIds]
  const documents = await requireDocuments(draftIds)
  let transaction = client.transaction()
  for (const [index, document] of documents.entries()) {
    const publishedId = contentPublishedIds[index]!
    transaction = transaction
      .create(document._type === 'practitioner'
        ? strongPractitioner(document, publishedId)
        : withoutSystemFields(document, publishedId))
      .delete(draftIds[index]!)
  }
  await transaction.commit()
  console.log(`published: page 1, taxonomies ${taxonomyIds.length}, practitioners ${validationIds.practitioners.length}`)
}

async function createUpdateDrafts() {
  const [page, firstPractitioner] = await requireDocuments([
    validationIds.page,
    validationIds.practitioners[0]!,
  ])
  await client.transaction()
    .create({
      ...withoutSystemFields(page, validationIds.pageDraft),
      intro: '草稿更新標記：匿名訪客在再次發布前仍應看見上一個公開版本，而不是這段文字。',
    })
    .create({
      ...withoutSystemFields(firstPractitioner, practitionerDraftIds[0]!),
      name: '草稿更新驗收執行師',
    })
    .commit()
  console.log('created update drafts: page 1, practitioners 1')
}

async function publishUpdates() {
  const [page, practitioner] = await requireDocuments([
    validationIds.pageDraft,
    practitionerDraftIds[0]!,
  ])
  await client.transaction()
    .createOrReplace(withoutSystemFields(page, validationIds.page))
    .createOrReplace(strongPractitioner(practitioner, validationIds.practitioners[0]!))
    .delete(validationIds.pageDraft)
    .delete(practitionerDraftIds[0]!)
    .commit()
  console.log('published updates: page 1, practitioners 1')
}

async function anonymousOverview() {
  return anonymousClient.fetch<{
    page: null | { intro?: string }
    regions: { _id: string }[]
    methods: { _id: string }[]
    practitioners: { _id: string, name?: string, regionKeys?: string[], methodKeys?: string[] }[]
  }>(`{
    "page": *[_id == "session-page" && _type == "sessionPage"][0]{intro},
    "regions": *[_id in $regionIds && _type == "sessionRegion"]{_id},
    "methods": *[_id in $methodIds && _type == "sessionMethod"]{_id},
    "practitioners": *[_id in $practitionerIds && _type == "practitioner" && isPublished == true]{
      _id,
      name,
      "regionKeys": regions[]->key,
      "methodKeys": methods[]->key
    }
  }`, {
    regionIds: validationIds.regions,
    methodIds: validationIds.methods,
    practitionerIds: validationIds.practitioners,
  })
}

async function verifyDraftIsolation() {
  const overview = await anonymousOverview()
  if (overview.page
    || overview.regions.length !== validationIds.regions.length
    || overview.methods.length !== validationIds.methods.length
    || overview.practitioners.length) {
    throw new Error('Anonymous published query did not preserve taxonomy prerequisites or exposed content drafts.')
  }
  console.log('anonymous draft isolation verified; published taxonomy prerequisites are readable')
}

async function verifyPublished(expectUpdate: boolean) {
  const overview = await anonymousOverview()
  if (!overview.page
    || overview.regions.length !== validationIds.regions.length
    || overview.methods.length !== validationIds.methods.length
    || overview.practitioners.length !== validationIds.practitioners.length) {
    throw new Error(`Unexpected anonymous published counts: ${JSON.stringify({
      page: Boolean(overview.page),
      regions: overview.regions.length,
      methods: overview.methods.length,
      practitioners: overview.practitioners.length,
    })}`)
  }
  if (overview.practitioners.some(item => !item.regionKeys?.length || !item.methodKeys?.length)) {
    throw new Error('Anonymous query could not resolve one or more taxonomy references.')
  }
  const hasUpdate = overview.page.intro?.startsWith('草稿更新標記') === true
    && overview.practitioners.some(item => item.name === '草稿更新驗收執行師')
  if (hasUpdate !== expectUpdate) {
    throw new Error(expectUpdate ? 'Published update is missing.' : 'Draft update leaked into published results.')
  }
  console.log({
    anonymousPublished: true,
    updated: hasUpdate,
    regions: overview.regions.length,
    methods: overview.methods.length,
    practitioners: overview.practitioners.length,
  })
}

async function cleanup() {
  await client.delete({ query: '*[_id in $ids]', params: { ids: allValidationIds } })
  console.log(`deleted validation documents: ${allValidationIds.length}`)
}

async function seedPageDraft() {
  const draftId = await seedEditableSingletonDraft(client, {
    publishedId: validationIds.page,
    schemaType: 'sessionPage',
  })
  console.log(`created editable page draft: ${draftId}`)
}

async function verifyPageDraft() {
  const [published, draft] = await client.getDocuments([
    validationIds.page,
    validationIds.pageDraft,
  ])
  if (published || draft?._type !== 'sessionPage') {
    throw new Error('Expected one unpublished Session page draft and no published singleton.')
  }
  const contentFields = Object.keys(draft).filter(key => ![
    '_id',
    '_type',
    '_rev',
    '_createdAt',
    '_updatedAt',
  ].includes(key))
  if (contentFields.length) {
    throw new Error(`Seeded Session page draft is not empty: ${contentFields.join(', ')}`)
  }
  const overview = await anonymousOverview()
  if (overview.page) throw new Error('Anonymous query exposed the seeded Session page draft.')
  console.log('editable Session page draft verified; anonymous published page remains empty')
}

async function verifyCleanup() {
  const documents = await client.getDocuments(allValidationIds)
  if (documents.some(Boolean)) throw new Error('One or more Session validation documents remain after cleanup.')
  const overview = await anonymousOverview()
  if (overview.page || overview.regions.length || overview.methods.length || overview.practitioners.length) {
    throw new Error('Anonymous query still exposes Session validation content after cleanup.')
  }
  console.log('authenticated and anonymous cleanup verified')
}

async function inspect() {
  const documents = await client.getDocuments(allValidationIds)
  const existing = documents.filter(Boolean)
  console.log({
    projectId,
    dataset,
    total: existing.length,
    published: existing.filter(document => !document!._id.startsWith('drafts.')).length,
    drafts: existing.filter(document => document!._id.startsWith('drafts.')).length,
    types: [...new Set(existing.map(document => document!._type))],
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
