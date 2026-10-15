import { createClient } from '@sanity/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { articleOverviewFixture } from '../../app/fixtures/articles'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
vi.mock('@sanity/client', () => ({ createClient: vi.fn(() => ({ fetch: fetchMock })) }))
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('useRuntimeConfig', () => ({ sanityProjectId: 'test-project', sanityDataset: 'production' }))
const { articlesQuery, default: getArticles } = await import('../../server/api/articles.get')

function sanityOverview() {
  return {
    page: {
      pageTitle: articleOverviewFixture.pageTitle,
      intro: articleOverviewFixture.intro,
      allLabel: articleOverviewFixture.allLabel,
      tagFilterLabel: articleOverviewFixture.tagFilterLabel,
      resultsHeading: articleOverviewFixture.resultsHeading,
      emptyMessage: articleOverviewFixture.emptyMessage,
      noMatchesMessage: articleOverviewFixture.noMatchesMessage,
    },
    categories: articleOverviewFixture.categories,
    tags: articleOverviewFixture.tags,
    articles: articleOverviewFixture.articles.slice(0, 1).map(({ categoryKey, tagSlugs, ...article }) => ({
      ...article,
      categoryKey,
      tagSlugs,
    })),
  }
}

describe('articles API', () => {
  beforeEach(() => fetchMock.mockReset())

  it('uses a published-only minimal projection and maps valid content', async () => {
    fetchMock.mockResolvedValue(sanityOverview())
    expect(await getArticles({} as never)).toEqual({
      state: 'ready',
      content: expect.objectContaining({ articles: [expect.objectContaining({ isPublished: true })] }),
    })
    expect(articlesQuery).toContain('_id == "articles-page"')
    expect(articlesQuery).toContain('"categoryKey": category->key')
    expect(articlesQuery).toContain('"tagSlugs": tags[]->slug.current')
    expect(articlesQuery).not.toContain('body')
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({ perspective: 'published', useCdn: false })
  })

  it('drops invalid articles and returns explicit empty and error states', async () => {
    const value = sanityOverview()
    value.articles[0]!.tagSlugs = ['missing']
    fetchMock.mockResolvedValue(value)
    expect(await getArticles({} as never)).toEqual({
      state: 'ready', content: expect.objectContaining({ articles: [] }),
    })
    fetchMock.mockResolvedValue({ ...value, page: null })
    expect(await getArticles({} as never)).toEqual({ state: 'empty', content: null })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('useRuntimeConfig', () => ({}))
    expect(await getArticles({} as never)).toEqual({ state: 'error', content: null })
  })
})
