import { createClient } from '@sanity/client'
import type { HomeSectionsResponse } from '#shared/types/homeSections'
import { homePageId, parseHomeSections } from '#shared/utils/homeSections'
import { siteSettingsId } from '#shared/utils/siteSettingsContract'

const imageProjection = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt,
  hotspot
}`

export const homeSectionsQuery = `{
  "page": *[_id == $homePageId && _type == "homePage"][0]{
    introductionLabel,
    introductionHeading,
    introductionParagraphs,
    "introductionImage": introductionImage${imageProjection},
    introductionCaption,
    eventsHeading,
    eventsIntroduction,
    eventsEmptyMessage,
    coursesHeading,
    coursesIntroduction,
    coursesEmptyMessage,
    contactHeading,
    contactIntroduction,
    contactButtonLabel
  },
  "settings": *[_id == $settingsId && _type == "siteSettings"][0]{contact{email}},
  "events": *[_type == "event" && isPublished == true]{_id, "slug": slug.current, title, eventType, startAt, endAt, scheduleNote, registrationStatus, order, isPublished},
  "courses": *[_type == "course" && isPublished == true]{
    _id,
    "slug": slug.current,
    title,
    summary,
    isPublished,
    "categoryName": category->name,
    "image": image${imageProjection},
    "runs": *[_type == "courseRun" && isPublished == true && references(^._id)]{registrationStatus, isPublished, stages[]{dateRanges[]{startDate}}}
  }
}`

export default defineEventHandler(async (): Promise<HomeSectionsResponse> => {
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
    const raw = await client.fetch<unknown>(homeSectionsQuery, { homePageId, settingsId: siteSettingsId })
    if (!raw || typeof raw !== 'object' || !('page' in raw) || raw.page === null) return { state: 'empty', content: null }
    const content = parseHomeSections(raw)
    return content ? { state: 'ready', content } : { state: 'invalid', content: null }
  }
  catch {
    console.error('無法讀取首頁內容')
    return { state: 'error', content: null }
  }
})
