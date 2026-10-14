import { createClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-03-01' })
const phase = process.argv.at(-1)
const stamp = '20261014'
const prefix = `session-detail-validation-${stamp}`
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
  region: `${prefix}-region`,
  method: `${prefix}-method`,
  city: `${prefix}-city`,
  citySecondary: `${prefix}-city-secondary`,
  practitioner: `${prefix}-practitioner`,
  practitionerDraft: `drafts.${prefix}-practitioner`,
  invalidDraft: `drafts.${prefix}-invalid`,
}

const slug = `${prefix}-practitioner`
const taxonomyIds = [validationIds.region, validationIds.method, validationIds.city, validationIds.citySecondary]
const allIds = [...taxonomyIds, validationIds.practitioner, validationIds.practitionerDraft, validationIds.invalidDraft]

function reference(id: string) {
  return { _type: 'reference', _ref: id }
}

function withoutSystemFields(document: Record<string, unknown>, id: string) {
  const { _rev, _createdAt, _updatedAt, ...content } = document
  return { ...content, _id: id }
}

function strongReferences(value: unknown) {
  return Array.isArray(value)
    ? value.map(item => ({ _type: 'reference', _ref: (item as { _ref: string })._ref }))
    : []
}

function publishedPractitioner(document: Record<string, unknown>) {
  return {
    ...withoutSystemFields(document, validationIds.practitioner),
    regions: strongReferences(document.regions),
    methods: strongReferences(document.methods),
    serviceLocations: Array.isArray(document.serviceLocations)
      ? document.serviceLocations.map(item => ({
          ...(item as Record<string, unknown>),
          cities: strongReferences((item as { cities?: unknown }).cities),
        }))
      : [],
  }
}

const taxonomyDocuments = [
  { _id: validationIds.region, _type: 'sessionRegion', key: `${prefix}-region`, label: '驗收地區', order: 901 },
  { _id: validationIds.method, _type: 'sessionMethod', key: `${prefix}-method`, label: '驗收服務項目', order: 901 },
  { _id: validationIds.city, _type: 'sessionCity', key: `${prefix}-city`, label: '驗收城市', order: 901 },
  { _id: validationIds.citySecondary, _type: 'sessionCity', key: `${prefix}-city-secondary`, label: '驗收第二城市', order: 902 },
]

const initialDraft = {
  _id: validationIds.practitionerDraft,
  _type: 'practitioner',
  name: '詳情流程驗收執行師',
  englishName: 'Validation Practitioner',
  slug: { _type: 'slug', current: slug },
  regions: [reference(validationIds.region)],
  methods: [reference(validationIds.method)],
  summary: '這是完成後會清除的執行師詳情驗收資料，用來確認草稿隔離、公開欄位與聯繫入口。',
  bio: ['這是一段可辨識且只供內容流程驗收使用的執行師介紹，不代表真實人物、服務資格或療效資訊；內容會在驗收完成後清除，並用來確認純文字段落、公開資料契約與前台閱讀順序。'],
  experienceItems: [],
  serviceLocations: [{
    _key: 'city-only',
    _type: 'sessionServiceLocation',
    cities: [reference(validationIds.city), reference(validationIds.citySecondary)],
    venueName: '不得公開的驗收場地',
    address: '不得公開的驗收地址',
    publicDetail: 'cityOnly',
  }],
  contactIntro: '此聯繫資訊只供內容流程驗收，不接受實際預約。',
  contactItems: [{
    _key: 'phone',
    _type: 'sessionContactItem',
    type: 'phone',
    label: '驗收電話',
    displayText: '07-000-0000',
    value: '07-000-0000',
  }],
  order: 901,
  isPublished: true,
}

async function requireMissing() {
  const existing = (await client.getDocuments(allIds)).filter(Boolean)
  if (existing.length) throw new Error(`Validation IDs already exist; refusing to overwrite: ${existing.map(item => item!._id).join(', ')}`)
}

async function requireDocument(id: string) {
  const document = await client.getDocument<Record<string, unknown>>(id)
  if (!document) throw new Error(`Missing validation document: ${id}`)
  return document
}

async function findReusableImageAsset() {
  return client.fetch<{ _id: string } | null>('*[_type == "sanity.imageAsset"] | order(_createdAt asc)[0]{_id}')
}

