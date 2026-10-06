export type CourseDeliveryMode = 'inPerson' | 'online'

export interface CourseImage {
  src: string
  alt: string
  objectPosition?: string
}

export interface CourseOverviewItem {
  title: string
  slug: string
  deliveryModes: CourseDeliveryMode[]
  summary: string
  image?: CourseImage
  order: number
  isPublished: boolean
}

export interface CourseOverviewCategory {
  key: 'body' | 'heart' | 'life' | 'beauty'
  name: string
  slug: string
  order: number
  summary: string
  courses: CourseOverviewItem[]
}

export interface CourseOverviewContent {
  pageTitle: string
  directoryPrompt: string
  prototypeNotice?: string
  categories: CourseOverviewCategory[]
  endingMessage?: string
}

export type CourseOverviewStatus = 'ready' | 'loading' | 'error'

export type CourseOverviewApiResponse =
  | { state: 'ready', content: CourseOverviewContent }
  | { state: 'empty' | 'error', content: null }
