import { createClient } from '@sanity/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))

vi.mock('@sanity/client', () => ({
  createClient: vi.fn(() => ({ fetch: fetchMock })),
}))

vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('useRuntimeConfig', () => ({
  sanityProjectId: 'hnypuj6l',
  sanityDataset: 'production',
}))

const { default: getHomeBanner } = await import('../../server/api/home-banner.get')

describe('home banner API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.mocked(createClient).mockClear()
  })

  it('returns ordered published slides with their matching descriptions', async () => {
    fetchMock.mockResolvedValue({
      title: '新的標題',
      summary: '新的摘要',
      slides: [
        { _key: 'a', image: '/first.jpg', imageAlt: '第一張', description: '第一段' },
        { _key: 'b', image: '/second.jpg', imageAlt: '第二張', description: '第二段' },
      ],
    })

    expect(await getHomeBanner({} as never)).toEqual({
      title: '新的標題',
      summary: '新的摘要',
      slides: [
        { id: 'a', image: '/first.jpg', imageAlt: '第一張', description: '第一段' },
        { id: 'b', image: '/second.jpg', imageAlt: '第二張', description: '第二段' },
      ],
    })
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({
      perspective: 'published',
      useCdn: false,
    })
    expect(fetchMock.mock.calls[0]?.[0]).toContain('slides[]')
  })

  it('keeps an existing published single image visible until slides are published', async () => {
    fetchMock.mockResolvedValue({
      title: '舊標題',
      summary: '舊摘要',
      slides: null,
      legacyImage: '/legacy.jpg',
      legacyImageAlt: '舊圖片',
    })

    expect(await getHomeBanner({} as never)).toEqual({
      title: '舊標題',
      summary: '舊摘要',
      slides: [{
        id: 'legacy-slide',
        image: '/legacy.jpg',
        imageAlt: '舊圖片',
        description: '舊摘要',
      }],
    })
  })

  it('uses the page fallback when no complete image is published', async () => {
    fetchMock.mockResolvedValue({
      title: '未完成的 Banner',
      summary: '摘要',
      slides: [{ _key: 'bad', image: null, imageAlt: null, description: '敘述' }],
      legacyImage: null,
      legacyImageAlt: null,
    })

    expect(await getHomeBanner({} as never)).toBeNull()
  })
})
