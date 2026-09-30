<script setup lang="ts">
import { computed } from 'vue'
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/effect-fade'

const props = defineProps<{
  banner: {
    title: string
    summary: string
    slides: {
      id: string
      image: string
      imageAlt: string
      description: string
    }[]
  }
}>()

const hasMultipleSlides = computed(() => props.banner.slides.length > 1)
const titleLines = computed(() => props.banner.title === '讓身心，慢慢回到自己的節奏。'
  ? ['讓身心，', '慢慢回到', '自己的節奏。']
  : [props.banner.title])
const pagination = computed(() => props.banner.slides.length > 0 ? {
  el: '.home-banner-pagination',
  type: 'fraction' as const,
  formatFractionCurrent: (value: number) => String(value).padStart(2, '0'),
  formatFractionTotal: (value: number) => String(value).padStart(2, '0'),
} : false)

</script>

<template>
  <section
    data-home-banner
    class="home-banner relative flex flex-col overflow-hidden bg-paper px-[clamp(28px,6vw,116px)] py-12 lg:block lg:py-0"
    aria-labelledby="hero-title"
  >
    <div data-banner-copy class="relative z-20 flex flex-col items-start lg:h-full lg:w-[33%] lg:justify-center lg:pr-8">
      <h1
        id="hero-title"
        class="m-0 max-w-[580px] font-display text-[clamp(46px,4.5vw,64px)] font-medium leading-[1.3] tracking-[-0.02em] text-ink"
      >
        <span v-for="line in titleLines" :key="line" class="block">{{ line }}</span>
      </h1>

      <p class="mt-10 max-w-[430px] text-[clamp(16px,1.05vw,18px)] leading-[2.05] tracking-[0.05em] text-[#71685e] lg:mt-12">
        {{ banner.summary }}
      </p>

      <a
        href="#courses"
        class="group mt-9 inline-flex min-h-12 items-center gap-7 border-b border-clay pb-2.5 text-sm font-semibold tracking-[0.12em] text-clay transition-colors duration-300 hover:text-ink"
      >
        查看近期課程
        <svg
          class="h-5 w-5 transition-transform duration-500 ease-out group-hover:translate-x-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M5 12h14M14 7l5 5-5 5" />
        </svg>
      </a>
    </div>

    <div data-banner-media class="banner-media relative z-20 mt-12 min-h-[260px] flex-1 overflow-hidden bg-[#b49b80] lg:absolute lg:bottom-[clamp(28px,5vh,64px)] lg:left-[39%] lg:right-0 lg:top-0 lg:mt-0 lg:h-auto lg:min-h-0">
      <Swiper
        class="home-banner-swiper h-full"
        :modules="[A11y, Autoplay, EffectFade, Keyboard, Pagination]"
        :slides-per-view="1"
        effect="fade"
        :fade-effect="{ mode: 'cross-fade' }"
        :speed="800"
        :autoplay="hasMultipleSlides ? { delay: 2500, disableOnInteraction: false } : false"
        :loop="hasMultipleSlides"
        :keyboard="{ enabled: true, onlyInViewport: true }"
        :allow-touch-move="hasMultipleSlides"
        :watch-overflow="true"
        :pagination="pagination"
      >
        <SwiperSlide v-for="(slide, index) in banner.slides" :key="slide.id" class="relative h-full overflow-hidden">
          <img
            :src="slide.image"
            :alt="slide.imageAlt"
            :loading="index === 0 ? 'eager' : 'lazy'"
            width="1600"
            height="1066"
            class="home-banner-image absolute inset-0 h-full w-full object-cover object-[54%_center]"
          >
          <div class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-stone-950/70 to-transparent" aria-hidden="true" />
          <p class="absolute bottom-7 right-7 z-10 m-0 max-w-[min(62%,390px)] text-right text-sm leading-7 tracking-[0.08em] text-[#fffaf1] [text-shadow:0_1px_8px_rgb(0_0_0_/_0.35)] md:bottom-9 md:right-9 md:text-base">
            {{ slide.description }}
          </p>
        </SwiperSlide>
        <template #container-end>
          <div
            v-if="banner.slides.length"
            class="home-banner-pagination pointer-events-none absolute bottom-7 left-7 z-10 font-editorial text-xs tracking-[0.16em] text-[#fffaf1] [text-shadow:0_1px_8px_rgb(0_0_0_/_0.35)] md:bottom-9 md:left-9"
            aria-live="polite"
          />
        </template>
      </Swiper>
    </div>
  </section>
</template>

<style scoped>
.home-banner {
  --header-height: 80px;
  height: calc(100svh - var(--header-height));
  height: calc(100dvh - var(--header-height));
}

.home-banner-image {
  transform: scale(1.045);
  transition: transform 6s cubic-bezier(0.16, 1, 0.3, 1);
}

.swiper-slide-active .home-banner-image {
  transform: scale(1);
}

@media (min-width: 768px) {
  .home-banner {
    --header-height: 108px;
  }
}

@media (max-width: 1023px) and (max-height: 800px) {
  .home-banner {
    padding-top: 24px;
    padding-bottom: 24px;
  }

  [data-banner-copy] h1 {
    font-size: clamp(34px, 6vh, 44px);
  }

  [data-banner-copy] p,
  [data-banner-copy] a {
    margin-top: 16px;
  }

  [data-banner-copy] p {
    line-height: 1.75;
  }

  .banner-media {
    min-height: 120px;
    margin-top: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-banner-image,
  .group svg {
    transform: none;
    transition: none;
  }
}
</style>
