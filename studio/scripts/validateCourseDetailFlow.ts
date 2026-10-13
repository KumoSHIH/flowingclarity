import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-03-01' })
const phase = process.argv.at(-1)

export const validationIds = {
  course: 'course-detail-validation-20261011',
  courseDraft: 'drafts.course-detail-validation-20261011',
  run: 'course-run-detail-validation-20261011',
  runDraft: 'drafts.course-run-detail-validation-20261011',
}

const slug = 'course-detail-validation-20261011'
const reusedImageAsset = 'image-51012d41790e1cea63dbf3a4a95d83cece6e5be1-1080x718-jpg'
const image = (alt: string) => ({
  _type: 'image',
  asset: { _type: 'reference', _ref: reusedImageAsset },
  alt,
})

const initialBody = [
  {
    _key: 'introduction',
    _type: 'courseDetailIntroduction',
    title: '從草稿到公開內容',
    lead: '這是可辨識且完成後會清除的內容流程測試，用來確認草稿不會提前出現在公開網站。',
    paragraphs: ['測試只使用隔離文件 ID，不修改既有正式課程，也不把示範文字當成真實課程資訊。'],
  },
  {
    _key: 'gallery-weave',
    _type: 'courseDetailGallery',
    title: '第一組圖文內容',
    description: '確認圖文版型能依照編輯者設定的順序出現在公開頁面。',
    layout: 'weave',
    note: '內容流程驗證用交錯章節。',
    items: [{
      _key: 'weave-item',
      _type: 'courseDetailGalleryItem',
      group: '驗證階段一',
      title: '草稿隔離',
      description: '先儲存草稿，再確認匿名 published 查詢完全看不到內容。',
      points: ['草稿不得進入公開查詢', '發布後才可由匿名訪客讀取'],
      image: image('課程內容流程測試使用的既有課程圖片'),
    }],
  },
  {
    _key: 'curriculum',
    _type: 'courseDetailCurriculum',
    title: '內容流程驗證步驟',
    description: '依序驗證草稿、初次發布、草稿更新與再次發布。',
    units: [{
      _key: 'flow-unit',
      _type: 'courseDetailCurriculumUnit',
      stage: '驗證流程',
      title: '保留公開版本',
      description: '發布後新增草稿修改時，匿名訪客仍應看到上一個已發布版本。',
    }],
  },
  {
    _key: 'gallery-folio',
    _type: 'courseDetailGallery',
    title: '第二組圖文內容',
    description: '確認同一頁可以混用第二種圖文版型，且不需要前台切換控制。',
    layout: 'folio',
    note: '內容流程驗證用單元圖冊。',
    items: [{
      _key: 'folio-item',
      _type: 'courseDetailGalleryItem',
      group: '驗證階段二',
      title: '多版型排序',
      description: '第二個版型區塊保留自己的標題、內容與呈現方式。',
      points: ['順序由內容編排陣列決定'],
      image: image('課程多版型排序測試使用的既有課程圖片'),
    }],
  },
  {
    _key: 'audience',
    _type: 'courseDetailAudience',
    title: '驗證範圍',
    description: '此區塊只描述本次技術驗收，不代表可公開招生的正式課程內容。',
    items: ['草稿隔離', '公開讀取', '版型排序', '安全報名連結'],
  },
]

const draftCourse = {
  _id: validationIds.courseDraft,
  _type: 'course',
  title: '課程內頁流程測試',
  slug: { _type: 'slug', current: slug },
  category: { _type: 'reference', _ref: 'course-category-body' },
  deliveryModes: ['inPerson'],
  summary: '這是完成後會清除的課程內頁流程測試，用來確認草稿、發布、排序與安全連結行為。',
  image: image('課程內頁內容流程測試使用的既有課程圖片'),
  detail: {
    _type: 'courseDetailContent',
    notice: '這是內容流程驗證文件，完成後會清除。',
    englishTitle: 'Course Detail Validation',
    body: initialBody,
    schedule: {
      _type: 'courseDetailSchedule',
      title: '測試梯次與參與條件',
      description: '只顯示已發布且資料格式有效的測試梯次。',
    },
    registration: {
      _type: 'courseDetailRegistration',
      title: '測試安全報名入口',
      description: '只有已發布、開放報名且使用 HTTPS 的梯次可以提供報名連結。',
      openActionLabel: '前往測試報名頁',
      closedActionLabel: '測試報名尚未開放',
      image: image('課程內頁報名區塊測試使用的既有課程圖片'),
    },
  },
  order: 999,
  isPublished: true,
}

