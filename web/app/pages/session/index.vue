<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSiteSettings } from '../../composables/useSiteSettings'
import type {
  SessionFilters,
  SessionOverviewApiResponse,
  SessionOverviewStatus,
} from '#shared/types/session'
import {
  emptySessionOverviewContent,
  getSessionPath,
  normalizeSessionFilter,
  normalizeSessionPage,
} from '#shared/utils/session'

const route = useRoute()
const router = useRouter()
const { settings } = useSiteSettings()
const {
  data: response,
  status: requestStatus,
  refresh,
} = useFetch<SessionOverviewApiResponse>('/api/session-overview')
const content = computed(() => response.value?.content ?? emptySessionOverviewContent)
const overviewStatus = computed<SessionOverviewStatus>(() => {
  if (requestStatus.value === 'pending') return 'loading'
  if (requestStatus.value === 'error' || response.value?.state === 'error') return 'error'
  return 'ready'
})
const regionKeys = computed(() => content.value.regions.map(item => item.key))
const methodKeys = computed(() => content.value.methods.map(item => item.key))
const activeRegions = computed(() => normalizeSessionFilter(route.query.region, regionKeys.value))
const activeMethods = computed(() => normalizeSessionFilter(route.query.method, methodKeys.value))
const activePage = computed(() => normalizeSessionPage(route.query.page))

function routeLocation(filters: SessionFilters, page: number) {
  return {
    path: '/session',
    query: {
      region: filters.regions.length ? filters.regions : undefined,
      method: filters.methods.length ? filters.methods : undefined,
      page: String(page),
    },
  }
}

function navigate(filters: SessionFilters, page: number) {
  return router.push(routeLocation(filters, page))
}

function normalize(filters: SessionFilters, page: number) {
  return router.replace(routeLocation(filters, page))
}

watch(
  () => [
    route.fullPath,
    activeRegions.value.join(','),
    activeMethods.value.join(','),
    activePage.value,
    response.value?.state,
  ] as const,
  ([fullPath, regions, methods, page, responseState]) => {
    if (responseState !== 'ready') return
    const canonicalPath = getSessionPath({
      regions: regions ? regions.split(',') : [],
      methods: methods ? methods.split(',') : [],
    }, page)
    if (fullPath === canonicalPath) return
    void normalize({
      regions: regions ? regions.split(',') : [],
      methods: methods ? methods.split(',') : [],
    }, page)
  },
  { immediate: true },
)

useHead({ title: '個案諮詢｜Flowing Clarity' })
</script>

<template>
  <div class="session-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" />

    <main>
      <SessionOverview
        :content="content"
        :status="overviewStatus"
        :regions="activeRegions"
        :methods="activeMethods"
        :page="activePage"
        @navigate="navigate"
        @normalize="normalize"
        @retry="refresh"
      />
    </main>

    <SiteFooter v-if="settings" :content="settings" current-path="/session" />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.session-page {
  --home-header-height: 87px;
  padding-top: var(--home-header-height);
  color: var(--color-ink);
  background: var(--color-paper);
}

.session-page ::selection {
  color: var(--color-oxblood);
  background: var(--color-saffron);
}

.session-page :focus-visible {
  outline: var(--control-focus-width) solid var(--color-clay);
  outline-offset: var(--control-focus-offset);
}
</style>
