import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-03-01' })
const phase = process.argv.at(-1)
const validationStamp = '20261012'
const eventPrefix = `event-validation-${validationStamp}-`

export const validationIds = {
  page: 'events-page',
  pageDraft: 'drafts.events-page',
  invalidEvent: `drafts.${eventPrefix}invalid`,
  events: Array.from({ length: 48 }, (_, index) => (
    `${eventPrefix}${String(index + 1).padStart(2, '0')}`
  )),
}

const eventDraftIds = validationIds.events.map(id => `drafts.${id}`)
const allValidationIds = [
  validationIds.page,
  validationIds.pageDraft,
  validationIds.invalidEvent,
  ...validationIds.events,
  ...eventDraftIds,
]

const pageDraft = {
  _id: validationIds.pageDraft,
  _type: 'eventsPage',
  pageTitle: '近期活動',
  intro: '這是可辨識且會在驗收後清除的活動內容流程測試，用來確認草稿、發布與公開讀取。',
  upcomingHeading: '近期活動',
  pastHeading: '過去活動',
  emptyMessage: '目前沒有已發布的近期活動；可以切換至過去活動查看歷史紀錄。',
}

function isoAt(dayOffset: number, hour = 2): string {
  const date = new Date(Date.UTC(2027, 0, 1 + dayOffset, hour))
  return date.toISOString()
}

function buildEvent(index: number) {
  const id = validationIds.events[index]!
  const number = index + 1
  const isPast = index >= 46
  const startAt = isPast
    ? new Date(Date.UTC(2026, 7, 20 + index - 46, 2)).toISOString()
    : isoAt(index)
  const endAt = new Date(Date.parse(startAt) + (index === 8 ? 30 : 7) * 3_600_000).toISOString()
  const longTitle = '活動內容流程驗收長標題'.repeat(5).slice(0, 40)
  const longSummary = '這段文字用來確認活動摘要達到內容契約上限時，公開頁面仍能完整呈現且不會被截斷。'.repeat(4).slice(0, 100)
  const longVenue = '活動內容流程驗收場地資訊'.repeat(8).slice(0, 80)

  return {
    _id: `drafts.${id}`,
    _type: 'event',
    title: index === 9 ? longTitle : `活動內容流程驗收 ${String(number).padStart(2, '0')}`,
    slug: { _type: 'slug', current: id },
    eventType: index === 8 ? '兩日工作坊' : index % 5 === 0 ? '課程說明會' : '一日工作坊',
    summary: index === 9
      ? longSummary
      : `這是第 ${String(number).padStart(2, '0')} 筆可辨識且驗收後會清除的活動測試內容，不代表正式活動資訊。`,
    startAt,
    endAt,
    scheduleNote: index === 8 ? '兩日皆為 10:00–17:00' : undefined,
    deliveryMode: index === 4 ? 'hybrid' : index % 5 === 0 ? 'online' : 'inPerson',
    city: index % 5 === 0 ? '線上' : '高雄',
    venue: index === 9 ? longVenue : index % 5 === 0 ? undefined : '內容流程驗收場地',
    registrationStatus: index === 6
      ? 'cancelled'
      : index === 2
        ? 'full'
        : index === 3 || isPast
          ? 'closed'
          : index === 1
            ? 'scheduled'
            : 'open',
    registrationUrl: index === 0 ? 'https://example.com/events-validation' : undefined,
    archiveVisible: index === 45 ? false : true,
    order: 1,
    isPublished: true,
  }
}

const eventDrafts = Array.from({ length: 48 }, (_, index) => buildEvent(index))

const invalidEventDraft = {
  _id: validationIds.invalidEvent,
  _type: 'event',
  title: '短',
  slug: { _type: 'slug', current: 'Invalid Slug' },
  eventType: '短',
  summary: '摘要太短',
  startAt: '2027-01-02T10:00:00.000Z',
  endAt: '2027-01-02T09:00:00.000Z',
  deliveryMode: 'inPerson',
  registrationStatus: 'invalid',
  registrationUrl: 'http://example.com/unsafe',
  archiveVisible: true,
  order: 1,
  isPublished: true,
}

function withoutSystemFields(document: Record<string, unknown>, id: string) {
  const { _rev, _createdAt, _updatedAt, ...content } = document
  return { ...content, _id: id }
}

