import type { RelatedArticleItem } from './articleDetail'
import type { SharedTestimonialItem } from './content'

export type CourseDetailStatus = 'loading' | 'ready' | 'not-found' | 'error'

export interface CourseDetailImage {
  src: string
  alt: string
  label?: string
  objectPosition?: string
}

export interface CourseDetailGalleryItem {
  key: string
  title?: string
  description?: string
  image: CourseDetailImage
  points?: string[]
  group?: string
}

export type CourseDetailGalleryLayout =
  | 'collage'
  | 'stages'
  | 'weave'
  | 'folio'
  | 'dossier'

export type CourseDetailGalleryRole = 'general' | 'curriculum'

export interface CourseDetailIntroductionBlock {
  key: string
  type: 'introduction'
  title: string
  lead: string
  paragraphs: string[]
}

export interface CourseDetailTextBlock {
  key: string
  type: 'text'
  title: string
  text: string
}

export interface CourseDetailGalleryBlock {
  key: string
  type: 'gallery'
  title: string
  description?: string
  layout: CourseDetailGalleryLayout
  contentRole?: CourseDetailGalleryRole
  note?: string
  statement?: string
  items: CourseDetailGalleryItem[]
}

export interface CourseDetailCurriculumUnit {
  key: string
  stage: string
  title: string
  description: string
}

export interface CourseDetailSession {
  key: string
  title: string
  status: string
  location?: string
  stages: Array<{
    key: string
    title: string
    dateRanges: string[]
  }>
  details: Array<{
    label: string
    value: string
  }>
}

export interface CourseDetailTeacherBlock {
  key: string
  type: 'teacher'
  name: string
  englishName?: string
  lead: string
  biography: string
  image?: CourseDetailImage
}

export interface CourseDetailQuoteBlock {
  key: string
  type: 'quote'
  text: string
  attribution: string
}

export interface CourseDetailCurriculumBlock {
  key: string
  type: 'curriculum'
  title: string
  description?: string
  units: CourseDetailCurriculumUnit[]
}

export interface CourseDetailVideoBlock {
  key: string
  type: 'video'
  title: string
  statusLabel: string
  image?: CourseDetailImage
  embedUrl?: string
}

export interface CourseDetailAudienceBlock {
  key: string
  type: 'audience'
  title: string
  description?: string
  items: string[]
}

export interface CourseDetailTestimonialBlock {
  key: string
  type: 'testimonials'
  title: string
  items: SharedTestimonialItem[]
}

export interface CourseDetailCarouselItem {
  id: string
  image: CourseDetailImage
  caption?: string
}

export interface CourseDetailCarouselBlock {
  key: string
  type: 'carousel'
  title: string
  text: string
  items: CourseDetailCarouselItem[]
}

export type CourseDetailBodyBlock =
  | CourseDetailIntroductionBlock
  | CourseDetailTextBlock
  | CourseDetailGalleryBlock
  | CourseDetailTeacherBlock
  | CourseDetailQuoteBlock
  | CourseDetailCurriculumBlock
  | CourseDetailVideoBlock
  | CourseDetailAudienceBlock
  | CourseDetailTestimonialBlock
  | CourseDetailCarouselBlock

export interface CourseDetailContent {
  slug: string
  notice?: string
  hero: {
    title: string
    englishTitle?: string
    summary: string
    image: CourseDetailImage
    meta: Array<{ label: string, value: string }>
    actionLabel: string
    actionUrl?: string
  }
  body: CourseDetailBodyBlock[]
  schedule: {
    title: string
    description?: string
    sessions: CourseDetailSession[]
  }
  testimonials?: CourseDetailTestimonialBlock
  highlights?: CourseDetailCarouselBlock
  registration: {
    title: string
    description?: string
    actionLabel: string
    actionUrl?: string
    image?: CourseDetailImage
  }
  relatedArticles: RelatedArticleItem[]
}

export type CourseDetailApiState = 'ready' | 'empty' | 'error'

export interface CourseDetailApiResponse {
  state: CourseDetailApiState
  content: CourseDetailContent | null
}
