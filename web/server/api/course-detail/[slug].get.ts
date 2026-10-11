import { createClient } from '@sanity/client'
import type { CourseDetailApiResponse } from '#shared/types/courseDetail'
import { parseCourseDetail } from '#shared/utils/courseDetail'
import { courseDetailQuery } from '../../queries/courseDetail'

export { courseDetailQuery } from '../../queries/courseDetail'

export default defineEventHandler(async (event): Promise<CourseDetailApiResponse> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { state: 'empty', content: null }

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
    const value = await client.fetch<unknown>(courseDetailQuery, { slug })
    if (!value || typeof value !== 'object' || !('course' in value) || value.course === null) {
      return { state: 'empty', content: null }
    }
    const content = parseCourseDetail(value, slug)
    if (!content) {
      console.error('已發布的課程內頁格式無效')
      return { state: 'error', content: null }
    }
    return { state: 'ready', content }
  } catch {
    console.error('無法讀取已發布的課程內頁')
    return { state: 'error', content: null }
  }
})
