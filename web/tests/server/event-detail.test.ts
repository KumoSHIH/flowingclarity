import { createClient } from '@sanity/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sanityEventDetail } from '../fixtures/eventDetailSanity'

const { fetchMock, routerParamMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  routerParamMock: vi.fn(() => 'body-awareness-day'),
}))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('getRouterParam', routerParamMock)
vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'test-project-id', sanityDataset: 'production' }))
const { eventDetailQuery, default: getEventDetail } = await import('../../server/api/event-detail/[slug].get')

describe('event detail API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    routerParamMock.mockReset()
    routerParamMock.mockReturnValue('body-awareness-day')
    vi.mocked(createClient).mockClear()
  })

  it('queries only explicitly published detail content and returns transformed data', async () => {
    fetchMock.mockResolvedValue(structuredClone(sanityEventDetail))
    expect(await getEventDetail({} as never)).toMatchObject({ state: 'ready', content: { slug: 'body-awareness-day' } })
    expect(eventDetailQuery).toContain('isPublished == true')
    expect(eventDetailQuery).toContain('detailIsPublished == true')
    expect(eventDetailQuery).toContain('slug.current == $slug')
    expect(eventDetailQuery).toContain('items[consentConfirmed == true]')
    expect(fetchMock).toHaveBeenCalledWith(eventDetailQuery, { slug: 'body-awareness-day' })
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({ perspective: 'published', useCdn: false })
  })

  it('returns empty for missing or invalid slugs without fixture fallback', async () => {
    fetchMock.mockResolvedValue(null)
    expect(await getEventDetail({} as never)).toEqual({ state: 'empty', content: null })
    routerParamMock.mockReturnValue('../drafts.event')
    expect(await getEventDetail({} as never)).toEqual({ state: 'empty', content: null })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns error for invalid published data and read failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResolvedValue({ ...sanityEventDetail, detail: { ...sanityEventDetail.detail, body: [] } })
    expect(await getEventDetail({} as never)).toEqual({ state: 'error', content: null })
    fetchMock.mockRejectedValue(new Error('unavailable'))
    expect(await getEventDetail({} as never)).toEqual({ state: 'error', content: null })
  })
})
