import type { HomeSectionsContent } from '../../shared/types/homeSections'

export const homeSectionsContent: HomeSectionsContent = {
  introduction: {
    label: '關於普那',
    heading: '讓身體被好好聽見，\n讓心有地方安放。',
    paragraphs: [
      '普那生活空間相信，照顧自己不需要急著抵達某個答案。從一次深呼吸開始，慢慢認識身體此刻真正的需要。',
      '我們透過按摩、身體工作與小型課程，陪你在日常之間留下一段可以鬆開、整理、重新感受自己的時間。',
    ],
    image: { src: 'https://cdn.sanity.io/images/test/production/intro.jpg', alt: '暖光照進安靜的療癒空間', width: 1080, height: 1350 },
    caption: 'A QUIET PLACE TO BE',
  },
  events: {
    heading: '近期活動',
    introduction: '在不大的空間裡相遇，分享一段專心感受當下的時間。',
    emptyMessage: '目前沒有近期活動，歡迎稍後再回來看看。',
    items: [
      { id: 'event-1', href: '/events/autumn-meditation', date: '2026-10-12', period: '2026/10', day: '12-13', weekday: '週一、週二', title: '秋日靜心練習', category: '兩日工作坊', time: '兩日皆為 14:00—16:00' },
      { id: 'event-2', href: '/events/body-writing-night', date: '2026-10-26', period: '2026/10', day: '26', weekday: '週一', title: '身體書寫之夜', category: '主題活動', time: '19:00—21:00' },
      { id: 'event-3', href: '/events/slow-tea-time', date: '2026-11-09', period: '2026/11', day: '09', weekday: '週一', title: '一杯茶的慢時光', category: '生活練習', time: '15:00—17:00' },
    ],
  },
  courses: {
    heading: '近期課程',
    introduction: '用可以帶回日常的練習，一點一點培養對身體的覺察與信任。',
    emptyMessage: '目前沒有已確定日期的近期課程，歡迎稍後再回來看看。',
    items: [
      { id: 'course-1', href: '/course/breathing-practice', title: '回到身體的呼吸練習', description: '從呼吸與緩慢的動作，練習辨認緊繃，也練習在生活裡為自己留下一點空間。', meta: '身體練習 · 2026/11/09 開課', image: { src: 'https://cdn.sanity.io/images/test/production/course.jpg', alt: '鋪著亞麻布的安靜按摩空間', width: 900, height: 720 } },
      { id: 'course-2', href: '/course/gentle-touch-massage', title: '溫柔觸碰按摩課', description: '認識安全而有界線的觸碰，學習適合日常使用的肩頸與手部放鬆方法。', meta: '按摩課程 · 2027/01/10 開課', image: { src: 'https://cdn.sanity.io/images/test/production/course-2.jpg', alt: '暖光中的療癒空間', width: 900, height: 720 } },
    ],
  },
  contact: { heading: '留一段時間，\n好好照顧自己。', introduction: '想了解按摩、近期活動或課程，歡迎來信與我們說說你的需要。', buttonLabel: '寫信給我們', email: 'hello@flowingclarity.tw' },
}

export const sanityHomeSections = {
  page: {
    introductionLabel: homeSectionsContent.introduction.label,
    introductionHeading: homeSectionsContent.introduction.heading,
    introductionParagraphs: homeSectionsContent.introduction.paragraphs,
    introductionImage: { ...homeSectionsContent.introduction.image, hotspot: { x: 0.5, y: 0.45 } },
    introductionCaption: homeSectionsContent.introduction.caption,
    eventsHeading: homeSectionsContent.events.heading,
    eventsIntroduction: homeSectionsContent.events.introduction,
    eventsEmptyMessage: homeSectionsContent.events.emptyMessage,
    coursesHeading: homeSectionsContent.courses.heading,
    coursesIntroduction: homeSectionsContent.courses.introduction,
    coursesEmptyMessage: homeSectionsContent.courses.emptyMessage,
    contactHeading: homeSectionsContent.contact?.heading,
    contactIntroduction: homeSectionsContent.contact?.introduction,
    contactButtonLabel: homeSectionsContent.contact?.buttonLabel,
  },
  settings: { contact: { email: 'hello@flowingclarity.tw' } },
  events: [
    { _id: 'event-1', slug: 'autumn-meditation', title: '秋日靜心練習', eventType: '小型聚會', startAt: '2026-10-25T06:00:00Z', endAt: '2026-10-25T08:00:00Z', registrationStatus: 'open', order: 1, isPublished: true },
  ],
  courses: [
    { _id: 'course-1', slug: 'breathing-practice', title: '回到身體的呼吸練習', summary: homeSectionsContent.courses.items[0]!.description, categoryName: '身體練習', image: homeSectionsContent.courses.items[0]!.image, isPublished: true, runs: [{ registrationStatus: 'open', isPublished: true, stages: [{ dateRanges: [{ startDate: '2026-11-09' }] }] }] },
  ],
}