async function anonymousDetail() {
  return anonymousClient.fetch<Record<string, unknown> | null>(`*[_type == "practitioner" && isPublished == true && slug.current == $slug][0]{
    "id": _id, name, englishName, "slug": slug.current, summary, isPublished,
    "regions": regions[]->label,
    "methods": methods[]->label,
    portrait{"src": asset->url, alt, "displayMode": coalesce(displayMode, "contained"), hotspot{x, y}},
    bio, experienceItems,
    serviceLocations[]{"key": _key, "cities": coalesce(cities[]->label, [city->label]), publicDetail,
      "venueName": select(publicDetail in ["venue", "fullAddress"] => venueName),
      "address": select(publicDetail == "fullAddress" => address)
    },
    contactIntro,
    contactItems[]{"key": _key, type, label, displayText, value},
    bookingAction{label, url},
    "seoTitle": seo.title, "seoDescription": seo.description
  }`, { slug })
}

async function createDraft() {
  await requireMissing()
  let transaction = client.transaction()
  for (const taxonomy of taxonomyDocuments) transaction = transaction.create(taxonomy)
  await transaction.create(initialDraft).commit()
  console.log(`created published taxonomies ${taxonomyDocuments.length} and practitioner draft 1`)
}

async function verifyDraft() {
  const detail = await anonymousDetail()
  const taxonomies = await anonymousClient.fetch<number>('count(*[_id in $ids])', { ids: taxonomyIds })
  if (detail || taxonomies !== taxonomyIds.length) throw new Error('Draft isolation or anonymous taxonomy read failed.')
  console.log('anonymous draft isolation verified; published taxonomy references are readable')
}

async function publish() {
  const draft = await requireDocument(validationIds.practitionerDraft)
  await client.transaction()
    .create(publishedPractitioner(draft))
    .delete(validationIds.practitionerDraft)
    .commit()
  console.log(`published practitioner: ${validationIds.practitioner}`)
}

function assertInitial(detail: Record<string, unknown> | null) {
  if (!detail || detail.name !== initialDraft.name || detail.bookingAction) throw new Error('Initial published projection is invalid.')
  const locations = detail.serviceLocations as Record<string, unknown>[]
  if (locations.length !== 1 || (locations[0]?.cities as unknown[])?.length !== 2 || locations[0]?.venueName || locations[0]?.address) {
    throw new Error('cityOnly projection leaked venue or address.')
  }
}

async function verifyPublished(expectUpdate: boolean) {
  const detail = await anonymousDetail()
  if (!expectUpdate) {
    assertInitial(detail)
    console.log('anonymous initial publication verified; optional booking and portrait omitted; city privacy preserved')
    return
  }
  if (!detail || detail.name !== '詳情流程驗收執行師更新版') throw new Error('Published update is missing.')
  const locations = detail.serviceLocations as Record<string, unknown>[]
  const contacts = detail.contactItems as Record<string, unknown>[]
  const portrait = detail.portrait as Record<string, unknown> | undefined
  if (locations.length !== 3 || contacts.length !== 5 || !(detail.bookingAction as { url?: string })?.url?.startsWith('https://')) {
    throw new Error('Updated collections or booking action are invalid.')
  }
  if (portrait && portrait.displayMode !== 'cover') throw new Error('Portrait display mode projection is invalid.')
  if (locations[0]?.venueName || locations[0]?.address || locations[1]?.address || !locations[1]?.venueName || !locations[2]?.address) {
    throw new Error('Location publicDetail projection did not enforce privacy levels.')
  }
  console.log({ anonymousPublished: true, updated: true, locations: locations.length, contacts: contacts.length, portrait: Boolean(detail.portrait) })
}

