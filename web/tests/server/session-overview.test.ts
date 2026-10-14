import { createClient } from '@sanity/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('useRuntimeConfig', () => ({
  sanityProjectId: 'test-project-id',
  sanityDataset: 'production',
}))
const { sessionOverviewQuery, default: getSessionOverview } = await import('../../server/api/session-overview.get')

const overview = {
  page: {
    pageTitle: '尋找\n執行師',
    intro: '依服務地區與方法，找到適合進一步了解的執行師。可複選條件，結果會立即更新。',
    resultsHeading: '執行師名錄',
    emptyMessage: '目前沒有已發布的執行師資料，請稍後再回來查看。',
    noMatchesMessage: '目前沒有符合條件的執行師，請清除部分篩選後再試一次。',
  },
  regions: [{ key: 'north', label: '北部', order: 1 }],
  methods: [{ key: 'rebalance', label: '身心再平衡按摩', order: 1 }],
  practitioners: [{
    id: 'practitioner-lin',
    name: '林若安',
    englishName: 'An',
    slug: 'lin-ruo-an',
    regionKeys: ['north'],
    methodKeys: ['rebalance'],
    order: 1,
    isPublished: true,
  }],
}

describe('session overview API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.mocked(createClient).mockClear()
  })

  it('queries published practitioners and maps references to frontend keys', async () => {
    fetchMock.mockResolvedValue(overview)

    expect(await getSessionOverview({} as never)).toEqual({
      state: 'ready',
      content: expect.objectContaining({
        pageTitle: '尋找\n執行師',
        practitioners: [expect.objectContaining({ id: 'practitioner-lin' })],
      }),
    })
    expect(sessionOverviewQuery).toContain('_id == "session-page"')
    expect(sessionOverviewQuery).toContain('_type == "practitioner" && isPublished == true')
    expect(sessionOverviewQuery).toContain('"regionKeys": regions[]->key')
    expect(sessionOverviewQuery).not.toContain('prototypeNotice')
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({
      perspective: 'published',
      useCdn: false,
    })
  })

  it('drops invalid practitioners without replacing them with fixtures', async () => {
    fetchMock.mockResolvedValue({
      ...overview,
      practitioners: [{ ...overview.practitioners[0], methodKeys: ['missing'] }],
    })
    expect(await getSessionOverview({} as never)).toEqual({
      state: 'ready',
      content: expect.objectContaining({ practitioners: [] }),
    })
  })

  it('returns explicit empty and error responses', async () => {
    fetchMock.mockResolvedValue({ ...overview, page: null })
    expect(await getSessionOverview({} as never)).toEqual({ state: 'empty', content: null })

    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResolvedValue({ ...overview, page: { pageTitle: '' } })
    expect(await getSessionOverview({} as never)).toEqual({ state: 'error', content: null })

    fetchMock.mockRejectedValue(new Error('unavailable'))
    expect(await getSessionOverview({} as never)).toEqual({ state: 'error', content: null })
  })
})
