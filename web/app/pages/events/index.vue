<script setup lang="ts">
import { computed } from 'vue'
import { useSiteSettings } from '../../composables/useSiteSettings'
import { eventOverviewFixture } from '../../fixtures/events'
import type { EventView } from '#shared/types/event'
import { normalizeEventPage, normalizeEventView } from '#shared/utils/events'

const route = useRoute()
const router = useRouter()
const { settings } = useSiteSettings()

const activeView = computed(() => normalizeEventView(route.query.view))
const activePage = computed(() => normalizeEventPage(route.query.page))

function navigate(view: EventView, page: number) {
  return router.push({ path: '/events', query: { view, page: String(page) } })
}

function normalize(view: EventView, page: number) {
  return router.replace({ path: '/events', query: { view, page: String(page) } })
}

useHead({ title: '近期活動｜Flowing Clarity' })
</script>

<template>
  <div class="events-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" />

    <main>
      <EventOverview
        :content="eventOverviewFixture"
        :view="activeView"
        :page="activePage"
        @navigate="navigate"
        @normalize="normalize"
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
