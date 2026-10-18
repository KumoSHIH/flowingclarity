import { createClient } from '@sanity/client'
import type { ArticleDetailApiResponse } from '#shared/types/articleDetail'
import { parseArticleDetail } from '#shared/utils/articleDetail'
import { articleDetailQuery } from '../../queries/articleDetail'

export { articleDetailQuery } from '../../queries/articleDetail'

export default defineEventHandler(async (event): Promise<ArticleDetailApiResponse> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    setResponseStatus(event, 404)
    return { state: 'empty', content: null }
  }
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
    const value = await client.fetch<unknown>(articleDetailQuery, { slug })
    if (!value) {
      setResponseStatus(event, 404)
      return { state: 'empty', content: null }
    }
    const content = parseArticleDetail(value, slug)
    if (!content) {
      console.error('已發布的文章內頁格式無效')
      return { state: 'error', content: null }
    }
    return { state: 'ready', content }
  }
  catch {
    console.error('無法讀取已發布的文章內頁')
    return { state: 'error', content: null }
  }
})