const draftRun = {
  _id: validationIds.runDraft,
  _type: 'courseRun',
  course: { _type: 'reference', _ref: validationIds.course, _weak: true },
  label: '內容流程測試梯次',
  registrationStatus: 'open',
  isPublished: true,
  city: '線上',
  venue: '測試環境',
  timeLabel: '2027/10/11 10:00–12:00',
  capacityLabel: '測試名額 1 人',
  feeLabel: '不收費測試',
  registrationUrl: 'https://example.com/course-detail-validation',
  notes: ['此為驗收文件，不接受實際報名'],
  stages: [{
    _key: 'validation-stage',
    _type: 'courseStage',
    title: '驗證階段',
    order: 1,
    dateRanges: [{
      _key: 'validation-range',
      _type: 'courseDateRange',
      startDate: '2027-10-11',
      endDate: '2027-10-11',
    }],
  }],
}

function withoutSystemFields(document: Record<string, unknown>, id: string) {
  const { _rev, _createdAt, _updatedAt, ...content } = document
  return { ...content, _id: id }
}

async function requireMissing() {
  const documents = await client.getDocuments(Object.values(validationIds))
  if (documents.some(Boolean)) throw new Error('Validation documents already exist; refusing to overwrite them.')
}

async function requireDocuments(ids: string[]) {
  const documents = await client.getDocuments(ids)
  if (documents.some(document => !document)) throw new Error(`Missing validation documents: ${ids.join(', ')}`)
  return documents as Record<string, unknown>[]
}

async function createDrafts() {
  await requireMissing()
  await client.transaction().create(draftCourse).create(draftRun).commit()
  console.log(`created drafts: ${validationIds.courseDraft}, ${validationIds.runDraft}`)
}

async function publishDrafts() {
  const [course, run] = await requireDocuments([validationIds.courseDraft, validationIds.runDraft])
  const publishedRun = {
    ...withoutSystemFields(run, validationIds.run),
    course: { _type: 'reference', _ref: validationIds.course },
  }
  await client.transaction()
    .create(withoutSystemFields(course, validationIds.course))
    .create(publishedRun)
    .delete(validationIds.courseDraft)
    .delete(validationIds.runDraft)
    .commit()
  console.log(`published: ${validationIds.course}, ${validationIds.run}`)
}

