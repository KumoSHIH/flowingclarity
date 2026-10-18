<script setup lang="ts">
import { computed } from 'vue'
import { useSiteSettings } from '../composables/useSiteSettings'
import type { AboutPageResponse, AboutPageStatus } from '#shared/types/about'
import { emptyAboutPageContent } from '#shared/utils/about'

const { settings } = useSiteSettings()
const { data: response, status: requestStatus, refresh } = useFetch<AboutPageResponse>('/api/about')
const content = computed(() => response.value?.content ?? emptyAboutPageContent)
const aboutStatus = computed<AboutPageStatus>(() => {
  if (requestStatus.value === 'pending') return 'loading'
  if (requestStatus.value === 'error' || response.value?.state !== 'ready') return 'error'
  return 'ready'
})

useSeoMeta({
  title: () => content.value.seo?.title || '關於我們｜Flowing Clarity',
  description: () => content.value.seo?.description,
})
</script>

<template>
  <div class="about-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" current-path="/about" />

    <main>
      <AboutOverview :content="content" :status="aboutStatus" @retry="refresh" />
    </main>

    <SiteFooter v-if="settings" :content="settings" current-path="/about" />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.about-page {
  --home-header-height: 87px;
  padding-top: var(--home-header-height);
  color: var(--color-ink);
  background: var(--color-paper);
}

.about-page ::selection {
  color: var(--color-oxblood);
  background: var(--color-saffron);
}

.about-page :focus-visible {
  outline: var(--control-focus-width) solid var(--color-clay);
  outline-offset: var(--control-focus-offset);
}
</style>
