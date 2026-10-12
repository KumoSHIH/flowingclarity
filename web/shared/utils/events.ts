import type {
  DisplayEvent,
  EffectiveEventStatus,
  EventCollections,
  EventOverviewItem,
  EventView,
  PaginatedEvents,
} from '../types/event'

export const EVENTS_PAGE_SIZE = 8
export const EVENTS_TIMEZONE = 'Asia/Taipei'

function timestamp(value: string): number | null {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function effectiveStatus(
  event: EventOverviewItem,
  now: number,
): EffectiveEventStatus {
  const startAt = timestamp(event.startAt) ?? Number.NEGATIVE_INFINITY
  if (now >= startAt) return 'closed'
  if (
    event.registrationStatus === 'completed'
    || event.registrationStatus === 'cancelled'
  ) return 'closed'
  return event.registrationStatus
}

function stableUpcomingOrder(first: DisplayEvent, second: DisplayEvent): number {
  return Date.parse(first.startAt) - Date.parse(second.startAt)
    || first.order - second.order
    || first.id.localeCompare(second.id)
}

function stablePastOrder(first: DisplayEvent, second: DisplayEvent): number {
  return Date.parse(second.endAt) - Date.parse(first.endAt)
    || first.order - second.order
    || first.id.localeCompare(second.id)
}

export function deriveEventCollections(
  events: readonly EventOverviewItem[],
  nowValue: Date | string | number,
): EventCollections {
  const now = new Date(nowValue).getTime()
  if (!Number.isFinite(now)) return { upcoming: [], past: [] }

  const upcoming: DisplayEvent[] = []
  const past: DisplayEvent[] = []

  for (const event of events) {
    const startAt = timestamp(event.startAt)
    const endAt = timestamp(event.endAt)
    if (
      !event.isPublished
      || event.registrationStatus === 'cancelled'
      || startAt === null
      || endAt === null
      || endAt <= startAt
    ) continue

    const displayEvent: DisplayEvent = {
      ...event,
      effectiveStatus: effectiveStatus(event, now),
    }

    if (now >= endAt) {
      if (event.archiveVisible) past.push(displayEvent)
    }
    else upcoming.push(displayEvent)
  }

  return {
    upcoming: upcoming.toSorted(stableUpcomingOrder),
    past: past.toSorted(stablePastOrder),
  }
}

export function paginateEvents(
  events: readonly DisplayEvent[],
  requestedPage: number,
  pageSize = EVENTS_PAGE_SIZE,
): PaginatedEvents {
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0
    ? pageSize
    : EVENTS_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(events.length / safePageSize))
  const currentPage = Math.min(
    Math.max(Number.isInteger(requestedPage) ? requestedPage : 1, 1),
    totalPages,
  )
  const start = (currentPage - 1) * safePageSize

  return {
    items: events.slice(start, start + safePageSize),
    currentPage,
    totalPages,
    totalItems: events.length,
  }
}

export function normalizeEventView(value: unknown): EventView {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate === 'past' ? 'past' : 'upcoming'
}

export function normalizeEventPage(value: unknown): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = typeof candidate === 'string' ? Number(candidate) : candidate
  return typeof parsed === 'number' && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : 1
}

export function getEventsPath(view: EventView, page = 1): string {
  const query = new URLSearchParams({ view, page: String(Math.max(1, page)) })
  return `/events?${query.toString()}`
}

export function isSafeRegistrationUrl(value?: string): boolean {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  }
  catch {
    return false
  }
}
