import { mount } from '@vue/test-utils'
import { defineComponent, reactive, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ArticleOverview from '../../app/components/ArticleOverview.vue'
import ArticlesPage from '../../app/pages/articles/index.vue'
import {
  articleOverviewFixture,
  emptyArticleOverviewFixture,
  longArticleOverviewFixture,
  missingOptionalArticleOverviewFixture,
} from '../../app/fixtures/articles'

const SiteHeaderStub = defineComponent({
  props: { alwaysVisible: Boolean },
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" />',
})

describe('article overview', () => {
  it('renders the approved strata layout, all filters, and eight newest articles', () => {
    const wrapper = mount(ArticleOverview, {
      props: { content: articleOverviewFixture },
    })

    expect(wrapper.get('h1').text()).toBe('文章分享')
    expect(wrapper.findAll('.article-categories a')).toHaveLength(5)
    expect(wrapper.get('.article-categories [aria-current="page"]').text()).toBe('全部文章')
    expect(wrapper.findAll('.article-tags input[type="checkbox"]')).toHaveLength(5)
    expect(wrapper.findAll('.article-entry')).toHaveLength(8)
    expect(wrapper.get('.article-results__header p').text()).toContain('共 24 篇文章')
    expect(wrapper.get('.article-entry time').text()).toBe('2026.10.08')
    expect(wrapper.get('.article-entry a').attributes('href')).toBe('/articles/prototype-article-01')
    expect(wrapper.get('.article-pagination a[aria-label="最新文章第 2 頁"]').attributes('href')).toBe('/articles?page=2')
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.text()).toContain(articleOverviewFixture.prototypeNotice)
  })

  it('emits category and multi-tag URL state while retaining the other filter group', async () => {
    const wrapper = mount(ArticleOverview, {
      props: {
        content: articleOverviewFixture,
        tags: ['craniosacral'],
      },
    })
    const heart = wrapper.findAll('.article-categories a')
      .find(link => link.text() === '撫慰心')!
    expect(heart.attributes('href')).toBe('/articles?category=heart&tag=craniosacral')
    await heart.trigger('click')
    expect(wrapper.emitted('navigate')).toContainEqual([{
      category: 'heart',
      tags: ['craniosacral'],
    }, 1])

    const humanDesign = wrapper.findAll('.article-tags label')
      .find(label => label.text().includes('人類圖'))!
    await humanDesign.get('input').setValue(true)
    expect(wrapper.emitted('navigate')).toContainEqual([{
      category: undefined,
      tags: ['craniosacral', 'human-design'],
    }, 1])
  })

  it('applies OR among tags and AND with the selected category', async () => {
    const wrapper = mount(ArticleOverview, {
      props: {
        content: articleOverviewFixture,
        category: 'body',
        tags: ['craniosacral', 'rebalance'],
      },
    })

    expect(wrapper.findAll('.article-entry')).toHaveLength(6)
    expect(wrapper.findAll('.article-entry').every(row => row.text().includes('愛身體'))).toBe(true)
    expect(wrapper.find('.article-pagination').exists()).toBe(false)

    const firstCheckbox = wrapper.findAll('.article-tags input')[0]!
    expect(firstCheckbox.element.checked).toBe(true)
    await wrapper.get('.article-tags__clear').trigger('click')
    expect(wrapper.emitted('navigate')).toContainEqual([{
      category: 'body',
      tags: [],
    }, 1])
  })

  it('normalizes out-of-range pages and focuses results after controlled navigation', async () => {
    const wrapper = mount(ArticleOverview, {
      attachTo: document.body,
      props: { content: articleOverviewFixture, page: 99 },
    })
    expect(wrapper.emitted('normalize')).toEqual([[{
      category: undefined,
      tags: [],
    }, 3]])

    await wrapper.setProps({ page: 2 })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.get('#article-results-heading').element)
    wrapper.unmount()
  })

  it('supports no-match, empty, loading, error, missing-image, and long-content states', async () => {
    const noMatch = mount(ArticleOverview, {
      props: {
        content: articleOverviewFixture,
        category: 'beauty',
        tags: ['family-constellations'],
      },
    })
    expect(noMatch.text()).toContain(articleOverviewFixture.noMatchesMessage)
    expect(noMatch.get('.article-results__header [aria-live="polite"]').text()).toContain('共 0 篇文章')
    expect(noMatch.findAll('.article-state button')).toHaveLength(2)

    const empty = mount(ArticleOverview, {
      props: { content: emptyArticleOverviewFixture },
    })
    expect(empty.text()).toContain(articleOverviewFixture.emptyMessage)
    expect(empty.find('.article-tags').exists()).toBe(false)

    const loading = mount(ArticleOverview, {
      props: { content: articleOverviewFixture, status: 'loading' },
    })
    expect(loading.get('.article-results').attributes('aria-busy')).toBe('true')
    expect(loading.text()).toContain('正在整理文章')

    const error = mount(ArticleOverview, {
      props: { content: articleOverviewFixture, status: 'error' },
    })
    await error.get('.article-state button').trigger('click')
    expect(error.emitted('retry')).toHaveLength(1)

    const missing = mount(ArticleOverview, {
      props: { content: missingOptionalArticleOverviewFixture },
    })
    expect(missing.get('.article-entry__media--missing').attributes('aria-hidden')).toBe('true')
    expect(missing.get('.article-entry__media--missing').find('img').exists()).toBe(false)

    const covered = mount(ArticleOverview, {
      props: {
        content: {
          ...emptyArticleOverviewFixture,
          articles: [{
            ...articleOverviewFixture.articles[0]!,
            coverImage: {
              src: '/images/generated/home-rose-atlas.png',
              alt: '橘黃花瓣形成向外展開的層次',
              width: 960,
              height: 540,
            },
          }],
        },
      },
    })
    expect(covered.get('.article-entry img').attributes('alt')).toBe('橘黃花瓣形成向外展開的層次')

    const long = mount(ArticleOverview, {
      props: { content: longArticleOverviewFixture },
    })
    expect(long.text()).toContain('在變動與未知同時發生的日子裡')
    expect(long.text()).toContain('不以省略號隱藏內容')
  })
})

