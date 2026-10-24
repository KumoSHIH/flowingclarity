<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoseAtlasAnimation } from "../composables/useRoseAtlasAnimation";
import { siteNavigationItems } from "../constants/siteNavigation";
import type { SiteNavigationItem } from "../constants/siteNavigation";

import {
  fallbackHomeBanner,
  parseHomeBanner,
  type HomeBannerContent,
} from "#shared/utils/homeBanner";

const props = defineProps<{
  banner?: HomeBannerContent | null;
  navigationItems?: readonly SiteNavigationItem[];
}>();
const items = computed<readonly SiteNavigationItem[]>(
  () => props.navigationItems ?? siteNavigationItems,
);
const content = computed(
  () => parseHomeBanner(props.banner) ?? fallbackHomeBanner,
);
const titleLines = computed(() => content.value.title.split(/\r?\n/));

interface CourseCategory {
  id: string;
  title: string;
  subtitle: string;
  courses: string[];
}

const categories: CourseCategory[] = [
  {
    id: "body",
    title: "愛身體",
    subtitle: "覺察邊界",
    courses: ["頭薦骨", "再平衡按摩", "日式臉部按摩"],
  },
  {
    id: "heart",
    title: "撫慰心",
    subtitle: "內在安定",
    courses: ["童年依附創傷療癒"],
  },
  {
    id: "life",
    title: "究生命",
    subtitle: "看見自己",
    courses: ["人類圖"],
  },
  {
    id: "beauty",
    title: "展現美",
    subtitle: "活出美感",
    courses: ["曼陀羅靜心彩繪"],
  },
];

const activeCategoryId = ref("body");
const atlas = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const { rippleFrom } = useRoseAtlasAnimation(atlas, canvas);

function selectCategory(id: string, event: MouseEvent) {
  activeCategoryId.value = id;
  rippleFrom(event);
}
</script>

<template>
  <section
    id="course-map"
    data-home-banner
    class="home-banner"
    aria-labelledby="hero-title"
  >
    <div ref="atlas" class="home-banner__atlas">
      <nav class="hero-menu" aria-label="首頁主要選單">
        <a
          v-for="item in items"
          :key="item.href"
          :href="item.href"
          :aria-label="item.accessibleLabel"
        >
          {{ item.label }}
        </a>
      </nav>
      <img
        class="home-banner__plate"
        src="/assets/plates/rose-atlas-plate.png"
        alt="暖黃色地形線交疊成一朵玫瑰，象徵由身體出發的感知地圖"
        width="2000"
        height="1786"
        fetchpriority="high"
        draggable="false"
      />

      <canvas ref="canvas" class="home-banner__canvas" aria-hidden="true" />

      <p class="atlas-caption atlas-caption--bottom-left" aria-hidden="true">
        Pathways to creative arts <br />and well-being
      </p>

      <div class="atlas-categories" aria-label="課程類別">
        <a
          v-for="category in categories"
          :key="category.id"
          :href="`/course#${category.id}`"
          class="atlas-category"
          :class="[
            `atlas-category--${category.id}`,
            { 'is-active': activeCategoryId === category.id },
          ]"
          @click="selectCategory(category.id, $event)"
        >
          <span class="atlas-category__marker" aria-hidden="true"><i /></span>
          <span class="atlas-category__copy">
            <strong>{{ category.title }}</strong>
            <small>{{ category.courses.join("、") }}</small>
          </span>
        </a>
      </div>
    </div>
    <div class="home-banner__story">
      <div class="hero-story-copy">
        <a class="atlas-brand" href="#course-map" aria-label="普那生活空間首頁">
          <img
            class="atlas-brand__logo"
            src="/assets/logo-main.png"
            alt=""
            width="896"
            height="496"
            draggable="false"
          />
        </a>
        <h1 id="hero-title" class="display-title">
          <span v-for="(line, index) in titleLines" :key="index">{{
            line
          }}</span>
        </h1>
        <p class="lead-text">{{ content.summary }}</p>
        <a class="hero-cta button-primary" :href="content.buttonLink">
          <span>{{ content.buttonText }}</span>
          <svg
            class="button-primary__icon"
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
    </div>
  </section>
</template>

<style scoped>
.home-banner {
  --hero-edge: clamp(28px, 3vw, 48px);
  --hero-top: clamp(28px, 4.8vh, 52px);

  display: grid;
  grid-template-columns: 67% 33%;
  grid-template-areas: "atlas story";
  width: 100%;
  height: 100svh;
  height: 100dvh;
  min-height: 680px;
  overflow: hidden;
  background: var(--color-saffron);
}

.home-banner__atlas {
  grid-area: atlas;
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  color: var(--color-oxblood);
}

.home-banner__plate {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
}

.home-banner__canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.atlas-brand {
  margin-bottom: 30px;
  display: block;
  text-decoration: none;
}

.atlas-brand__logo {
  display: block;
  width: clamp(168px, 18vw, 190px);
  height: auto;
  pointer-events: none;
  user-select: none;
}

