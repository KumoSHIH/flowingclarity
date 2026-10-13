<script setup lang="ts">
import { computed } from 'vue'
import { getEventDetailFixture } from '../../fixtures/eventDetail'
import { useSiteSettings } from '../../composables/useSiteSettings'

const route = useRoute()
const { settings } = useSiteSettings()
const slug = computed(() => {
  const value = route.params.slug
  return Array.isArray(value) ? value[0] ?? '' : String(value ?? '')
})
const content = computed(() => getEventDetailFixture(slug.value))
const status = computed(() => content.value ? 'ready' as const : 'not-found' as const)

useHead(() => ({
  title: content.value ? `${content.value.hero.title}｜Flowing Clarity` : '找不到活動｜Flowing Clarity',
  meta: [
    { name: 'robots', content: 'noindex' },
    ...(content.value ? [{ name: 'description', content: content.value.hero.summary }] : []),
  ],
}))
</script>

<template>
  <div class="event-detail-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" />
    <main><EventDetail :content="content" :status="status" /></main>
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

