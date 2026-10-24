<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type {
  SessionFilters,
  SessionOverviewContent,
  SessionOverviewStatus,
} from "#shared/types/session";
import {
  filterPractitioners,
  getPractitionerPath,
  getSessionPaginationItems,
  getSessionPath,
  paginatePractitioners,
} from "#shared/utils/session";

const props = withDefaults(
  defineProps<{
    content: SessionOverviewContent;
    status?: SessionOverviewStatus;
    regions?: string[];
    methods?: string[];
    page?: number;
  }>(),
  {
    status: "ready",
    regions: () => [],
    methods: () => [],
    page: 1,
  },
);

const emit = defineEmits<{
  navigate: [filters: SessionFilters, page: number];
  normalize: [filters: SessionFilters, page: number];
  retry: [];
}>();

const resultsHeading = ref<HTMLElement | null>(null);
const shouldFocusResults = ref(false);
const orderedRegions = computed(() =>
  props.content.regions.toSorted((a, b) => a.order - b.order),
);
const orderedMethods = computed(() =>
  props.content.methods.toSorted((a, b) => a.order - b.order),
);
const regionLabels = computed(
  () => new Map(props.content.regions.map((item) => [item.key, item.label])),
);
const methodLabels = computed(
  () => new Map(props.content.methods.map((item) => [item.key, item.label])),
);
const filters = computed<SessionFilters>(() => ({
  regions: props.regions,
  methods: props.methods,
}));
const allPublishedPractitioners = computed(() =>
  filterPractitioners(props.content.practitioners, {
    regions: [],
    methods: [],
  }),
);
const filteredPractitioners = computed(() =>
  filterPractitioners(props.content.practitioners, filters.value),
);
const pagination = computed(() =>
  paginatePractitioners(filteredPractitioners.value, props.page),
);
const paginationItems = computed(() =>
  getSessionPaginationItems(
    pagination.value.currentPage,
    pagination.value.totalPages,
  ),
);
const hasFilters = computed(
  () => props.regions.length > 0 || props.methods.length > 0,
);

function toggleFilter(group: keyof SessionFilters, key: string) {
  const next = new Set(filters.value[group]);
  next.has(key) ? next.delete(key) : next.add(key);
  shouldFocusResults.value = true;
  emit("navigate", { ...filters.value, [group]: [...next] }, 1);
}

function clearFilters() {
  shouldFocusResults.value = true;
  emit("navigate", { regions: [], methods: [] }, 1);
}

function navigate(event: MouseEvent, page: number) {
  event.preventDefault();
  shouldFocusResults.value = true;
  emit("navigate", filters.value, page);
}

function regionText(keys: readonly string[]): string {
  return keys
    .map((key) => regionLabels.value.get(key))
    .filter(Boolean)
    .join("・");
}

function methodText(key: string): string {
  return methodLabels.value.get(key) ?? key;
}

