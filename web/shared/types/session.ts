export type SessionOverviewStatus = 'ready' | 'loading' | 'error'

export interface SessionFilterOption {
  key: string
  label: string
  order: number
}

export interface PractitionerOverviewItem {
  id: string
  name: string
  englishName?: string
  slug: string
  regionKeys: string[]
  methodKeys: string[]
  summary?: string
  order: number
  isPublished: boolean
}

export interface SessionOverviewContent {
  pageTitle: string
  intro: string
  resultsHeading: string
  emptyMessage: string
  noMatchesMessage: string
  prototypeNotice?: string
  regions: SessionFilterOption[]
  methods: SessionFilterOption[]
  practitioners: PractitionerOverviewItem[]
}

export interface SessionFilters {
  regions: string[]
  methods: string[]
}

export interface PaginatedPractitioners {
  items: PractitionerOverviewItem[]
  currentPage: number
  totalPages: number
  totalItems: number
}
