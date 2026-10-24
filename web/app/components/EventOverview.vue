<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import type {
  DisplayEvent,
  EventOverviewContent,
  EventOverviewStatus,
  EventView,
} from "#shared/types/event";
import {
  deriveEventCollections,
  getEventDetailPath,
  getEventsPath,
  getPaginationItems,
  isSafeRegistrationUrl,
  paginateEvents,
} from "#shared/utils/events";
import DirectoryIntro from "./DirectoryIntro.vue";

const props = withDefaults(
  defineProps<{
    content: EventOverviewContent;
    status?: EventOverviewStatus;
    view?: EventView;
    page?: number;
    now?: Date | string | number;
  }>(),
  {
    status: "ready",
    view: "upcoming",
    page: 1,
    now: undefined,
  },
);

const emit = defineEmits<{
  navigate: [view: EventView, page: number];
  normalize: [view: EventView, page: number];
  retry: [];
}>();

const statusLabels = {
  scheduled: "尚未開放",
  open: "名額尚餘",
  full: "名額已滿",
  closed: "報名已截止",
} as const;

const deliveryModeLabels = {
  inPerson: "實體",
  online: "線上",
  hybrid: "實體・線上",
} as const;

const controlledNow = computed(() => props.now !== undefined);
const clock = ref(new Date(props.now ?? Date.now()));
const collectionHeading = ref<HTMLElement | null>(null);
let boundaryTimer: ReturnType<typeof setTimeout> | undefined;
let mounted = false;

watch(
  () => props.now,
  (value) => {
    if (value !== undefined) clock.value = new Date(value);
  },
);

const collections = computed(() =>
  deriveEventCollections(props.content.events, clock.value),
);
const hasAnyEvents = computed(
  () =>
    collections.value.upcoming.length > 0 || collections.value.past.length > 0,
);
const activeEvents = computed(() => collections.value[props.view]);
const pagination = computed(() =>
  paginateEvents(activeEvents.value, props.page),
);
const paginationItems = computed(() =>
  getPaginationItems(pagination.value.currentPage, pagination.value.totalPages),
);
const activeHeading = computed(() =>
  props.view === "upcoming"
    ? props.content.upcomingHeading
    : props.content.pastHeading,
);

interface MonthGroup {
  key: string;
  label: string;
  events: DisplayEvent[];
}

const monthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

const monthGroups = computed<MonthGroup[]>(() => {
  const groups = new Map<string, MonthGroup>();
  for (const event of pagination.value.items) {
    const date = new Date(event.startAt);
    const year = new Intl.DateTimeFormat("en", {
      timeZone: event.timezone,
      year: "numeric",
    }).format(date);
    const month = Number(
      new Intl.DateTimeFormat("en", {
        timeZone: event.timezone,
        month: "numeric",
      }).format(date),
    );
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const group = groups.get(key) ?? {
      key,
      label: `${monthNames[month - 1]} ${year}`,
      events: [],
    };
    group.events.push(event);
    groups.set(key, group);
  }
  return [...groups.values()];
});

function formatDay(event: DisplayEvent): string {
  const days = eventCalendarDays(event);
  const firstDay = days[0]?.day ?? "";
  const lastDay = days.at(-1)?.day ?? firstDay;
  return days.length > 1 ? `${firstDay}–${lastDay}` : firstDay;
}

interface EventCalendarDay {
  day: string;
  isoDate: string;
  shortDate: string;
  weekday: string;
}

