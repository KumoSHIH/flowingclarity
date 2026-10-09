<script setup lang="ts">
import { ref } from "vue";
import { useSiteSettings } from '../composables/useSiteSettings';
import type { HomeBannerContent } from "#shared/utils/homeBanner";

const { data: banner } = useFetch<HomeBannerContent | null>("/api/home-banner");
const { settings } = useSiteSettings();

const heroElement = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    class="home-page relative isolate mx-auto min-h-screen max-w-[1920px] overflow-clip"
  >
    <SiteHeader :reveal-after="heroElement" :settings="settings" />

    <main>
      <div ref="heroElement">
        <HomeBanner :banner="banner" :navigation-items="settings?.navigationItems" />
      </div>
      <div class="relative">
        <HomeIntroduction />
        <HomeEvents />
        <HomeCourses />
        <HomeContact />
      </div>
    </main>

    <SiteFooter v-if="settings" :content="settings" current-path="/" />
    <SiteFooterUnavailable v-else />
  </div>
</template>
