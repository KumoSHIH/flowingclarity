import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-03-01' })
const phase = process.argv.at(-1)

export const validationIds = {
  event: 'event-detail-validation-20261013',
  eventDraft: 'drafts.event-detail-validation-20261013',
}

const slug = 'event-detail-validation-20261013'

const minimalBody = [
  {
    _key: 'facilitator',
    _type: 'eventDetailFacilitator',
    name: '驗收帶領者',
    role: '內容流程測試',
    biography: '這是可辨識且會在驗收完成後清除的帶領者測試資料，不代表正式人物資訊。',
  },
  {
    _key: 'agenda',
    _type: 'eventDetailAgenda',
    title: '這一天，會怎麼進行',
    description: '用兩個最小流程項目驗證內容契約、排序與公開讀取。',
    items: [
      {
        _key: 'arrival',
        _type: 'eventDetailAgendaItem',
        timeLabel: '10:00',
        title: '抵達與說明',
        description: '確認參與方式、活動邊界與驗收範圍。',
      },
      {
        _key: 'closing',
        _type: 'eventDetailAgendaItem',
        timeLabel: '16:00',
        title: '整理與收束',
        description: '確認前台顯示、公開讀取與後續清理流程。',
      },
    ],
  },
]

const draftEvent = {
  _id: validationIds.eventDraft,
  _type: 'event',
  title: '活動詳情內容流驗收',
  slug: { _type: 'slug', current: slug },
  eventType: '一日工作坊',
  summary: '這是完成後會清除的活動詳情測試，用來確認草稿、發布、排序與安全報名連結。',
  startAt: '2027-11-07T02:00:00.000Z',
  endAt: '2027-11-07T09:00:00.000Z',
  scheduleNote: '10:00–17:00',
  deliveryMode: 'inPerson',
  city: '高雄',
  venue: '內容流程驗收場地',
  detail: {
    _type: 'eventDetailContent',
    intro: '這是一筆可辨識且完成後會清除的活動詳情驗收內容，只用來確認草稿隔離、公開讀取、內容排序與報名狀態。',
    body: minimalBody,
  },
  registrationStatus: 'scheduled',
  archiveVisible: true,
  order: 999,
  isPublished: true,
}

function withoutSystemFields(document: Record<string, unknown>, id: string) {
  const { _rev, _createdAt, _updatedAt, ...content } = document
  return { ...content, _id: id }
}

async function requireMissing() {
  const documents = await client.getDocuments(Object.values(validationIds))
  if (documents.some(Boolean)) throw new Error('Validation documents already exist; refusing to overwrite them.')
}

async function requireDocument(id: string) {
  const document = await client.getDocument<Record<string, unknown>>(id)
  if (!document) throw new Error(`Missing validation document: ${id}`)
  return document
}

async function findReusableImageAsset() {
  const asset = await client.fetch<{ _id: string } | null>(
    '*[_type == "sanity.imageAsset"] | order(_createdAt asc)[0]{_id}',
  )
  if (!asset?._id) throw new Error('No existing Sanity image asset is available for media validation.')
  return asset._id
}

function image(assetId: string, alt: string) {
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
    alt,
  }
}

async function createDraft() {
  await requireMissing()
  await client.create(draftEvent)
  console.log(`created draft: ${validationIds.eventDraft}`)
}

async function publishDraft() {
  const draft = await requireDocument(validationIds.eventDraft)
  await client.transaction()
    .create(withoutSystemFields(draft, validationIds.event))
    .delete(validationIds.eventDraft)
    .commit()
  console.log(`published: ${validationIds.event}`)
}

