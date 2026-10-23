<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
} from "vue";
import type {
  CourseDeliveryMode,
  CourseOverviewContent,
  CourseOverviewStatus,
} from "../../shared/types/course";
import { getCoursePath } from "../utils/courseRoutes";
import DirectoryIntro from "./DirectoryIntro.vue";

const props = withDefaults(
  defineProps<{
    content: CourseOverviewContent;
    status?: CourseOverviewStatus;
  }>(),
  {
    status: "ready",
  },
);

const emit = defineEmits<{
  retry: [];
}>();

const deliveryModeLabels: Record<CourseDeliveryMode, string> = {
  inPerson: "實體",
  online: "線上",
};

const orderedCategories = computed(() =>
  props.content.categories
    .toSorted((first, second) => first.order - second.order)
    .map((category) => ({
      ...category,
      courses: category.courses
        .filter((course) => course.isPublished)
        .toSorted((first, second) => first.order - second.order),
    }))
    .map((category) => ({
      ...category,
      courseRows: Array.from(
        { length: Math.ceil(category.courses.length / 4) },
        (_, rowIndex) => category.courses.slice(rowIndex * 4, rowIndex * 4 + 4),
      ),
    })),
);

const totalCourses = computed(() =>
  orderedCategories.value.reduce(
    (total, category) => total + category.courses.length,
    0,
  ),
);
const hasCourses = computed(() => totalCourses.value > 0);
const activeCategorySlug = ref("");
const categorySections = new Map<string, HTMLElement>();
let categoryObserver: IntersectionObserver | null = null;
let isMounted = false;
let hasAppliedInitialHash = false;

const setCategorySection = (
  element: Element | ComponentPublicInstance | null,
) => {
  if (element instanceof HTMLElement) categorySections.set(element.id, element);
};

async function setupCategoryNavigation() {
  if (!isMounted) return;
  categoryObserver?.disconnect();
  categoryObserver = null;
  if (props.status !== "ready" || !hasCourses.value) return;

  await nextTick();
  const requestedSlug = window.location.hash.slice(1);
  activeCategorySlug.value = orderedCategories.value.some(
    (category) => category.slug === requestedSlug,
  )
    ? requestedSlug
    : (orderedCategories.value[0]?.slug ?? "");

  if (requestedSlug && activeCategorySlug.value === requestedSlug && !hasAppliedInitialHash) {
    categorySections.get(requestedSlug)?.scrollIntoView({ block: "start" });
    hasAppliedInitialHash = true;
  }

  categoryObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (first, second) =>
            first.boundingClientRect.top - second.boundingClientRect.top,
        )[0];

      if (visibleSection?.target.id)
        activeCategorySlug.value = visibleSection.target.id;
    },
    { rootMargin: "-24% 0px -58% 0px", threshold: 0 },
  );

  categorySections.forEach((section) => categoryObserver?.observe(section));
}

onMounted(() => {
  isMounted = true;
  void setupCategoryNavigation();
});

watch(
  [
    () => props.status,
    () => orderedCategories.value.map((category) => category.slug).join("|"),
  ],
  () => void setupCategoryNavigation(),
);

onBeforeUnmount(() => {
  isMounted = false;
  categoryObserver?.disconnect();
});
</script>

