import { createClient } from '@sanity/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sanityCourseDetail } from '../fixtures/courseDetailSanity'

const { fetchMock, routerParamMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  routerParamMock: vi.fn(() => 'japanese-facial-massage'),
}))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('getRouterParam', routerParamMock)
vi.stubGlobal('useRuntimeConfig', () => ({
  sanityProjectId: 'test-project-id',
  sanityDataset: 'production',
}))
const { courseDetailQuery, default: getCourseDetail } = await import('../../server/api/course-detail/[slug].get')

describe('course detail API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    routerParamMock.mockReset()
    routerParamMock.mockReturnValue('japanese-facial-massage')
    vi.mocked(createClient).mockClear()
  })

  it('queries only explicitly published detail content and returns transformed data', async () => {
    fetchMock.mockResolvedValue(structuredClone(sanityCourseDetail))

    expect(await getCourseDetail({} as never)).toMatchObject({
      state: 'ready',
      content: { slug: 'japanese-facial-massage' },
    })
    expect(courseDetailQuery).toContain('isPublished == true')
    expect(courseDetailQuery).toContain('detailIsPublished == true')
    expect(courseDetailQuery).toContain('slug.current == $slug')
    expect(fetchMock).toHaveBeenCalledWith(courseDetailQuery, { slug: 'japanese-facial-massage' })
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({
      perspective: 'published',
      useCdn: false,
    })
  })

  it('returns empty for missing, unpublished or invalid slugs without leaking fixtures', async () => {
    fetchMock.mockResolvedValue({ course: null, runs: [] })
    expect(await getCourseDetail({} as never)).toEqual({ state: 'empty', content: null })

    routerParamMock.mockReturnValue('../drafts.course')
    expect(await getCourseDetail({} as never)).toEqual({ state: 'empty', content: null })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns error for an invalid published contract', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const value = structuredClone(sanityCourseDetail)
    const gallery = value.course.detail.body.find(block => block.type === 'gallery')
    if (gallery && gallery.type === 'gallery') gallery.items = []
    fetchMock.mockResolvedValue(value)

    expect(await getCourseDetail({} as never)).toEqual({ state: 'error', content: null })
  })

  it('returns error when Sanity cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('unavailable'))
    expect(await getCourseDetail({} as never)).toEqual({ state: 'error', content: null })
  })
})
