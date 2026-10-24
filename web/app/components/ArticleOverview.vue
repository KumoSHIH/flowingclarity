<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import type {
  ArticleCategoryKey,
  ArticleFilters,
  ArticleOverviewContent,
  ArticleOverviewStatus,
} from "#shared/types/articles";
import {
  filterArticles,
  getArticlePaginationItems,
  getArticlePath,
  getArticlesPath,
  paginateArticles,
} from "#shared/utils/articles";

const props = withDefaults(
  defineProps<{
    content: ArticleOverviewContent;
    status?: ArticleOverviewStatus;
    category?: ArticleCategoryKey;
    tags?: string[];
    page?: number;
  }>(),
  {
    status: "ready",
    category: undefined,
    tags: () => [],
    page: 1,
  },
);

const emit = defineEmits<{
  navigate: [filters: ArticleFilters, page: number];
  normalize: [filters: ArticleFilters, page: number];
  retry: [];
}>();

const resultsHeading = ref<HTMLElement | null>(null);
const mounted = ref(false);
const orderedCategories = computed(() =>
  props.content.categories.toSorted(
    (first, second) => first.order - second.order,
  ),
);
const categoryLabels = computed(
  () =>
    new Map(
      props.content.categories.map((category) => [category.key, category.name]),
    ),
);
const publishedArticles = computed(() =>
  filterArticles(props.content.articles, {
    category: undefined,
    tags: [],
  }),
);
const usedTagSlugs = computed(
  () => new Set(publishedArticles.value.flatMap((article) => article.tagSlugs)),
);
const orderedTags = computed(() =>
  props.content.tags
    .filter((tag) => usedTagSlugs.value.has(tag.slug))
    .toSorted(
      (first, second) =>
        first.order - second.order ||
        first.name.localeCompare(second.name, "zh-Hant") ||
        first.slug.localeCompare(second.slug),
    ),
);
const tagLabels = computed(
  () => new Map(props.content.tags.map((tag) => [tag.slug, tag.name])),
);
const filters = computed<ArticleFilters>(() => ({
  category: props.category,
  tags: props.tags,
}));
const filteredArticles = computed(() =>
  filterArticles(props.content.articles, filters.value),
);
const pagination = computed(() =>
  paginateArticles(filteredArticles.value, props.page),
);
const paginationItems = computed(() =>
  getArticlePaginationItems(
    pagination.value.currentPage,
    pagination.value.totalPages,
  ),
);
const hasFilters = computed(
  () => Boolean(props.category) || props.tags.length > 0,
);

function selectCategory(event: MouseEvent, category?: ArticleCategoryKey) {
  event.preventDefault();
  emit("navigate", { category, tags: props.tags }, 1);
}

function toggleTag(slug: string) {
  const next = new Set(props.tags);
  next.has(slug) ? next.delete(slug) : next.add(slug);
  emit("navigate", { category: props.category, tags: [...next] }, 1);
}

function clearTags() {
  emit("navigate", { category: props.category, tags: [] }, 1);
}

function clearAll() {
  emit("navigate", { category: undefined, tags: [] }, 1);
}

function navigatePage(event: MouseEvent, page: number) {
  event.preventDefault();
  emit("navigate", filters.value, page);
}

function categoryName(key: ArticleCategoryKey): string {
  return categoryLabels.value.get(key) ?? key;
}

function tagName(slug: string): string {
  return tagLabels.value.get(slug) ?? slug;
}

function formatDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : value;
}

watch(
  () => [props.page, props.category, props.tags.join(",")] as const,
  async () => {
    if (!mounted.value) return;
    await nextTick();
    resultsHeading.value?.focus({ preventScroll: true });
  },
);

watch(
  () => [pagination.value.currentPage, props.page] as const,
  ([currentPage, requestedPage]) => {
    if (currentPage !== requestedPage)
      emit("normalize", filters.value, currentPage);
  },
  { immediate: true },
);

onMounted(() => {
  mounted.value = true;
});
</script>

