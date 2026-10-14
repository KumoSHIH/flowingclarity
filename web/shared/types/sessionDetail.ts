export type SessionDetailStatus = 'ready' | 'loading' | 'error' | 'not-found'
export type SessionContactType = 'phone' | 'lineId' | 'facebook' | 'lineUrl' | 'bookingUrl'
export type SessionLocationVisibility = 'cityOnly' | 'venue' | 'fullAddress'
export type SessionPortraitDisplayMode = 'contained' | 'cover'

export interface SessionDetailImage { src: string, alt: string, displayMode: SessionPortraitDisplayMode, objectPosition?: string }
export interface SessionServiceLocation { key: string, cities: string[], venueName?: string, address?: string, publicDetail: SessionLocationVisibility }
export interface SessionContactItem { key: string, type: SessionContactType, label: string, displayText: string, href?: string }
export interface SessionBookingAction { label: string, url: string }
export interface SessionDetailContent {
  id: string
  slug: string
  name: string
  englishName?: string
  summary: string
  regions: string[]
  portrait?: SessionDetailImage
  bio: string[]
  experienceItems: string[]
  serviceLocations: SessionServiceLocation[]
  methods: string[]
  contactIntro?: string
  contactItems: SessionContactItem[]
  bookingAction?: SessionBookingAction
  prototypeNotice?: string
  seo?: { title?: string, description?: string }
}
export type SessionDetailApiResponse =
  | { state: 'ready', content: SessionDetailContent }
  | { state: 'empty' | 'error', content: null }