function eventCalendarDays(event: DisplayEvent): EventCalendarDay[] {
  const start = new Date(event.startAt);
  const inclusiveEnd = new Date(
    Math.max(start.getTime(), new Date(event.endAt).getTime() - 1),
  );
  const partsFormatter = new Intl.DateTimeFormat("en", {
    timeZone: event.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateParts = (date: Date) =>
    Object.fromEntries(
      partsFormatter.formatToParts(date).map((part) => [part.type, part.value]),
    );
  const startParts = dateParts(start);
  const endParts = dateParts(inclusiveEnd);
  const startOrdinal = Date.UTC(
    Number(startParts.year),
    Number(startParts.month) - 1,
    Number(startParts.day),
  );
  const endOrdinal = Date.UTC(
    Number(endParts.year),
    Number(endParts.month) - 1,
    Number(endParts.day),
  );
  const totalDays = Math.max(
    1,
    Math.round((endOrdinal - startOrdinal) / 86_400_000) + 1,
  );

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start.getTime() + index * 86_400_000);
    const parts = dateParts(date);
    return {
      day: parts.day ?? "",
      isoDate: `${parts.year}-${parts.month}-${parts.day}`,
      shortDate: new Intl.DateTimeFormat("zh-TW", {
        timeZone: event.timezone,
        month: "2-digit",
        day: "2-digit",
      }).format(date),
      weekday: new Intl.DateTimeFormat("zh-TW", {
        timeZone: event.timezone,
        weekday: "short",
      }).format(date),
    };
  });
}