<template>
  <div class="article-directory">
    <header class="article-hero">
      <div class="article-hero__identity">
        <h1>{{ content.pageTitle }}</h1>
        <p>{{ content.intro }}</p>
      </div>
      <p class="article-hero__eyebrow" aria-hidden="true">閱讀與覺察</p>
    </header>

    <nav class="article-categories" aria-label="文章主要分類">
      <a
        :href="getArticlesPath({ category: undefined, tags }, 1)"
        :aria-current="!category ? 'page' : undefined"
        @click="selectCategory($event)"
      >
        {{ content.allLabel }}
      </a>
      <a
        v-for="option in orderedCategories"
        :key="option.key"
        :href="getArticlesPath({ category: option.key, tags }, 1)"
        :aria-current="category === option.key ? 'page' : undefined"
        @click="selectCategory($event, option.key)"
      >
        {{ option.name }}
      </a>
    </nav>

    <form
      v-if="publishedArticles.length && orderedTags.length"
      class="article-tags"
      aria-label="依相關標籤篩選文章"
      @submit.prevent
    >
      <fieldset>
        <legend>{{ content.tagFilterLabel }}</legend>
        <div class="article-tags__options">
          <label v-for="tag in orderedTags" :key="tag.slug">
            <input
              type="checkbox"
              :checked="tags.includes(tag.slug)"
              @change="toggleTag(tag.slug)"
            />
            <span aria-hidden="true" />
            {{ tag.name }}
          </label>
        </div>
      </fieldset>
      <button
        v-if="tags.length"
        type="button"
        class="article-tags__clear"
        @click="clearTags"
      >
        清除標籤
      </button>
    </form>

    <section
      class="article-results"
      aria-labelledby="article-results-heading"
      :aria-busy="status === 'loading'"
    >
      <header class="article-results__header">
        <h2 id="article-results-heading" ref="resultsHeading" tabindex="-1">
          {{ content.resultsHeading }}
        </h2>
        <p
          v-if="status === 'ready' && publishedArticles.length"
          aria-live="polite"
        >
          共 {{ pagination.totalItems }} 篇文章<span>・每頁 8 篇</span>
        </p>
      </header>

      <div
        v-if="status === 'loading'"
        class="article-state article-state--loading"
        role="status"
      >
        <p>正在整理文章</p>
        <div aria-hidden="true">
          <span v-for="index in 4" :key="index" />
        </div>
      </div>

      <div v-else-if="status === 'error'" class="article-state" role="alert">
        <p>文章暫時無法載入，請稍後再試。</p>
        <button type="button" @click="emit('retry')">重新載入</button>
      </div>

      <div v-else-if="!publishedArticles.length" class="article-state">
        <p>{{ content.emptyMessage }}</p>
      </div>

      <div v-else-if="!pagination.totalItems" class="article-state">
        <p>{{ content.noMatchesMessage }}</p>
        <div class="article-state__actions">
          <button v-if="tags.length" type="button" @click="clearTags">
            清除標籤
          </button>
          <button v-if="category" type="button" @click="clearAll">
            返回全部文章
          </button>
        </div>
      </div>

      <template v-else>
        <ol class="article-list">
          <li
            v-for="article in pagination.items"
            :key="article.id"
            class="article-entry"
          >
            <a :href="getArticlePath(article.slug)" class="article-entry__link">
              <div v-if="article.coverImage" class="article-entry__media">
                <img
                  :src="article.coverImage.src"
                  :alt="article.coverImage.alt"
                  :width="article.coverImage.width"
                  :height="article.coverImage.height"
                  loading="lazy"
                />
              </div>
              <div
                v-else
                class="article-entry__media article-entry__media--missing"
                :class="`article-entry__media--${article.categoryKey}`"
                aria-hidden="true"
              >
                <span />
              </div>

              <div class="article-entry__copy">
                <time :datetime="article.publishedAt">
                  {{ formatDate(article.publishedAt) }}
                </time>
                <p class="article-entry__taxonomy">
                  <span>{{ categoryName(article.categoryKey) }}</span>
                  <span v-for="tag in article.tagSlugs" :key="tag">
                    {{ tagName(tag) }}
                  </span>
                </p>
                <h3>{{ article.title }}</h3>
                <p class="article-entry__excerpt">
                  {{ article.excerpt }}
                </p>
                <span class="article-entry__action" aria-hidden="true">
                  閱讀全文 <b>→</b>
                </span>
              </div>
            </a>
          </li>
        </ol>

        <nav
          v-if="pagination.totalPages > 1"
          class="article-pagination"
          :aria-label="`${content.resultsHeading}分頁`"
        >
          <button v-if="pagination.currentPage === 1" type="button" disabled>
            上一頁
          </button>
          <a
            v-else
            :href="getArticlesPath(filters, pagination.currentPage - 1)"
            rel="prev"
            @click="navigatePage($event, pagination.currentPage - 1)"
            >上一頁</a
          >
          <ol>
            <li
              v-for="(item, index) in paginationItems"
              :key="item === 'ellipsis' ? `ellipsis-${index}` : item"
            >
              <span v-if="item === 'ellipsis'" aria-hidden="true">…</span>
              <span
                v-else-if="item === pagination.currentPage"
                aria-current="page"
              >
                {{ item }}
              </span>
              <a
                v-else
                :href="getArticlesPath(filters, item)"
                :aria-label="`${content.resultsHeading}第 ${item} 頁`"
                @click="navigatePage($event, item)"
                >{{ item }}</a
              >
            </li>
          </ol>
          <button
            v-if="pagination.currentPage === pagination.totalPages"
            type="button"
            disabled
          >
            下一頁
          </button>
          <a
            v-else
            :href="getArticlesPath(filters, pagination.currentPage + 1)"
            rel="next"
            @click="navigatePage($event, pagination.currentPage + 1)"
            >下一頁</a
          >
        </nav>
      </template>
    </section>

    <p v-if="content.prototypeNotice" class="article-directory__notice">
      {{ content.prototypeNotice }}
    </p>
  </div>