<template>
  <div
    id="course-directory"
    class="course-directory"
    :aria-busy="status === 'loading'"
  >
    <aside class="course-directory__index">
      <DirectoryIntro
        :title="content.pageTitle"
        :description="content.directoryPrompt"
      />

      <nav v-if="status === 'ready' && hasCourses" aria-label="課程分類">
        <ol>
          <li v-for="category in orderedCategories" :key="category.key">
            <a
              class="directory-filter__link"
              :href="`#${category.slug}`"
              :aria-current="
                activeCategorySlug === category.slug ? 'location' : undefined
              "
              @click="activeCategorySlug = category.slug"
            >
              <span>{{ category.name }}</span>
              <span class="course-directory__count directory-filter__count">
                {{ category.courses.length }} 門
              </span>
            </a>
          </li>
        </ol>
      </nav>

      <p v-if="content.prototypeNotice" class="course-directory__notice">
        {{ content.prototypeNotice }}
      </p>
    </aside>

    <div class="course-directory__content" aria-live="polite">
      <div
        v-if="status === 'loading'"
        class="course-state course-state--loading"
      >
        <span class="course-state__line course-state__line--title" />
        <span class="course-state__line" />
        <span class="course-state__line" />
        <p>正在整理課程目錄…</p>
      </div>

      <div v-else-if="status === 'error'" class="course-state">
        <h2>課程目錄暫時無法載入</h2>
        <p>請稍後再試一次；主要導覽仍可正常使用。</p>
        <button type="button" @click="emit('retry')">重新載入</button>
      </div>

      <div v-else-if="!hasCourses" class="course-state">
        <h2>目前沒有可瀏覽的課程</h2>
        <p>新的課程資訊整理完成後，會在這裡依學習方向呈現。</p>
      </div>

      <template v-else>
        <section
          v-for="category in orderedCategories"
          :id="category.slug"
          :key="category.key"
          :ref="setCategorySection"
          class="course-group"
          :aria-labelledby="`${category.slug}-title`"
        >
          <div class="course-group__heading">
            <h2 :id="`${category.slug}-title`">{{ category.name }}</h2>
            <p>{{ category.summary }}</p>
          </div>

          <p v-if="category.courses.length === 0" class="course-group__empty">
            這個方向目前沒有已發布的課程。
          </p>

          <div v-else class="course-rows">
            <ul
              v-for="(row, rowIndex) in category.courseRows"
              :key="`${category.key}-${rowIndex}`"
              class="course-list"
            >
              <li v-for="course in row" :key="course.slug">
                <a class="course-item" :href="getCoursePath(course.slug)">
                  <span v-if="course.image" class="course-item__visual">
                    <img
                      :src="course.image.src"
                      :alt="course.image.alt"
                      :style="
                        course.image.objectPosition
                          ? { objectPosition: course.image.objectPosition }
                          : undefined
                      "
                      width="640"
                      height="960"
                      loading="lazy"
                    />
                  </span>
                  <span
                    v-else
                    class="course-item__visual course-item__visual--empty"
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                  <span class="course-item__copy">
                    <span class="course-item__modes">
                      {{
                        course.deliveryModes
                          .map((mode) => deliveryModeLabels[mode])
                          .join("・")
                      }}
                    </span>
                    <h3 class="course-item__title">{{ course.title }}</h3>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section v-if="content.endingMessage" class="course-ending">
          <h2>{{ content.endingMessage }}</h2>
          <a href="#course-directory">回到課程目錄</a>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.course-directory {
  display: grid;
  grid-template-columns: var(--split-layout-rail-width) minmax(0, 1fr);
  align-items: start;
  color: var(--color-ink);
  background: var(--color-paper);
}

.course-directory__index {
  position: sticky;
  top: var(--home-header-height);
  display: flex;
  height: calc(100svh - var(--home-header-height));
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  padding: clamp(64px, 7vw, 112px) clamp(28px, 3.2vw, 58px) 48px;
  overflow-y: auto;
  background: var(--color-sand);
  scrollbar-color: color-mix(in srgb, var(--color-saffron) 70%, transparent)
    transparent;
  scrollbar-width: thin;
}

.course-directory__index ol {
  padding: 0;
  margin: 0;
  list-style: none;
}

.course-directory__index a {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  color: var(--color-ink);
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 20%, transparent);
  text-decoration: none;
  letter-spacing: 0.07em;
  transition: color 180ms ease;
}

.course-directory__index li:first-child a {
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 20%, transparent);
}

.course-directory__index a:hover,
.course-directory__index a[aria-current="location"] {
  color: var(--color-oxblood);
}

.course-directory__index a[aria-current="location"] {
  font-weight: 700;
}

.course-directory__count {
  display: flex;
  align-items: center;
  gap: 9px;
  white-space: nowrap;
}

.course-directory__notice {
  max-width: 28em;
  margin: 0;
  color: var(--color-ink);
  font-size: 11px;
  line-height: 1.8;
  letter-spacing: 0.08em;
}

.course-directory__content {
  width: 100%;
  min-width: 0;
  padding-top: 30px;
}

.course-group {
  min-height: calc(100svh - var(--home-header-height));
  padding: clamp(72px, 8vw, 80px) clamp(28px, 4vw, 72px);
  overflow: hidden;
  scroll-margin-top: calc(var(--home-header-height) + 20px);
}

.course-group__heading {
  display: flex;
  gap: 40px;
  margin-bottom: 50px;
}

.course-group__heading h2 {
  max-width: 5em;
  margin: 0;
  font-family: var(--font-display);
  font-size: 60px;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.05em;
}

.course-group__heading p {
  max-width: 25em;
  font-size: 14px;
  line-height: 1.9;
  letter-spacing: 0.12em;
}

.course-rows {
  display: grid;
  gap: 18px;
}

.course-list {
  display: flex;
  min-height: 430px;
  align-items: stretch;
  gap: 18px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.course-list li {
  min-width: 0;
  flex: 1 1 0;
  transition: flex-grow 750ms cubic-bezier(0.16, 1, 0.3, 1);
}

.course-list li:has(.course-item:is(:hover, :focus-visible)) {
  flex-grow: 2.2;
}

.course-item {
  position: relative;
  display: flex;
  height: 430px;
  min-height: 44px;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  color: var(--color-warm-white);
  background: var(--color-film);
  text-decoration: none;
}

.course-item__copy {
  z-index: 2;
  position: relative;
  display: grid;
  align-items: end;
  padding: 30px 20px;
}

.course-item__modes {
  color: var(--color-saffron);
  font-size: 14px;
  letter-spacing: 0.18em;
}

.course-item__title {
  margin: 0;
  padding: 10px 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: 0.035em;
  overflow-wrap: anywhere;
  transition: font-size 0.3s ease;
}

.course-item__visual {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
  background: var(--color-clay);
}

.course-item__visual::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 30%, rgb(25 15 9 / 92%) 100%);
  content: "";
}