async function createUpdateDraft() {
  const published = await requireDocument(validationIds.practitioner)
  const asset = await findReusableImageAsset()
  const portrait = asset?._id
    ? { _type: 'image', asset: reference(asset._id), alt: '執行師詳情內容流程驗收圖片', displayMode: 'cover' }
    : undefined
  await client.create({
    ...withoutSystemFields(published, validationIds.practitionerDraft),
    name: '詳情流程驗收執行師更新版',
    portrait,
    experienceItems: ['內容流程驗收經歷一', '內容流程驗收經歷二'],
    serviceLocations: [
      { _key: 'city-only', _type: 'sessionServiceLocation', cities: [reference(validationIds.city), reference(validationIds.citySecondary)], venueName: '不得公開的場地', address: '不得公開的地址', publicDetail: 'cityOnly' },
      { _key: 'venue', _type: 'sessionServiceLocation', cities: [reference(validationIds.city)], venueName: '驗收公開場地', address: '不得公開的地址', publicDetail: 'venue' },
      { _key: 'full-address', _type: 'sessionServiceLocation', cities: [reference(validationIds.citySecondary)], venueName: '驗收完整地址場地', address: '驗收公開完整地址', publicDetail: 'fullAddress' },
    ],
    contactItems: [
      { _key: 'phone', _type: 'sessionContactItem', type: 'phone', label: '驗收電話', displayText: '07-000-0000', value: '07-000-0000' },
      { _key: 'line-id', _type: 'sessionContactItem', type: 'lineId', label: '驗收 LINE ID', displayText: '@validation', value: '@validation' },
      { _key: 'facebook', _type: 'sessionContactItem', type: 'facebook', label: '驗收 Facebook', displayText: 'Facebook 驗收頁', value: 'https://example.com/facebook-validation' },
      { _key: 'line-url', _type: 'sessionContactItem', type: 'lineUrl', label: '驗收 LINE 官方連結', displayText: 'LINE 驗收入口', value: 'https://example.com/line-validation' },
      { _key: 'booking-url', _type: 'sessionContactItem', type: 'bookingUrl', label: '驗收預約表單', displayText: '預約表單驗收入口', value: 'https://example.com/booking-validation' },
    ],
    bookingAction: { _type: 'sessionBookingAction', label: '前往驗收預約表單', url: 'https://example.com/booking-validation' },
    seo: {
      _type: 'sessionDetailSeo',
      title: '執行師詳情內容流程驗收頁面',
      description: '這是完成後會清除的執行師詳情內容流程驗收摘要，用來確認搜尋描述、公開資料、服務地區隱私與站外聯繫連結。',
    },
  })
  console.log(`created update draft; reusable portrait asset: ${asset?._id ? 'yes' : 'no'}`)
}

async function verifyDraftUpdate() {
  assertInitial(await anonymousDetail())
  console.log('anonymous visitors still receive the previous published version while update draft exists')
}

async function publishUpdate() {
  const draft = await requireDocument(validationIds.practitionerDraft)
  await client.transaction()
    .createOrReplace(publishedPractitioner(draft))
    .delete(validationIds.practitionerDraft)
    .commit()
  console.log('published practitioner update')
}

async function unpublish() {
  const published = await requireDocument(validationIds.practitioner)
  await client.transaction()
    .create(withoutSystemFields(published, validationIds.practitionerDraft))
    .delete(validationIds.practitioner)
    .commit()
  console.log('unpublished practitioner and preserved editable draft')
}

async function verifyUnpublished() {
  const detail = await anonymousDetail()
  const draft = await client.getDocument(validationIds.practitionerDraft)
  if (detail || !draft) throw new Error('Unpublish lifecycle did not hide the public document or preserve its draft.')
  console.log('anonymous query is empty after unpublish; authenticated editable draft remains')
}

async function cleanup() {
  await client.delete({ query: '*[_id in $ids]', params: { ids: allIds } })
  console.log(`deleted validation documents: ${allIds.length}`)
}

async function createInvalidDraft() {
  const existing = await client.getDocument(validationIds.invalidDraft)
  if (existing) throw new Error('Invalid validation draft already exists; refusing to overwrite it.')
  await client.create({
    _id: validationIds.invalidDraft,
    _type: 'practitioner',
    name: '驗收缺漏資料',
    slug: { _type: 'slug', current: `${prefix}-invalid` },
    order: 902,
    isPublished: true,
  })
  console.log(`created invalid publication draft: ${validationIds.invalidDraft}`)
}

async function verifyCleanup() {
  const existing = (await client.getDocuments(allIds)).filter(Boolean)
  const detail = await anonymousDetail()
  if (existing.length || detail) throw new Error('Validation documents remain after cleanup.')
  console.log('authenticated and anonymous cleanup verified')
}

async function inspect() {
  const existing = (await client.getDocuments(allIds)).filter(Boolean)
  console.log({ projectId, dataset, validationDocuments: existing.map(item => ({ _id: item!._id, _type: item!._type })) })
}

if (phase === 'inspect') await inspect()
else if (phase === 'draft') await createDraft()
else if (phase === 'verify-draft') await verifyDraft()
else if (phase === 'publish') await publish()
else if (phase === 'verify-published') await verifyPublished(false)
else if (phase === 'draft-update') await createUpdateDraft()
else if (phase === 'verify-draft-update') await verifyDraftUpdate()
else if (phase === 'publish-update') await publishUpdate()
else if (phase === 'verify-published-update') await verifyPublished(true)
else if (phase === 'unpublish') await unpublish()
else if (phase === 'verify-unpublished') await verifyUnpublished()
else if (phase === 'invalid') await createInvalidDraft()
else if (phase === 'cleanup') await cleanup()
else if (phase === 'verify-cleanup') await verifyCleanup()
else throw new Error('Use one phase: inspect, draft, verify-draft, publish, verify-published, draft-update, verify-draft-update, publish-update, verify-published-update, unpublish, verify-unpublished, invalid, cleanup, verify-cleanup')
