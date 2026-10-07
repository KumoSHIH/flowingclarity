<script setup lang="ts">
import { ref } from "vue";
import type { HomeBannerContent } from "#shared/utils/homeBanner";

const { data: banner } = useFetch<HomeBannerContent | null>("/api/home-banner");

const heroElement = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    class="home-page relative isolate mx-auto min-h-screen max-w-[1920px] overflow-clip"
  >
    <SiteHeader :reveal-after="heroElement" />

    <main>
      <div ref="heroElement">
        <HomeBanner :banner="banner" />
      </div>
      <div class="relative">
        <HomeIntroduction />
        <HomeEvents />
        <HomeCourses />
        <HomeContact />
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
