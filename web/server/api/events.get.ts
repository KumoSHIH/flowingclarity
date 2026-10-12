import { createClient } from '@sanity/client'
import type { EventOverviewApiResponse } from '#shared/types/event'
import { parseEventOverview } from '#shared/utils/events'

export const eventsQuery = `{
  "page": *[_id == "events-page" && _type == "eventsPage"][0]{
    pageTitle,
    intro,
    upcomingHeading,
    pastHeading,
    pastIntro,
    emptyMessage
  },
  "events": *[_type == "event" && isPublished == true]{
    "id": _id,
    title,
    "slug": slug.current,
    eventType,
    summary,
    startAt,
    endAt,
    scheduleNote,
    deliveryMode,
    city,
    venue,
    image{
      "src": asset->url,
      alt,
      hotspot{x, y}
    },
    registrationStatus,
    registrationUrl,
    "relatedCourseSlug": select(
      relatedCourse->isPublished == true && relatedCourse->detailIsPublished == true
        => relatedCourse->slug.current
    ),
    archiveVisible,
    order,
    isPublished
  }
}`

export default defineEventHandler(async (): Promise<EventOverviewApiResponse> => {
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
    const value = await client.fetch<unknown>(eventsQuery)
    if (!value || typeof value !== 'object' || !('page' in value) || value.page === null) {
      return { state: 'empty', content: null }
    }
    const content = parseEventOverview(value)
    if (!content) {
      console.error('已發布的活動總覽格式無效')
      return { state: 'error', content: null }
    }
    return { state: 'ready', content }
  }
  catch {
    console.error('無法讀取已發布的活動總覽')
    return { state: 'error', content: null }
  }
})
