import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@sanity/client'
import { sanityAboutPage } from '../fixtures/aboutSanity'
import { parseAboutPage } from '../../shared/utils/about'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
const { aboutPageQuery, default: getAbout } = await import('../../server/api/about.get')

describe('about content boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'test-project', sanityDataset: 'test' }))
    fetchMock.mockReset()
    vi.mocked(createClient).mockClear()
  })
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('reads the two published singletons and maps rich text, images, and shared contact', async () => {
    fetchMock.mockResolvedValue(sanityAboutPage)
    const result = await getAbout({} as never)
    expect(result.state).toBe('ready')
    expect(result.content?.brandStory.body[0]?.text).toContain('標準答案')
    expect(result.content?.featuredMoments.items).toHaveLength(3)
    expect(result.content?.contact?.businessHours[0]).toEqual({ days: '週二至週日', hours: '10:00–18:00' })
    expect(aboutPageQuery).toContain('_id == $aboutId')
    expect(fetchMock).toHaveBeenCalledWith(aboutPageQuery, { aboutId: 'about-page', settingsId: 'site-settings' })
    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({ perspective: 'published', useCdn: false }))
  })

  it('keeps valid page content when shared contact is absent or invalid', () => {
    expect(parseAboutPage({ ...sanityAboutPage, settings: null })?.contact).toBeUndefined()
    expect(parseAboutPage({ ...sanityAboutPage, settings: { contact: { businessHours: [] } } })?.contact).toBeUndefined()
  })

  it('rejects unsafe, incomplete, duplicate, or out-of-range page content', () => {
    expect(parseAboutPage({ ...sanityAboutPage, page: { ...sanityAboutPage.page, heroImage: { ...sanityAboutPage.page.heroImage, src: 'javascript:bad' } } })).toBeNull()
    expect(parseAboutPage({ ...sanityAboutPage, page: { ...sanityAboutPage.page, featuredMoments: { ...sanityAboutPage.page.featuredMoments, items: sanityAboutPage.page.featuredMoments.items.slice(0, 2) } } })).toBeNull()
    const duplicateItems = sanityAboutPage.page.featuredMoments.items.map(item => ({ ...item, key: 'same' }))
    expect(parseAboutPage({ ...sanityAboutPage, page: { ...sanityAboutPage.page, featuredMoments: { ...sanityAboutPage.page.featuredMoments, items: duplicateItems } } })).toBeNull()
    const unsafeBody = [{ ...sanityAboutPage.page.brandStory.body[0], style: 'h2' }]
    expect(parseAboutPage({ ...sanityAboutPage, page: { ...sanityAboutPage.page, brandStory: { ...sanityAboutPage.page.brandStory, body: unsafeBody } } })).toBeNull()
  })

  it('distinguishes unconfigured, missing, invalid, and failed responses without fixture fallback', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: '', sanityDataset: 'production' }))
    expect(await getAbout({} as never)).toEqual({ state: 'unconfigured', content: null })
    vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'test-project', sanityDataset: 'test' }))
    fetchMock.mockResolvedValue({ page: null, settings: null })
    expect(await getAbout({} as never)).toEqual({ state: 'empty', content: null })
    fetchMock.mockResolvedValue({ ...sanityAboutPage, page: { ...sanityAboutPage.page, title: '' } })
    expect(await getAbout({} as never)).toEqual({ state: 'invalid', content: null })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('private upstream detail'))
    expect(await getAbout({} as never)).toEqual({ state: 'error', content: null })
    expect(console.error).toHaveBeenCalledWith('無法讀取關於我們內容')
  })
})
