import type {
  DisplayEvent,
  EffectiveEventStatus,
  EventCollections,
  EventOverviewItem,
  EventView,
  PaginatedEvents,
  EventImage,
  EventOverviewContent,
} from '../types/event'

export const EVENTS_PAGE_SIZE = 8
export const EVENTS_TIMEZONE = 'Asia/Taipei'
export type PaginationItem = number | 'ellipsis'

const eventSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const deliveryModes = new Set(['inPerson', 'online', 'hybrid'])
const registrationStatuses = new Set([
  'scheduled', 'open', 'full', 'closed', 'cancelled', 'completed',
])

export const emptyEventOverviewContent: EventOverviewContent = {
  pageTitle: '近期活動',
  intro: '從短期活動開始，依自己的時間與需要，找到適合參與的方式。',
  upcomingHeading: '近期活動',
  pastHeading: '過去活動',
  emptyMessage: '目前沒有已發布的近期活動；可以切換至過去活動查看歷史紀錄。',
  events: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function textInRange(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text.length >= min && text.length <= max ? text : null
}

function optionalText(value: unknown, min: number, max: number): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined
  return textInRange(value, min, max)
}

function parseImage(value: unknown): EventImage | undefined {
  if (!isRecord(value) || typeof value.src !== 'string') return undefined
  let url: URL
  try {
    url = new URL(value.src)
  }
  catch {
    return undefined
  }
  if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') return undefined
  const alt = value.alt === undefined || value.alt === null || value.alt === ''
    ? ''
    : textInRange(value.alt, 2, 120)
  if (alt === null) return undefined

  const image: EventImage = { src: url.toString(), alt }
  if (isRecord(value.hotspot)
    && typeof value.hotspot.x === 'number' && value.hotspot.x >= 0 && value.hotspot.x <= 1
    && typeof value.hotspot.y === 'number' && value.hotspot.y >= 0 && value.hotspot.y <= 1) {
    image.objectPosition = `${value.hotspot.x * 100}% ${value.hotspot.y * 100}%`
  }
  return image
}

function parseEvent(value: unknown): EventOverviewItem | null {
  if (!isRecord(value) || value.isPublished !== true) return null
  const id = textInRange(value.id, 1, 200)
  const title = textInRange(value.title, 2, 40)
  const slug = textInRange(value.slug, 1, 60)
  const eventType = textInRange(value.eventType, 2, 12)
  const summary = textInRange(value.summary, 20, 100)
  const startAt = typeof value.startAt === 'string' ? value.startAt : null
  const endAt = typeof value.endAt === 'string' ? value.endAt : null
  const scheduleNote = optionalText(value.scheduleNote, 2, 80)
  const city = optionalText(value.city, 2, 30)
  const venue = optionalText(value.venue, 2, 80)
  const startTime = startAt ? Date.parse(startAt) : Number.NaN
  const endTime = endAt ? Date.parse(endAt) : Number.NaN
  const order = value.order

  if (!id || id.includes('.') || !title || !slug || !eventSlugPattern.test(slug) || !eventType || !summary
    || !startAt || !endAt || !Number.isFinite(startTime) || !Number.isFinite(endTime)
    || endTime <= startTime || scheduleNote === null || city === null || venue === null
    || typeof value.deliveryMode !== 'string' || !deliveryModes.has(value.deliveryMode)
    || typeof value.registrationStatus !== 'string'
    || !registrationStatuses.has(value.registrationStatus)
    || typeof value.archiveVisible !== 'boolean'
    || !Number.isInteger(order) || (order as number) < 1) return null

  if ((value.deliveryMode === 'inPerson' || value.deliveryMode === 'hybrid') && !city) return null
  const registrationUrl = typeof value.registrationUrl === 'string'
    && isSafeRegistrationUrl(value.registrationUrl)
    ? value.registrationUrl
    : undefined
  if (value.registrationStatus === 'open' && value.registrationUrl && !registrationUrl) return null
  const relatedCourseHref = typeof value.relatedCourseSlug === 'string'
    && eventSlugPattern.test(value.relatedCourseSlug)
    ? `/course/${value.relatedCourseSlug}`
    : undefined

  return {
    id,
    title,
    slug,
    eventType,
    summary,
    startAt,
    endAt,
    timezone: EVENTS_TIMEZONE,
    scheduleNote,
    deliveryMode: value.deliveryMode as EventOverviewItem['deliveryMode'],
    city,
    venue,
    image: parseImage(value.image),
    registrationStatus: value.registrationStatus as EventOverviewItem['registrationStatus'],
    registrationUrl,
    relatedCourseHref,
    archiveVisible: value.archiveVisible,
    order: order as number,
    isPublished: true,
  }
}

export function parseEventOverview(value: unknown): EventOverviewContent | null {
  if (!isRecord(value) || !isRecord(value.page) || !Array.isArray(value.events)) return null
  const pageTitle = textInRange(value.page.pageTitle, 4, 20)
  const intro = textInRange(value.page.intro, 20, 100)
  const upcomingHeading = textInRange(value.page.upcomingHeading, 2, 12)
  const pastHeading = textInRange(value.page.pastHeading, 2, 12)
  const pastIntro = optionalText(value.page.pastIntro, 10, 80)
  const emptyMessage = textInRange(value.page.emptyMessage, 12, 80)
  if (!pageTitle || !intro || !upcomingHeading || !pastHeading
    || pastIntro === null || !emptyMessage) return null

  const seenIds = new Set<string>()
  const seenSlugs = new Set<string>()
  const events = value.events
    .map(parseEvent)
    .filter((event): event is EventOverviewItem => {
      if (!event || seenIds.has(event.id) || seenSlugs.has(event.slug)) return false
      seenIds.add(event.id)
      seenSlugs.add(event.slug)
      return true
    })

  return {
    pageTitle,
    intro,
    upcomingHeading,
    pastHeading,
    pastIntro,
    emptyMessage,
    events,
  }
}

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

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  const safeTotal = Math.max(1, Math.floor(totalPages))
  const safeCurrent = Math.min(Math.max(1, Math.floor(currentPage)), safeTotal)

  if (safeTotal <= 5) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1)
  }
  if (safeCurrent <= 3) return [1, 2, 3, 'ellipsis', safeTotal]
  if (safeCurrent >= safeTotal - 2) {
    return [1, 'ellipsis', safeTotal - 2, safeTotal - 1, safeTotal]
  }
  return [1, 'ellipsis', safeCurrent, 'ellipsis', safeTotal]
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

export function getEventDetailPath(slug: string): string {
  return `/events/${encodeURIComponent(slug)}`
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
