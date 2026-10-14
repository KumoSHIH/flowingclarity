<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSiteSettings } from '../../composables/useSiteSettings'
import { sessionOverviewFixture } from '../../fixtures/session'
import type { SessionFilters } from '#shared/types/session'
import {
  getSessionPath,
  normalizeSessionFilter,
  normalizeSessionPage,
} from '#shared/utils/session'

const route = useRoute()
const router = useRouter()
const { settings } = useSiteSettings()
const regionKeys = sessionOverviewFixture.regions.map(item => item.key)
const methodKeys = sessionOverviewFixture.methods.map(item => item.key)
const activeRegions = computed(() => normalizeSessionFilter(route.query.region, regionKeys))
const activeMethods = computed(() => normalizeSessionFilter(route.query.method, methodKeys))
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
  () => [route.fullPath, activeRegions.value.join(','), activeMethods.value.join(','), activePage.value] as const,
  ([fullPath, regions, methods, page]) => {
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
        :content="sessionOverviewFixture"
        :regions="activeRegions"
        :methods="activeMethods"
        :page="activePage"
        @navigate="navigate"
        @normalize="normalize"
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
