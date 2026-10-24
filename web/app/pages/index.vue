<script setup lang="ts">
import { computed, ref } from "vue";
import { useSiteSettings } from '../composables/useSiteSettings';
import type { HomeBannerContent } from "#shared/utils/homeBanner";
import type { HomeSectionsResponse } from '#shared/types/homeSections'

const { data: banner } = useFetch<HomeBannerContent | null>("/api/home-banner");
const { data: homeResponse, status: homeRequestStatus } = useFetch<HomeSectionsResponse>('/api/home-sections')
const { settings } = useSiteSettings();
const homeContent = computed(() => homeResponse.value?.state === 'ready' ? homeResponse.value.content : null)

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
      <div v-if="homeContent" class="relative">
        <HomeIntroduction :content="homeContent.introduction" />
        <HomeEvents :content="homeContent.events" />
        <HomeCourses :content="homeContent.courses" />
        <HomeContact v-if="homeContent.contact" :content="homeContent.contact" />
      </div>
      <HomeSectionsState v-else :state="homeRequestStatus === 'pending' ? 'loading' : 'unavailable'" />
    </main>

    <SiteFooter v-if="settings" :content="settings" current-path="/" />
    <SiteFooterUnavailable v-else />
  </div>
</template>