watch(
  () => [props.page, props.regions.join(","), props.methods.join(",")] as const,
  async () => {
    if (!shouldFocusResults.value) return;
    shouldFocusResults.value = false;
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

</script>

<template>
  <div class="session-directory">
    <aside class="session-directory__aside">
      <div class="session-directory__intro">
        <h1>{{ content.pageTitle }}</h1>
        <p>{{ content.intro }}</p>
      </div>

      <form
        v-if="allPublishedPractitioners.length"
        class="session-filters"
        aria-label="篩選執行師"
        @submit.prevent
      >
        <fieldset>
          <legend>服務地區</legend>
          <div
            class="session-filters__options session-filters__options--regions"
          >
            <button
              v-for="option in orderedRegions"
              :key="option.key"
              type="button"
              :aria-pressed="regions.includes(option.key)"
              @click="toggleFilter('regions', option.key)"
            >
              {{ option.label }}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>服務項目</legend>
          <div class="session-filters__options">
            <button
              v-for="option in orderedMethods"
              :key="option.key"
              type="button"
              :aria-pressed="methods.includes(option.key)"
              @click="toggleFilter('methods', option.key)"
            >
              {{ option.label }}
            </button>
          </div>
        </fieldset>

        <button
          v-if="hasFilters"
          type="button"
          class="session-filters__clear"
          @click="clearFilters"
        >
          清除全部篩選
        </button>
      </form>

      <p v-if="content.prototypeNotice" class="session-directory__notice">
        {{ content.prototypeNotice }}
      </p>
    </aside>

    <section
      class="session-results"
      :aria-busy="status === 'loading'"
      :aria-labelledby="'session-results-heading'"
    >
      <header class="session-results__header">
        <h2 id="session-results-heading" ref="resultsHeading" tabindex="-1">
          {{ content.resultsHeading }}
        </h2>
        <p
          v-if="status === 'ready' && pagination.totalItems"
          class="session-results__count"
          aria-live="polite"
        >
          符合條件 {{ pagination.totalItems }} 位・第
          {{ pagination.currentPage }} 頁
        </p>
      </header>

      <div
        v-if="status === 'loading'"
        class="session-state session-state--loading"
        role="status"
      >
        <p>正在整理執行師資料</p>
        <span v-for="index in 4" :key="index" aria-hidden="true" />
      </div>

      <div v-else-if="status === 'error'" class="session-state" role="alert">
        <p>執行師資料暫時無法載入，請稍後再試。</p>
        <button type="button" @click="emit('retry')">重新載入</button>
      </div>

      <div v-else-if="!allPublishedPractitioners.length" class="session-state">
        <p>{{ content.emptyMessage }}</p>
      </div>

      <div v-else-if="!pagination.totalItems" class="session-state">
        <p>{{ content.noMatchesMessage }}</p>
        <button type="button" @click="clearFilters">清除全部篩選</button>
      </div>

      <template v-else>
        <ol class="practitioner-list">
          <li
            v-for="practitioner in pagination.items"
            :key="practitioner.id"
            class="practitioner-row"
          >
            <a
              :href="getPractitionerPath(practitioner.slug)"
              :aria-label="`查看 ${practitioner.name} 的執行師詳情`"
            >
              <h3>
                {{ practitioner.name }}
                <span v-if="practitioner.englishName">{{
                  practitioner.englishName
                }}</span>
              </h3>
              <p class="practitioner-row__regions">
                {{ regionText(practitioner.regionKeys) }}
              </p>
              <ul class="practitioner-row__methods" aria-label="服務項目">
                <li v-for="method in practitioner.methodKeys" :key="method">
                  {{ methodText(method) }}
                </li>
              </ul>
              <svg viewBox="0 0 32 20" aria-hidden="true">
                <path d="M1 10h27M22 4l6 6-6 6" />
              </svg>
            </a>
          </li>
        </ol>

        <nav
          v-if="pagination.totalPages > 1"
          class="session-pagination"
          :aria-label="`${content.resultsHeading}分頁`"
        >
          <button v-if="pagination.currentPage === 1" type="button" disabled>
            上一頁
          </button>
          <a
            v-else
            :href="getSessionPath(filters, pagination.currentPage - 1)"
            rel="prev"
            @click="navigate($event, pagination.currentPage - 1)"
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
                >{{ item }}</span
              >
              <a
                v-else
                :href="getSessionPath(filters, item)"
                :aria-label="`${content.resultsHeading}第 ${item} 頁`"
                @click="navigate($event, item)"
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
            :href="getSessionPath(filters, pagination.currentPage + 1)"
            rel="next"
            @click="navigate($event, pagination.currentPage + 1)"
            >下一頁</a
          >
        </nav>
      </template>
    </section>
  </div>
</template>

<style scoped>
.session-directory {
  --session-muted: color-mix(in srgb, var(--color-muted) 78%, var(--color-ink));
  --session-clay: color-mix(in srgb, var(--color-clay) 72%, var(--color-ink));
  display: grid;
  grid-template-columns: var(--split-layout-rail-width) minmax(0, 1fr);
  align-items: start;
  min-height: calc(100svh - var(--home-header-height));
  color: var(--color-ink);
  background: var(--color-paper);
}

.session-directory__aside {
  position: sticky;
  top: var(--home-header-height);
  height: calc(100svh - var(--home-header-height));
  padding: clamp(64px, 7vw, 112px) clamp(28px, 3.2vw, 58px) 48px;
  overflow-y: auto;
  background: var(--color-sand);
}

.session-directory__intro h1 {
  max-width: 6em;
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-lg-size);
  font-weight: var(--type-title-lg-weight);
  line-height: var(--type-title-lg-leading);
  letter-spacing: var(--type-title-lg-tracking);
  white-space: pre-line;
}

.session-directory__intro > p {
  max-width: 20em;
  margin: 24px 0 0;
  color: var(--session-muted);
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}

.session-filters {
  margin-top: 42px;
}

.session-filters fieldset {
  min-width: 0;
  padding: 0;
  margin: 0 0 28px;
  border: 0;
}

.session-filters legend {
  width: 100%;
  padding: 0 0 11px;
  margin-bottom: 6px;
  color: var(--session-clay);
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 24%, transparent);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}

.session-filters__options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.session-filters__options button {
  position: relative;
  width: 100%;
  min-height: 48px;
  padding: 6px 0;
  color: var(--color-ink);
  background: transparent;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 24%, transparent);
  font: inherit;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
}

.session-filters__options button::before {
  position: absolute;
  top: 21px;
  left: 0;
  width: 5px;
  height: 5px;
  background: var(--color-clay);
  border-radius: 50%;
  content: "";
  opacity: 0;
}

