import type { EventImage, EventRegistrationStatus } from './event'

export type EventDetailStatus = 'loading' | 'ready' | 'not-found' | 'error'

export interface SharedTestimonialItem {
  text: string
  sharerName: string
}

export interface EventDetailAgendaItem {
  key: string
  timeLabel: string
  dateTime?: string
  title: string
  description?: string
}

export interface EventDetailContent {
  slug: string
  prototypeNotice?: string
  hero: {
    title: string
    summary: string
    image?: EventImage
  }
  facts: Array<{
    label: string
    value: string
    dateTime?: string
  }>
  introduction: {
    title: string
    paragraphs: string[]
  }
  facilitator: {
    title: string
    name: string
    role?: string
    biography: string
  }
  agenda: {
    title: string
    description: string
    items: EventDetailAgendaItem[]
  }
  testimonials?: {
    title: string
    items: SharedTestimonialItem[]
  }
  registration: {
    status: EventRegistrationStatus
    actionLabel: string
    actionUrl?: string
    note?: string
  }
}

