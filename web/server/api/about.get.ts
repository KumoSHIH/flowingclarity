import { createClient } from '@sanity/client'
import type { AboutPageResponse } from '#shared/types/about'
import { aboutPageId, parseAboutPage } from '#shared/utils/about'
import { siteSettingsId } from '#shared/utils/siteSettingsContract'

const imageProjection = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt,
  hotspot
}`

export const aboutPageQuery = `{
  "page": *[_id == $aboutId && _type == "aboutPage"][0]{
    title,
    introduction,
    "heroImage": heroImage${imageProjection},
    brandStory{
      heading,
      body[]{_key, _type, style, listItem, children[]{_key, _type, text, marks}, markDefs[]{_key, _type, href}},
      "image": image${imageProjection}
    },
    placeAndTeam{
      heading,
      body[]{_key, _type, style, listItem, children[]{_key, _type, text, marks}, markDefs[]{_key, _type, href}},
      "image": image${imageProjection}
    },
    featuredMoments{
      heading,
      body[]{_key, _type, style, listItem, children[]{_key, _type, text, marks}, markDefs[]{_key, _type, href}},
      items[]{"key": _key, "image": image${imageProjection}, caption}
    },
    contactHeading,
    contactIntroduction,
    seo{title, description}
  },
  "settings": *[_id == $settingsId && _type == "siteSettings"][0]{
    contact{address, email, phone{display, href}, businessHours[]{days, hours}, businessHoursNote, map{placeName, embedUrl, externalUrl}},
    socialLinks[]{label, href}
  }
}`

export default defineEventHandler(async (): Promise<AboutPageResponse> => {
  const { sanityProjectId, sanityDataset } = useRuntimeConfig()
  if (!sanityProjectId || !sanityDataset) return { state: 'unconfigured', content: null }
  try {
    const client = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2026-03-01',
      perspective: 'published',
      useCdn: false,
      timeout: 5000,
    })
    const raw = await client.fetch<unknown>(aboutPageQuery, {
      aboutId: aboutPageId,
      settingsId: siteSettingsId,
    })
    if (!raw || typeof raw !== 'object' || !('page' in raw) || raw.page === null) {
      return { state: 'empty', content: null }
    }
    const content = parseAboutPage(raw)
    return content ? { state: 'ready', content } : { state: 'invalid', content: null }
  }
  catch {
    console.error('無法讀取關於我們內容')
    return { state: 'error', content: null }
  }
})
