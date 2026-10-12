import type { EventOverviewContent, EventOverviewItem } from '#shared/types/event'

function event(
  id: string,
  overrides: Partial<EventOverviewItem>,
): EventOverviewItem {
  return {
    id,
    title: `示意活動 ${id}`,
    slug: `prototype-event-${id}`,
    eventType: '工作坊',
    summary: '此為版面與互動驗證用的示意內容，不代表已確認或可公開報名的正式活動。',
    startAt: '2026-11-07T10:00:00+08:00',
    endAt: '2026-11-07T17:00:00+08:00',
    timezone: 'Asia/Taipei',
    deliveryMode: 'inPerson',
    city: '台北',
    venue: '示意空間',
    registrationStatus: 'open',
    registrationUrl: `https://example.com/register/${id}`,
    archiveVisible: true,
    order: Number(id.replace(/\D/g, '')) || 1,
    isPublished: true,
    ...overrides,
  }
}

export const eventOverviewFixture: EventOverviewContent = {
  pageTitle: '近期活動',
  intro: '從短期工作坊與說明會開始，依自己的時間與需要，找到適合參與的練習。',
  upcomingHeading: '近期活動',
  pastHeading: '過去活動',
  emptyMessage: '目前沒有已發布的近期活動；可以切換至過去活動查看歷史紀錄。',
  prototypeNotice: '本頁活動、日期、地點與報名網址皆為前端示意資料。',
  events: [
    event('01', { title: '身體覺察一日工作坊', startAt: '2026-10-17T10:00:00+08:00', endAt: '2026-10-17T17:00:00+08:00' }),
    event('02', { title: '課程線上說明會', eventType: '說明會', deliveryMode: 'online', city: '線上', venue: undefined, startAt: '2026-10-24T20:00:00+08:00', endAt: '2026-10-24T21:30:00+08:00' }),
    event('03', { title: '兩日靜心練習', eventType: '兩日工作坊', registrationStatus: 'full', registrationUrl: undefined, city: '新北', startAt: '2026-11-07T09:30:00+08:00', endAt: '2026-11-08T17:00:00+08:00', scheduleNote: '兩日皆為 09:30–17:00' }),
    event('04', { title: '呼吸與情緒工作坊', city: '台中', startAt: '2026-11-14T14:00:00+08:00', endAt: '2026-11-14T17:00:00+08:00' }),
    event('05', { title: '課程理念分享會', eventType: '分享會', registrationStatus: 'scheduled', registrationUrl: undefined, deliveryMode: 'hybrid', startAt: '2026-11-21T19:00:00+08:00', endAt: '2026-11-21T21:00:00+08:00' }),
    event('06', { title: '年末身心整理工作坊', registrationStatus: 'closed', registrationUrl: undefined, startAt: '2026-12-05T10:00:00+08:00', endAt: '2026-12-05T17:00:00+08:00' }),
    event('07', { title: '線上練習說明會', eventType: '說明會', deliveryMode: 'online', city: '線上', venue: undefined, startAt: '2026-12-12T20:00:00+08:00', endAt: '2026-12-12T21:00:00+08:00' }),
    event('08', { title: '冬日身體書寫', city: '高雄', startAt: '2026-12-19T14:00:00+08:00', endAt: '2026-12-19T17:00:00+08:00' }),
    event('09', { title: '新年練習預備會', eventType: '分享會', startAt: '2026-12-26T14:00:00+08:00', endAt: '2026-12-26T16:00:00+08:00' }),
    event('10', { title: '一月線上交流', eventType: '線上活動', deliveryMode: 'online', city: '線上', venue: undefined, startAt: '2027-01-09T20:00:00+08:00', endAt: '2027-01-09T21:30:00+08:00' }),
    event('11', { title: '日常中的身體覺察', startAt: '2026-10-10T14:00:00+08:00', endAt: '2026-10-10T17:00:00+08:00' }),
    event('12', { title: '九月線上說明會', eventType: '說明會', deliveryMode: 'online', city: '線上', venue: undefined, startAt: '2026-09-26T20:00:00+08:00', endAt: '2026-09-26T21:00:00+08:00' }),
    event('13', { title: '兩日安定練習', eventType: '兩日工作坊', startAt: '2026-09-19T09:30:00+08:00', endAt: '2026-09-20T17:00:00+08:00' }),
    event('14', { title: '身體與情緒的對話', startAt: '2026-09-12T14:00:00+08:00', endAt: '2026-09-12T17:00:00+08:00' }),
    event('15', { title: '八月課程分享會', eventType: '分享會', startAt: '2026-08-29T14:00:00+08:00', endAt: '2026-08-29T16:00:00+08:00' }),
    event('16', { title: '身體覺察午後', startAt: '2026-08-22T14:00:00+08:00', endAt: '2026-08-22T17:00:00+08:00' }),
    event('17', { title: '線上練習交流', eventType: '線上活動', deliveryMode: 'online', city: '線上', venue: undefined, startAt: '2026-08-15T20:00:00+08:00', endAt: '2026-08-15T21:30:00+08:00' }),
    event('18', { title: '夏日靜心練習', startAt: '2026-08-08T10:00:00+08:00', endAt: '2026-08-08T17:00:00+08:00' }),
    event('19', { title: '七月線上說明會', eventType: '說明會', deliveryMode: 'online', city: '線上', venue: undefined, startAt: '2026-07-25T20:00:00+08:00', endAt: '2026-07-25T21:00:00+08:00' }),
    event('20', { title: '不公開的取消活動', registrationStatus: 'cancelled', startAt: '2026-11-28T10:00:00+08:00', endAt: '2026-11-28T17:00:00+08:00' }),
  ],
}
