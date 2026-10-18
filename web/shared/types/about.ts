export type AboutPageStatus = 'ready' | 'loading' | 'error'

export interface AboutImage {
  src: string
  alt: string
  width: number
  height: number
  objectPosition?: string
}

export interface AboutTextSection {
  heading: string
  body: string[]
  image?: AboutImage
}

export interface AboutFeaturedMoment {
  id: string
  image: AboutImage
  caption?: string
}

export interface AboutContactContent {
  address?: string
  phone?: { display: string; href: string }
  email?: string
  businessHours: { days: string; hours: string }[]
  businessHoursNote?: string
  socialLinks: { label: string; href: string }[]
  map?: {
    placeName: string
    embedUrl: string
    externalUrl: string
  }
}

export interface AboutPageContent {
  title: string
  introduction?: string
  heroImage: AboutImage
  brandStory: AboutTextSection
  placeAndTeam: AboutTextSection & { image: AboutImage }
  featuredMoments: {
    heading: string
    body: string[]
    items: AboutFeaturedMoment[]
  }
  contactHeading: string
  contactIntroduction?: string
  contact?: AboutContactContent
  prototypeNotice?: string
  seo?: { title?: string; description?: string }
}
