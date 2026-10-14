import { createClient } from '@sanity/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sanitySessionDetail } from '../fixtures/sessionDetailSanity'

const { fetchMock, routerParamMock, responseStatusMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  routerParamMock: vi.fn(() => 'lin-ruo-an'),
  responseStatusMock: vi.fn(),
}))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('getRouterParam', routerParamMock)
vi.stubGlobal('setResponseStatus', responseStatusMock)
vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'test-project-id', sanityDataset: 'production' }))
const { sessionDetailQuery, default: getSessionDetail } = await import('../../server/api/session-detail/[slug].get')

describe('session detail API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    routerParamMock.mockReset()
    routerParamMock.mockReturnValue('lin-ruo-an')
    vi.mocked(createClient).mockClear()
    responseStatusMock.mockReset()
  })

  it('queries published practitioners and returns transformed detail data', async () => {
    fetchMock.mockResolvedValue(structuredClone(sanitySessionDetail))
    expect(await getSessionDetail({} as never)).toMatchObject({ state: 'ready', content: { slug: 'lin-ruo-an' } })
    expect(sessionDetailQuery).toContain('isPublished == true')
    expect(sessionDetailQuery).toContain('slug.current == $slug')
    expect(sessionDetailQuery).toContain('coalesce(displayMode, "contained")')
    expect(sessionDetailQuery).toContain('coalesce(cities[]->label, [city->label])')
    expect(sessionDetailQuery).toContain('publicDetail == "fullAddress" => address')
    expect(sessionDetailQuery).not.toContain('consent')
    expect(fetchMock).toHaveBeenCalledWith(sessionDetailQuery, { slug: 'lin-ruo-an' })
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({ perspective: 'published', useCdn: false })
  })

  it('returns empty for missing or invalid slugs without fixture fallback', async () => {
    fetchMock.mockResolvedValue(null)
    expect(await getSessionDetail({} as never)).toEqual({ state: 'empty', content: null })
    expect(responseStatusMock).toHaveBeenCalledWith(expect.anything(), 404)
    routerParamMock.mockReturnValue('../drafts.practitioner')
    expect(await getSessionDetail({} as never)).toEqual({ state: 'empty', content: null })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns error for invalid published data and read failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResolvedValue({ ...sanitySessionDetail, contactItems: [] })
    expect(await getSessionDetail({} as never)).toEqual({ state: 'error', content: null })
    fetchMock.mockRejectedValue(new Error('unavailable'))
    expect(await getSessionDetail({} as never)).toEqual({ state: 'error', content: null })
  })
})
