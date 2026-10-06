import { createClient } from '@sanity/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('useRuntimeConfig', () => ({
  sanityProjectId: 'test-project-id',
  sanityDataset: 'production',
}))
const { courseOverviewQuery, default: getCourseOverview } = await import('../../server/api/course-overview.get')

const overview = {
  page: { pageTitle: '課程探索', directoryPrompt: '想從哪裡開始？' },
  categories: [
    { key: 'body', name: '愛身體', order: 1, summary: '從有意識的碰觸與覺察出發，練習聆聽身體，也重新辨認自己的界線。', courses: [] },
    { key: 'heart', name: '撫慰心', order: 2, summary: '透過關係與依附經驗的理解，為內在感受留出能被看見與承接的空間。', courses: [] },
    { key: 'life', name: '究生命', order: 3, summary: '藉由理解工具觀察生命裡反覆出現的節奏，整理當下的位置與可能方向。', courses: [] },
    { key: 'beauty', name: '展現美', order: 4, summary: '在顏色、形狀與創作的過程中安住，讓美感成為回到當下的一條路。', courses: [] },
  ],
}

describe('course overview API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.mocked(createClient).mockClear()
  })

  it('queries only published public courses and returns transformed content', async () => {
    fetchMock.mockResolvedValue(overview)

    expect(await getCourseOverview({} as never)).toEqual({
      state: 'ready',
      content: expect.objectContaining({ pageTitle: '課程探索' }),
    })
    expect(courseOverviewQuery).toContain('isPublished == true')
    expect(courseOverviewQuery).toContain('course-category-body')
    expect(courseOverviewQuery).toContain('category._ref == "courseCategory." + ^.key')
    expect(courseOverviewQuery).not.toContain('href')
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({
      perspective: 'published',
      useCdn: false,
    })
  })

  it('returns an explicit empty response when no overview page is published', async () => {
    fetchMock.mockResolvedValue(null)
    expect(await getCourseOverview({} as never)).toEqual({ state: 'empty', content: null })

    fetchMock.mockResolvedValue({ ...overview, page: null })
    expect(await getCourseOverview({} as never)).toEqual({ state: 'empty', content: null })
  })

  it('returns an error response for an invalid published content contract', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockResolvedValue({ ...overview, page: { pageTitle: '' } })
    expect(await getCourseOverview({} as never)).toEqual({ state: 'error', content: null })
  })

  it('returns an error response when Sanity cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('unavailable'))
    expect(await getCourseOverview({} as never)).toEqual({ state: 'error', content: null })
  })
})