</template>

<style scoped>
.article-directory {
  --article-rule: color-mix(in srgb, var(--color-ink) 24%, transparent);
  --article-accent: color-mix(
    in srgb,
    var(--color-clay) 86%,
    var(--color-oxblood)
  );
  --article-muted-text: color-mix(
    in srgb,
    var(--color-muted) 78%,
    var(--color-ink)
  );
  min-height: 100svh;
  padding: clamp(48px, 5.5vw, 84px) clamp(28px, 6vw, 116px) 64px;
  color: var(--color-ink);
  background: var(--color-paper);
}

.article-hero {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 48px;
}

.article-hero__identity {
  display: flex;
  align-items: center;
  gap: clamp(28px, 4vw, 62px);
}

.article-hero h1 {
  flex: 0 0 auto;
  margin: 0;
  color: var(--color-oxblood);
  font-family: var(--font-display);
  font-size: var(--type-title-xl-size);
  font-weight: var(--type-title-xl-weight);
  line-height: var(--type-title-xl-leading);
  letter-spacing: var(--type-title-xl-tracking);
}

.article-hero__identity > p {
  max-width: 33em;
  padding-left: clamp(28px, 3.4vw, 50px);
  margin: 8px 0 0;
  border-left: 1px solid var(--article-rule);
  color: color-mix(in srgb, var(--color-muted) 84%, var(--color-ink));
  font-size: var(--type-lead-size);
  font-weight: var(--type-lead-weight);
  line-height: var(--type-lead-leading);
  letter-spacing: var(--type-lead-tracking);
  white-space: pre-line;
}

.article-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 30px 0 0;
  color: var(--article-muted-text);
  font-family: var(--font-display);
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.article-hero__eyebrow::before {
  width: 96px;
  height: 1px;
  background: var(--article-rule);
  content: "";
}

.article-categories {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-top: clamp(36px, 4.6vw, 66px);
  border-bottom: 1px solid var(--article-rule);
}

.article-categories a {
  position: relative;
  display: inline-flex;
  min-width: 116px;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  padding: 0 clamp(18px, 2vw, 34px);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  text-decoration: none;
}

.article-categories a + a::before {
  position: absolute;
  left: 0;
  width: 1px;
  height: 16px;
  background: var(--article-rule);
  content: "";
}