.session-filters__options button[aria-pressed="true"] {
  padding-left: 14px;
  color: var(--color-oxblood);
  border-bottom-color: var(--color-oxblood);
  font-weight: 400;
}

.session-filters__options button[aria-pressed="true"]::before {
  opacity: 1;
}

.session-filters__clear,
.session-state button {
  min-height: 48px;
  padding: 0;
  color: var(--session-clay);
  background: transparent;
  border: 0;
  border-bottom: 1px solid currentColor;
  font: inherit;
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
  cursor: pointer;
}

.session-directory__notice {
  max-width: 24em;
  margin: 36px 0 0;
  color: var(--session-muted);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}

.session-results {
  width: 100%;
  min-width: 0;
}

.session-results__header {
  display: flex;
  min-height: 154px;
  align-items: end;
  justify-content: space-between;
  gap: 36px;
  padding: 52px clamp(28px, 6vw, 116px) 30px clamp(44px, 5vw, 84px);
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 24%, transparent);
}

.session-results__header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-md-size);
  font-weight: var(--type-title-md-weight);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}

.session-results__count {
  margin: 0;
  color: var(--session-muted);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--type-meta-tracking);
}

.practitioner-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.practitioner-row {
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 24%, transparent);
  transition: background 220ms ease;
}

.practitioner-row:hover {
  background: color-mix(in srgb, var(--color-sand) 56%, var(--color-paper));
}

.practitioner-row > a {
  display: grid;
  min-height: 142px;
  grid-template-columns: minmax(210px, 0.9fr) minmax(110px, 0.45fr) minmax(
      240px,
      1.25fr
    ) 42px;
  align-items: center;
  gap: clamp(22px, 2.5vw, 38px);
  padding: 26px clamp(28px, 6vw, 116px) 26px clamp(44px, 5vw, 84px);
  color: inherit;
  text-decoration: none;
}

.practitioner-row h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-sm-size);
  font-weight: var(--type-title-sm-weight);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}

.practitioner-row h3 span {
  display: block;
  margin-top: 8px;
  color: var(--session-muted);
  font-family: var(--font-sans);
  font-size: var(--type-meta-size);
  font-weight: var(--type-meta-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}

.practitioner-row__regions {
  margin: 0;
  color: var(--session-clay);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}

.practitioner-row__methods {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 15px;
  padding: 0;
  margin: 0;
  color: var(--session-muted);
  font-size: var(--type-body-size);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
  list-style: none;
}

.practitioner-row__methods li {
  position: relative;
  padding-left: 12px;
}

.practitioner-row__methods li::before {
  position: absolute;
  top: 0.72em;
  left: 0;
  width: 4px;
  height: 4px;
  background: var(--color-saffron);
  border-radius: 50%;
  content: "";
}

.practitioner-row svg {
  width: 32px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  transition:
    color 220ms ease,
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.practitioner-row > a:hover svg,
.practitioner-row > a:focus-visible svg {
  color: var(--color-persimmon);
  transform: translateX(5px);
}

.session-pagination {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) auto minmax(80px, 1fr);
  align-items: center;
  gap: clamp(18px, 3vw, 40px);
  max-width: 620px;
  margin: 64px auto;
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  text-align: center;
}

.session-pagination > a,
.session-pagination > button {
  min-height: 48px;
  align-content: center;
  padding: 0;
  color: var(--color-ink);
  background: transparent;
  border: 0;
  font: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 7px;
  cursor: pointer;
}

.session-pagination > button:disabled {
  color: color-mix(in srgb, var(--color-muted) 48%, var(--color-paper));
  text-decoration: none;
  cursor: default;
}

.session-pagination ol {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.session-pagination li > * {
  display: grid;
  min-width: 44px;
  min-height: 44px;
  place-items: center;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  text-decoration: none;
}

.session-pagination [aria-current="page"] {
  border-bottom: 1px solid var(--color-clay);
  font-weight: 700;
}

.session-pagination > :first-child {
  justify-self: end;
}

.session-pagination > :last-child {
  justify-self: start;
}

.session-state {
  display: grid;
  min-height: 60svh;
  place-content: center;
  justify-items: start;
  padding: 80px clamp(44px, 5vw, 84px);
}

.session-state p {
  max-width: 34em;
  margin: 0;
  color: var(--session-muted);
  font-size: var(--type-body-size);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}

.session-state button {
  margin-top: 22px;
}

.session-state--loading {
  place-content: start stretch;
  gap: 0;
}

.session-state--loading p {
  margin-bottom: 28px;
}

.session-state--loading span {
  display: block;
  min-height: 112px;
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-sand) 55%, transparent),
    transparent
  );
  background-size: 220% 100%;
  animation: loading-sweep 1.6s ease-in-out infinite;
}