async function requireMissing() {
  const documents = await client.getDocuments(allValidationIds)
  if (documents.some(Boolean)) {
    throw new Error('Validation documents already exist; refusing to overwrite them.')
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
  for (const event of eventDrafts) transaction = transaction.create(event)
  await transaction.commit()
  console.log(`created drafts: page 1, events ${eventDrafts.length}`)
}

async function createInvalidDraft() {
  const existing = await client.getDocument(validationIds.invalidEvent)
  if (existing) throw new Error('Invalid validation draft already exists; refusing to overwrite it.')
  await client.create(invalidEventDraft)
  console.log(`created invalid draft: ${validationIds.invalidEvent}`)
}

async function seedEditablePageDraft() {
  const [published, draft] = await client.getDocuments([
    validationIds.page,
    validationIds.pageDraft,
  ])
  if (published || draft) {
    throw new Error('Events page already exists; refusing to overwrite it.')
  }
  await client.create({
    _id: validationIds.pageDraft,
    _type: 'eventsPage',
  })
  console.log(`created editable page draft: ${validationIds.pageDraft}`)
}

async function cleanupInvalidDraft() {
  await client.delete(validationIds.invalidEvent)
  console.log(`deleted invalid draft: ${validationIds.invalidEvent}`)
}

async function publishDrafts() {
  const draftIds = [validationIds.pageDraft, ...eventDraftIds]
  const documents = await requireDocuments(draftIds)
  let transaction = client.transaction()
  for (const [index, document] of documents.entries()) {
    const publishedId = index === 0 ? validationIds.page : validationIds.events[index - 1]!
    transaction = transaction.create(withoutSystemFields(document, publishedId)).delete(draftIds[index]!)
  }
  await transaction.commit()
  console.log(`published: page 1, events ${validationIds.events.length}`)
}

async function createUpdateDrafts() {
  const [page, firstEvent] = await requireDocuments([
    validationIds.page,
    validationIds.events[0]!,
  ])
  await client.transaction()
    .create({
      ...withoutSystemFields(page, validationIds.pageDraft),
      intro: '草稿更新標記：匿名訪客在再次發布前仍應看見上一個公開版本，而不是這段文字。',
    })
    .create({
      ...withoutSystemFields(firstEvent, eventDraftIds[0]!),
      title: '草稿更新標記：活動內容流程驗收 01',
    })
    .commit()
  console.log('created update drafts: page 1, events 1')
}

async function publishUpdates() {
  const [page, firstEvent] = await requireDocuments([
    validationIds.pageDraft,
    eventDraftIds[0]!,
  ])
  await client.transaction()
    .createOrReplace(withoutSystemFields(page, validationIds.page))
    .createOrReplace(withoutSystemFields(firstEvent, validationIds.events[0]!))
    .delete(validationIds.pageDraft)
    .delete(eventDraftIds[0]!)
    .commit()
  console.log('published updates: page 1, events 1')
}

async function cleanup() {
  await client.delete({
    query: '*[_id in $ids]',
    params: { ids: allValidationIds },
  })
  console.log(`deleted validation documents: ${allValidationIds.length}`)
}

async function inspect() {
  const documents = await client.getDocuments(allValidationIds)
  const existing = documents.filter(Boolean)
  console.log({
    total: existing.length,
    page: existing.filter(document => document?._type === 'eventsPage').map(document => document!._id),
    publishedEvents: existing.filter(document => document?._type === 'event' && !document!._id.startsWith('drafts.')).length,
    draftEvents: existing.filter(document => document?._type === 'event' && document!._id.startsWith('drafts.')).length,
  })
}

if (phase === 'draft') await createDrafts()
else if (phase === 'invalid-draft') await createInvalidDraft()
else if (phase === 'seed-page-draft') await seedEditablePageDraft()
else if (phase === 'cleanup-invalid-draft') await cleanupInvalidDraft()
else if (phase === 'publish') await publishDrafts()
else if (phase === 'draft-update') await createUpdateDrafts()
else if (phase === 'publish-update') await publishUpdates()
else if (phase === 'cleanup') await cleanup()
else if (phase === 'inspect') await inspect()
else throw new Error('Use one phase: draft, invalid-draft, seed-page-draft, cleanup-invalid-draft, publish, draft-update, publish-update, inspect, cleanup')
