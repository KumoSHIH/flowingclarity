export type ArticleOverviewStatus = 'ready' | 'loading' | 'error'

export type ArticleCategoryKey = 'body' | 'heart' | 'life' | 'beauty'

export interface ArticleCategory {
  key: ArticleCategoryKey
  name: string
  order: number
}

export interface ArticleTag {
  slug: string
  name: string
  order: number
}

export interface ArticleCoverImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface ArticleOverviewItem {
  id: string
  title: string
  slug: string
  categoryKey: ArticleCategoryKey
  tagSlugs: string[]
  excerpt: string
  publishedAt: string
  coverImage?: ArticleCoverImage
  isPublished: boolean
}

export interface ArticleOverviewContent {
  pageTitle: string
  intro: string
  allLabel: string
  tagFilterLabel: string
  resultsHeading: string
  emptyMessage: string
  noMatchesMessage: string
  prototypeNotice?: string
  categories: ArticleCategory[]
  tags: ArticleTag[]
  articles: ArticleOverviewItem[]
}

export interface ArticleFilters {
  category?: ArticleCategoryKey
  tags: string[]
}

export interface PaginatedArticles {
  items: ArticleOverviewItem[]
  currentPage: number
  totalPages: number
  totalItems: number
}

export type ArticleOverviewApiResponse =
  | { state: 'ready', content: ArticleOverviewContent }
  | { state: 'empty' | 'error', content: null }