.article-categories a::after {
  position: absolute;
  right: 18px;
  bottom: -1px;
  left: 18px;
  height: 2px;
  background: var(--article-accent);
  content: "";
  opacity: 0;
}

.article-categories a[aria-current="page"] {
  color: var(--article-accent);
}

.article-categories a[aria-current="page"]::after,
.article-categories a:hover::after,
.article-categories a:focus-visible::after {
  opacity: 1;
}

.article-tags {
  display: flex;
  align-items: stretch;
  margin-top: 22px;
}

.article-tags fieldset {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  padding: 10px 24px;
  margin: 0;
  border: 0;
}

.article-tags legend {
  float: left;
  min-width: 104px;
  padding: 13px 24px 13px 0;
  color: var(--article-muted-text);
  font-family: var(--font-display);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}

.article-tags__options {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px clamp(12px, 2vw, 30px);
}

.article-tags label {
  position: relative;
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 10px;
  color: color-mix(in srgb, var(--color-muted) 88%, var(--color-ink));
  cursor: pointer;
  line-height: 1.45;
}

.article-tags input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.article-tags label > span {
  position: relative;
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  border: 1px solid color-mix(in srgb, var(--color-ink) 54%, transparent);
  background: transparent;
}

.article-tags input:checked + span {
  border-color: var(--article-accent);
  background: var(--article-accent);
}

.article-tags input:checked + span::after {
  position: absolute;
  top: 2px;
  left: 5px;
  width: 5px;
  height: 9px;
  border-right: 2px solid var(--color-paper);
  border-bottom: 2px solid var(--color-paper);
  content: "";
  transform: rotate(45deg);
}

.article-tags input:focus-visible + span {
  outline: var(--control-focus-width) solid var(--color-clay);
  outline-offset: var(--control-focus-offset);
}

.article-tags__clear {
  min-width: 132px;
  min-height: 44px;
  padding: 0 22px;
  color: var(--article-accent);
  background: transparent;
  border: 0;
  border-left: 1px solid var(--article-rule);
  font: inherit;
  letter-spacing: 0.06em;
  cursor: pointer;
}

.article-results {
  margin-top: clamp(34px, 4vw, 58px);
}

.article-results__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.article-results__header h2 {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 20px;
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-md-size);
  font-weight: var(--type-title-md-weight);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}

.article-results__header h2::after {
  height: 1px;
  flex: 1;
  background: var(--article-rule);
  content: "";
}

.article-results__header p {
  margin: 0;
  color: var(--article-muted-text);
  font-family: var(--font-display);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
  white-space: nowrap;
}

.article-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: clamp(58px, 7vw, 104px);
  padding: 34px 0 54px;
  margin: 0;
  list-style: none;
}

.article-list::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: var(--article-rule);
  content: "";
}

.article-entry {
  position: relative;
  width: calc(50% - 45px);
}

.article-entry:nth-child(even) {
  margin-left: calc(50% + 45px);
}

.article-entry::before {
  position: absolute;
  top: 20px;
  width: 45px;
  height: 1px;
  background: var(--article-rule);
  content: "";
}

.article-entry::after {
  position: absolute;
  top: 16px;
  width: 8px;
  height: 8px;
  background: var(--color-oxblood);
  border-radius: 50%;
  content: "";
}

.article-entry:nth-child(odd)::before {
  right: -45px;
}

.article-entry:nth-child(odd)::after {
  right: -49px;
}

.article-entry:nth-child(even)::before {
  left: -45px;
}

.article-entry:nth-child(even)::after {
  left: -49px;
}

.article-entry__link {
  display: grid;
  grid-template-columns: minmax(180px, 1.08fr) minmax(190px, 0.92fr);
  align-items: start;
  gap: clamp(18px, 2.4vw, 34px);
  color: inherit;
  text-decoration: none;
}

.article-entry:nth-child(even) .article-entry__media {
  order: 2;
}

.article-entry:nth-child(even) .article-entry__copy {
  order: 1;
}

.article-entry__media {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-sand);
}

.article-entry__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.72) sepia(0.1);
  transition:
    transform 320ms ease,
    filter 320ms ease;
}