async function createUpdateDraft() {
  const published = await requireDocument(validationIds.event)
  const assetId = await findReusableImageAsset()
  const updatedBody = [
    {
      _key: 'introduction',
      _type: 'eventDetailText',
      title: '活動介紹',
      paragraphs: [
        '這段文字只用來驗證完整內容區塊、長文排版與編輯者指定的順序。',
        '建立更新草稿後，匿名訪客在再次發布前仍應看到上一個公開版本。',
      ],
    },
    {
      _key: 'quote',
      _type: 'eventDetailQuote',
      text: '這是活動詳情內容流驗收的示意引言。',
      attribution: '內容流程驗收',
    },
    minimalBody[0],
    {
      ...minimalBody[1],
      items: [
        (minimalBody[1] as { items: unknown[] }).items[0],
        {
          _key: 'practice',
          _type: 'eventDetailAgendaItem',
          timeLabel: '13:30',
          title: '示範與練習',
          description: '確認流程項目可新增、排序並完整顯示。',
        },
        (minimalBody[1] as { items: unknown[] }).items[1],
      ],
    },
    {
      _key: 'testimonials',
      _type: 'sharedTestimonialBlock',
      title: '學員心得分享',
      items: [{
        _key: 'testimonial-one',
        _type: 'sharedTestimonialItem',
        text: '這是只用於驗證長文顯示與匿名公開查詢的測試心得，不代表真實學員經驗。',
        sharerName: '驗收分享者',
      }],
    },
    {
      _key: 'audience',
      _type: 'eventDetailList',
      kind: 'audience',
      title: '適合對象',
      items: ['需要驗證活動詳情內容流的編輯者'],
    },
    {
      _key: 'preparation',
      _type: 'eventDetailList',
      kind: 'preparation',
      title: '準備事項',
      items: ['本文件為驗收資料，不接受實際報名'],
    },
    {
      _key: 'media',
      _type: 'eventDetailMedia',
      title: '活動圖像驗收',
      items: [
        {
          _key: 'media-one',
          _type: 'eventDetailMediaItem',
          image: image(assetId, '活動詳情內容流驗收圖片一'),
          caption: '單圖與替代文字驗收。',
        },
        {
          _key: 'media-two',
          _type: 'eventDetailMediaItem',
          image: image(assetId, '活動詳情內容流驗收圖片二'),
          caption: '雙圖排版與圖說驗收。',
        },
      ],
    },
  ]

  await client.create({
    ...withoutSystemFields(published, validationIds.eventDraft),
    title: '活動詳情內容流驗收：完整內容版',
    image: image(assetId, '活動詳情內容流驗收代表圖'),
    registrationStatus: 'open',
    registrationUrl: 'https://example.com/event-detail-validation',
    detail: {
      _type: 'eventDetailContent',
      intro: '草稿更新標記：這個完整內容版本在再次發布前不得出現於匿名查詢或公開前台，發布後才能取代原有公開版本。',
      body: updatedBody,
      feeLabel: '驗收費用標示',
      registrationNote: '這是內容流驗收用連結，不接受實際報名或付款。',
      seoTitle: '活動詳情內容流驗收｜Flowing Clarity',
      seoDescription: '驗證活動詳情的草稿隔離、公開讀取、內容排序與安全連結。',
    },
  })
  console.log(`created update draft: ${validationIds.eventDraft}`)
}

async function publishUpdate() {
  const draft = await requireDocument(validationIds.eventDraft)
  await client.transaction()
    .createOrReplace(withoutSystemFields(draft, validationIds.event))
    .delete(validationIds.eventDraft)
    .commit()
  console.log(`published update: ${validationIds.event}`)
}

async function cleanup() {
  await client.delete({ query: '*[_id in $ids]', params: { ids: Object.values(validationIds) } })
  console.log(`deleted validation ids: ${Object.values(validationIds).join(', ')}`)
}

async function inspect() {
  const documents = await client.getDocuments(Object.values(validationIds))
  console.log(documents.filter(Boolean).map(document => ({
    _id: document!._id,
    _type: document!._type,
    title: document!.title,
  })))
}

if (phase === 'draft') await createDraft()
else if (phase === 'publish') await publishDraft()
else if (phase === 'draft-update') await createUpdateDraft()
else if (phase === 'publish-update') await publishUpdate()
else if (phase === 'cleanup') await cleanup()
else if (phase === 'inspect') await inspect()
else throw new Error('Use one phase: draft, publish, draft-update, publish-update, inspect, cleanup')
