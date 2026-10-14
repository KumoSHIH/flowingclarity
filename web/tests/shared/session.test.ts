import { describe, expect, it } from 'vitest'
import type { PractitionerOverviewItem } from '../../shared/types/session'
import {
  filterPractitioners,
  getPractitionerPath,
  getSessionPaginationItems,
  getSessionPath,
  normalizeSessionFilter,
  normalizeSessionPage,
  paginatePractitioners,
} from '../../shared/utils/session'

function practitioner(
  id: string,
  regions: string[],
  methods: string[],
  order: number,
  overrides: Partial<PractitionerOverviewItem> = {},
): PractitionerOverviewItem {
  return {
    id,
    name: `執行師 ${id}`,
    slug: `practitioner-${id}`,
    regionKeys: regions,
    methodKeys: methods,
    order,
    isPublished: true,
    ...overrides,
  }
}

describe('session overview helpers', () => {
  it('normalizes repeated query filters and removes unknown or duplicate keys', () => {
    expect(normalizeSessionFilter(
      ['north', 'unknown', 'north', 'south'],
      ['north', 'central', 'south'],
    )).toEqual(['north', 'south'])
    expect(normalizeSessionFilter(undefined, ['north'])).toEqual([])
    expect(normalizeSessionPage(['3', '4'])).toBe(3)
    expect(normalizeSessionPage('-1')).toBe(1)
  })

  it('uses OR within a group, AND across groups, and stable manual ordering', () => {
    const source = [
      practitioner('a', ['north'], ['craniosacral'], 2),
      practitioner('b', ['central'], ['rebalance'], 1),
      practitioner('c', ['south'], ['craniosacral'], 3),
      practitioner('hidden', ['north'], ['craniosacral'], 0, { isPublished: false }),
    ]

    expect(filterPractitioners(source, {
      regions: ['north', 'central'],
      methods: ['craniosacral'],
    }).map(item => item.id)).toEqual(['a'])
    expect(filterPractitioners(source, {
      regions: [],
      methods: [],
    }).map(item => item.id)).toEqual(['b', 'a', 'c'])
  })

  it('clamps pagination and compacts longer page ranges', () => {
    const source = Array.from({ length: 48 }, (_, index) => practitioner(
      String(index + 1),
      ['north'],
      ['rebalance'],
      index + 1,
    ))
    const result = paginatePractitioners(source, 99)
    expect(result.currentPage).toBe(6)
    expect(result.items).toHaveLength(8)
    expect(getSessionPaginationItems(1, 6)).toEqual([1, 2, 3, 'ellipsis', 6])
    expect(getSessionPaginationItems(4, 6)).toEqual([1, 'ellipsis', 4, 5, 6])
  })

  it('builds shareable filter and practitioner paths', () => {
    expect(getSessionPath({
      regions: ['north', 'south'],
      methods: ['craniosacral'],
    }, 2)).toBe('/session?region=north&region=south&method=craniosacral&page=2')
    expect(getSessionPath({ regions: [], methods: [] }, 1)).toBe('/session?page=1')
    expect(getPractitionerPath('therapist-one')).toBe('/session/therapist-one')
    expect(getPractitionerPath('執行師 01')).toBe('/session/%E5%9F%B7%E8%A1%8C%E5%B8%AB%2001')
  })
})
