export interface HomeSectionImage {
  src: string
  alt: string
  width: number
  height: number
  objectPosition?: string
}

export interface HomeIntroductionContent {
  label: string
  heading: string
  paragraphs: string[]
  image: HomeSectionImage
  caption?: string
}

export interface HomeEventItem {
  id: string
  href: string
  date: string
  period: string
  day: string
  weekday: string
  title: string
  category: string
  time: string
}

export interface HomeCourseItem {
  id: string
  href: string
  title: string
  description: string
  meta: string
  image: HomeSectionImage
}

export interface HomeSectionsContent {
  introduction: HomeIntroductionContent
  events: { heading: string; introduction: string; emptyMessage: string; items: HomeEventItem[] }
  courses: { heading: string; introduction: string; emptyMessage: string; items: HomeCourseItem[] }
  contact?: { heading: string; introduction: string; buttonLabel: string; email: string }
}

export type HomeSectionsResponse =
  | { state: 'ready'; content: HomeSectionsContent }
  | { state: 'empty' | 'invalid' | 'error' | 'unconfigured'; content: null }
