import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@sanity/client'
import { sanityHomeSections } from '../fixtures/homeSections'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
const { homeSectionsQuery, default: getHomeSections } = await import('../../server/api/home-sections.get')

describe('home sections content boundary', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-24T04:00:00Z'))
    vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'test-project', sanityDataset: 'test' }))
    fetchMock.mockReset()
    vi.mocked(createClient).mockClear()
  })
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('queries published shared content and returns mapped sections', async () => {
    fetchMock.mockResolvedValue(sanityHomeSections)
    const result = await getHomeSections({} as never)
    expect(result.state).toBe('ready')
    expect(result.content?.courses.items).toHaveLength(1)
    expect(homeSectionsQuery).toContain('references(^._id)')
    expect(homeSectionsQuery.match(/"slug": slug\.current/g)).toHaveLength(2)
    expect(fetchMock).toHaveBeenCalledWith(homeSectionsQuery, { homePageId: 'home-page', settingsId: 'site-settings' })
    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({ perspective: 'published', useCdn: false }))
  })

  it('distinguishes unconfigured, missing, invalid, and failed responses', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: '', sanityDataset: 'production' }))
    expect(await getHomeSections({} as never)).toEqual({ state: 'unconfigured', content: null })
    vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'test-project', sanityDataset: 'test' }))
    fetchMock.mockResolvedValue({ page: null })
    expect(await getHomeSections({} as never)).toEqual({ state: 'empty', content: null })
    fetchMock.mockResolvedValue({ ...sanityHomeSections, page: { ...sanityHomeSections.page, coursesHeading: '' } })
    expect(await getHomeSections({} as never)).toEqual({ state: 'invalid', content: null })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('private upstream detail'))
    expect(await getHomeSections({} as never)).toEqual({ state: 'error', content: null })
    expect(console.error).toHaveBeenCalledWith('無法讀取首頁內容')
  })
})