.article-entry__media--missing {
  position: relative;
  background: var(--color-sand);
}

.article-entry__media--heart {
  background: color-mix(in srgb, var(--color-clay) 18%, var(--color-paper));
}

.article-entry__media--life {
  background: color-mix(in srgb, var(--color-bark) 22%, var(--color-paper));
}

.article-entry__media--beauty {
  background: color-mix(in srgb, var(--color-saffron) 12%, var(--color-paper));
}

.article-entry__media--missing::before,
.article-entry__media--missing::after,
.article-entry__media--missing span {
  position: absolute;
  background: color-mix(in srgb, var(--color-clay) 42%, transparent);
  content: "";
}

.article-entry__media--missing::before {
  top: 0;
  bottom: 0;
  left: 34%;
  width: 1px;
  transform: rotate(24deg);
}

.article-entry__media--missing::after {
  right: 12%;
  bottom: 0;
  left: 0;
  height: 1px;
  transform: rotate(-12deg);
  transform-origin: left;
}

.article-entry__media--missing span {
  top: 28%;
  right: 22%;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--color-clay) 42%, transparent);
}

.article-entry__copy time {
  display: block;
  font-family: var(--font-editorial);
  font-size: var(--type-title-sm-size);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}

.article-entry__taxonomy {
  display: flex;
  flex-wrap: wrap;
  margin: 8px 0 0;
  color: var(--article-muted-text);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}

.article-entry__taxonomy span {
  display: inline-flex;
  align-items: center;
}

.article-entry__taxonomy span + span::before {
  height: 14px;
  margin: 0 10px;
  border-left: 1px solid var(--article-rule);
  content: "";
}

.article-entry h3 {
  margin: 16px 0 0;
  color: var(--color-oxblood);
  font-family: var(--font-display);
  font-size: var(--type-title-sm-size);
  font-weight: var(--type-title-sm-weight);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
  overflow-wrap: anywhere;
}

.article-entry h3::after {
  display: block;
  width: 26px;
  height: 1px;
  margin-top: 10px;
  background: var(--color-clay);
  content: "";
}

.article-entry__excerpt {
  margin: 12px 0 0;
  color: color-mix(in srgb, var(--color-muted) 86%, var(--color-ink));
  font-size: var(--type-body-size);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
  overflow-wrap: anywhere;
}

.article-entry__action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  color: var(--article-accent);
  font-family: var(--font-display);
  letter-spacing: 0.08em;
}

.article-entry__action b {
  font-family: sans-serif;
  font-weight: 400;
  transition: transform 220ms ease;
}

.article-entry__link:hover .article-entry__media img,
.article-entry__link:focus-visible .article-entry__media img {
  filter: saturate(0.94) sepia(0);
  transform: scale(1.025);
}

.article-entry__link:hover .article-entry__action b,
.article-entry__link:focus-visible .article-entry__action b {
  transform: translateX(5px);
}

.article-pagination {
  display: flex;
  min-height: 74px;
  align-items: center;
  justify-content: center;
  gap: 18px;
  border-top: 1px solid var(--article-rule);
  border-bottom: 1px solid var(--article-rule);
  font-family: var(--font-display);
}

.article-pagination ol {
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
}

.article-pagination a,
.article-pagination button,
.article-pagination li > span {
  display: inline-flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  color: inherit;
  background: transparent;
  border: 0;
  font: inherit;
  text-decoration: none;
}

.article-pagination a:hover,
.article-pagination a:focus-visible,
.article-pagination [aria-current="page"] {
  color: var(--article-accent);
  text-decoration: underline;
  text-underline-offset: 8px;
}

.article-pagination button:disabled {
  color: color-mix(in srgb, var(--color-muted) 56%, transparent);
}

.article-state {
  min-height: 360px;
  padding: 96px 24px;
  text-align: center;
}

.article-state > p {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-sm-size);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}

.article-state button {
  min-height: 44px;
  margin-top: 22px;
  padding: 0 4px;
  color: var(--article-accent);
  background: transparent;
  border: 0;
  border-bottom: 1px solid currentColor;
  font: inherit;
  cursor: pointer;
}