describe('articles page', () => {
  const route = reactive({
    query: { category: undefined, tag: undefined, page: undefined } as Record<string, unknown>,
    fullPath: '/articles',
  })
  const push = vi.fn()
  const replace = vi.fn()

  beforeEach(() => {
    push.mockReset()
    replace.mockReset()
    route.query = { category: undefined, tag: undefined, page: undefined }
    route.fullPath = '/articles'
    vi.stubGlobal('useRoute', () => route)
    vi.stubGlobal('useRouter', () => ({ push, replace }))
    vi.stubGlobal('useHead', vi.fn())
    vi.stubGlobal('useFetch', (url: string) => ({
      data: ref(url === '/api/articles'
        ? { state: 'ready', content: articleOverviewFixture }
        : { state: 'empty', content: null }),
      status: ref('success'),
      refresh: vi.fn(),
    }))
  })

  afterEach(() => vi.unstubAllGlobals())

  function mountPage() {
    return mount(ArticlesPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          ArticleOverview,
        },
      },
    })
  }

  it('uses the shared shell and pushes shareable filter state', async () => {
    const wrapper = mountPage()
    expect(wrapper.get('[data-site-header]').attributes('data-always-visible')).toBe('true')
    expect(wrapper.get('main h1').text()).toBe('文章分享')

    const craniosacral = wrapper.findAll('.article-tags label')
      .find(label => label.text().includes('頭薦骨'))!
    await craniosacral.get('input').setValue(true)
    expect(push).toHaveBeenCalledWith({
      path: '/articles',
      query: { category: undefined, tag: ['craniosacral'], page: undefined },
    })
  })

  it('replaces invalid, duplicate, unordered query values with the canonical URL state', () => {
    route.query = {
      category: 'unknown',
      tag: ['family-constellations', 'missing', 'craniosacral', 'family-constellations'],
      page: '-2',
    }
    route.fullPath = '/articles?category=unknown&tag=family-constellations&tag=missing&tag=craniosacral&tag=family-constellations&page=-2'
    mountPage()

    expect(replace).toHaveBeenCalledWith({
      path: '/articles',
      query: {
        category: undefined,
        tag: ['craniosacral', 'family-constellations'],
        page: undefined,
      },
    })
  })
})
