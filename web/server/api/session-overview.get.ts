import { createClient } from '@sanity/client'
import type { SessionOverviewApiResponse } from '#shared/types/session'
import { parseSessionOverview } from '#shared/utils/session'

export const sessionOverviewQuery = `{
  "page": *[_id == "session-page" && _type == "sessionPage"][0]{
    pageTitle,
    intro,
    resultsHeading,
    emptyMessage,
    noMatchesMessage
  },
  "regions": *[_type == "sessionRegion"] | order(order asc){
    key,
    label,
    order
  },
  "methods": *[_type == "sessionMethod"] | order(order asc){
    key,
    label,
    order
  },
  "practitioners": *[_type == "practitioner" && isPublished == true]{
    "id": _id,
    name,
    englishName,
    "slug": slug.current,
    "regionKeys": regions[]->key,
    "methodKeys": methods[]->key,
    summary,
    order,
    isPublished
  }
}`

export default defineEventHandler(async (): Promise<SessionOverviewApiResponse> => {
  try {
    const { sanityProjectId, sanityDataset } = useRuntimeConfig()
    if (!sanityProjectId || !sanityDataset) throw new Error('Sanity runtime config is missing')
    const client = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2026-03-01',
      perspective: 'published',
      useCdn: false,
    })
    const value = await client.fetch<unknown>(sessionOverviewQuery)
    if (!value || typeof value !== 'object' || !('page' in value) || value.page === null) {
      return { state: 'empty', content: null }
    }
    const content = parseSessionOverview(value)
    if (!content) {
      console.error('已發布的個案諮詢總覽格式無效')
      return { state: 'error', content: null }
    }
    return { state: 'ready', content }
  }
  catch {
    console.error('無法讀取已發布的個案諮詢總覽')
    return { state: 'error', content: null }
  }
})
