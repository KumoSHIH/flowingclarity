import { createClient } from '@sanity/client'
import type { EventDetailApiResponse } from '#shared/types/eventDetail'
import { parseEventDetail } from '#shared/utils/eventDetail'
import { eventDetailQuery } from '../../queries/eventDetail'

export { eventDetailQuery } from '../../queries/eventDetail'

export default defineEventHandler(async (event): Promise<EventDetailApiResponse> => {
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
    const value = await client.fetch<unknown>(eventDetailQuery, { slug })
    if (!value) return { state: 'empty', content: null }
    const content = parseEventDetail(value, slug)
    if (!content) {
      console.error('已發布的活動內頁格式無效')
      return { state: 'error', content: null }
    }
    return { state: 'ready', content }
  }
  catch {
    console.error('無法讀取已發布的活動內頁')
    return { state: 'error', content: null }
  }
})
