<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { RelatedArticleItem } from "#shared/types/articleDetail";

const props = withDefaults(defineProps<{
  items: RelatedArticleItem[];
  title?: string;
  idBase?: string;
}>(), {
  title: "延伸閱讀",
  idBase: "related-articles",
});

const currentSlide = ref(0);
const visibleCount = ref(3);
const hasMoved = ref(false);
const isEnhanced = ref(false);
const swipeStart = ref<{ x: number; y: number }>();
const maxSlide = computed(() => Math.max(0, props.items.length - visibleCount.value));
const trackStyle = computed(() => ({
  "--visible": String(visibleCount.value),
  transform: isEnhanced.value
    ? `translateX(calc(-${currentSlide.value} * (100% + 30px) / ${visibleCount.value}))`
    : undefined,
}));
const liveMessage = computed(() => hasMoved.value && props.items.length
  ? `目前顯示第 ${currentSlide.value + 1} 篇，共 ${props.items.length} 篇`
  : "",
);
const rangeLabel = computed(() => {
  if (!props.items.length) return "";
  const start = currentSlide.value + 1;
  const end = Math.min(props.items.length, currentSlide.value + visibleCount.value);
  return `${String(start).padStart(2, "0")}–${String(end).padStart(2, "0")} / ${String(props.items.length).padStart(2, "0")}`;
});
const progressStyle = computed(() => ({
  width: props.items.length ? `${(visibleCount.value / props.items.length) * 100}%` : "100%",
  transform: `translateX(${(currentSlide.value / visibleCount.value) * 100}%)`,
}));

function updateVisibleCount() {
  visibleCount.value = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  currentSlide.value = Math.min(currentSlide.value, maxSlide.value);
}

function move(direction: -1 | 1) {
  currentSlide.value = Math.min(maxSlide.value, Math.max(0, currentSlide.value + direction));
  hasMoved.value = true;
}

function isVisible(index: number) {
  return index >= currentSlide.value && index < currentSlide.value + visibleCount.value;
}

function beginSwipe(event: TouchEvent) {
  const touch = event.touches[0];
  swipeStart.value = touch ? { x: touch.clientX, y: touch.clientY } : undefined;
}

function endSwipe(event: TouchEvent) {
  const start = swipeStart.value;
  const touch = event.changedTouches[0];
  swipeStart.value = undefined;
  if (!start || !touch || maxSlide.value === 0) return;
  const deltaX = touch.clientX - start.x;
  const deltaY = touch.clientY - start.y;
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
  move(deltaX > 0 ? -1 : 1);
}

onMounted(() => {
  updateVisibleCount();
  isEnhanced.value = true;
  window.addEventListener("resize", updateVisibleCount);
});
onBeforeUnmount(() => window.removeEventListener("resize", updateVisibleCount));
watch(() => props.items.map(item => item.id).join("|"), () => {
  currentSlide.value = 0;
  hasMoved.value = false;
}, { flush: "sync" });
</script>

<template>
  <section
    v-if="items.length"
    class="article-related"
    :class="{ 'article-related--enhanced': isEnhanced }"
    :aria-labelledby="`${idBase}-title`"
  >
    <header>
      <h2 :id="`${idBase}-title`" class="type-title-md">{{ title }}</h2>
      <div v-if="isEnhanced && maxSlide > 0" class="article-related__tools">
        <span class="article-related__position type-label" aria-hidden="true">{{ rangeLabel }}</span>
        <div class="article-related__controls">
          <button type="button" aria-label="上一篇相關文章" :aria-controls="`${idBase}-track`" :disabled="currentSlide === 0" @click="move(-1)">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14.5 5 7.5 12l7 7" /></svg>
          </button>
          <button type="button" aria-label="下一篇相關文章" :aria-controls="`${idBase}-track`" :disabled="currentSlide === maxSlide" @click="move(1)">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9.5 5 7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </header>
    <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
    <div class="article-related__viewport" @touchstart.passive="beginSwipe" @touchend.passive="endSwipe" @touchcancel="swipeStart = undefined">
      <ul :id="`${idBase}-track`" class="article-related__track" :style="trackStyle">
        <li v-for="(article, index) in items" :key="article.id" :aria-hidden="isEnhanced && !isVisible(index) ? 'true' : undefined">
          <NuxtLink class="article-related__link" :to="`/articles/${article.slug}`" :tabindex="isEnhanced && !isVisible(index) ? -1 : undefined">
            <span class="article-related__media">
              <img :src="article.coverImage.src" :alt="article.coverImage.alt" :width="article.coverImage.width" :height="article.coverImage.height" decoding="async" loading="lazy">
            </span>
            <small class="type-label">{{ article.category.name }}</small>
            <h3 class="type-title-sm">{{ article.title }}</h3>
            <p class="type-body">{{ article.excerpt }}</p>
            <span class="article-related__action type-label">閱讀文章<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9.5 5 7 7-7 7" /></svg></span>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div v-if="isEnhanced && maxSlide > 0" class="article-related__progress" aria-hidden="true"><span :style="progressStyle" /></div>
  </section>
