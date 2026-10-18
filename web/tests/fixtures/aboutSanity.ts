const image = (name: string, alt: string) => ({
  src: `https://cdn.sanity.io/images/test/production/${name}.png`,
  width: 1536,
  height: 1024,
  alt,
  hotspot: { x: 0.5, y: 0.5 },
})

const body = (prefix: string, texts: string[]) => texts.map((text, index) => ({
  _key: `${prefix}-${index + 1}`,
  _type: 'block',
  style: 'normal',
  listItem: null,
  children: [{ _key: `${prefix}-${index + 1}-span`, _type: 'span', text, marks: [] }],
  markDefs: [],
}))

export const sanityAboutPage = {
  page: {
    title: '關於我們',
    introduction: '我們從身體、感受與創作出發，為每一段靠近自己的練習，留下一個可以慢慢發生的地方。',
    heroImage: image('team', '團隊在工作室準備活動'),
    brandStory: {
      heading: '讓理解自己，從一段停留開始。',
      body: body('brand', ['我們相信，身心的學習不急著提供一個標準答案，而是協助每個人重新辨認自己的感受。']),
      image: null,
    },
    placeAndTeam: {
      heading: '一個讓經驗被好好承接的地方。',
      body: body('place', ['我們在不同領域學習，也一起照顧空間、課程與每一次相遇。']),
      image: image('place', '團隊在木桌旁整理課程材料'),
    },
    featuredMoments: {
      heading: '一些發生過的靠近。',
      body: body('moments', ['從課程、練習到活動準備，我們留下少量片段，讓還沒來過的人先感受這裡的步調。']),
      items: ['one', 'two', 'three'].map((key, index) => ({
        key,
        image: image(key, `精選片段 ${index + 1}`),
        caption: `片段圖說 ${index + 1}`,
      })),
    },
    contactHeading: '從一段對話，找到適合的入口。',
    contactIntroduction: '若你還不確定從哪裡開始，歡迎先來信或來電和我們聊聊。',
    seo: {
      title: '關於我們｜Flowing Clarity',
      description: '認識 Flowing Clarity 的品牌理念、空間與團隊，以及聯絡方式與營業時間。',
    },
  },
  settings: {
    contact: {
      address: '高雄市民生一路201號A棟2樓',
      phone: { display: '+886 934 031 389', href: 'tel:+886934031389' },
      email: 'hello@example.com',
      businessHours: [{ days: '週二至週日', hours: '10:00–18:00' }],
      businessHoursNote: '採預約制',
      map: {
        placeName: 'Flowing Clarity',
        embedUrl: 'https://www.google.com/maps?q=Kaohsiung%2C+Taiwan&output=embed',
        externalUrl: 'https://www.google.com/maps/search/?api=1&query=Kaohsiung',
      },
    },
    socialLinks: [{ label: 'Facebook', href: 'https://example.com/facebook' }],
  },
}
