import { describe, expect, it } from 'vitest'
import type { EventOverviewItem } from '../../shared/types/event'
import {
  deriveEventCollections,
  getEventsPath,
  isSafeRegistrationUrl,
  normalizeEventPage,
  normalizeEventView,
  paginateEvents,
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
  })

  it('accepts only HTTPS registration destinations', () => {
    expect(isSafeRegistrationUrl('https://example.com/form')).toBe(true)
    expect(isSafeRegistrationUrl('http://example.com/form')).toBe(false)
    expect(isSafeRegistrationUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeRegistrationUrl()).toBe(false)
  })
})
