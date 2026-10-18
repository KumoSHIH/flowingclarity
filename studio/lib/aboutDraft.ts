type ImageReference = { _type: 'reference'; _ref: string }

export interface AboutDraftAssets {
  team: ImageReference
  mandala: ImageReference
  circle: ImageReference
  bodywork: ImageReference
}

function block(key: string, text: string) {
  return {
    _key: key,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _key: `${key}-span`, _type: 'span', text, marks: [] }],
  }
}

function image(asset: ImageReference, alt: string) {
  return { _type: 'image', asset, alt }
}

export function buildAboutDraft(assets: AboutDraftAssets) {
  const team = image(assets.team, '三位團隊成員在暖光工作室中準備活動的示意影像')
  return {
    _id: 'drafts.about-page',
    _type: 'aboutPage',
    title: '關於我們',
    introduction: '我們從身體、感受與創作出發，為每一段靠近自己的練習，留下一個可以慢慢發生的地方。',
    heroImage: team,
    brandStory: {
      heading: '讓理解自己，從一段停留開始。',
      body: [
        block('brand-1', '我們相信，身心的學習不急著提供一個標準答案，而是協助每個人重新辨認自己的感受。透過觸碰、對話、觀察與創作，讓選擇逐漸變得清楚。'),
        block('brand-2', '這段文字是長度與節奏示意，正式品牌理念仍須由內容負責人核准。'),
      ],
    },
    placeAndTeam: {
      heading: '一個讓經驗被好好承接的地方。',
      body: [block('place-1', '我們在不同領域學習，也一起照顧空間、課程與每一次相遇。這裡呈現的是構圖示意，不代表正式團隊名單。')],
      image: { ...team, alt: '團隊在木桌旁整理課程材料的示意影像' },
    },
    featuredMoments: {
      heading: '一些發生過的靠近。',
      body: [block('moments-1', '從課程、練習到活動準備，我們留下少量片段，讓還沒來過的人先感受這裡的步調。正式照片上線前須確認授權與人物公開同意。')],
      items: [
        {
          _key: 'mandala',
          image: image(assets.mandala, '幾位參與者一起在手工紙上繪製曼陀羅的示意影像'),
          caption: '共同創作的片刻，讓每一雙手留下不同的節奏。',
        },
        {
          _key: 'circle',
          image: image(assets.circle, '五位參與者坐在暖光空間中交流的示意影像'),
          caption: '圍坐、傾聽與回應，讓經驗在關係之間慢慢被理解。',
        },
        {
          _key: 'bodywork',
          image: image(assets.bodywork, '講師示範肩背觸碰方式、學員在旁觀察的示意影像'),
          caption: '在清楚而尊重的示範中，理解觸碰的分寸與感受。',
        },
      ],
    },
    contactHeading: '從一段對話，找到適合的入口。',
    contactIntroduction: '以下聯絡內容僅供版面示意；CMS 串接後將由全站設定同步帶入。',
    seo: {
      title: '關於我們｜Flowing Clarity',
      description: '認識 Flowing Clarity 的品牌理念、空間與團隊，以及聯絡方式。',
    },
  }
}