.course-item__visual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.58) brightness(0.8);
  transform: scale(1.04);
  transition:
    filter 500ms ease,
    transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.course-item__visual--empty {
  display: grid;
  place-items: center;
  background:
    linear-gradient(145deg, rgb(57 38 24 / 18%), transparent 46%),
    var(--color-clay);
}

.course-item__visual--empty span {
  width: 14px;
  height: 14px;
  background: var(--color-saffron);
  border: 3px solid var(--color-warm-white);
  border-radius: 50%;
}

.course-item:is(:hover, :focus-visible) .course-item__visual img {
  filter: saturate(0.86) brightness(0.9);
  transform: scale(1);
}

.course-item:is(:hover, :focus-visible) .course-item__title {
  font-size: 36px;
}

.course-group__empty {
  padding: 40px 0;
  margin: 0;
  color: var(--color-ink);
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 20%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 20%, transparent);
  line-height: 1.8;
}

.course-ending,
.course-state {
  display: grid;
  min-height: calc(100svh - var(--home-header-height));
  place-content: center;
  justify-items: start;
  padding: clamp(80px, 10vw, 160px) clamp(28px, 6vw, 112px);
}

.course-ending {
  color: var(--color-ink);
  background: var(--color-saffron);
}

.course-ending h2,
.course-state h2 {
  max-width: 12em;
  margin: 0 0 38px;
  font-family: var(--font-display);
  font-size: 78px;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: 0.035em;
}

.course-ending a,
.course-state button {
  display: inline-flex;
  min-width: min(230px, 100%);
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-bottom: 1px solid currentColor;
  font: inherit;
  letter-spacing: 0.1em;
  text-decoration: none;
  cursor: pointer;
}

.course-state {
  align-content: center;
  color: var(--color-warm-white);
  background: var(--color-night);
}

.course-state p {
  max-width: 34em;
  margin: 0 0 32px;
  color: var(--color-warm-muted);
  line-height: 1.9;
}

.course-state--loading {
  align-content: start;
  padding-top: clamp(100px, 11vw, 180px);
}

.course-state__line {
  display: block;
  width: min(520px, 88%);
  height: 1px;
  margin-bottom: 56px;
  background: rgb(247 246 244 / 18%);
}

.course-state__line--title {
  width: min(340px, 64%);
  height: 54px;
  margin-bottom: 80px;
  background: rgb(247 246 244 / 14%);
}

@media (max-width: 1023px) {
  .course-directory {
    grid-template-columns: 1fr;
  }

  .course-directory__index {
    position: relative;
    top: auto;
    min-height: min(620px, calc(100svh - var(--home-header-height)));
    height: auto;
    padding: 72px clamp(28px, 7vw, 72px) 48px;
    overflow: visible;
  }

  .course-group {
    min-height: auto;
    padding-block: 90px;
  }

  .course-group__heading {
    flex-direction: column;
    gap: 28px;
    margin-bottom: 75px;
  }

  .course-group__heading h2 {
    font-size: 52px;
  }

  .course-item__title,
  .course-item:is(:hover, :focus-visible) .course-item__title {
    font-size: 34px;
  }

  .course-ending h2,
  .course-state h2 {
    font-size: 40px;
  }

  .course-rows {
    gap: 32px;
  }

  .course-list {
    min-height: 0;
    flex-direction: column;
    gap: 32px;
  }

  .course-list li,
  .course-list li:has(.course-item:is(:hover, :focus-visible)) {
    width: 100%;
    flex: none;
  }

  .course-item {
    height: clamp(340px, 72vw, 430px);
  }

  .course-ending,
  .course-state {
    min-height: 68svh;
  }
}

@media (max-width: 420px) {
  .course-directory__index {
    padding-inline: 24px;
  }

  .course-directory__index a {
    gap: 12px;
  }

  .course-group,
  .course-ending,
  .course-state {
    padding-inline: 24px;
  }

  .course-item__copy {
    padding: 24px;
  }

}

@media (prefers-reduced-motion: reduce) {
  .course-directory__index a,
  .course-list li,
  .course-item__title,
  .course-item__visual img {
    transition: none;
  }

  .course-list li:has(.course-item:is(:hover, :focus-visible)) {
    flex-grow: 1;
  }

  .course-item:is(:hover, :focus-visible) .course-item__visual img {
    filter: saturate(0.58) brightness(0.8);
    transform: scale(1.04);
  }
}
</style>