.article-state__actions {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.article-state--loading > div {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  max-width: 920px;
  margin: 42px auto 0;
}

.article-state--loading span {
  display: block;
  height: 170px;
  background: color-mix(in srgb, var(--color-sand) 74%, transparent);
  animation: article-pulse 1.8s ease-in-out infinite alternate;
}

.article-directory__notice {
  margin: 28px 0 0;
  color: var(--article-muted-text);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
  text-align: center;
}

@keyframes article-pulse {
  from {
    opacity: 0.48;
  }
  to {
    opacity: 0.9;
  }
}

@media (max-width: 1180px) {
  .article-entry__link {
    grid-template-columns: 1fr;
  }

  .article-entry:nth-child(even) .article-entry__media,
  .article-entry:nth-child(even) .article-entry__copy {
    order: initial;
  }
}

@media (max-width: 1023px) {
  .article-directory {
    padding: 40px var(--page-gutter-mobile) 52px;
  }

  .article-state {
    padding-inline: var(--page-gutter-mobile);
  }

  .article-hero__identity {
    display: block;
  }

  .article-hero__identity > p {
    padding-left: 0;
    margin-top: 18px;
    border-left: 0;
  }

  .article-hero__eyebrow {
    display: none;
  }

  .article-categories {
    flex-wrap: wrap;
  }

  .article-categories a {
    min-width: auto;
    flex: 1 1 20%;
    padding-inline: 14px;
  }

  .article-tags {
    align-items: stretch;
  }

  .article-tags fieldset {
    display: block;
    padding: 14px 18px;
  }

  .article-tags legend {
    float: none;
    width: 100%;
    padding: 0 0 8px;
  }

  .article-list {
    gap: 54px;
    padding-left: 38px;
  }

  .article-list::before {
    left: 10px;
  }

  .article-entry,
  .article-entry:nth-child(even) {
    width: 100%;
    margin-left: 0;
  }

  .article-entry::before,
  .article-entry:nth-child(odd)::before,
  .article-entry:nth-child(even)::before {
    top: 20px;
    right: auto;
    left: -28px;
    width: 28px;
  }

  .article-entry::after,
  .article-entry:nth-child(odd)::after,
  .article-entry:nth-child(even)::after {
    top: 16px;
    right: auto;
    left: -32px;
  }

  .article-entry__link {
    grid-template-columns: 1fr;
  }

  .article-entry:nth-child(even) .article-entry__media,
  .article-entry:nth-child(even) .article-entry__copy {
    order: initial;
  }

  .article-entry__media {
    aspect-ratio: 16 / 7;
  }

  .article-entry__copy time {
    margin-top: 3px;
  }
}

@media (max-width: 640px) {
  .article-directory {
    padding-block: 34px 44px;
  }

  .article-categories {
    margin-top: 30px;
  }

  .article-categories a {
    flex: 1 1 33%;
  }

  .article-tags {
    display: block;
  }

  .article-tags__options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2px 12px;
  }

  .article-tags__clear {
    width: 100%;
    border-top: 1px solid var(--article-rule);
    border-left: 0;
  }

  .article-results__header {
    align-items: end;
  }

  .article-results__header h2 {
    display: block;
    flex: none;
  }

  .article-results__header h2::after {
    display: none;
  }

  .article-results__header p span {
    display: none;
  }

  .article-list {
    gap: 46px;
    padding-left: 34px;
  }

  .article-entry__media {
    aspect-ratio: 16 / 8;
  }

  .article-pagination {
    gap: 0;
    justify-content: space-between;
  }

  .article-pagination a,
  .article-pagination button,
  .article-pagination li > span {
    padding-inline: 6px;
  }

  .article-state--loading > div {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 360px) {
  .article-directory {
    padding-inline: var(--page-gutter-mobile);
  }

  .article-tags__options {
    grid-template-columns: 1fr;
  }

  .article-pagination {
    flex-wrap: wrap;
    padding-block: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-entry__media img,
  .article-entry__action b {
    transition: none;
  }

  .article-state--loading span {
    animation: none;
  }
}
</style>
