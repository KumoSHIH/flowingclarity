<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import ArticleRichTextContent from "./ArticleRichTextContent.vue";
import DetailBreadcrumb from "./DetailBreadcrumb.vue";
import type {
  ArticleDetailContent,
  ArticleDetailStatus,
} from "#shared/types/articleDetail";

const props = withDefaults(
  defineProps<{
    content?: ArticleDetailContent;
    status?: ArticleDetailStatus;
  }>(),
  {
    content: undefined,
    status: "ready",
  },
);

const emit = defineEmits<{ retry: [] }>();
const currentSlide = ref(0);
const visibleCount = ref(3);
const hasMovedRelatedArticles = ref(false);
const isEnhanced = ref(false);
const relatedSwipeStart = ref<{ x: number; y: number }>();

const relatedCount = computed(() => props.content?.relatedArticles.length ?? 0);
const maxSlide = computed(() =>
  Math.max(0, relatedCount.value - visibleCount.value),
);
const trackStyle = computed(() => ({
  "--visible": String(visibleCount.value),
  transform: isEnhanced.value
    ? `translateX(calc(-${currentSlide.value} * (100% + 30px) / ${visibleCount.value}))`
    : undefined,
}));
const liveMessage = computed(() =>
  hasMovedRelatedArticles.value && relatedCount.value
    ? `目前顯示第 ${currentSlide.value + 1} 篇，共 ${relatedCount.value} 篇`
    : "",
);
const relatedRangeLabel = computed(() => {
  if (!relatedCount.value) return "";
  const start = currentSlide.value + 1;
  const end = Math.min(
    relatedCount.value,
    currentSlide.value + visibleCount.value,
  );
  return `${String(start).padStart(2, "0")}–${String(end).padStart(2, "0")} / ${String(relatedCount.value).padStart(2, "0")}`;
});
const relatedProgressStyle = computed(() => ({
  width: relatedCount.value
    ? `${(visibleCount.value / relatedCount.value) * 100}%`
    : "100%",
  transform: `translateX(${(currentSlide.value / visibleCount.value) * 100}%)`,
}));

function updateVisibleCount() {
  visibleCount.value =
    window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  currentSlide.value = Math.min(currentSlide.value, maxSlide.value);
}

function moveSlide(direction: -1 | 1) {
  currentSlide.value = Math.min(
    maxSlide.value,
    Math.max(0, currentSlide.value + direction),
  );
  hasMovedRelatedArticles.value = true;
}

function isRelatedArticleVisible(index: number) {
  return (
    index >= currentSlide.value &&
    index < currentSlide.value + visibleCount.value
  );
}

function beginRelatedSwipe(event: TouchEvent) {
  const touch = event.touches[0];
  relatedSwipeStart.value = touch
    ? { x: touch.clientX, y: touch.clientY }
    : undefined;
}

function endRelatedSwipe(event: TouchEvent) {
  const start = relatedSwipeStart.value;
  const touch = event.changedTouches[0];
  relatedSwipeStart.value = undefined;
  if (!start || !touch || maxSlide.value === 0) return;

  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) {
    return;
  }
  moveSlide(deltaX > 0 ? -1 : 1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replaceAll("/", ".");
}

onMounted(() => {
  updateVisibleCount();
  isEnhanced.value = true;
  window.addEventListener("resize", updateVisibleCount);
});
onBeforeUnmount(() => window.removeEventListener("resize", updateVisibleCount));
watch(
  () => props.content?.id,
  () => {
    currentSlide.value = 0;
    hasMovedRelatedArticles.value = false;
  },
);
</script>

