import { createClient } from '@sanity/client'
import { parseHomeBanner } from '#shared/utils/homeBanner'

const homeBannerQuery = `*[_id == "homeBanner" && _type == "homeBanner"][0]{
  title,
  summary,
  buttonText,
  buttonLink
}`

export default defineEventHandler(async () => {
  try {
    const { sanityProjectId, sanityDataset } = useRuntimeConfig()
    const client = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2026-03-01',
      perspective: 'published',
      useCdn: false,
    })
    return parseHomeBanner(await client.fetch<unknown>(homeBannerQuery))
  } catch {
    console.error('無法讀取已發布的首頁 Banner')
    return null
  }
})
