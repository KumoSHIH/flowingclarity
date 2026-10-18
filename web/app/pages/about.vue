<script setup lang="ts">
import { aboutPageFixture } from '../fixtures/about'
import { useSiteSettings } from '../composables/useSiteSettings'

const { settings } = useSiteSettings()

useSeoMeta({
  title: aboutPageFixture.seo?.title,
  description: aboutPageFixture.seo?.description,
})
</script>

<template>
  <div class="about-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" current-path="/about" />

    <main>
      <AboutOverview :content="aboutPageFixture" />
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
