import type { CourseOverviewContent } from '../../shared/types/course'

export const courseOverviewFixture: CourseOverviewContent = {
  pageTitle: '課程探索',
  directoryPrompt: '想從哪裡開始？',
  prototypeNotice: '分類簡介與影像為版面示意，正式內容待確認。',
  endingMessage: '找到想靠近的方向，再慢慢深入。',
  categories: [
    {
      key: 'body',
      name: '愛身體',
      slug: 'body',
      order: 1,
      summary: '從有意識的碰觸與覺察出發，練習聆聽身體，也重新辨認自己的界線。',
      courses: [
        {
          title: '頭薦骨',
          slug: 'craniosacral',
          deliveryModes: ['inPerson'],
          summary: '以示意內容測試課程資料結構，正式介紹仍待內容確認。',
          image: { src: '/images/home-banner-2.jpg', alt: '' },
          order: 1,
          isPublished: true,
        },
        {
          title: '再平衡按摩',
          slug: 'rebalancing-massage',
          deliveryModes: ['inPerson'],
          summary: '以示意內容測試課程資料結構，正式介紹仍待內容確認。',
          order: 2,
          isPublished: true,
        },
        {
          title: '日式臉部按摩',
          slug: 'japanese-face-massage',
          deliveryModes: ['inPerson'],
          summary: '以示意內容測試課程資料結構，正式介紹仍待內容確認。',
          image: { src: '/images/home-banner.jpg', alt: '' },
          order: 3,
          isPublished: true,
        },
      ],
    },
    {
      key: 'heart',
      name: '撫慰心',
      slug: 'heart',
      order: 2,
      summary: '透過關係與依附經驗的理解，為內在感受留出能被看見與承接的空間。',
      courses: [
        {
          title: '童年依附創傷療癒',
          slug: 'childhood-attachment-healing',
          deliveryModes: ['inPerson', 'online'],
          summary: '以示意內容測試課程資料結構，正式介紹仍待內容確認。',
          image: { src: '/images/home-banner-2.jpg', alt: '' },
          order: 1,
          isPublished: true,
        },
      ],
    },
    {
      key: 'life',
      name: '究生命',
      slug: 'life',
      order: 3,
      summary: '藉由理解工具觀察生命裡反覆出現的節奏，整理當下的位置與可能方向。',
      courses: [
        {
          title: '人類圖',
          slug: 'human-design',
          deliveryModes: ['online'],
          summary: '以示意內容測試課程資料結構，正式介紹仍待內容確認。',
          order: 1,
          isPublished: true,
        },
      ],
    },
    {
      key: 'beauty',
      name: '展現美',
      slug: 'beauty',
      order: 4,
      summary: '在顏色、形狀與創作的過程中安住，讓美感成為回到當下的一條路。',
      courses: [
        {
          title: '曼陀羅靜心彩繪',
          slug: 'mandala-meditative-painting',
          deliveryModes: ['online'],
          summary: '以示意內容測試課程資料結構，正式介紹仍待內容確認。',
          image: { src: '/images/home-banner.jpg', alt: '' },
          order: 1,
          isPublished: true,
        },
      ],
    },
  ],
}

export const courseOverviewLongContentFixture: CourseOverviewContent = {
  ...courseOverviewFixture,
  directoryPrompt: '想從身體、關係、生命理解或創作練習的哪一個方向開始？',
  categories: courseOverviewFixture.categories.map((category, categoryIndex) => ({
    ...category,
    summary: categoryIndex === 0
      ? '從有意識的碰觸、呼吸與細緻覺察出發，在安全而有邊界的練習裡重新聆聽身體，也逐步辨認日常生活中容易被忽略的需要。'
      : category.summary,
    courses: category.courses.map((course, courseIndex) => ({
      ...course,
      title: categoryIndex === 0 && courseIndex === 0
        ? '從身體感知開始的頭薦骨共振與日常自我照顧練習'
        : course.title,
    })),
  })),
}

export const courseOverviewMissingOptionalFixture: CourseOverviewContent = {
  ...courseOverviewFixture,
  endingMessage: undefined,
  categories: courseOverviewFixture.categories.map(category => ({
    ...category,
    courses: category.courses.map(course => ({ ...course, image: undefined })),
  })),
}

export const courseOverviewCategoryEmptyFixture: CourseOverviewContent = {
  ...courseOverviewFixture,
  categories: courseOverviewFixture.categories.map(category => (
    category.key === 'heart' ? { ...category, courses: [] } : category
  )),
}

export const courseOverviewEmptyFixture: CourseOverviewContent = {
  ...courseOverviewFixture,
  endingMessage: undefined,
  categories: courseOverviewFixture.categories.map(category => ({
    ...category,
    courses: [],
  })),
}
