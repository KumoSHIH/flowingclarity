import { createClient } from '@sanity/client'
import { parseSiteSettings } from '#shared/utils/siteSettings'
import { siteSettingsId } from '#shared/utils/siteSettingsContract'
import type { SiteSettingsResponse } from '#shared/types/siteSettings'

export const siteSettingsQuery = `*[_id == $id && _type == "siteSettings"][0]{
  brandName, brandDestination,
  "brandLogo": brandLogo.asset->{"src": url, "width": metadata.dimensions.width, "height": metadata.dimensions.height},
  "footerLogo": footerLogo.asset->{"src": url, "width": metadata.dimensions.width, "height": metadata.dimensions.height},
  brandMessages{englishStatement, closingStatement},
  contact{address, email, phone{display, href}},
  socialLinks[]{label, href}, navigationItems[]{label, destination, accessibleLabel},
  legal{copyrightText}
}`

export default defineEventHandler(async (): Promise<SiteSettingsResponse> => {
  const { sanityProjectId, sanityDataset } = useRuntimeConfig()
  if (!sanityProjectId || !sanityDataset) return { state: 'unconfigured', content: null }
  try {
    const client = createClient({ projectId: sanityProjectId, dataset: sanityDataset, apiVersion: '2026-03-01', perspective: 'published', useCdn: false, timeout: 5000 })
    const raw = await client.fetch<unknown>(siteSettingsQuery, { id: siteSettingsId })
    if (raw == null) return { state: 'empty', content: null }
    const content = parseSiteSettings(raw)
    return { state: content ? 'ready' : 'invalid', content }
  } catch {
    console.error('無法讀取全站設定')
    return { state: 'error', content: null }
  }
})