</template>

<style scoped>
.article-related { padding: var(--related-section-block, 88px) var(--related-edge, clamp(28px, 6vw, 116px)); color: var(--color-ink); background: var(--color-paper); }
.article-related > header { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 38px; }
.article-related h2 { margin: 0; }
.article-related__tools, .article-related__controls { display: flex; align-items: center; }.article-related__tools { gap: 18px; }.article-related__controls { gap: 8px; }
.article-related__position { color: #745142; font-variant-numeric: tabular-nums; }
.article-related__controls button { display: inline-grid; width: 48px; height: 48px; place-items: center; border: 1px solid rgb(56 52 46 / 35%); color: inherit; background: transparent; cursor: pointer; transition: color 220ms ease, background-color 220ms ease, transform 140ms ease; }
.article-related__controls svg, .article-related__action svg { width: 20px; height: 20px; fill: none; stroke: currentcolor; stroke-linecap: square; stroke-linejoin: miter; stroke-width: 1.5; transition: transform 260ms cubic-bezier(.16, 1, .3, 1); }
.article-related__controls button:focus-visible, .article-related__link:focus-visible { outline: 2px solid var(--color-clay); outline-offset: 5px; }
.article-related__controls button:not(:disabled):active { transform: scale(.94); }.article-related__controls button:disabled { opacity: .35; cursor: not-allowed; }
.article-related__viewport { overflow: visible; }.article-related__track { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px; padding: 0; margin: 0; list-style: none; }
.article-related--enhanced .article-related__viewport { overflow: clip; }.article-related--enhanced .article-related__track { display: flex; grid-template-columns: none; transition: transform 1500ms cubic-bezier(.22, 1, .36, 1); }
.article-related--enhanced .article-related__track > li { min-width: calc((100% - (var(--visible) - 1) * 30px) / var(--visible)); flex: 0 0 calc((100% - (var(--visible) - 1) * 30px) / var(--visible)); }
.article-related__link { display: grid; color: inherit; text-decoration: none; }.article-related__media { display: block; overflow: hidden; background: #ded3c4; }
.article-related img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; transition: filter 420ms ease, transform 420ms cubic-bezier(.16, 1, .3, 1); }
.article-related small { margin-top: 18px; color: #745142; }
.article-related h3 { margin: 10px 0 0; transition: color 220ms ease; }
.article-related a > p { display: -webkit-box; min-height: 67px; margin: 14px 0 0; overflow: hidden; color: #625a51; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.article-related__action { display: inline-flex; min-height: 48px; align-items: center; gap: 18px; width: max-content; margin-top: 18px; border-bottom: 1px solid currentcolor; transition: color 220ms ease, gap 260ms cubic-bezier(.16, 1, .3, 1); }
.article-related__progress { height: 2px; margin-top: 38px; overflow: hidden; background: rgb(116 81 66 / 20%); }.article-related__progress span { display: block; height: 100%; background: var(--color-clay); transform-origin: left; transition: transform 1500ms cubic-bezier(.22, 1, .36, 1); }
.article-related__link:focus-visible img { filter: saturate(1.06) contrast(1.025); transform: scale(1.035); }.article-related__link:focus-visible :is(h3, .article-related__action) { color: var(--interactive-title-hover); }.article-related__link:focus-visible .article-related__action { gap: 24px; }.article-related__link:focus-visible .article-related__action svg { transform: translateX(4px); }
@media (hover: hover) and (pointer: fine) {
  .article-related__controls button:not(:disabled):hover { color: var(--color-warm-white); background: var(--color-bark); }
  .article-related__controls button:first-child:not(:disabled):hover svg { transform: translateX(-2px); }.article-related__controls button:last-child:not(:disabled):hover svg { transform: translateX(2px); }
  .article-related__link:hover img { filter: saturate(1.06) contrast(1.025); transform: scale(1.035); }.article-related__link:hover :is(h3, .article-related__action) { color: var(--interactive-title-hover); }.article-related__link:hover .article-related__action { gap: 24px; }.article-related__link:hover .article-related__action svg { transform: translateX(4px); }
}
@media (max-width: 1023px) { .article-related { padding: var(--related-section-block, 72px) var(--related-edge, var(--page-gutter-mobile)); }.article-related__track { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .article-related__position { display: none; }.article-related__track { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) {
  .article-related--enhanced .article-related__track, .article-related__controls button, .article-related__controls svg, .article-related img, .article-related h3, .article-related__action, .article-related__action svg, .article-related__progress span { transition: none; }
  .article-related__controls button:not(:disabled):active, .article-related__controls button:not(:disabled):hover svg, .article-related__link:hover img, .article-related__link:focus-visible img, .article-related__link:hover .article-related__action svg, .article-related__link:focus-visible .article-related__action svg { transform: none; }
  .article-related__link:hover .article-related__action, .article-related__link:focus-visible .article-related__action { gap: 18px; }
}
</style>
