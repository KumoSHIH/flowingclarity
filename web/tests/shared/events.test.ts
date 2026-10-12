import { describe, expect, it } from 'vitest'
import type { EventOverviewItem } from '../../shared/types/event'
import {
  deriveEventCollections,
  getEventDetailPath,
  getEventsPath,
  getPaginationItems,
  isSafeRegistrationUrl,
  normalizeEventPage,
  normalizeEventView,
  paginateEvents,
  parseEventOverview,
} from '../../shared/utils/events'

function event(id: string, overrides: Partial<EventOverviewItem> = {}): EventOverviewItem {
  return {
    id,
    title: `活動 ${id}`,
    slug: `event-${id}`,
    eventType: '工作坊',
    summary: '這是用來驗證活動時間與狀態處理的測試內容。',
    startAt: '2026-10-12T10:00:00+08:00',
    endAt: '2026-10-12T18:00:00+08:00',
    timezone: 'Asia/Taipei',
    deliveryMode: 'inPerson',
    registrationStatus: 'open',
    registrationUrl: 'https://example.com/register',
    archiveVisible: true,
    order: 1,
    isPublished: true,
    ...overrides,
  }
}

describe('event overview helpers', () => {
  it('transforms valid Sanity content and filters invalid event documents', () => {
    const result = parseEventOverview({
      page: {
        pageTitle: '近期活動',
        intro: '從短期工作坊與說明會開始，依自己的時間與需要，找到適合參與的練習。',
        upcomingHeading: '近期活動',
        pastHeading: '過去活動',
        emptyMessage: '目前沒有已發布的近期活動；可以切換至過去活動查看歷史紀錄。',
      },
      events: [
        {
          ...event('valid'),
          city: '高雄',
          relatedCourseSlug: 'body-awareness',
          image: {
            src: 'https://cdn.sanity.io/images/project/dataset/image.jpg',
            alt: '雙手進行身體覺察練習',
            hotspot: { x: 0.25, y: 0.75 },
          },
        },
        { ...event('invalid'), deliveryMode: 'inPerson', city: undefined },
      ],
    })

    expect(result?.events).toEqual([expect.objectContaining({
      id: 'valid',
      relatedCourseHref: '/course/body-awareness',
      image: expect.objectContaining({ objectPosition: '25% 75%' }),
    })])
  })

  it('rejects an invalid page content contract', () => {
    expect(parseEventOverview({ page: { pageTitle: '' }, events: [] })).toBeNull()
  })

  it('accepts a three-character empty message and rejects a shorter value', () => {
    const page = {
      pageTitle: '近期活動',
      intro: '從短期工作坊與說明會開始，依自己的時間與需要，找到適合參與的練習。',
      upcomingHeading: '近期活動',
      pastHeading: '過去活動',
      emptyMessage: '無活動',
    }

    expect(parseEventOverview({ page, events: [] })).not.toBeNull()
    expect(parseEventOverview({
      page: { ...page, emptyMessage: '目前' },
      events: [],
    })).toBeNull()
  })

  it('closes registration at the start boundary and archives at the end boundary', () => {
    const source = [event('boundary')]
    const atStart = deriveEventCollections(source, '2026-10-12T10:00:00+08:00')
    expect(atStart.upcoming).toHaveLength(1)
    expect(atStart.upcoming[0]?.effectiveStatus).toBe('closed')

    const atEnd = deriveEventCollections(source, '2026-10-12T18:00:00+08:00')
    expect(atEnd.upcoming).toHaveLength(0)
    expect(atEnd.past).toHaveLength(1)
  })

  it('sorts future events nearest first and archived events newest first', () => {
    const source = [
      event('future-later', { startAt: '2026-12-01T10:00:00+08:00', endAt: '2026-12-01T12:00:00+08:00' }),
      event('past-older', { startAt: '2026-08-01T10:00:00+08:00', endAt: '2026-08-01T12:00:00+08:00' }),
      event('future-nearer', { startAt: '2026-11-01T10:00:00+08:00', endAt: '2026-11-01T12:00:00+08:00' }),
      event('past-newer', { startAt: '2026-09-01T10:00:00+08:00', endAt: '2026-09-01T12:00:00+08:00' }),
    ]
    const result = deriveEventCollections(source, '2026-10-12T09:00:00+08:00')
    expect(result.upcoming.map(item => item.id)).toEqual(['future-nearer', 'future-later'])
    expect(result.past.map(item => item.id)).toEqual(['past-newer', 'past-older'])
  })

  it('excludes cancelled, hidden, invalid, and non-archived past events', () => {
    const source = [
      event('cancelled', { registrationStatus: 'cancelled' }),
      event('hidden', { isPublished: false }),
      event('invalid', { endAt: '2026-10-11T18:00:00+08:00' }),
      event('not-archived', { archiveVisible: false }),
    ]
    expect(deriveEventCollections(source, '2026-10-13T09:00:00+08:00')).toEqual({
      upcoming: [],
      past: [],
    })
  })

  it('clamps pagination and normalizes shareable query values', () => {
    const items = deriveEventCollections([
      event('1', { startAt: '2026-11-01T10:00:00+08:00', endAt: '2026-11-01T12:00:00+08:00' }),
      event('2', { startAt: '2026-11-02T10:00:00+08:00', endAt: '2026-11-02T12:00:00+08:00' }),
      event('3', { startAt: '2026-11-03T10:00:00+08:00', endAt: '2026-11-03T12:00:00+08:00' }),
    ], '2026-10-01T09:00:00+08:00').upcoming
    const result = paginateEvents(items, 99, 2)
    expect(result.currentPage).toBe(2)
    expect(result.items.map(item => item.id)).toEqual(['3'])
    expect(normalizeEventView('unknown')).toBe('upcoming')
    expect(normalizeEventView(['past'])).toBe('past')
    expect(normalizeEventPage('-2')).toBe(1)
    expect(normalizeEventPage('3')).toBe(3)
    expect(getEventsPath('past', 2)).toBe('/events?view=past&page=2')
    expect(getEventDetailPath('two-day-workshop')).toBe('/events/two-day-workshop')
    expect(getEventDetailPath('活動 01')).toBe('/events/%E6%B4%BB%E5%8B%95%2001')
  })

  it('shows every short pagination page and compacts longer ranges around the current page', () => {
    expect(getPaginationItems(2, 3)).toEqual([1, 2, 3])
    expect(getPaginationItems(1, 8)).toEqual([1, 2, 3, 'ellipsis', 8])
    expect(getPaginationItems(4, 8)).toEqual([1, 'ellipsis', 4, 'ellipsis', 8])
    expect(getPaginationItems(8, 8)).toEqual([1, 'ellipsis', 6, 7, 8])
  })

  it('accepts only HTTPS registration destinations', () => {
    expect(isSafeRegistrationUrl('https://example.com/form')).toBe(true)
    expect(isSafeRegistrationUrl('http://example.com/form')).toBe(false)
    expect(isSafeRegistrationUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeRegistrationUrl()).toBe(false)
  })
})
