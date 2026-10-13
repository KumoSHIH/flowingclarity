import type { EventDetailContent } from '#shared/types/eventDetail'
import type { EventOverviewItem } from '#shared/types/event'
import { eventOverviewFixture } from './events'

const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('zh-TW', {
  timeZone: 'Asia/Taipei',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function locationLabel(event: EventOverviewItem): string {
  if (event.deliveryMode === 'online') return event.city ?? '線上'
  return [event.city, event.venue].filter(Boolean).join('・') || '地點待確認'
}

export function getEventDetailFixture(slug: string): EventDetailContent | undefined {
  const event = eventOverviewFixture.events.find(item => item.slug === slug)
  if (!event || event.registrationStatus === 'cancelled') return undefined

  const start = new Date(event.startAt)
  const end = new Date(event.endAt)
  const actionIsOpen = event.registrationStatus === 'open'

  return {
    slug,
    hero: {
      title: event.title,
      summary: event.summary,
      image: event.image,
    },
    facts: [
      { label: '日期', value: dateFormatter.format(start), dateTime: event.startAt },
      { label: '時間', value: event.scheduleNote ?? `${timeFormatter.format(start)}–${timeFormatter.format(end)}` },
      { label: '地點', value: locationLabel(event) },
      { label: '費用', value: '正式費用待確認' },
    ],
    intro: '這是一場用來驗證活動詳情頁排版、內容順序與狀態呈現的前端原型，所有人名、費用、心得與報名資訊都不是已核准的正式內容。',
    body: [
      {
        key: 'introduction',
        type: 'text',
        title: '課程介紹',
        paragraphs: [
        '活動將說明練習如何進行、參與者會接觸哪些方法，以及過程中可以如何依自己的狀態停留、調整或休息。',
        '活動會從說明與個人觀察逐步進入實作和整理；每一段都會保留停頓與提問的空間。',
        ],
      },
      {
        key: 'facilitator',
        type: 'facilitator',
        name: '帶領者姓名待確認',
        role: '活動帶領者',
        biography: '帶領者將說明活動的進行方式與練習界線，並在每個階段保留提問與調整的空間。完整經歷將於資料確認後更新。',
      },
      {
        key: 'agenda',
        type: 'agenda',
        title: '這一天，會怎麼進行',
        description: '一天會從抵達、活動說明與個人觀察開始，再進入示範、練習與共同整理；正式時段依活動公告為準。',
        items: [
        {
          key: 'arrival',
          timeLabel: '10:00',
          title: '抵達、說明與個人觀察',
          description: '理解參與方式與界線，從自己的呼吸與重量開始。',
        },
        {
          key: 'practice',
          timeLabel: '13:30',
          title: '示範與兩人練習',
          description: '依活動設計進行實作，過程可按自身狀態調整參與程度。',
        },
        {
          key: 'closing',
          timeLabel: '15:45',
          title: '提問與共同整理',
          description: '回看當天經驗、提出問題，並完成活動收束。',
        },
        ],
      },
      {
        key: 'testimonials',
        type: 'testimonials',
        title: '學員心得分享',
        items: [
        {
          text: '這段練習讓我第一次注意到，原來自己在面對不熟悉的感受時，總會急著替它找到答案。帶領者沒有要求我們立刻說明發生了什麼，而是留了一段很安靜的時間，讓每個人可以按照自己的速度觀察。',
          sharerName: '示意分享者 A',
        },
        {
          text: '活動的說明很具體，從練習方式、彼此的界線，到過程中可以選擇暫停或調整，都有清楚交代。這樣的安排讓我不需要勉強完成所有步驟，也能好好理解自己正在經驗的內容。',
          sharerName: '示意分享者 B',
        },
        ],
      },
    ],
    registration: {
      status: event.registrationStatus,
      actionLabel: actionIsOpen ? '報名資料待確認' : '目前不開放報名',
      note: actionIsOpen ? '正式網址通過 HTTPS 驗證後才會啟用' : undefined,
    },
  }
}

