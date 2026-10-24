import { describe, expect, it } from 'vitest'
import { addCalendarMonths, parseHomeSections } from '../../shared/utils/homeSections'
import { sanityHomeSections } from '../fixtures/homeSections'

const now = new Date('2026-10-24T04:00:00Z')

function course(id: string, date: string, status = 'open') {
  const base = sanityHomeSections.courses[0]!
  return {
    ...base,
    _id: id,
    slug: id,
    title: `課程 ${id}`,
    runs: [{ registrationStatus: status, isPublished: true, stages: [
      { dateRanges: [{ startDate: date }, { startDate: '2028-01-01' }] },
    ] }],
  }
}

describe('home sections content mapping', () => {
  it('maps the singleton and selects at most three upcoming events', () => {
    const events = [1, 2, 3, 4].map(day => ({
      ...sanityHomeSections.events[0],
      _id: `event-${day}`,
      slug: `event-${day}`,
      startAt: `2026-11-0${day}T06:00:00Z`,
      endAt: `2026-11-0${day}T08:00:00Z`,
    })).reverse()
    const content = parseHomeSections({ ...sanityHomeSections, events }, now)
    expect(content?.events.items.map(item => item.id)).toEqual(['event-1', 'event-2', 'event-3'])
    expect(content?.events.items[0]?.period).toBe('2026/11')
    expect(content?.events.items[0]?.href).toBe('/events/event-1')
    expect(content?.contact?.email).toBe('hello@flowingclarity.tw')
  })

  it('shows every calendar date covered by a multi-day event', () => {
    const base = sanityHomeSections.events[0]!
    const content = parseHomeSections({
      ...sanityHomeSections,
      events: [
        { ...base, _id: 'same-month', slug: 'same-month', startAt: '2026-11-07T01:30:00Z', endAt: '2026-11-08T09:00:00Z' },
        { ...base, _id: 'month-boundary', slug: 'month-boundary', startAt: '2026-11-30T01:30:00Z', endAt: '2026-12-01T09:00:00Z' },
        { ...base, _id: 'midnight-end', slug: 'midnight-end', startAt: '2026-12-05T02:00:00Z', endAt: '2026-12-05T16:00:00Z' },
      ],
    }, now)

    expect(content?.events.items.map(({ period, day, weekday }) => ({ period, day, weekday }))).toEqual([
      { period: '2026/11', day: '07、08', weekday: '週六、週日' },
      { period: '2026/11–12', day: '30、01', weekday: '週一、週二' },
      { period: '2026/12', day: '05', weekday: '週六' },
    ])
  })

  it('prefers courses inside six calendar months, deduplicates runs, and fills later courses', () => {
    const content = parseHomeSections({
      ...sanityHomeSections,
      courses: [
        { ...course('later', '2027-05-01'), runs: [
          { registrationStatus: 'open', isPublished: true, stages: [{ dateRanges: [{ startDate: '2027-05-01' }] }] },
          { registrationStatus: 'open', isPublished: true, stages: [{ dateRanges: [{ startDate: '2027-06-01' }] }] },
        ] },
        course('boundary', '2027-04-24'),
        course('soon', '2026-10-24'),
        course('cancelled', '2026-10-25', 'cancelled'),
        course('past', '2026-10-23'),
      ],
    }, now)
    expect(content?.courses.items.map(item => item.id)).toEqual(['soon', 'boundary', 'later'])
    expect(content?.courses.items[0]?.meta).toContain('2026/10/24')
    expect(content?.courses.items[0]?.href).toBe('/course/soon')
  })

  it('handles month-end calendar arithmetic', () => {
    expect(addCalendarMonths('2026-08-31', 6)).toBe('2027-02-28')
    expect(addCalendarMonths('invalid', 6)).toBeNull()
  })

  it('returns empty collections without demo fillers and omits invalid shared email', () => {
    const content = parseHomeSections({ ...sanityHomeSections, events: [], courses: [], settings: { contact: { email: 'bad' } } }, now)
    expect(content?.events.items).toEqual([])
    expect(content?.courses.items).toEqual([])
    expect(content?.contact).toBeUndefined()
  })

  it('excludes entries without a safe detail slug', () => {
    const content = parseHomeSections({
      ...sanityHomeSections,
      events: [{ ...sanityHomeSections.events[0], slug: '../private' }],
      courses: [{ ...sanityHomeSections.courses[0], slug: 'unsafe/path' }],
    }, now)

    expect(content?.events.items).toEqual([])
    expect(content?.courses.items).toEqual([])
  })

  it('rejects missing, incomplete, or unsafe singleton content', () => {
    expect(parseHomeSections({ page: null }, now)).toBeNull()
    expect(parseHomeSections({ ...sanityHomeSections, page: { ...sanityHomeSections.page, eventsHeading: '' } }, now)).toBeNull()
    expect(parseHomeSections({ ...sanityHomeSections, page: { ...sanityHomeSections.page, introductionImage: { ...sanityHomeSections.page.introductionImage, src: 'https://example.com/image.jpg' } } }, now)).toBeNull()
  })
})