async function createUpdateDrafts() {
  const [course, run] = await requireDocuments([validationIds.course, validationIds.run])
  const publishedCourse = course as typeof draftCourse
  const body = [...publishedCourse.detail.body]
  const secondGalleryIndex = body.findIndex(block => block._key === 'gallery-folio')
  const [secondGallery] = body.splice(secondGalleryIndex, 1)
  body.splice(1, 0, secondGallery!)
  body.splice(2, 0,
    {
      _key: 'teacher',
      _type: 'courseDetailTeacher',
      name: '驗收講師',
      englishName: 'Validation Teacher',
      lead: '確認選填講師區塊能穿插在任意兩個內容區塊之間。',
      biography: '這是只用於內容流程驗收的講師介紹，測試結束後會隨隔離文件一併清除。',
      image: image('課程講師區塊驗收使用的既有課程圖片'),
    },
    {
      _key: 'gallery-collage',
      _type: 'courseDetailGallery',
      title: '拼貼版型驗收內容',
      description: '確認拼貼版型可以和其他圖文區塊同時存在，並保留編輯者指定的位置。',
      layout: 'collage',
      note: '內容流程驗證用拼貼章節。',
      statement: '每個圖文區塊都能獨立選擇版型。',
      items: [{
        _key: 'collage-item',
        _type: 'courseDetailGalleryItem',
        group: '完整內容測試',
        title: '拼貼配置',
        description: '使用既有圖片確認拼貼配置在桌機與手機寬度都能正常呈現。',
        points: ['保留圖片替代文字', '內容順序由後台控制'],
        image: image('課程拼貼版型驗收使用的既有課程圖片'),
      }],
    },
    {
      _key: 'quote',
      _type: 'courseDetailQuote',
      text: '編輯者可以依內容節奏安排每一個區塊。',
      attribution: '內容流程驗收',
    },
  )
  body.splice(body.findIndex(block => block._key === 'curriculum'), 0,
    {
      _key: 'gallery-stages',
      _type: 'courseDetailGallery',
      title: '階段版型驗收內容',
      description: '確認階段版型可以加入相同頁面，並在課程架構之前依設定順序呈現。',
      layout: 'stages',
      note: '內容流程驗證用階段章節。',
      items: [{
        _key: 'stages-item',
        _type: 'courseDetailGalleryItem',
        group: '完整內容測試',
        title: '階段配置',
        description: '檢查階段式圖文在內容較長時仍維持清楚的閱讀層次。',
        image: image('課程階段版型驗收使用的既有課程圖片'),
      }],
    },
  )
  body.splice(body.findIndex(block => block._key === 'audience'), 0,
    {
      _key: 'video',
      _type: 'courseDetailVideo',
      title: '課程影片區塊驗收',
      statusLabel: '可播放測試影片',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      image: image('課程影片區塊驗收使用的既有課程圖片'),
    },
    {
      _key: 'gallery-dossier',
      _type: 'courseDetailGallery',
      title: '檔案版型驗收內容',
      description: '確認第五種圖文版型與所有選填模組一起出現時，頁面仍可完整輸出。',
      layout: 'dossier',
      note: '內容流程驗證用檔案章節。',
      items: [{
        _key: 'dossier-item',
        _type: 'courseDetailGalleryItem',
        group: '完整內容測試',
        title: '檔案配置',
        description: '最後一種版型用來確認多選、混排與完整內容的邊界情境。',
        image: image('課程檔案版型驗收使用的既有課程圖片'),
      }],
    },
  )
  await client.transaction()
    .create({
      ...withoutSystemFields(course, validationIds.courseDraft),
      title: '課程內頁流程測試：多版型自由排序與完整內容呈現驗收版本',
      detail: { ...publishedCourse.detail, body },
    })
    .create({
      ...withoutSystemFields(run, validationIds.runDraft),
      label: '內容流程測試梯次（草稿更新）',
    })
    .commit()
  console.log(`created update drafts: ${validationIds.courseDraft}, ${validationIds.runDraft}`)
}

async function publishUpdates() {
  const [course, run] = await requireDocuments([validationIds.courseDraft, validationIds.runDraft])
  await client.transaction()
    .createOrReplace(withoutSystemFields(course, validationIds.course))
    .createOrReplace(withoutSystemFields(run, validationIds.run))
    .delete(validationIds.courseDraft)
    .delete(validationIds.runDraft)
    .commit()
  console.log(`published updates: ${validationIds.course}, ${validationIds.run}`)
}

async function cleanup() {
  await client.delete({ query: '*[_id in $ids]', params: { ids: Object.values(validationIds) } })
  console.log(`deleted validation ids: ${Object.values(validationIds).join(', ')}`)
}

async function inspect() {
  const documents = await client.getDocuments(Object.values(validationIds))
  console.log(documents.filter(Boolean).map(document => ({ _id: document!._id, _type: document!._type })))
}

if (phase === 'draft') await createDrafts()
else if (phase === 'publish') await publishDrafts()
else if (phase === 'draft-update') await createUpdateDrafts()
else if (phase === 'publish-update') await publishUpdates()
else if (phase === 'cleanup') await cleanup()
else if (phase === 'inspect') await inspect()
else throw new Error('Use one phase: draft, publish, draft-update, publish-update, inspect, cleanup')