<template>
  <article class="article-detail" :aria-busy="status === 'loading'">
    <DetailBreadcrumb
      class="article-breadcrumb"
      :items="[
        { label: '首頁', to: '/' },
        { label: '文章分享', to: '/articles' },
        { label: content?.title ?? '文章內容' },
      ]"
    />

    <div v-if="status === 'loading'" class="article-state" role="status">
      <div aria-hidden="true" class="article-state__skeletons">
        <span class="article-state__skeleton article-state__skeleton--title" />
        <span v-for="index in 4" :key="index" class="article-state__skeleton" />
      </div>
      <p>正在整理文章內容…</p>
    </div>

    <div v-else-if="status === 'error'" class="article-state" role="alert">
      <h1>文章內容暫時無法載入</h1>
      <p>請稍後再試一次；文章總覽仍可正常瀏覽。</p>
      <div class="article-state__actions">
        <button type="button" @click="emit('retry')">重新載入</button>
        <NuxtLink to="/articles">返回文章分享</NuxtLink>
      </div>
    </div>

    <div v-else-if="status === 'not-found' || !content" class="article-state">
      <h1>找不到這篇文章</h1>
      <p>文章可能尚未公開、已下架，或網址不正確。</p>
      <NuxtLink to="/articles">返回文章分享</NuxtLink>
    </div>

    <template v-else>
      <header class="article-hero">
        <aside class="article-meta" aria-label="文章資訊">
          <strong>{{ content.category.name }}</strong>
          <ul aria-label="文章標籤">
            <li v-for="tag in content.tags" :key="tag.slug">{{ tag.name }}</li>
          </ul>
          <time :datetime="content.publishedAt">{{
            formatDate(content.publishedAt)
          }}</time>
        </aside>

        <div
          class="article-hero__panel"
          :class="[
            `article-hero__panel--${content.heroStyle}`,
            { 'article-hero__panel--without-cover': !content.coverImage },
          ]"
        >
          <figure v-if="content.coverImage" class="article-hero__media">
            <img
              :src="content.coverImage.src"
              :alt="content.coverImage.alt"
              :width="content.coverImage.width"
              :height="content.coverImage.height"
              decoding="async"
              fetchpriority="high"
              :style="
                content.coverImage.objectPosition
                  ? { objectPosition: content.coverImage.objectPosition }
                  : undefined
              "
            />
          </figure>
          <div class="article-hero__copy">
            <h1>{{ content.title }}</h1>
            <p>{{ content.excerpt }}</p>
          </div>
        </div>
      </header>

      <div class="article-body">
        <template v-for="section in content.body" :key="section.key">
          <section
            v-if="section.type === 'richTextSection'"
            class="article-section article-section--text"
          >
            <h2 v-if="section.heading">{{ section.heading }}</h2>
            <ArticleRichTextContent :content="section.content" />
          </section>

          <section
            v-else-if="section.type === 'splitMediaSection'"
            class="article-section article-section--split"
            :class="`article-section--media-${section.mediaSide}`"
          >
            <figure>
              <img
                :src="section.image.src"
                :alt="section.image.alt"
                :width="section.image.width"
                :height="section.image.height"
                decoding="async"
                loading="lazy"
                :style="
                  section.image.objectPosition
                    ? { objectPosition: section.image.objectPosition }
                    : undefined
                "
              />
            </figure>
            <div>
              <h2 v-if="section.heading">{{ section.heading }}</h2>
              <ArticleRichTextContent :content="section.content" />
            </div>
          </section>

          <figure v-else class="article-wide-image">
            <img
              :src="section.image.src"
              :alt="section.image.alt"
              :width="section.image.width"
              :height="section.image.height"
              decoding="async"
              loading="lazy"
              :style="
                section.image.objectPosition
                  ? { objectPosition: section.image.objectPosition }
                  : undefined
              "
            />
            <figcaption v-if="section.caption">
              {{ section.caption }}
            </figcaption>
          </figure>
        </template>
      </div>

      <section
        v-if="content.relatedArticles.length"
        class="article-related"
        :class="{ 'article-related--enhanced': isEnhanced }"
        aria-labelledby="article-related-title"
      >
        <header>
          <h2 id="article-related-title">延伸閱讀</h2>
          <div v-if="isEnhanced && maxSlide > 0" class="article-related__tools">
            <span class="article-related__position" aria-hidden="true">
              {{ relatedRangeLabel }}
            </span>
            <div class="article-related__controls">
              <button
                type="button"
                aria-label="上一篇相關文章"
                aria-controls="article-related-track"
                :disabled="currentSlide === 0"
                @click="moveSlide(-1)"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M14.5 5 7.5 12l7 7" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="下一篇相關文章"
                aria-controls="article-related-track"
                :disabled="currentSlide === maxSlide"
                @click="moveSlide(1)"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m9.5 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
        <div
          class="article-related__viewport"
          @touchstart.passive="beginRelatedSwipe"
          @touchend.passive="endRelatedSwipe"
          @touchcancel="relatedSwipeStart = undefined"
        >
          <ul
            id="article-related-track"
            class="article-related__track"
            :style="trackStyle"
          >
            <li
              v-for="(article, index) in content.relatedArticles"
              :key="article.id"
              :aria-hidden="
                isEnhanced && !isRelatedArticleVisible(index)
                  ? 'true'
                  : undefined
              "
            >
              <NuxtLink
                class="article-related__link"
                :to="`/articles/${article.slug}`"
                :tabindex="
                  isEnhanced && !isRelatedArticleVisible(index) ? -1 : undefined
                "
              >
                <span class="article-related__media">
                  <img
                    :src="article.coverImage.src"
                    :alt="article.coverImage.alt"
                    :width="article.coverImage.width"
                    :height="article.coverImage.height"
                    decoding="async"
                    loading="lazy"
                  />
                </span>
                <small>{{ article.category.name }}</small>
                <h3>{{ article.title }}</h3>
                <p>{{ article.excerpt }}</p>
                <span class="article-related__action">
                  閱讀文章
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m9.5 5 7 7-7 7" />
                  </svg>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div
          v-if="isEnhanced && maxSlide > 0"
          class="article-related__progress"
          aria-hidden="true"
        >
          <span :style="relatedProgressStyle" />
        </div>
      </section>

      <aside v-if="content.prototypeNotice" class="article-prototype-notice">
        {{ content.prototypeNotice }}
      </aside>
    </template>
  </article>
