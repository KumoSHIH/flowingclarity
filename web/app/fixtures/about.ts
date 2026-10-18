import type { AboutPageContent } from '#shared/types/about'

function paragraphs(prefix: string, values: string[]) {
  return values.map((text, index) => ({
    key: `${prefix}-${index + 1}`,
    text,
    segments: [{ key: `${prefix}-${index + 1}-span`, text }],
  }))
}

const teamImage = {
  src: '/assets/about/about-team-preparation.png',
  alt: '三位團隊成員在暖光工作室中準備活動的示意影像',
  width: 1536,
  height: 1024,
}

export const aboutPageFixture: AboutPageContent = {
  title: '關於我們',
  introduction: '我們從身體、感受與創作出發，為每一段靠近自己的練習，留下一個可以慢慢發生的地方。',
  heroImage: teamImage,
  brandStory: {
    heading: '讓理解自己，從一段停留開始。',
    body: paragraphs('brand', [
      '我們相信，身心的學習不急著提供一個標準答案，而是協助每個人重新辨認自己的感受。透過觸碰、對話、觀察與創作，讓選擇逐漸變得清楚。',
      '這段文字是長度與節奏示意，正式品牌理念仍須由內容負責人核准。',
    ]),
  },
  placeAndTeam: {
    heading: '一個讓經驗被好好承接的地方。',
    body: paragraphs('place', [
      '我們在不同領域學習，也一起照顧空間、課程與每一次相遇。這裡呈現的是構圖示意，不代表正式團隊名單。',
    ]),
    image: {
      ...teamImage,
      alt: '團隊在木桌旁整理課程材料的示意影像',
    },
  },
  featuredMoments: {
    heading: '一些發生過的靠近。',
    body: paragraphs('moments', [
      '從課程、練習到活動準備，我們留下少量片段，讓還沒來過的人先感受這裡的步調。正式照片上線前須確認授權與人物公開同意。',
    ]),
    items: [
      {
        id: 'mandala',
        image: {
          src: '/assets/about/about-moment-mandala.png',
          alt: '幾位參與者一起在手工紙上繪製曼陀羅的示意影像',
          width: 1536,
          height: 1024,
        },
        caption: '共同創作的片刻，讓每一雙手留下不同的節奏。',
      },
      {
        id: 'circle',
        image: {
          src: '/assets/about/about-moment-circle.png',
          alt: '五位參與者坐在暖光空間中交流的示意影像',
          width: 1536,
          height: 1024,
        },
        caption: '圍坐、傾聽與回應，讓經驗在關係之間慢慢被理解。',
      },
      {
        id: 'bodywork',
        image: {
          src: '/assets/about/about-moment-bodywork.png',
          alt: '講師示範肩背觸碰方式、學員在旁觀察的示意影像',
          width: 1536,
          height: 1024,
        },
        caption: '在清楚而尊重的示範中，理解觸碰的分寸與感受。',
      },
    ],
  },
  contactHeading: '從一段對話，找到適合的入口。',
  contactIntroduction: '以下聯絡內容僅供版面示意；CMS 串接後將由全站設定同步帶入。',
  contact: {
    address: '高雄市・正式地址待核准',
    phone: { display: '07 — 000 0000', href: 'tel:+88670000000' },
    email: 'hello@example.com',
    businessHours: [{ days: '週二至週日', hours: '10:00–18:00' }],
    businessHoursNote: '採預約制・實際時間待核准',
    socialLinks: [
      { label: 'Facebook', href: 'https://example.com/' },
      { label: 'LINE', href: 'https://example.com/' },
    ],
    map: {
      placeName: '高雄市示意地點',
      embedUrl: 'https://www.google.com/maps?q=Kaohsiung%2C+Taiwan&output=embed',
      externalUrl: 'https://www.google.com/maps/search/?api=1&query=Kaohsiung%2C%20Taiwan',
    },
  },
  prototypeNotice: '本頁文案、人物影像、聯絡資料與營業時間皆為前端原型示意，尚未核准發布。',
  seo: {
    title: '關於我們｜Flowing Clarity',
    description: '認識 Flowing Clarity 的品牌理念、空間與團隊，以及聯絡方式。',
  },
}

export const aboutPageLongFixture: AboutPageContent = {
  ...aboutPageFixture,
  introduction: '這是一段用來確認較長首屏導言在窄螢幕與放大狀態下仍能完整閱讀、不被截斷，也不會擠壓頁面標題的示意內容。'.repeat(2),
  brandStory: {
    ...aboutPageFixture.brandStory,
    heading: '讓每一種感受與經驗，都能在足夠的時間裡慢慢被理解。',
    body: paragraphs('long-brand', ['較長品牌理念內容。'.repeat(45)]),
  },
  placeAndTeam: {
    ...aboutPageFixture.placeAndTeam,
    body: paragraphs('long-place', ['較長空間與團隊介紹內容。'.repeat(45)]),
  },
  featuredMoments: {
    ...aboutPageFixture.featuredMoments,
    items: Array.from({ length: 10 }, (_, index) => ({
      ...aboutPageFixture.featuredMoments.items[index % 3]!,
      id: `long-${index + 1}`,
      caption: `較長片段圖說 ${index + 1}：${'確認圖說換行仍可閱讀。'.repeat(4)}`,
    })),
  },
}

export const aboutPageMissingOptionalFixture: AboutPageContent = {
  ...aboutPageFixture,
  introduction: undefined,
  brandStory: { ...aboutPageFixture.brandStory, image: undefined },
  featuredMoments: {
    ...aboutPageFixture.featuredMoments,
    items: aboutPageFixture.featuredMoments.items.map(item => ({ ...item, caption: undefined })),
  },
  contactIntroduction: undefined,
  prototypeNotice: undefined,
}

export const aboutPageEmptyMomentsFixture: AboutPageContent = {
  ...aboutPageFixture,
  featuredMoments: { ...aboutPageFixture.featuredMoments, items: [] },
}
