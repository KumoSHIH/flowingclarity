<script setup lang="ts">
import { computed } from 'vue'
import { useSiteSettings } from '../../composables/useSiteSettings'
import type { EventDetailApiResponse, EventDetailStatus } from '../../types/eventDetail'

const route = useRoute()
const { settings } = useSiteSettings()
const slug = computed(() => {
  const value = route.params.slug
  return Array.isArray(value) ? value[0] ?? '' : String(value ?? '')
})
const { data: response, status: requestStatus, refresh } = useFetch<EventDetailApiResponse>(
  () => `/api/event-detail/${encodeURIComponent(slug.value)}`,
)
const content = computed(() => response.value?.content ?? undefined)
const status = computed<EventDetailStatus>(() => {
  if (requestStatus.value === 'pending') return 'loading'
  if (requestStatus.value === 'error' || response.value?.state === 'error') return 'error'
  if (response.value?.state === 'empty') return 'not-found'
  return response.value?.state === 'ready' && content.value ? 'ready' : 'error'
})

useHead(() => ({
  title: content.value?.seo?.title ?? (content.value ? `${content.value.hero.title}｜Flowing Clarity` : '找不到活動｜Flowing Clarity'),
  meta: content.value
    ? [{ name: 'description', content: content.value.seo?.description ?? content.value.hero.summary }]
    : [{ name: 'robots', content: 'noindex' }],
}))
</script>

<template>
  <div class="event-detail-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" />
    <main><EventDetail :content="content" :status="status" @retry="refresh" /></main>
    <SiteFooter v-if="settings" :content="settings" :current-path="route.path" />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.event-detail-page {
  --home-header-height: 87px;
  padding-top: var(--home-header-height);
  color: var(--color-ink);
  background: var(--color-paper);
}

.event-detail-page ::selection { color: var(--color-oxblood); background: var(--color-saffron); }
.event-detail-page :focus-visible { outline: var(--control-focus-width) solid var(--color-clay); outline-offset: var(--control-focus-offset); }
</style>