@keyframes loading-sweep {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -120% 0;
  }
}

@media (max-width: 1023px) {
  .session-directory {
    display: block;
  }

  .session-directory__aside {
    position: static;
    width: 100%;
    height: auto;
    padding: 72px var(--page-gutter-mobile) 48px;
    overflow: visible;
    border-bottom: 1px solid
      color-mix(in srgb, var(--color-ink) 24%, transparent);
  }

  .session-filters__options {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .session-results__header {
    min-height: 130px;
    padding: 42px var(--page-gutter-mobile) 28px;
  }

  .practitioner-row > a {
    grid-template-columns: minmax(180px, 0.8fr) minmax(0, 1fr) 36px;
    padding: 26px var(--page-gutter-mobile);
  }

  .practitioner-row__regions {
    grid-column: 1;
  }

  .practitioner-row__methods {
    grid-row: 1 / span 2;
    grid-column: 2;
  }

  .practitioner-row svg {
    grid-row: 1 / span 2;
    grid-column: 3;
  }
}

@media (max-width: 620px) {
  .session-directory__aside {
    padding-inline: var(--page-gutter-mobile);
  }

  .session-directory__intro h1 {
    max-width: 5em;
    line-height: 1.14;
  }

  .session-directory__intro > p {
    margin-top: 20px;
  }

  .session-filters {
    margin-top: 28px;
  }

  .session-filters fieldset {
    margin-bottom: 20px;
  }

  .session-filters legend {
    padding-bottom: 8px;
    margin-bottom: 2px;
  }

  .session-filters__options--regions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 12px;
  }

  .session-filters__options button {
    min-height: 46px;
    overflow-wrap: anywhere;
  }

  .session-directory__notice {
    margin-top: 24px;
  }

  .session-filters__options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 16px;
  }

  .session-filters__options--regions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .session-results__header {
    min-height: 118px;
    padding: 34px var(--page-gutter-mobile) 22px;
  }

  .session-results__header {
    display: block;
  }

  .session-results__count {
    margin-top: 10px;
  }

  .practitioner-row > a {
    min-height: 156px;
    grid-template-columns: minmax(0, 1fr) auto 28px;
    gap: 12px 14px;
    padding: 24px var(--page-gutter-mobile);
  }

  .practitioner-row h3 {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .practitioner-row h3 span {
    margin-top: 5px;
  }

  .practitioner-row__methods {
    grid-column: 1 / 3;
  }

  .practitioner-row__regions {
    grid-row: 1;
    grid-column: 2;
    align-self: start;
    padding-top: 8px;
    text-align: right;
    white-space: nowrap;
  }

  .practitioner-row__methods {
    grid-row: auto;
    gap: 3px 12px;
    padding-top: 2px;
  }

  .practitioner-row svg {
    width: 28px;
    grid-row: 1 / span 2;
    grid-column: 3;
  }

  .session-pagination {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px 24px;
    margin: 48px auto;
    padding: 0 var(--page-gutter-mobile);
  }

  .session-pagination ol {
    grid-row: 1;
    grid-column: 1 / -1;
  }

  .session-pagination > :first-child {
    grid-row: 2;
    grid-column: 1;
    justify-self: start;
  }

  .session-pagination > :last-child {
    grid-row: 2;
    grid-column: 2;
    justify-self: end;
  }

  .session-state {
    min-height: 48svh;
    padding: 64px var(--page-gutter-mobile);
  }

  @media (hover: none) {
    .practitioner-row > a:active {
      background: color-mix(in srgb, var(--color-sand) 72%, var(--color-paper));
    }

    .session-filters__options button:active {
      color: var(--color-oxblood);
      border-bottom-color: var(--color-oxblood);
    }
  }
}

@media (max-width: 359px) {
  .session-directory__aside {
    padding-inline: var(--page-gutter-mobile);
  }

  .session-filters__options:not(.session-filters__options--regions) {
    grid-template-columns: 1fr;
  }

  .session-results__header,
  .practitioner-row > a,
  .session-state {
    padding-inline: var(--page-gutter-mobile);
  }

  .practitioner-row > a {
    grid-template-columns: minmax(0, 1fr) 24px;
  }

  .practitioner-row__regions {
    grid-row: 2;
    grid-column: 1;
    justify-self: start;
    padding-top: 0;
    text-align: left;
  }

  .practitioner-row__methods {
    grid-row: 3;
    grid-column: 1 / -1;
  }

  .practitioner-row svg {
    grid-row: 1 / span 2;
    grid-column: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .practitioner-row,
  .practitioner-row svg {
    transition: none;
  }

  .session-state--loading span {
    animation: none;
  }
}
</style>
