import { describe, expect, it } from 'vitest'
import type { ArticleOverviewItem } from '../../shared/types/articles'
import {
  filterArticles,
  getArticlePaginationItems,
  getArticlePath,
  getArticlesPath,
  normalizeArticleCategory,
  normalizeArticlePage,
  normalizeArticleTags,
  paginateArticles,
} from '../../shared/utils/articles'

function article(
  id: string,
  categoryKey: ArticleOverviewItem['categoryKey'],
  tagSlugs: string[],
  publishedAt: string,
  isPublished = true,
): ArticleOverviewItem {
  return {
    id,
    title: `示意文章 ${id}`,
    slug: `article-${id}`,
    categoryKey,
    tagSlugs,
    excerpt: '這是一段符合長度需求、用來驗證文章篩選與排序的示意摘要內容。',
    publishedAt,
    isPublished,
  }
}

describe('article overview helpers', () => {
  const tags = [
    { slug: 'craniosacral', name: '頭薦骨', order: 1 },
    { slug: 'human-design', name: '人類圖', order: 2 },
    { slug: 'family', name: '家族系統排列', order: 3 },
  ]

  it('normalizes fixed categories, ordered tags, limits, and positive pages', () => {
    expect(normalizeArticleCategory('body', ['body', 'heart'])).toBe('body')
    expect(normalizeArticleCategory('unknown', ['body', 'heart'])).toBeUndefined()
    expect(normalizeArticleTags(
      ['family', 'unknown', 'craniosacral', 'family'],
      tags,
    )).toEqual(['craniosacral', 'family'])
    expect(normalizeArticleTags(
      Array.from({ length: 12 }, (_, index) => `tag-${index}`),
      Array.from({ length: 12 }, (_, index) => ({
        slug: `tag-${index}`,
        name: `標籤 ${index}`,
        order: index,
      })),
    )).toHaveLength(8)
    expect(normalizeArticlePage(['3', '4'])).toBe(3)
    expect(normalizeArticlePage('0')).toBe(1)
  })

  it('uses OR among tags, AND with category, and stable newest-first ordering', () => {
    const source = [
      article('b', 'body', ['craniosacral'], '2026-05-01T08:00:00+08:00'),
      article('a', 'body', ['family'], '2026-05-01T08:00:00+08:00'),
      article('c', 'heart', ['craniosacral', 'human-design'], '2026-06-01T08:00:00+08:00'),
      article('hidden', 'body', ['craniosacral'], '2026-07-01T08:00:00+08:00', false),
    ]

    expect(filterArticles(source, {
      category: 'body',
      tags: ['craniosacral', 'family'],
    }).map(item => item.id)).toEqual(['a', 'b'])
    expect(filterArticles(source, {
      category: undefined,
      tags: [],
    }).map(item => item.id)).toEqual(['c', 'a', 'b'])
  })

  it('clamps pagination and compacts long page ranges', () => {
    const source = Array.from({ length: 48 }, (_, index) => article(
      String(index + 1),
      'body',
      ['craniosacral'],
      `2026-01-${String((index % 28) + 1).padStart(2, '0')}T08:00:00+08:00`,
    ))
    const result = paginateArticles(source, 99)
    expect(result.currentPage).toBe(6)
    expect(result.items).toHaveLength(8)
    expect(getArticlePaginationItems(1, 6)).toEqual([1, 2, 3, 'ellipsis', 6])
    expect(getArticlePaginationItems(4, 6)).toEqual([1, 'ellipsis', 4, 5, 6])
  })

  it('builds canonical list and article paths', () => {
    expect(getArticlesPath({
      category: 'body',
      tags: ['craniosacral', 'family'],
    }, 2)).toBe('/articles?category=body&tag=craniosacral&tag=family&page=2')
    expect(getArticlesPath({ category: undefined, tags: [] }, 1)).toBe('/articles')
    expect(getArticlePath('article-one')).toBe('/articles/article-one')
    expect(getArticlePath('文章 01')).toBe('/articles/%E6%96%87%E7%AB%A0%2001')
  })
})
