import type {
  PaginatedPractitioners,
  PractitionerOverviewItem,
  SessionFilters,
} from '../types/session'

export const SESSION_PAGE_SIZE = 8
export type SessionPaginationItem = number | 'ellipsis'

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