function formatTimeRange(event: DisplayEvent): string {
  if (event.scheduleNote) return event.scheduleNote;
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: event.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFormatter = new Intl.DateTimeFormat("zh-TW", {
    timeZone: event.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  if (dateFormatter.format(start) === dateFormatter.format(end)) {
    return `${timeFormatter.format(start)}–${timeFormatter.format(end)}`;
  }
  const shortDateFormatter = new Intl.DateTimeFormat("zh-TW", {
    timeZone: event.timezone,
    month: "numeric",
    day: "numeric",
  });
  return `${shortDateFormatter.format(start)}–${shortDateFormatter.format(end)}`;
}

function locationLabel(event: DisplayEvent): string {
  if (event.deliveryMode === "online") return event.city ?? "線上";
  return [event.city, event.venue].filter(Boolean).join("・");
}

function statusLabel(event: DisplayEvent): string {
  return statusLabels[event.effectiveStatus];
}

function registrationIsAvailable(event: DisplayEvent): boolean {
  return (
    event.effectiveStatus === "open" &&
    isSafeRegistrationUrl(event.registrationUrl)
  );
}

function navigate(event: MouseEvent, view: EventView, page: number) {
  event.preventDefault();
  emit("navigate", view, page);
}

function scheduleBoundaryUpdate() {
  if (boundaryTimer) clearTimeout(boundaryTimer);
  if (controlledNow.value) return;

  const now = clock.value.getTime();
  const nextBoundary = props.content.events
    .flatMap((event) => [Date.parse(event.startAt), Date.parse(event.endAt)])
    .filter((value) => Number.isFinite(value) && value > now)
    .sort((first, second) => first - second)[0];

  if (!nextBoundary) return;
  const delay = Math.min(Math.max(nextBoundary - now + 50, 50), 2_147_483_647);
  boundaryTimer = setTimeout(() => {
    clock.value = new Date();
    scheduleBoundaryUpdate();
  }, delay);
}

watch(
  () => [props.view, props.page, pagination.value.totalPages] as const,
  async ([view, requestedPage], previous) => {
    if (requestedPage !== pagination.value.currentPage) {
      emit("normalize", view, pagination.value.currentPage);
      return;
    }
    if (!mounted || !previous) return;
    await nextTick();
    collectionHeading.value?.focus();
  },
  { immediate: true },
);

onMounted(() => {
  mounted = true;
  scheduleBoundaryUpdate();
});

onBeforeUnmount(() => {
  if (boundaryTimer) clearTimeout(boundaryTimer);
});
</script>

<template>
  <div class="event-directory" :aria-busy="status === 'loading'">
    <aside class="event-directory__index">
      <DirectoryIntro :title="content.pageTitle" :description="content.intro" />

      <nav v-if="status === 'ready'" aria-label="活動檢視">
        <ul>
          <li>
            <a
              class="directory-filter__link"
              :href="getEventsPath('upcoming', 1)"
              :aria-current="view === 'upcoming' ? 'page' : undefined"
              @click="navigate($event, 'upcoming', 1)"
            >
              <span>{{ content.upcomingHeading }}</span>
              <span
                v-if="hasAnyEvents"
                class="event-directory__count directory-filter__count"
              >
                {{ collections.upcoming.length }}
              </span>
            </a>
          </li>
          <li>
            <a
              class="directory-filter__link"
              :href="getEventsPath('past', 1)"
              :aria-current="view === 'past' ? 'page' : undefined"
              @click="navigate($event, 'past', 1)"
            >
              <span>{{ content.pastHeading }}</span>
              <span
                v-if="hasAnyEvents"
                class="event-directory__count directory-filter__count"
              >
                {{ collections.past.length }}
              </span>
            </a>
          </li>
        </ul>
      </nav>

      <p v-if="content.prototypeNotice" class="event-directory__notice">
        {{ content.prototypeNotice }}
      </p>
    </aside>

    <div class="event-directory__content" aria-live="polite">
      <div v-if="status === 'loading'" class="event-state event-state--loading">
        <span class="event-state__line event-state__line--title" />
        <span v-for="index in 5" :key="index" class="event-state__line" />
        <p>正在整理活動資料…</p>
      </div>

      <div v-else-if="status === 'error'" class="event-state">
        <h2>活動資料暫時無法載入</h2>
        <p>請稍後再試一次；主要導覽仍可正常使用。</p>
        <button type="button" @click="emit('retry')">重新載入</button>
      </div>

      <section
        v-else
        id="event-collection"
        class="event-collection"
        :aria-labelledby="`${view}-events-title`"
      >
        <header class="event-collection__heading">
          <h2
            :id="`${view}-events-title`"
            ref="collectionHeading"
            tabindex="-1"
          >
            {{ activeHeading }}
          </h2>
        </header>

        <div v-if="pagination.totalItems === 0" class="event-collection__empty">
          <p>
            {{
              view === "upcoming"
                ? content.emptyMessage
                : "目前沒有可公開瀏覽的過去活動。"
            }}
          </p>
        </div>

        <template v-else>
          <div
            v-for="group in monthGroups"
            :key="group.key"
            class="event-month"
          >
            <h3>{{ group.label }}</h3>
            <ol>
              <li
                v-for="item in group.events"
                :key="item.id"
                class="event-row"
                :class="{
                  'event-row--multi-day': eventCalendarDays(item).length > 1,
                }"
              >
                <div class="event-row__date">
                  <span class="event-row__day" aria-hidden="true">{{
                    formatDay(item)
                  }}</span>
                  <span class="event-row__date-list">
                    <template
                      v-for="(day, dayIndex) in eventCalendarDays(item)"
                      :key="day.isoDate"
                    >
                      <span
                        v-if="dayIndex > 0"
                        class="event-row__date-separator"
                        aria-hidden="true"
                        >-</span
                      >
                      <time
                        :datetime="day.isoDate"
                        class="event-row__date-item"
                      >
                        <span>{{ day.shortDate }}</span>
                        <span class="event-row__weekday"
                          >({{ day.weekday }})</span
                        >
                      </time>
                    </template>
                  </span>
                </div>

                <a
                  class="event-row__copy"
                  :href="getEventDetailPath(item.slug)"
                  :aria-label="`查看活動：${item.title}`"
                >
                  <p class="event-row__type">{{ item.eventType }}</p>
                  <h4>{{ item.title }}</h4>
                  <p class="event-row__meta">
                    <span>{{ deliveryModeLabels[item.deliveryMode] }}</span>
                    <span v-if="locationLabel(item)">{{
                      locationLabel(item)
                    }}</span>
                    <span>{{ formatTimeRange(item) }}</span>
                  </p>
                  <p class="event-row__summary">{{ item.summary }}</p>
                </a>

                <div v-if="view === 'upcoming'" class="event-row__action">
                  <span class="event-row__status">{{ statusLabel(item) }}</span>
                  <a
                    v-if="registrationIsAvailable(item)"
                    class="button-primary"
                    :href="item.registrationUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`${item.title}：前往報名（另開新視窗）`"
                  >
                    <span>前往報名</span>
                    <svg
                      class="button-primary__icon"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M4 10h11M11 6l4 4-4 4" />
                    </svg>
                  </a>
                  <a
                    v-else-if="item.relatedCourseHref"
                    :href="item.relatedCourseHref"
                    class="event-row__course-link"
                    >了解課程</a
                  >
                </div>
              </li>
            </ol>
          </div>

          <nav
            v-if="pagination.totalPages > 1"
            class="event-pagination"
            :aria-label="`${activeHeading}分頁`"
          >
            <button v-if="pagination.currentPage === 1" type="button" disabled>
              上一頁
            </button>
            <a
              v-else
              :href="getEventsPath(view, pagination.currentPage - 1)"
              class="event-pagination__step"
              rel="prev"
              @click="navigate($event, view, pagination.currentPage - 1)"
              >上一頁</a
            >
            <ol class="event-pagination__pages">
              <li
                v-for="(item, index) in paginationItems"
                :key="item === 'ellipsis' ? `ellipsis-${index}` : item"
              >
                <span
                  v-if="item === 'ellipsis'"
                  class="event-pagination__ellipsis"
                  aria-hidden="true"
                  >…</span
                >
                <span
                  v-else-if="item === pagination.currentPage"
                  class="event-pagination__page"
                  aria-current="page"
                  >{{ item }}</span
                >
                <a
                  v-else
                  :href="getEventsPath(view, item)"
                  class="event-pagination__page"
                  :aria-label="`${activeHeading}第 ${item} 頁`"
                  @click="navigate($event, view, item)"
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
              :href="getEventsPath(view, pagination.currentPage + 1)"
              class="event-pagination__step"
              rel="next"
              @click="navigate($event, view, pagination.currentPage + 1)"
              >下一頁</a
            >
          </nav>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.event-directory {
  --event-text-muted: color-mix(
    in srgb,
    var(--color-muted) 80%,
    var(--color-ink)
  );
  --event-text-clay: color-mix(
    in srgb,
    var(--color-clay) 80%,
    var(--color-ink)
  );
  display: grid;
  grid-template-columns: var(--split-layout-rail-width) minmax(0, 1fr);
  align-items: start;
  color: var(--color-ink);
  background: var(--color-paper);
}

.event-directory__index {
  position: sticky;
  top: var(--home-header-height);
  display: flex;
  height: calc(100svh - var(--home-header-height));
  flex-direction: column;
  gap: 56px;
  padding: clamp(64px, 7vw, 112px) clamp(28px, 3.2vw, 58px) 48px;
  overflow-y: auto;
  background: var(--color-sand);
  scrollbar-color: color-mix(in srgb, var(--color-saffron) 70%, transparent)
    transparent;
  scrollbar-width: thin;
}

.event-directory__index nav {
  margin-top: auto;
}

.event-directory__index ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.event-directory__index a {
  position: relative;
  display: flex;
  min-height: 68px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 20px;
  color: var(--event-text-muted);
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
  text-decoration: none;
  letter-spacing: 0.07em;
  transition:
    color 180ms ease,
    background 180ms ease;
}

.event-directory__index li:last-child a {
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
}

.event-directory__index a:hover {
  color: var(--color-ink);
}

.event-directory__index a[aria-current="page"] {
  color: var(--color-ink);
  background: color-mix(in srgb, var(--color-paper) 84%, var(--color-sand));
  font-weight: 700;
}

.event-directory__index a[aria-current="page"]::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 1px;
  background: var(--color-saffron);
  content: "";
}

