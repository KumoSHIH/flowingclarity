import { createClient } from '@sanity/client'
import type { CourseOverviewApiResponse } from '#shared/types/course'
import { parseCourseOverview } from '#shared/utils/courseOverview'

export const courseOverviewQuery = `{
  "page": *[_id == "courseOverviewPage" && _type == "courseOverviewPage"][0]{
    pageTitle,
    directoryPrompt,
    endingMessage
  },
  "categories": *[
    _type == "courseCategory" &&
    _id in ["course-category-body", "course-category-heart", "course-category-life", "course-category-beauty"]
  ] | order(order asc){
    key,
    name,
    order,
    summary,
    "courses": *[
      _type == "course" &&
      isPublished == true &&
      (references(^._id) || category._ref == "courseCategory." + ^.key)
    ] | order(order asc){
      title,
      "slug": slug.current,
      deliveryModes,
      summary,
      image{
        "src": asset->url,
        alt,
        hotspot{x, y}
      },
      order,
      isPublished
    }
  }
}`

export default defineEventHandler(async (): Promise<CourseOverviewApiResponse> => {
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
    const value = await client.fetch<unknown>(courseOverviewQuery)
    if (!value || typeof value !== 'object' || !('page' in value) || value.page === null) {
      return { state: 'empty', content: null }
    }
    const content = parseCourseOverview(value)
    if (!content) {
      console.error('已發布的課程總覽格式無效')
      return { state: 'error', content: null }
    }
    return { state: 'ready', content }
  } catch {
    console.error('無法讀取已發布的課程總覽')
    return { state: 'error', content: null }
  }
})