.atlas-legend,
.atlas-caption {
  position: absolute;
  z-index: 2;
  margin: 0;
  font-size: var(--type-meta-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}

.atlas-legend {
  top: 14%;
  left: 4.7%;
}

.atlas-caption--top {
  top: 8%;
  right: 5%;
  padding-left: 18px;
  border-left: 1px solid currentColor;
}

.atlas-caption--bottom-left {
  bottom: 30px;
  left: 4.7%;
}

.atlas-caption--bottom-right {
  right: 5%;
  bottom: 30px;
  padding-bottom: 9px;
  border-bottom: 1px solid currentColor;
}

.atlas-category {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  padding: 8px;
  color: var(--color-oxblood);
  background: transparent;
  border: 0;
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: color 180ms ease;
}

.atlas-category:is(:hover, :focus-visible) {
  color: var(--color-warm-white);
}

.atlas-category--body {
  top: 26%;
  left: 17%;
}
.atlas-category--heart {
  top: 23%;
  right: 10%;
}
.atlas-category--life {
  bottom: 23%;
  left: 12%;
}
.atlas-category--beauty {
  right: 5%;
  bottom: 20%;
}

.atlas-category__marker {
  position: relative;
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-oxblood) 68%, transparent);
  border-radius: 50%;
  transition:
    background 220ms ease,
    border-color 180ms ease,
    transform 220ms ease;
}

.atlas-category:is(:hover, :focus-visible) .atlas-category__marker {
  border-color: currentColor;
}

.atlas-category__marker i {
  position: relative;
  width: 11px;
  height: 11px;
  background: color-mix(in srgb, var(--color-oxblood) 38%, transparent);
  border: 4px solid var(--color-warm-white);
  border-radius: 50%;
  box-shadow:
    0 0 7px rgb(255 248 231 / 82%),
    0 0 18px rgb(255 248 231 / 44%);
  box-sizing: content-box;
  transition: box-shadow 180ms ease;
}

.atlas-category:is(:hover, :focus-visible, .is-active)
  .atlas-category__marker
  i {
  box-shadow:
    0 0 9px rgb(255 248 231 / 92%),
    0 0 24px rgb(255 248 231 / 60%);
}

.atlas-category__copy {
  display: grid;
  gap: 4px;
}

.atlas-category__copy strong {
  font-family: var(--font-sans);
  font-size: var(--type-title-md-size);
  font-weight: 500;
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}

.atlas-category__copy small {
  font-size: var(--type-meta-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}

.home-banner__story {
  grid-area: story;
  position: relative;
  min-width: 0;
  min-height: 0;
  color: var(--color-ink);
  background: var(--color-sand);
}

.hero-menu {
  position: absolute;
  top: var(--hero-top);
  left: 50%;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: clamp(18px, 2vw, 34px);
  color: var(--color-oxblood);
  transform: translateX(-50%);
}

.hero-menu a {
  position: relative;
  display: flex;
  min-height: 44px;
  align-items: center;
  text-decoration: none;
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  white-space: nowrap;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.hero-menu a:is(:hover, :focus-visible) {
  opacity: 0.8;
  transform: translateY(-2px);
}

.hero-menu a:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 5px;
}

.hero-story-copy {
  position: absolute;
  inset: 18% 0 8%;
  padding-inline: var(--hero-edge);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.hero-story-copy h1 {
  margin: 0;
}

.hero-story-copy h1 span {
  display: block;
}

.hero-story-copy p {
  margin: clamp(30px, 7vh, 30px) 0 10px;
}

.hero-cta {
  margin: clamp(12px, 1.8vh, 20px) 0 0;
}

@media (max-width: 1250px) {
  .home-banner {
    grid-template-columns: 60% 40%;
  }

  .atlas-category--heart,
  .atlas-category--beauty {
    right: 2%;
  }

  .hero-menu {
    gap: 16px;
  }
}

@media (max-width: 1023px) {
  .home-banner {
    --hero-edge: var(--page-gutter-mobile);
    display: flex;
    height: auto;
    min-height: 100svh;
    overflow: visible;
    flex-direction: column;
  }

  .home-banner__atlas {
    min-height: 64svh;
    order: 1;
  }

  .home-banner__plate {
    object-position: center;
  }

  .atlas-brand,
  .atlas-legend,
  .atlas-caption,
  .hero-menu {
    display: none;
  }

  .atlas-category {
    gap: 8px;
    padding: 7px;
  }

  .atlas-category--body {
    top: 26%;
    left: 8%;
  }

  .atlas-category--heart {
    top: 29%;
    right: 4%;
  }

  .atlas-category--life {
    bottom: 21%;
    left: 8%;
  }

  .atlas-category--beauty {
    right: 4%;
    bottom: 18%;
  }

  .atlas-category__marker {
    width: 34px;
    height: 34px;
  }

  .atlas-category__marker i {
    width: 7px;
    height: 7px;
    border-width: 3px;
  }

  .atlas-category__copy strong {
    font-size: var(--type-body-size);
    line-height: var(--type-body-leading);
    letter-spacing: var(--type-body-tracking);
  }

  .atlas-category__copy small {
    display: none;
  }

  .home-banner__story {
    order: 2;
  }

  .hero-story-copy {
    position: relative;
    inset: auto;
    padding-top: 50px;
    padding-bottom: 50px;
  }

  .hero-story-copy p {
    margin: 34px 0 0;
  }

  .hero-cta {
    margin: 20px 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atlas-category__marker,
  .atlas-category__marker i,
  .atlas-category,
  .hero-menu a {
    transition: none;
  }
}
</style>