</template>

<style scoped>
.article-detail {
  --article-edge: clamp(28px, 6vw, 116px);
  --article-section-gap: 96px;
  min-height: 70vh;
  overflow: clip;
  color: var(--color-ink);
  background: var(--color-paper);
}
.article-hero {
  display: grid;
  grid-template-columns: minmax(230px, 24%) minmax(0, 1fr);
  gap: clamp(36px, 5vw, 84px);
  padding: 0 var(--article-edge) 58px;
}
.article-meta {
  display: flex;
  min-height: 510px;
  flex-direction: column;
  padding: 42px 34px;
  background: var(--color-sand);
}
.article-meta strong {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
}
.article-meta ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 36px 0 0;
  list-style: none;
}
.article-meta li {
  padding: 7px 10px;
  border: 1px solid rgb(56 52 46 / 24%);
  color: #745142;
  font-size: 12px;
}
.article-meta time {
  margin-top: auto;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.article-hero__panel {
  position: relative;
  min-width: 0;
  min-height: 510px;
}
.article-hero__media {
  min-width: 0;
  margin: 0;
}
.article-hero__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.article-hero__copy h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--detail-hero-title-size);
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: 0.025em;
  text-wrap: balance;
}
.article-hero__copy p {
  max-width: 48em;
  margin: 28px 0 0;
  font-size: var(--detail-summary-size);
  line-height: 2;
  letter-spacing: 0.035em;
}
.article-hero__panel--overlay {
  display: grid;
  align-items: end;
  overflow: hidden;
}
.article-hero__panel--overlay::after {
  position: absolute;
  inset: 0;
  background: rgb(20 13 9 / 48%);
  content: "";
}
.article-hero__panel--overlay .article-hero__media {
  position: absolute;
  inset: 0;
}
.article-hero__panel--overlay .article-hero__copy {
  position: relative;
  z-index: 1;
  width: min(760px, 78%);
  padding: clamp(42px, 6vw, 88px);
  color: var(--color-warm-white);
}
.article-hero__panel--overlay .article-hero__copy p {
  color: rgb(247 246 244 / 88%);
}
.article-hero__panel--split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 38%);
  align-items: center;
  gap: clamp(36px, 5vw, 74px);
}
.article-hero__panel--split .article-hero__media {
  height: 510px;
  order: 2;
}
.article-hero__panel--split .article-hero__copy {
  padding-block: 42px;
}
.article-hero__panel--without-cover {
  grid-template-columns: 1fr;
}
.article-hero__panel--without-cover .article-hero__copy {
  max-width: 880px;
}
.article-body {
  display: grid;
  gap: var(--article-section-gap);
  padding: 0 var(--article-edge) 94px;
}
.article-section {
  min-width: 0;
}
.article-section h2 {
  max-width: 18em;
  margin: 0 0 26px;
  font-family: var(--font-display);
  font-size: var(--detail-section-title-size);
  font-weight: 400;
  line-height: 1.4;
}
.article-section h3 {
  margin: 34px 0 12px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
}
.article-section p,
.article-section li {
  color: #625a51;
  font-size: var(--detail-body-size);
  line-height: 2.1;
  letter-spacing: 0.025em;
}
.article-section p {
  margin: 0;
}
.article-section p + p {
  margin-top: 0;
}
.article-section ul,
.article-section ol {
  padding-left: 1.3em;
  margin: 24px 0 0;
}
.article-section--text {
  width: min(68ch, 68%);
  margin-left: 27%;
}
.article-section--split {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
  align-items: center;
  gap: clamp(48px, 7vw, 110px);
}
.article-section--split figure {
  width: calc(100% + var(--article-edge));
  height: 500px;
  margin: 0 0 0 calc(var(--article-edge) * -1);
}
.article-section--split figure img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.article-section--media-end figure {
  grid-column: 2;
  width: calc(100% + var(--article-edge));
  margin: 0 calc(var(--article-edge) * -1) 0 0;
}
.article-section--media-end > div {
  grid-column: 1;
  grid-row: 1;
}
.article-wide-image {
  margin: 0 calc(var(--article-edge) * -1);
}
.article-wide-image img {
  display: block;
  width: 100%;
  max-height: 720px;
  object-fit: cover;
}
.article-wide-image figcaption {
  padding: 12px var(--article-edge) 0;
  color: #745142;
  font-size: 12px;
  line-height: 1.7;
}
.article-related {
  padding: 88px var(--article-edge) 108px;
}
.article-related > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 38px;
}
.article-related h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--detail-section-title-size);
  font-weight: 400;
}
.article-related__tools {
  display: flex;
  align-items: center;
  gap: 18px;
}
.article-related__position {
  color: #745142;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.article-related__controls {
  display: flex;
  gap: 8px;
}
.article-related__controls button {
  display: inline-grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgb(56 52 46 / 35%);
  color: inherit;
  background: transparent;
  cursor: pointer;
  transition:
    color 220ms ease,
    background-color 220ms ease,
    transform 140ms ease;
}
.article-related__controls svg,
.article-related__action svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: square;
  stroke-linejoin: miter;
  stroke-width: 1.5;
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}
.article-related__controls button:focus-visible,
.article-related__link:focus-visible {
  outline: 2px solid var(--color-clay);
  outline-offset: 5px;
}
.article-related__controls button:not(:disabled):active {
  transform: scale(0.94);
}
.article-related__controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.article-related__viewport {
  overflow: visible;
}
.article-related__track {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.article-related--enhanced .article-related__viewport {
  overflow: clip;
}
.article-related--enhanced .article-related__track {
  display: flex;
  grid-template-columns: none;
  transition: transform 1500ms cubic-bezier(0.22, 1, 0.36, 1);
}
.article-related--enhanced .article-related__track > li {
  min-width: calc((100% - (var(--visible) - 1) * 30px) / var(--visible));
  flex: 0 0 calc((100% - (var(--visible) - 1) * 30px) / var(--visible));
}
.article-related__link {
  display: grid;
  color: inherit;
  text-decoration: none;
}
.article-related__media {
  display: block;
  overflow: hidden;
  background: #ded3c4;
}
.article-related img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition:
    filter 420ms ease,
    transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}