.event-directory__count {
  flex: 0 0 auto;
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
  font-weight: 400;
}

.event-directory__notice {
  max-width: 28em;
  margin: 0;
  font-size: var(--type-meta-size);
  font-weight: var(--type-meta-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}

.event-directory__content {
  width: 100%;
  min-width: 0;
  min-height: calc(100svh - var(--home-header-height));
  padding-top: 30px;
  background: var(--color-paper);
}

.event-collection {
  min-height: calc(100svh - var(--home-header-height) - 30px);
  padding: clamp(72px, 8vw, 80px) clamp(28px, 4vw, 72px) 72px;
}

.event-collection__heading {
  padding-bottom: 32px;
}

.event-collection__heading h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-md-size);
  font-weight: var(--type-title-md-weight);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}

.event-month {
  padding-top: 52px;
}

.event-month h3 {
  display: flex;
  align-items: center;
  gap: 22px;
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-md-size);
  font-weight: var(--type-title-md-weight);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}

.event-month h3::after {
  height: 1px;
  flex: 1 1 auto;
  background: color-mix(in srgb, var(--color-ink) 30%, transparent);
  content: "";
}

.event-month ol {
  padding: 0;
  margin: 10px 0 0;
  list-style: none;
}

.event-row {
  display: grid;
  grid-template-columns: minmax(82px, 0.55fr) minmax(0, 3fr) minmax(
      140px,
      0.85fr
    );
  gap: clamp(22px, 3vw, 46px);
  align-items: center;
  min-height: 150px;
  padding: 24px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 16%, transparent);
}

