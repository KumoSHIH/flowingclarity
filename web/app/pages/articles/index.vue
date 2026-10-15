<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSiteSettings } from '../../composables/useSiteSettings'
import type { ArticleFilters, ArticleOverviewApiResponse, ArticleOverviewStatus } from '#shared/types/articles'
import {
  emptyArticleOverviewContent,
  getArticlesPath,
  normalizeArticleCategory,
  normalizeArticlePage,
  normalizeArticleTags,
} from '#shared/utils/articles'

const route = useRoute()
const router = useRouter()
const { settings } = useSiteSettings()
const { data: response, status: requestStatus, refresh } = useFetch<ArticleOverviewApiResponse>('/api/articles')
const content = computed(() => response.value?.content ?? emptyArticleOverviewContent)
const overviewStatus = computed<ArticleOverviewStatus>(() => {
  if (requestStatus.value === 'pending') return 'loading'
  if (requestStatus.value === 'error' || response.value?.state === 'error') return 'error'
  return 'ready'
})
const categoryKeys = computed(() => content.value.categories.map(category => category.key))
const publishedTagSlugs = computed(() => new Set(
  content.value.articles
    .filter(article => article.isPublished)
    .flatMap(article => article.tagSlugs),
))
const availableTags = computed(() => content.value.tags.filter(tag => publishedTagSlugs.value.has(tag.slug)))
const activeCategory = computed(() => normalizeArticleCategory(
  route.query.category,
  categoryKeys.value,
))
const activeTags = computed(() => normalizeArticleTags(route.query.tag, availableTags.value))
const activePage = computed(() => normalizeArticlePage(route.query.page))

function routeLocation(filters: ArticleFilters, page: number) {
  return {
    path: '/articles',
    query: {
      category: filters.category,
      tag: filters.tags.length ? filters.tags : undefined,
      page: page > 1 ? String(page) : undefined,
    },
  }
}

function navigate(filters: ArticleFilters, page: number) {
  return router.push(routeLocation(filters, page))
}

function normalize(filters: ArticleFilters, page: number) {
  return router.replace(routeLocation(filters, page))
}

watch(
  () => [
    route.fullPath,
    activeCategory.value,
    activeTags.value.join(','),
    activePage.value,
    response.value?.state,
  ] as const,
  ([fullPath, category, tags, page, responseState]) => {
    if (responseState !== 'ready') return
    const filters: ArticleFilters = {
      category,
      tags: tags ? tags.split(',') : [],
    }
    if (fullPath === getArticlesPath(filters, page)) return
    void normalize(filters, page)
  },
  { immediate: true },
)

useHead({ title: '文章分享｜Flowing Clarity' })
</script>

<template>
  <div class="articles-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" />

    <main>
      <ArticleOverview
        :content="content"
        :status="overviewStatus"
        :category="activeCategory"
        :tags="activeTags"
        :page="activePage"
        @navigate="navigate"
        @normalize="normalize"
        @retry="refresh"
      />
    </main>

    <SiteFooter v-if="settings" :content="settings" current-path="/articles" />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.articles-page {
  --home-header-height: 87px;
  padding-top: var(--home-header-height);
  color: var(--color-ink);
  background: var(--color-paper);
}

.articles-page ::selection {
  color: var(--color-oxblood);
  background: var(--color-saffron);
}

.articles-page :focus-visible {
  outline: var(--control-focus-width) solid var(--color-clay);
  outline-offset: var(--control-focus-offset);
}
</style>
