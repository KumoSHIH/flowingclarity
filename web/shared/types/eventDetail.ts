import type { EventImage, EventRegistrationStatus } from './event'
import type { SharedTestimonialItem } from './content'

export type EventDetailStatus = 'loading' | 'ready' | 'not-found' | 'error'

export interface EventDetailAgendaItem {
  key: string
  timeLabel: string
  dateTime?: string
  title: string
  description?: string
}

export interface EventDetailTextBlock {
  key: string
  type: 'text'
  title: string
  paragraphs: string[]
}

export interface EventDetailFacilitatorBlock {
  key: string
  type: 'facilitator'
  name: string
  role?: string
  biography: string
}

export interface EventDetailAgendaBlock {
  key: string
  type: 'agenda'
  title: string
  description: string
  items: EventDetailAgendaItem[]
}

export interface EventDetailTestimonialBlock {
  key: string
  type: 'testimonials'
  title: string
  items: SharedTestimonialItem[]
}

export interface EventDetailListBlock {
  key: string
  type: 'list'
  kind: 'audience' | 'preparation'
  title: string
  items: string[]
}

export interface EventDetailQuoteBlock {
  key: string
  type: 'quote'
  text: string
  attribution?: string
}

export interface EventDetailMediaBlock {
  key: string
  type: 'media'
  title?: string
  items: Array<{
    key: string
    image: EventImage
    caption?: string
  }>
}

export type EventDetailBodyBlock =
  | EventDetailTextBlock
  | EventDetailFacilitatorBlock
  | EventDetailAgendaBlock
  | EventDetailTestimonialBlock
  | EventDetailListBlock
  | EventDetailQuoteBlock
  | EventDetailMediaBlock

export interface EventDetailContent {
  slug: string
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
  intro: string
  body: EventDetailBodyBlock[]
  registration: {
    status: EventRegistrationStatus
    actionLabel: string
    actionUrl?: string
    note?: string
  }
  seo?: {
    title?: string
    description?: string
  }
}

export type EventDetailApiState = 'ready' | 'empty' | 'error'

export type EventDetailApiResponse =
  | { state: 'ready', content: EventDetailContent }
  | { state: 'empty' | 'error', content: null }

