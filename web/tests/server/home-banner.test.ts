import { createClient } from '@sanity/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'hnypuj6l', sanityDataset: 'production' }))
const { default: getHomeBanner } = await import('../../server/api/home-banner.get')
const banner = { title: '標題', summary: '敘述', buttonText: '探索課程', buttonLink: '#courses' }

describe('home banner API', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.mocked(createClient).mockClear()
  })
  afterEach(() => vi.restoreAllMocks())

  it('returns only the four published fields without requiring an image', async () => {
    fetchMock.mockResolvedValue({ ...banner, slides: [{ image: '/old.jpg' }] })
    expect(await getHomeBanner({} as never)).toEqual(banner)
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({ perspective: 'published', useCdn: false })
    expect(fetchMock.mock.calls[0]?.[0]).toContain('buttonLink')
    expect(fetchMock.mock.calls[0]?.[0]).not.toContain('slides')
  })

  it.each(['title', 'summary', 'buttonText', 'buttonLink'])('rejects a blank or missing %s', async (field) => {
    for (const value of [null, undefined, '   ', 123]) {
      fetchMock.mockResolvedValue({ ...banner, [field]: value })
      expect(await getHomeBanner({} as never)).toBeNull()
    }
  })

  it.each(['#courses', '/course?category=body#intro', 'https://example.com/courses', 'http://example.com'])('accepts %s', async (buttonLink) => {
    fetchMock.mockResolvedValue({ ...banner, buttonLink })
    expect(await getHomeBanner({} as never)).toEqual({ ...banner, buttonLink })
  })

  it.each(['javascript:alert(1)', 'data:text/html,test', '//example.com', '/\\example.com', '#', 'courses', 'https://', 'java\nscript:alert(1)'])('rejects invalid links: %s', async (buttonLink) => {
    fetchMock.mockResolvedValue({ ...banner, buttonLink })
    expect(await getHomeBanner({} as never)).toBeNull()
  })

  it('returns null for no published content or a CMS failure', async () => {
    fetchMock.mockResolvedValue(null)
    expect(await getHomeBanner({} as never)).toBeNull()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('unavailable'))
    expect(await getHomeBanner({} as never)).toBeNull()
  })
})
