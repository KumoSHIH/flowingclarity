export type EventDeliveryMode = 'inPerson' | 'online' | 'hybrid'

export type EventRegistrationStatus =
  | 'scheduled'
  | 'open'
  | 'full'
  | 'closed'
  | 'cancelled'
  | 'completed'

export type EventView = 'upcoming' | 'past'
export type EventOverviewStatus = 'ready' | 'loading' | 'error'

export interface EventImage {
  src: string
  alt: string
  objectPosition?: string
}

export interface EventOverviewItem {
  id: string
  title: string
  slug: string
  eventType: string
  summary: string
  startAt: string
  endAt: string
  timezone: 'Asia/Taipei'
  scheduleNote?: string
  deliveryMode: EventDeliveryMode
  city?: string
  venue?: string
  image?: EventImage
  registrationStatus: EventRegistrationStatus
  registrationUrl?: string
  relatedCourseHref?: string
  archiveVisible: boolean
  order: number
  isPublished: boolean
}

export interface EventOverviewContent {
  pageTitle: string
  intro: string
  upcomingHeading: string
  pastHeading: string
  emptyMessage: string
  prototypeNotice?: string
  events: EventOverviewItem[]
}

export type EventOverviewApiResponse =
  | { state: 'ready', content: EventOverviewContent }
  | { state: 'empty' | 'error', content: null }

export type EffectiveEventStatus = Exclude<
  EventRegistrationStatus,
  'cancelled' | 'completed'
>

export interface DisplayEvent extends EventOverviewItem {
  effectiveStatus: EffectiveEventStatus
}

export interface EventCollections {
  upcoming: DisplayEvent[]
  past: DisplayEvent[]
}

export interface PaginatedEvents {
  items: DisplayEvent[]
  currentPage: number
  totalPages: number
  totalItems: number
}
