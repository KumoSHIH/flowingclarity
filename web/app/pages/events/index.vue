<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSiteSettings } from '../../composables/useSiteSettings'
import type {
  EventOverviewApiResponse,
  EventOverviewStatus,
  EventView,
} from '#shared/types/event'
import {
  emptyEventOverviewContent,
  normalizeEventPage,
  normalizeEventView,
} from '#shared/utils/events'

const route = useRoute()
const router = useRouter()
const { settings } = useSiteSettings()
const {
  data: response,
  status: requestStatus,
  refresh,
} = useFetch<EventOverviewApiResponse>('/api/events')

const content = computed(() => response.value?.content ?? emptyEventOverviewContent)
const overviewStatus = computed<EventOverviewStatus>(() => {
  if (requestStatus.value === 'pending') return 'loading'
  if (requestStatus.value === 'error' || response.value?.state === 'error') return 'error'
  return 'ready'
})

const activeView = computed(() => normalizeEventView(route.query.view))
const activePage = computed(() => normalizeEventPage(route.query.page))

function navigate(view: EventView, page: number) {
  return router.push({ path: '/events', query: { view, page: String(page) } })
}

function normalize(view: EventView, page: number) {
  return router.replace({ path: '/events', query: { view, page: String(page) } })
}

watch(
  () => [route.query.view, route.query.page, activeView.value, activePage.value] as const,
  ([rawView, rawPage, view, page]) => {
    if (rawView === view && rawPage === String(page)) return
    void normalize(view, page)
  },
  { immediate: true },
)

useHead({ title: '近期活動｜Flowing Clarity' })
</script>

<template>
  <div class="events-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" current-path="/events" />

    <main>
      <EventOverview
        :content="content"
        :status="overviewStatus"
        :view="activeView"
        :page="activePage"
        @navigate="navigate"
        @normalize="normalize"
        @retry="refresh"
      />
    </main>

    <SiteFooter v-if="settings" :content="settings" current-path="/events" />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.events-page {
  --home-header-height: 87px;
  padding-top: var(--home-header-height);
  color: var(--color-ink);
  background: var(--color-paper);
}

.events-page ::selection {
  color: var(--color-oxblood);
  background: var(--color-saffron);
}

.events-page :focus-visible {
  outline: var(--control-focus-width) solid var(--color-clay);
  outline-offset: var(--control-focus-offset);
}
</style>
