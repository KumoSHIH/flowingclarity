import type {
  PaginatedPractitioners,
  PractitionerOverviewItem,
  SessionFilters,
  SessionFilterOption,
  SessionOverviewContent,
} from '../types/session'

export const SESSION_PAGE_SIZE = 8
export type SessionPaginationItem = number | 'ellipsis'

const sessionKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const emptySessionOverviewContent: SessionOverviewContent = {
  pageTitle: '尋找\n執行師',
  intro: '依服務地區與方法，找到適合進一步了解的執行師。',
  resultsHeading: '執行師名錄',
  emptyMessage: '目前沒有已發布的執行師資料，請稍後再回來查看。',
  noMatchesMessage: '目前沒有符合條件的執行師，請清除部分篩選後再試一次。',
  regions: [],
  methods: [],
  practitioners: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function textInRange(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text.length >= min && text.length <= max ? text : null
}

function optionalText(value: unknown, min: number, max: number): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined
  return textInRange(value, min, max)
}

function pageTitle(value: unknown): string | null {
  if (typeof value !== 'string' || /<[^>]*>/.test(value)) return null
  const text = value.replace(/\r\n?/g, '\n').trim()
  const lines = text.split('\n')
  const visibleLength = lines.join('').length
  if (lines.length > 2 || lines.some(line => !line.trim())
    || visibleLength < 4 || visibleLength > 20) return null
  return text
}

function parseOptions(value: unknown): SessionFilterOption[] {
  if (!Array.isArray(value)) return []
  const seenKeys = new Set<string>()
  const seenOrders = new Set<number>()
  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    const key = textInRange(item.key, 1, 60)
    const label = textInRange(item.label, 2, 24)
    const order = item.order
    if (!key || !sessionKeyPattern.test(key) || !label
      || !Number.isInteger(order) || (order as number) < 1
      || seenKeys.has(key) || seenOrders.has(order as number)) return []
    seenKeys.add(key)
    seenOrders.add(order as number)
    return [{ key, label, order: order as number }]
  }).toSorted((first, second) => first.order - second.order)
}

function parsePractitioner(
  value: unknown,
  regionKeys: ReadonlySet<string>,
  methodKeys: ReadonlySet<string>,
): PractitionerOverviewItem | null {
  if (!isRecord(value) || value.isPublished !== true) return null
  const id = textInRange(value.id, 1, 200)
  const name = textInRange(value.name, 2, 20)
  const englishName = optionalText(value.englishName, 2, 40)
  const slug = textInRange(value.slug, 1, 60)
  const summary = optionalText(value.summary, 20, 100)
  const order = value.order
  if (!id || id.includes('.') || !name || englishName === null || !slug
    || !sessionKeyPattern.test(slug) || summary === null
    || !Number.isInteger(order) || (order as number) < 1
    || !Array.isArray(value.regionKeys) || !Array.isArray(value.methodKeys)) return null

  const regions = value.regionKeys.filter(
    (key): key is string => typeof key === 'string' && regionKeys.has(key),
  )
  const methods = value.methodKeys.filter(
    (key): key is string => typeof key === 'string' && methodKeys.has(key),
  )
  if (!regions.length || regions.length > 5 || !methods.length
    || new Set(regions).size !== regions.length
    || new Set(methods).size !== methods.length) return null

  return {
    id,
    name,
    englishName,
    slug,
    regionKeys: regions,
    methodKeys: methods,
    summary,
    order: order as number,
    isPublished: true,
  }
}

export function parseSessionOverview(value: unknown): SessionOverviewContent | null {
  if (!isRecord(value) || !isRecord(value.page)
    || !Array.isArray(value.regions) || !Array.isArray(value.methods)
    || !Array.isArray(value.practitioners)) return null
  const parsedTitle = pageTitle(value.page.pageTitle)
  const intro = textInRange(value.page.intro, 20, 100)
  const resultsHeading = textInRange(value.page.resultsHeading, 2, 20)
  const emptyMessage = textInRange(value.page.emptyMessage, 3, 80)
  const noMatchesMessage = textInRange(value.page.noMatchesMessage, 3, 80)
  if (!parsedTitle || !intro || !resultsHeading || !emptyMessage || !noMatchesMessage) return null

  const regions = parseOptions(value.regions)
  const methods = parseOptions(value.methods)
  const allowedRegions = new Set(regions.map(item => item.key))
  const allowedMethods = new Set(methods.map(item => item.key))
  const seenIds = new Set<string>()
  const seenSlugs = new Set<string>()
  const practitioners = value.practitioners
    .map(item => parsePractitioner(item, allowedRegions, allowedMethods))
    .filter((item): item is PractitionerOverviewItem => {
      if (!item || seenIds.has(item.id) || seenSlugs.has(item.slug)) return false
      seenIds.add(item.id)
      seenSlugs.add(item.slug)
      return true
    })

  return {
    pageTitle: parsedTitle,
    intro,
    resultsHeading,
    emptyMessage,
    noMatchesMessage,
    regions,
    methods,
    practitioners,
  }
}

function queryValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  return typeof value === 'string' ? [value] : []
}

export function normalizeSessionFilter(
  value: unknown,
  allowedKeys: readonly string[],
): string[] {
  const allowed = new Set(allowedKeys)
  return [...new Set(queryValues(value).filter(item => allowed.has(item)))]
}

export function normalizeSessionPage(value: unknown): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = typeof candidate === 'string' ? Number(candidate) : candidate
  return typeof parsed === 'number' && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : 1
}

export function filterPractitioners(
  practitioners: readonly PractitionerOverviewItem[],
  filters: SessionFilters,
): PractitionerOverviewItem[] {
  const selectedRegions = new Set(filters.regions)
  const selectedMethods = new Set(filters.methods)

  return practitioners
    .filter(item => item.isPublished)
    .filter(item => !selectedRegions.size || item.regionKeys.some(key => selectedRegions.has(key)))
    .filter(item => !selectedMethods.size || item.methodKeys.some(key => selectedMethods.has(key)))
    .toSorted((first, second) => (
      first.order - second.order
      || first.name.localeCompare(second.name, 'zh-Hant')
      || first.id.localeCompare(second.id)
    ))
}

export function paginatePractitioners(
  practitioners: readonly PractitionerOverviewItem[],
  requestedPage: number,
  pageSize = SESSION_PAGE_SIZE,
): PaginatedPractitioners {
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0
    ? pageSize
    : SESSION_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(practitioners.length / safePageSize))
  const currentPage = Math.min(
    Math.max(Number.isInteger(requestedPage) ? requestedPage : 1, 1),
    totalPages,
  )
  const start = (currentPage - 1) * safePageSize

  return {
    items: practitioners.slice(start, start + safePageSize),
    currentPage,
    totalPages,
    totalItems: practitioners.length,
  }
}

export function getSessionPaginationItems(
  currentPage: number,
  totalPages: number,
): SessionPaginationItem[] {
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

export function getSessionPath(filters: SessionFilters, page = 1): string {
  const query = new URLSearchParams()
  for (const region of filters.regions) query.append('region', region)
  for (const method of filters.methods) query.append('method', method)
  query.set('page', String(Math.max(1, page)))
  return `/session?${query.toString()}`
}

export function getPractitionerPath(slug: string): string {
  return `/session/${encodeURIComponent(slug)}`
}
