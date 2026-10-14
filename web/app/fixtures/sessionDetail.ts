import type { SessionDetailContent } from '#shared/types/sessionDetail'

const primaryFixture: SessionDetailContent = {
  id: 'prototype-practitioner-01',
  slug: 'prototype-practitioner-01',
  name: '林若安',
  englishName: 'AN LIN',
  summary: '陪伴人重新感受身體的界線與節奏，在安靜、穩定的接觸裡，找到可以呼吸與停留的位置。',
  regions: ['南部'],
  portrait: {
    src: '/images/course-detail/facial-portrait-4.jpg',
    alt: '排版示意人物肖像，非正式執行師',
    displayMode: 'contained',
    objectPosition: '58% center',
  },
  bio: [
    '乘著覺察如歸，照顧案主如同照顧自己的家人。寧靜的碰觸，讓案主有回到自己內在歸屬感的空間，才可釋放當下生活緊湊、工作壓力與身體累積的緊繃。',
    '這段內容為前端排版示意，用來呈現一至六段介紹文字的閱讀節奏，不代表正式服務說明或療效承諾。',
  ],
  experienceItems: [
    '身心再平衡按摩相關訓練與持續進修',
    '生物動能頭薦骨學習與個案實作',
    '日式臉部按摩服務經驗',
    '身體覺察與陪伴工作坊協作',
  ],
  serviceLocations: [
    {
      key: 'kaohsiung-studio',
      cities: ['高雄市', '台南市'],
      venueName: '示意服務空間',
      address: '示意地址不代表正式服務地區',
      publicDetail: 'venue',
    },
  ],
  methods: ['身心再平衡按摩', '生物動能頭薦骨', '日式臉部按摩'],
  contactIntro: '請先透過合適的公開管道詢問服務方式與可預約時間。',
  contactItems: [
    { key: 'phone', type: 'phone', label: '電話', displayText: '07-000-0000', href: 'tel:070000000' },
    { key: 'line-id', type: 'lineId', label: 'LINE ID', displayText: '@flowing-demo' },
    { key: 'facebook', type: 'facebook', label: 'Facebook', displayText: '執行師公開頁面', href: 'https://example.com/facebook' },
    { key: 'line-url', type: 'lineUrl', label: 'LINE 官方連結', displayText: '開啟外部服務', href: 'https://example.com/line' },
  ],
  bookingAction: {
    label: '前往預約表單',
    url: 'https://example.com/booking',
  },
  prototypeNotice: '本頁人物、圖片、經歷、地點與聯繫資訊皆為前端示意資料。',
}

const minimalFixture: SessionDetailContent = {
  ...primaryFixture,
  id: 'prototype-practitioner-02',
  slug: 'prototype-practitioner-02',
  name: '周以澄',
  regions: ['中部'],
  englishName: undefined,
  portrait: undefined,
  experienceItems: [],
  bookingAction: undefined,
  serviceLocations: [
    { key: 'taichung', cities: ['台中市'], publicDetail: 'cityOnly' },
  ],
  contactItems: [
    { key: 'line-id', type: 'lineId', label: 'LINE ID', displayText: '@flowing-demo' },
  ],
}

const longFixture: SessionDetailContent = {
  ...primaryFixture,
  id: 'prototype-practitioner-long',
  slug: 'prototype-practitioner-long',
  name: '示意長姓名用於驗證自然換行與閱讀順序',
  regions: ['北部'],
  englishName: 'A VERY LONG PUBLIC ENGLISH NAME',
  portrait: undefined,
  summary: '這是一段用於驗證較長摘要在窄螢幕自然換行的示意內容，需保持完整可讀，不能裁切或造成水平捲動。',
  bio: Array.from({ length: 6 }, (_, index) => `第 ${index + 1} 段長篇介紹用於驗證內容閱讀節奏。${'示意文字不代表正式服務、資格或療效承諾。'.repeat(8)}`),
  experienceItems: Array.from({ length: 12 }, (_, index) => `第 ${index + 1} 筆可排序示意經歷，用於驗證較長清單完整顯示與自然換行`),
  serviceLocations: Array.from({ length: 6 }, (_, index) => ({
    key: `location-${index + 1}`,
    cities: [`示意城市 ${index + 1}`],
    venueName: `示意服務地區 ${index + 1}`,
    publicDetail: 'venue' as const,
  })),
  methods: Array.from({ length: 20 }, (_, index) => `第 ${index + 1} 種可擴充服務項目名稱`),
  contactItems: Array.from({ length: 6 }, (_, index) => ({
    key: `contact-${index + 1}`,
    type: 'lineId' as const,
    label: `聯繫管道 ${index + 1}`,
    displayText: `@flowing-demo-${index + 1}`,
  })),
  bookingAction: undefined,
}

const fixtures = new Map([
  [primaryFixture.slug, primaryFixture],
  [minimalFixture.slug, minimalFixture],
  [longFixture.slug, longFixture],
])

export function getSessionDetailFixture(slug: string): SessionDetailContent | undefined {
  return fixtures.get(slug)
}

export {
  longFixture as sessionDetailLongFixture,
  minimalFixture as sessionDetailMinimalFixture,
  primaryFixture as sessionDetailFixture,
}
