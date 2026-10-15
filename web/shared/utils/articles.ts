import type {
  ArticleCategoryKey,
  ArticleFilters,
  ArticleOverviewItem,
  ArticleTag,
  ArticleOverviewContent,
  PaginatedArticles,
} from '../types/articles'

export const ARTICLE_PAGE_SIZE = 8
export const ARTICLE_TAG_LIMIT = 8
export type ArticlePaginationItem = number | 'ellipsis'

export const emptyArticleOverviewContent: ArticleOverviewContent = {
  pageTitle: '文章分享',
  intro: '從身體的感受出發，記錄練習與理解。在閱讀之間，慢慢靠近自己的節奏。',
  allLabel: '全部文章',
  tagFilterLabel: '相關標籤',
  resultsHeading: '最新文章',
  emptyMessage: '目前還沒有已發布的文章，請稍後再回來看看。',
  noMatchesMessage: '目前沒有符合這組條件的文章，可以調整或清除篩選。',
  categories: [
    { key: 'body', name: '愛身體', order: 1 },
    { key: 'heart', name: '撫慰心', order: 2 },
    { key: 'life', name: '究生命', order: 3 },
    { key: 'beauty', name: '展現美', order: 4 },
  ],
  tags: [],
  articles: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null
  const candidate = value.trim()
  return candidate.length >= min && candidate.length <= max ? candidate : null
}

export function parseArticleOverview(value: unknown): ArticleOverviewContent | null {
  if (!isRecord(value) || !isRecord(value.page) || !Array.isArray(value.categories)
    || !Array.isArray(value.tags) || !Array.isArray(value.articles)) return null
  const pageTitle = text(value.page.pageTitle, 4, 20)
  const intro = text(value.page.intro, 20, 120)
  const allLabel = text(value.page.allLabel, 2, 8)
  const tagFilterLabel = text(value.page.tagFilterLabel, 2, 12)
  const resultsHeading = text(value.page.resultsHeading, 2, 20)
  const emptyMessage = text(value.page.emptyMessage, 4, 80)
  const noMatchesMessage = text(value.page.noMatchesMessage, 4, 80)
  if (!pageTitle || !intro || !allLabel || !tagFilterLabel || !resultsHeading
    || !emptyMessage || !noMatchesMessage) return null

  const categories = value.categories.flatMap((item) => {
    if (!isRecord(item)) return []
    const expected = emptyArticleOverviewContent.categories.find(category => category.key === item.key)
    return expected && item.name === expected.name && item.order === expected.order ? [expected] : []
  })
  if (categories.length !== 4) return null
  const categoryKeys = new Set(categories.map(category => category.key))

  const tags = value.tags.flatMap((item) => {
    if (!isRecord(item)) return []
    const slug = text(item.slug, 1, 60)
    const name = text(item.name, 2, 20)
    return slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && name
      && Number.isInteger(item.order) && Number(item.order) > 0
      ? [{ slug, name, order: Number(item.order) }]
      : []
  })
  const tagSlugs = new Set(tags.map(tag => tag.slug))
  const seenIds = new Set<string>()
  const seenSlugs = new Set<string>()
  const articles = value.articles.flatMap((item) => {
    if (!isRecord(item)) return []
    const id = text(item.id, 1, 200)
    const title = text(item.title, 4, 50)
    const slug = text(item.slug, 1, 80)
    const excerpt = text(item.excerpt, 30, 140)
    const publishedAt = text(item.publishedAt, 10, 40)
    const categoryKey = item.categoryKey as ArticleCategoryKey
    const itemTags = Array.isArray(item.tagSlugs)
      ? [...new Set(item.tagSlugs.filter((tag): tag is string => typeof tag === 'string' && tagSlugs.has(tag)))]
      : []
    if (!id || id.includes('.') || seenIds.has(id) || !title || !slug
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || seenSlugs.has(slug)
      || !excerpt || !publishedAt || !Number.isFinite(Date.parse(publishedAt))
      || !categoryKeys.has(categoryKey) || !itemTags.length || itemTags.length > 8) return []
    seenIds.add(id)
    seenSlugs.add(slug)
    let coverImage
    if (isRecord(item.coverImage)) {
      const src = text(item.coverImage.src, 8, 1000)
      const alt = text(item.coverImage.alt, 2, 120)
      const width = Number(item.coverImage.width)
      const height = Number(item.coverImage.height)
      if (src && /^https:\/\//.test(src) && alt && width > 0 && height > 0) {
        coverImage = { src, alt, width, height }
      }
    }
    return [{ id, title, slug, categoryKey, tagSlugs: itemTags, excerpt, publishedAt, coverImage, isPublished: true }]
  })
  return { pageTitle, intro, allLabel, tagFilterLabel, resultsHeading, emptyMessage, noMatchesMessage, categories, tags, articles }
}

function queryValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  return typeof value === 'string' ? [value] : []
}

export function normalizeArticleCategory(
  value: unknown,
  allowedKeys: readonly ArticleCategoryKey[],
): ArticleCategoryKey | undefined {
  const candidate = Array.isArray(value) ? value[0] : value
  return typeof candidate === 'string' && allowedKeys.includes(candidate as ArticleCategoryKey)
    ? candidate as ArticleCategoryKey
    : undefined
}

export function normalizeArticleTags(
  value: unknown,
  tags: readonly Pick<ArticleTag, 'slug' | 'order' | 'name'>[],
): string[] {
  const requested = new Set(queryValues(value))
  return tags
    .toSorted((first, second) => (
      first.order - second.order
      || first.name.localeCompare(second.name, 'zh-Hant')
      || first.slug.localeCompare(second.slug)
    ))
    .filter(tag => requested.has(tag.slug))
    .slice(0, ARTICLE_TAG_LIMIT)
    .map(tag => tag.slug)
}

export function normalizeArticlePage(value: unknown): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = typeof candidate === 'string' ? Number(candidate) : candidate
  return typeof parsed === 'number' && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : 1
}

export function filterArticles(
  articles: readonly ArticleOverviewItem[],
  filters: ArticleFilters,
): ArticleOverviewItem[] {
  const selectedTags = new Set(filters.tags)
  return articles
    .filter(article => article.isPublished)
    .filter(article => !filters.category || article.categoryKey === filters.category)
    .filter(article => !selectedTags.size
      || article.tagSlugs.some(tag => selectedTags.has(tag)))
    .toSorted((first, second) => (
      Date.parse(second.publishedAt) - Date.parse(first.publishedAt)
      || first.id.localeCompare(second.id)
    ))
}

export function paginateArticles(
  articles: readonly ArticleOverviewItem[],
  requestedPage: number,
  pageSize = ARTICLE_PAGE_SIZE,
): PaginatedArticles {
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0
    ? pageSize
    : ARTICLE_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(articles.length / safePageSize))
  const currentPage = Math.min(
    Math.max(Number.isInteger(requestedPage) ? requestedPage : 1, 1),
    totalPages,
  )
  const start = (currentPage - 1) * safePageSize
  return {
    items: articles.slice(start, start + safePageSize),
    currentPage,
    totalPages,
    totalItems: articles.length,
  }
}

export function getArticlePaginationItems(
  currentPage: number,
  totalPages: number,
): ArticlePaginationItem[] {
  const safeTotal = Math.max(1, Math.floor(totalPages))
  const safeCurrent = Math.min(Math.max(1, Math.floor(currentPage)), safeTotal)
  if (safeTotal <= 5) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1)
  }
  if (safeCurrent <= 3) return [1, 2, 3, 'ellipsis', safeTotal]
  if (safeCurrent >= safeTotal - 2) {
    return [1, 'ellipsis', safeTotal - 2, safeTotal - 1, safeTotal]
  }
  return [1, 'ellipsis', safeCurrent, 'ellipsis', safeTotal]
}

export function getArticlesPath(filters: ArticleFilters, page = 1): string {
  const query = new URLSearchParams()
  if (filters.category) query.set('category', filters.category)
  for (const tag of filters.tags) query.append('tag', tag)
  if (page > 1) query.set('page', String(page))
  const value = query.toString()
  return value ? `/articles?${value}` : '/articles'
}

export function getArticlePath(slug: string): string {
  return `/articles/${encodeURIComponent(slug)}`
}