.event-month .event-row:last-child {
  border-bottom: 0;
}

.event-row--multi-day {
  grid-template-columns: minmax(150px, 0.9fr) minmax(0, 3fr) minmax(
      140px,
      0.85fr
    );
}

.event-row__date {
  display: flex;
  flex-direction: column;
  color: var(--event-text-muted);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
  white-space: nowrap;
}

.event-row__date-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}

.event-row__date-item {
  display: grid;
  gap: 2px;
}

.event-row__date-separator {
  display: none;
}

.event-row__day {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: var(--type-title-md-size);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
  font-variant-numeric: tabular-nums;
}

.event-row__type {
  margin: 0 0 4px;
  color: var(--event-text-clay);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}

.event-row__copy {
  color: inherit;
  text-decoration: none;
}

.event-row__copy h4 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-sm-size);
  font-weight: var(--type-title-sm-weight);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
  overflow-wrap: anywhere;
  transition: color 180ms ease;
}

.event-row__copy:is(:hover, :focus-visible) h4 {
  color: var(--interactive-title-hover);
}

.event-row__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  margin: 6px 0 0;
  color: var(--event-text-muted);
  font-size: var(--type-label-size);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}

.event-row__summary {
  display: -webkit-box;
  max-width: 70ch;
  margin: 5px 0 0;
  overflow: hidden;
  font-size: var(--type-body-size);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.event-row__action {
  display: grid;
  justify-items: stretch;
  gap: 12px;
  min-width: 0;
}

.event-row__action .button-primary > span {
  flex: 0 0 auto;
  white-space: nowrap;
}

.event-row__status {
  color: var(--event-text-clay);
  font-size: var(--type-meta-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
  text-align: center;
}

.event-row__course-link {
  min-height: 48px;
  align-content: center;
  color: var(--color-ink);
  border-bottom: 1px solid currentColor;
  text-align: center;
  text-underline-offset: 5px;
}

.event-pagination {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) auto minmax(80px, 1fr);
  align-items: center;
  gap: clamp(18px, 3vw, 40px);
  max-width: 620px;
  margin: 64px auto 0;
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  text-align: center;
}

.event-pagination__step,
.event-pagination > button {
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

.event-pagination > button:disabled {
  color: color-mix(in srgb, var(--color-muted) 48%, var(--color-paper));
  text-decoration: none;
  cursor: default;
}

.event-pagination__pages {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.event-pagination__page,
.event-pagination__ellipsis {
  display: grid;
  min-width: 44px;
  min-height: 44px;
  place-items: center;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  text-decoration: none;
}

.event-pagination__page[aria-current="page"] {
  border-bottom: 1px solid var(--color-clay);
  font-weight: 700;
}

.event-pagination__pages a:hover {
  color: var(--color-clay);
}

.event-pagination > :first-child {
  justify-self: end;
}

.event-pagination > :last-child {
  justify-self: start;
}

.event-collection__empty,
.event-state {
  display: grid;
  min-height: 56svh;
  place-content: center;
  justify-items: start;
  padding: clamp(72px, 8vw, 120px) 0;
}

.event-collection__empty p,
.event-state p {
  max-width: 34em;
  margin: 0;
  color: var(--color-muted);
  font-size: var(--type-body-size);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}

.event-state {
  min-height: calc(100svh - var(--home-header-height) - 30px);
  padding-inline: clamp(28px, 6vw, 112px);
  color: var(--color-warm-white);
  background: var(--color-night);
}

.event-state h2 {
  margin: 0 0 30px;
  font-family: var(--font-display);
  font-size: var(--type-title-lg-size);
  font-weight: var(--type-title-lg-weight);
  line-height: var(--type-title-lg-leading);
  letter-spacing: var(--type-title-lg-tracking);
}

.event-state p {
  margin-bottom: 30px;
  color: var(--color-warm-muted);
}

.event-state button {
  min-width: 200px;
  min-height: 52px;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-bottom: 1px solid currentColor;
  font: inherit;
  letter-spacing: 0.1em;
  text-align: left;
  cursor: pointer;
}

.event-state--loading {
  align-content: start;
  gap: 28px;
  padding-top: clamp(100px, 11vw, 180px);
}

.event-state__line {
  display: block;
  width: min(680px, 88%);
  height: 1px;
  background: rgb(247 246 244 / 18%);
}

.event-state__line--title {
  width: min(340px, 64%);
  height: 54px;
  margin-bottom: 32px;
  background: rgb(247 246 244 / 14%);
}

@media (min-width: 1024px) {
  .event-row__date {
    align-items: center;
  }

  .event-row__date-list {
    padding-top: 10px;
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .event-row,
  .event-row--multi-day {
    grid-template-columns: 150px minmax(0, 1fr);
  }

  .event-row__date {
    grid-row: 1 / span 2;
  }

  .event-row__action {
    grid-column: 2;
    grid-template-columns: minmax(0, 1fr) minmax(240px, 280px);
    align-items: center;
  }
}

@media (min-width: 1280px) {
  .event-row,
  .event-row--multi-day {
    grid-template-columns: minmax(150px, 0.9fr) minmax(0, 3fr) minmax(
        240px,
        0.85fr
      );
  }
}

@media (max-width: 1023px) {
  .event-directory {
    grid-template-columns: minmax(0, 1fr);
  }

  .event-directory__index {
    position: relative;
    top: auto;
    min-width: 0;
    height: auto;
    min-height: 0;
    padding: 72px var(--page-gutter-mobile) 48px;
    overflow: visible;
  }

  .event-directory__index nav {
    margin-top: 8px;
  }

  .event-directory__notice {
    margin-top: 0;
  }

  .event-directory__content {
    padding-top: 0;
  }

  .event-collection {
    min-height: auto;
    padding-block: 80px;
    padding-inline: var(--page-gutter-mobile);
  }

  .event-row {
    grid-template-columns: 78px minmax(0, 1fr);
    gap: 18px;
    min-height: 0;
  }

  .event-row--multi-day {
    grid-template-columns: 150px minmax(0, 1fr);
  }

  .event-row__date {
    grid-row: 1 / span 2;
  }

  .event-row__action {
    grid-column: 2;
    grid-template-columns: minmax(0, 1fr) minmax(200px, 0.7fr);
    align-items: center;
    min-width: 0;
  }
}

@media (max-width: 520px) {
  .event-state {
    padding-inline: var(--page-gutter-mobile);
  }

  .event-directory__index a {
    gap: 12px;
    padding-inline: 16px;
  }

  .event-month {
    padding-top: 44px;
  }

  .event-row,
  .event-row--multi-day {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    align-items: start;
    padding-block: 24px;
  }

  .event-row__date {
    grid-row: auto;
    gap: 5px;
  }

  .event-row__date-list {
    align-items: baseline;
    gap: 0 10px;
  }

  .event-row__date-item {
    display: flex;
    gap: 0;
  }

  .event-row__day {
    display: none;
  }

  .event-row__date-separator {
    display: inline;
  }

  .event-row__copy,
  .event-row__action {
    grid-column: 1;
  }

  .event-row__action {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .event-row__action > a {
    min-width: 0;
  }

  .event-row__status {
    text-align: left;
  }

  .event-pagination {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px 24px;
  }

  .event-pagination__pages {
    grid-row: 1;
    grid-column: 1 / -1;
  }

  .event-pagination > :first-child {
    grid-row: 2;
    grid-column: 1;
    justify-self: start;
  }

  .event-pagination > :last-child {
    grid-row: 2;
    grid-column: 2;
    justify-self: end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .event-directory__index a,
  .event-row__copy h4 {
    transition: none;
  }
}
</style>