.article-related small {
  margin-top: 18px;
  color: #745142;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.article-related h3 {
  margin: 10px 0 0;
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 400;
  line-height: 1.55;
  transition: color 220ms ease;
}
.article-related a > p {
  display: -webkit-box;
  min-height: 67px;
  margin: 14px 0 0;
  overflow: hidden;
  color: #625a51;
  font-size: 15px;
  line-height: 2.1;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.article-related__action {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  gap: 18px;
  width: max-content;
  margin-top: 18px;
  border-bottom: 1px solid currentcolor;
  font-size: 13px;
  transition:
    color 220ms ease,
    gap 260ms cubic-bezier(0.16, 1, 0.3, 1);
}
.article-related__progress {
  height: 2px;
  margin-top: 38px;
  overflow: hidden;
  background: rgb(116 81 66 / 20%);
}
.article-related__progress span {
  display: block;
  height: 100%;
  background: var(--color-clay);
  transform-origin: left;
  transition: transform 1500ms cubic-bezier(0.22, 1, 0.36, 1);
}
.article-related b {
  font-weight: 400;
}
.article-related__link:focus-visible img {
  filter: saturate(1.06) contrast(1.025);
  transform: scale(1.035);
}
.article-related__link:focus-visible h3,
.article-related__link:focus-visible .article-related__action {
  color: var(--color-clay);
}
.article-related__link:focus-visible .article-related__action {
  gap: 24px;
}
.article-related__link:focus-visible .article-related__action svg {
  transform: translateX(4px);
}
@media (hover: hover) and (pointer: fine) {
  .article-related__controls button:not(:disabled):hover {
    color: var(--color-warm-white);
    background: var(--color-bark);
  }
  .article-related__controls button:first-child:not(:disabled):hover svg {
    transform: translateX(-2px);
  }
  .article-related__controls button:last-child:not(:disabled):hover svg {
    transform: translateX(2px);
  }
  .article-related__link:hover img {
    filter: saturate(1.06) contrast(1.025);
    transform: scale(1.035);
  }
  .article-related__link:hover h3,
  .article-related__link:hover .article-related__action {
    color: var(--color-clay);
  }
  .article-related__link:hover .article-related__action {
    gap: 24px;
  }
  .article-related__link:hover .article-related__action svg {
    transform: translateX(4px);
  }
}
.article-prototype-notice {
  padding: 24px var(--article-edge);
  color: var(--color-warm-white);
  background: var(--color-bark);
  font-size: 12px;
  line-height: 1.8;
}
.article-state {
  display: grid;
  min-height: 64vh;
  place-content: center;
  justify-items: start;
  gap: 18px;
  padding: 80px var(--article-edge);
}
.article-state h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 400;
}
.article-state p {
  max-width: 42em;
  margin: 0;
  color: #625a51;
  line-height: 2;
}
.article-state__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.article-state :is(button, a) {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  padding: 0 22px;
  border: 1px solid var(--color-ink);
  color: inherit;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
}
.article-state__skeleton {
  display: block;
  width: min(620px, 75vw);
  height: 12px;
  background: color-mix(in srgb, var(--color-bark) 30%, transparent);
  animation: article-pulse 1.6s ease-in-out infinite;
}
.article-state__skeletons {
  display: grid;
  gap: 18px;
}
.article-state__skeleton--title {
  width: min(460px, 65vw);
  height: 48px;
}
@keyframes article-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 1023px) {
  .article-detail {
    --article-edge: 24px;
    --article-section-gap: 64px;
  }
  .article-hero {
    grid-template-columns: 1fr;
    gap: 18px;
    padding-bottom: 48px;
  }
  .article-meta {
    display: grid;
    min-height: 112px;
    grid-template-columns: 1fr auto;
    align-items: start;
    padding: 18px 20px;
  }
  .article-meta strong {
    font-size: 24px;
  }
  .article-meta ul {
    justify-content: end;
    margin: 0;
  }
  .article-meta time {
    grid-column: 2;
    margin-top: 10px;
    text-align: right;
  }
  .article-hero__panel {
    min-height: 0;
  }
  .article-hero__panel--overlay {
    min-height: 520px;
  }
  .article-hero__panel--overlay .article-hero__copy {
    width: 100%;
    padding: 36px 24px;
  }
  .article-hero__panel--split {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .article-hero__panel--split .article-hero__media {
    grid-row: 2;
    width: calc(100% + 48px);
    height: 360px;
    margin-left: -24px;
    order: initial;
  }
  .article-hero__panel--split .article-hero__copy {
    grid-row: 1;
    padding: 28px 0 0;
  }
  .article-hero__copy h1 {
    font-size: var(--detail-hero-title-size);
  }
  .article-body {
    padding-bottom: 72px;
  }
  .article-section--text {
    width: min(100%, 68ch);
    margin-left: 0;
  }
  .article-section--split {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .article-section--split figure,
  .article-section--media-end figure {
    grid-column: 1;
    grid-row: 1;
    width: calc(100% + 24px);
    height: 320px;
    margin: 0 0 0 -24px;
  }
  .article-section--media-end figure {
    margin: 0 -24px 0 0;
    justify-self: end;
  }
  .article-section--split > div,
  .article-section--media-end > div {
    grid-column: 1;
    grid-row: 2;
  }
  .article-wide-image {
    margin-inline: -24px;
  }
  .article-related {
    padding: 72px 24px 88px;
  }
  .article-related__track {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .article-related h2,
  .article-section h2 {
    font-size: var(--detail-section-title-size);
  }
}

@media (max-width: 560px) {
  .article-hero__copy h1 {
    font-size: 42px;
  }
  .article-related h3 {
    font-size: 23px;
  }
  .article-related__position {
    display: none;
  }
  .article-related__track {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-related--enhanced .article-related__track,
  .article-related__controls button,
  .article-related__controls svg,
  .article-related img,
  .article-related h3,
  .article-related__action,
  .article-related__action svg,
  .article-related__progress span {
    transition: none;
  }
  .article-related__controls button:not(:disabled):active,
  .article-related__controls button:not(:disabled):hover svg,
  .article-related__link:hover img,
  .article-related__link:focus-visible img,
  .article-related__link:hover .article-related__action svg,
  .article-related__link:focus-visible .article-related__action svg {
    transform: none;
  }
  .article-related__link:hover .article-related__action,
  .article-related__link:focus-visible .article-related__action {
    gap: 18px;
  }
  .article-state__skeleton {
    animation: none;
  }
}
</style>
