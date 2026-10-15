import { createClient } from '@sanity/client'
import type { ArticleOverviewApiResponse } from '#shared/types/articles'
import { parseArticleOverview } from '#shared/utils/articles'

export const articlesQuery = `{
  "page": *[_id == "articles-page" && _type == "articlesPage"][0]{
    pageTitle, intro, allLabel, tagFilterLabel, resultsHeading, emptyMessage, noMatchesMessage
  },
  "categories": *[_type == "courseCategory"] | order(order asc){ key, name, order },
  "tags": *[_type == "articleTag"] | order(order asc, name asc, _id asc){
    "slug": slug.current, name, order
  },
  "articles": *[_type == "article"] | order(publishedAt desc, _id asc){
    "id": _id,
    title,
    "slug": slug.current,
    "categoryKey": category->key,
    "tagSlugs": tags[]->slug.current,
    excerpt,
    publishedAt,
    "coverImage": select(defined(coverImage.asset) => {
      "src": coverImage.asset->url,
      "alt": coverImage.alt,
      "width": coverImage.asset->metadata.dimensions.width,
      "height": coverImage.asset->metadata.dimensions.height
    })
  }
}`

export default defineEventHandler(async (): Promise<ArticleOverviewApiResponse> => {
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
    const value = await client.fetch<unknown>(articlesQuery)
    if (!value || typeof value !== 'object' || !('page' in value) || value.page === null) {
      return { state: 'empty', content: null }
    }
    const content = parseArticleOverview(value)
    if (!content) {
      console.error('已發布的文章分享總覽格式無效')
      return { state: 'error', content: null }
    }
    return { state: 'ready', content }
  }
  catch {
    console.error('無法讀取已發布的文章分享總覽')
    return { state: 'error', content: null }
  }
})
