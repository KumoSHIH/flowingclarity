<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoseAtlasAnimation } from "../composables/useRoseAtlasAnimation";

import {
  fallbackHomeBanner,
  parseHomeBanner,
  type HomeBannerContent,
} from "#shared/utils/homeBanner";

const props = defineProps<{ banner?: HomeBannerContent | null }>();
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

      <a class="atlas-brand" href="#course-map" aria-label="普那生活空間首頁">
        <span>普那生活空間</span>
        <small>FLOWING CLARITY</small>
      </a>

      <p class="atlas-caption atlas-caption--bottom-right" aria-hidden="true">
        A LEARNING SPACE<br />FOR BODY, MIND AND LIFE
      </p>

      <div class="atlas-categories" aria-label="課程類別">
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="atlas-category"
          :class="[
            `atlas-category--${category.id}`,
            { 'is-active': activeCategoryId === category.id },
          ]"
          :aria-pressed="activeCategoryId === category.id"
          @click="selectCategory(category.id, $event)"
        >
          <span class="atlas-category__marker" aria-hidden="true"><i /></span>
          <span class="atlas-category__copy">
            <strong>{{ category.title }}</strong>
            <small>{{ category.courses.join("、") }}</small>
          </span>
        </button>
      </div>
    </div>

    <div class="home-banner__story">
      <nav class="hero-menu" aria-label="首頁主要選單">
        <a href="#courses">近期課程</a>
        <a href="#course-map">課程探索</a>
        <a href="#articles">文章分享</a>
        <a href="#contact">個案諮詢</a>
      </nav>

      <div class="hero-story-copy">
        <h1 id="hero-title" class="display-title">
          <span v-for="(line, index) in titleLines" :key="index">{{
            line
          }}</span>
        </h1>
        <p class="lead-text lead-text--inverse">{{ content.summary }}</p>
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
  display: grid;
  grid-template-columns: 65% 35%;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  min-height: 680px;
  overflow: hidden;
  background: #f8bf4c;
}

.home-banner__atlas {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  color: #25180f;
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
  position: absolute;
  top: 4.2%;
  left: 4.1%;
  z-index: 3;
  display: grid;
  color: inherit;
  text-decoration: none;
}

.atlas-brand span {
  font-size: clamp(31px, 2.6vw, 41px);
  font-weight: 400;
  letter-spacing: 0.16em;
  line-height: 1;
}

.atlas-brand small {
  margin-top: 10px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.42em;
}

.atlas-legend,
.atlas-caption {
  position: absolute;
  z-index: 2;
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.7;
  letter-spacing: 0.25em;
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
  bottom: 5.5%;
  left: 4.7%;
}

.atlas-caption--bottom-right {
  right: 5%;
  bottom: 5.5%;
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
  color: #25180f;
  background: transparent;
  border: 0;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: color 180ms ease;
}

.atlas-category:is(:hover, :focus-visible) {
  color: #fff;
}

.atlas-category--body {
  top: 23%;
  left: 26%;
}
.atlas-category--heart {
  top: 24%;
  right: 5%;
}
.atlas-category--life {
  bottom: 23%;
  left: 22%;
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
  border: 1px solid color-mix(in srgb, #25180f 68%, transparent);
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
  background: #25180f61;
  border: 4px solid #f7f6f4;
  border-radius: 50%;
  box-sizing: content-box;
}

.atlas-category__copy {
  display: grid;
  gap: 4px;
}

.atlas-category__copy strong {
  font-size: clamp(22px, 2.2vw, 36px);
  line-height: 1;
  letter-spacing: 0.06em;
}

.atlas-category__copy small {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.home-banner__story {
  position: relative;
  min-width: 0;
  min-height: 0;
  color: #f7f6f4;
  background: #392618;
}

.hero-menu {
  position: absolute;
  top: 4.8%;
  right: clamp(28px, 3vw, 48px);
  z-index: 2;
  display: grid;
  justify-items: end;
  gap: 19px;
}

.hero-menu a {
  color: inherit;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.12em;
  transition: color 180ms ease;
}

.hero-menu a:hover {
  color: #f8bf4c;
}

.hero-story-copy {
  position: absolute;
  inset: 31% 0 8%;
  padding-inline: clamp(28px, 3vw, 48px);
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

@media (min-width: 1024px) and (max-width: 1180px) {
  .hero-story-copy h1 {
    font-size: clamp(50px, 6vw, 72px);
  }
}

@media (max-width: 1180px) {
  .home-banner {
    grid-template-columns: 62% 38%;
  }

  .atlas-category--heart,
  .atlas-category--beauty {
    right: 2%;
  }
}

@media (max-width: 1023px) {
  .home-banner {
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
    font-size: 16px;
    letter-spacing: 0.04em;
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
  .atlas-category,
  .hero-menu a {
    transition: none;
  }
}
</style>
