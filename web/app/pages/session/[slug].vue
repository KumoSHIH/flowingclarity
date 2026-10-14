<script setup lang="ts">
import { computed } from 'vue'
import { getSessionDetailFixture } from '../../fixtures/sessionDetail'
import { useSiteSettings } from '../../composables/useSiteSettings'
import type { SessionDetailStatus } from '../../types/sessionDetail'

const route = useRoute()
const { settings } = useSiteSettings()
const slug = computed(() => {
  const value = route.params.slug
  return Array.isArray(value) ? value[0] ?? '' : String(value ?? '')
})
const content = computed(() => getSessionDetailFixture(slug.value))
const status = computed<SessionDetailStatus>(() => content.value ? 'ready' : 'not-found')

useHead(() => ({
  title: content.value?.seo?.title ?? (content.value ? `${content.value.name}｜Flowing Clarity` : '找不到執行師｜Flowing Clarity'),
  meta: content.value
    ? [{ name: 'description', content: content.value.seo?.description ?? content.value.summary }]
    : [{ name: 'robots', content: 'noindex' }],
}))
</script>

<template>
  <div class="session-detail-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" />
    <main><SessionDetail :content="content" :status="status" /></main>
    <SiteFooter v-if="settings" :content="settings" :current-path="route.path" />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.session-detail-page { --home-header-height: 87px; padding-top: var(--home-header-height); color: var(--color-ink); background: var(--color-paper); }
.session-detail-page ::selection { color: var(--color-oxblood); background: var(--color-saffron); }
.session-detail-page :focus-visible { outline: var(--control-focus-width) solid var(--color-clay); outline-offset: var(--control-focus-offset); }
</style>
