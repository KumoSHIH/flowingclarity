<script setup lang="ts">
interface HomeBannerContent {
  title: string;
  summary: string;
  slides: {
    id: string;
    image: string;
    imageAlt: string;
    description: string;
  }[];
}

const fallbackBanner: HomeBannerContent = {
  title: "讓身心，慢慢回到自己的節奏。",
  summary:
    "在溫柔的觸碰與安靜的片刻裡，放下日常的緊繃。給自己一段時間，重新感受身體，也重新聽見內心。",
  slides: [
    {
      id: "quiet-space",
      image: "/images/home-banner.jpg",
      imageAlt: "午後暖光照進安靜的按摩空間，亞麻布鋪在按摩床上",
      description: "在安靜的空間裡，讓身體先放鬆下來。",
    },
    {
      id: "warm-light",
      image: "/images/home-banner-2.jpg",
      imageAlt: "陽光穿過窗簾，照在鋪著亞麻布的按摩床上",
      description: "循著溫暖的光，找回屬於自己的步調。",
    },
  ],
};

const { data: publishedBanner } = await useFetch<HomeBannerContent | null>(
  "/api/home-banner",
);
const banner = computed(() => publishedBanner.value ?? fallbackBanner);
</script>

<template>
  <div class="home-page relative isolate mx-auto flex min-h-screen max-w-[1920px] flex-col overflow-hidden">
    <header
      class="relative z-20 flex h-20 shrink-0 items-center justify-between px-[clamp(28px,6vw,116px)] md:h-[108px]"
      aria-label="網站標題"
    >
      <div
        class="flex items-center gap-3 whitespace-nowrap font-editorial text-[25px] tracking-[-0.04em] max-[480px]:text-[21px]"
      >
        <span
          class="text-[42px] font-light leading-[0.5] text-clay"
          aria-hidden="true"
          >◌</span
        >
        <span>普那生活空間</span>
      </div>
      <nav
        class="hidden items-center gap-8 text-xs tracking-[0.12em] text-muted md:flex"
        aria-label="首頁區塊導覽"
      >
        <a
          class="inline-flex min-h-12 items-center transition-colors hover:text-clay"
          href="#about"
          >關於我們</a
        >
        <a
          class="inline-flex min-h-12 items-center transition-colors hover:text-clay"
          href="#events"
          >近期活動</a
        >
        <a
          class="inline-flex min-h-12 items-center transition-colors hover:text-clay"
          href="#courses"
          >近期課程</a
        >
        <a
          class="inline-flex min-h-12 items-center transition-colors hover:text-clay"
          href="#contact"
          >聯絡我們</a
        >
      </nav>
    </header>

    <main class="relative flex-1">
      <div class="relative">
        <HomeFlowLine />
        <HomeBanner :banner="banner" />
        <HomeIntroduction />
        <HomeEvents />
        <HomeCourses />
        <div class="h-10 md:h-16" aria-hidden="true" />
      </div>
      <HomeContact />
    </main>

    <footer
      class="relative z-20 flex min-h-16 items-center justify-between px-[clamp(28px,6vw,116px)] font-editorial text-[10px] tracking-[0.16em] text-muted max-[480px]:text-[9px]"
    >
      <span>FLOWING CLARITY</span>
      <span>留一點空白，給自己。</span>
    </footer>
  </div>
</template>
