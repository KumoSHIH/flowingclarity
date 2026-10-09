import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@sanity/client'
import { siteSettingsFixture } from '../../app/fixtures/siteSettings'
import { parseSiteSettings } from '../../shared/utils/siteSettings'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
const { default: getSettings } = await import('../../server/api/site-settings.get')
const raw = {
  ...siteSettingsFixture, brandDestination: '/', brandLogo: undefined,
  navigationItems: siteSettingsFixture.navigationItems.map(item => ({ label: item.label, destination: item.href })),
}

describe('site settings content boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'test-project', sanityDataset: 'test' }))
    fetchMock.mockReset()
    vi.mocked(createClient).mockClear()
  })
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
  it('reads one published singleton and maps navigation to the UI contract', async () => {
    fetchMock.mockResolvedValue(raw)
    const result = await getSettings({} as never)
    expect(result.state).toBe('ready')
    expect(result.content?.navigationItems).toEqual(siteSettingsFixture.navigationItems)
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('_id == $id'), { id: 'site-settings' })
    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({ perspective: 'published', useCdn: false }))
  })
  it('handles missing configuration without querying', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: '', sanityDataset: 'test' }))
    expect(await getSettings({} as never)).toEqual({ state: 'unconfigured', content: null })
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('distinguishes absent, invalid and failed content without fixture fallback', async () => {
    fetchMock.mockResolvedValue(null)
    expect(await getSettings({} as never)).toEqual({ state: 'empty', content: null })
    fetchMock.mockResolvedValue({ ...raw, brandName: '' })
    expect(await getSettings({} as never)).toEqual({ state: 'invalid', content: null })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('private upstream detail'))
    expect(await getSettings({} as never)).toEqual({ state: 'error', content: null })
    expect(console.error).toHaveBeenCalledWith('無法讀取全站設定')
  })
  it.each([
    { navigationItems: [] }, { brandDestination: '//example.com' },
    { socialLinks: [{ label: 'LINE', href: 'javascript:alert(1)' }] },
    { contact: { email: 'a@example.com?subject=bad' } },
    { contact: { phone: { display: '12345678' } } },
    { brandMessages: { englishStatement: '' } }, { legal: { copyrightText: '' } },
  ])('rejects incomplete or unsafe fields: %j', fields => {
    expect(parseSiteSettings({ ...raw, ...fields })).toBeNull()
  })
  it('allows omitted optional fields and ignores malformed optional images', () => {
    const result = parseSiteSettings({ ...raw, contact: undefined, socialLinks: undefined, brandLogo: { src: 'javascript:bad', width: 1, height: 1 } })
    expect(result?.socialLinks).toEqual([])
    expect(result?.brandLogo).toBeUndefined()
    expect(result?.contact).toBeUndefined()
  })
  it('maps independent header and footer logos without cross-fallback', () => {
    const header = { src: 'https://example.com/header.png', width: 100, height: 50 }
    const footer = { src: 'https://example.com/footer.png', width: 200, height: 80 }
    expect(parseSiteSettings({ ...raw, brandLogo: header, footerLogo: footer })).toMatchObject({ brandLogo: header, footerLogo: footer })
    expect(parseSiteSettings({ ...raw, brandLogo: header, footerLogo: null })?.footerLogo).toBeUndefined()
  })
})
