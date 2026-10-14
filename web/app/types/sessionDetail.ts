export type SessionDetailStatus = 'ready' | 'loading' | 'error' | 'not-found'
export type SessionContactType = 'phone' | 'lineId' | 'facebook' | 'lineUrl' | 'bookingUrl'
export type SessionLocationVisibility = 'cityOnly' | 'venue' | 'fullAddress'

export interface SessionDetailImage {
  src: string
  alt: string
  objectPosition?: string
}

export interface SessionServiceLocation {
  key: string
  city: string
  venueName?: string
  address?: string
  publicDetail: SessionLocationVisibility
}

export interface SessionContactItem {
  key: string
  type: SessionContactType
  label: string
  displayText: string
  href?: string
}

export interface SessionBookingAction {
  label: string
  url: string
}

export interface SessionDetailContent {
  id: string
  slug: string
  name: string
  englishName?: string
  summary: string
  portrait?: SessionDetailImage
  bio: string[]
  experienceItems: string[]
  serviceLocations: SessionServiceLocation[]
  methods: string[]
  contactIntro?: string
  contactItems: SessionContactItem[]
  bookingAction?: SessionBookingAction
  prototypeNotice?: string
  seo?: {
    title?: string
    description?: string
  }
}
