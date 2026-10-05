<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type ComponentPublicInstance,
} from 'vue'
import type {
  CourseDeliveryMode,
  CourseOverviewContent,
  CourseOverviewStatus,
} from '../../shared/types/course'
import { getCoursePath } from '../utils/courseRoutes'

const props = withDefaults(defineProps<{
  content: CourseOverviewContent
  status?: CourseOverviewStatus
}>(), {
  status: 'ready',
})

const emit = defineEmits<{
  retry: []
}>()

const deliveryModeLabels: Record<CourseDeliveryMode, string> = {
  inPerson: '實體',
  online: '線上',
}

const orderedCategories = computed(() => props.content.categories
  .toSorted((first, second) => first.order - second.order)
  .map(category => ({
    ...category,
    courses: category.courses
      .filter(course => course.isPublished)
      .toSorted((first, second) => first.order - second.order),
  })))

const totalCourses = computed(() => orderedCategories.value
  .reduce((total, category) => total + category.courses.length, 0))
const hasCourses = computed(() => totalCourses.value > 0)
const activeCategorySlug = ref('')
const categorySections = new Map<string, HTMLElement>()
let categoryObserver: IntersectionObserver | null = null

const setCategorySection = (
  element: Element | ComponentPublicInstance | null,
) => {
  if (element instanceof HTMLElement) categorySections.set(element.id, element)
}

onMounted(async () => {
  if (props.status !== 'ready' || !hasCourses.value) return

  await nextTick()
  const requestedSlug = window.location.hash.slice(1)
  activeCategorySlug.value = orderedCategories.value.some(
    category => category.slug === requestedSlug,
  )
    ? requestedSlug
    : (orderedCategories.value[0]?.slug ?? '')

  categoryObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter(entry => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0]

      if (visibleSection?.target.id) activeCategorySlug.value = visibleSection.target.id
    },
    { rootMargin: '-24% 0px -58% 0px', threshold: 0 },
  )

  categorySections.forEach(section => categoryObserver?.observe(section))
})

onBeforeUnmount(() => categoryObserver?.disconnect())
</script>

<template>
  <div
    id="course-directory"
    class="course-directory"
    :aria-busy="status === 'loading'"
  >
    <aside class="course-directory__index">
      <div>
        <h1>{{ content.pageTitle }}</h1>
        <p class="course-directory__prompt">{{ content.directoryPrompt }}</p>
      </div>

      <nav
        v-if="status === 'ready' && hasCourses"
        aria-label="課程分類"
      >
        <ol>
          <li
            v-for="category in orderedCategories"
            :key="category.key"
          >
            <a
              :href="`#${category.slug}`"
              :aria-current="activeCategorySlug === category.slug ? 'location' : undefined"
            >
              <span>{{ category.name }}</span>
              <span class="course-directory__count">
                <span v-if="activeCategorySlug === category.slug" class="course-directory__current">目前</span>
                {{ category.courses.length }} 門
              </span>
            </a>
          </li>
        </ol>
      </nav>

      <p
        v-if="content.prototypeNotice"
        class="course-directory__notice"
      >
        {{ content.prototypeNotice }}
      </p>
    </aside>

    <div class="course-directory__content" aria-live="polite">
      <div v-if="status === 'loading'" class="course-state course-state--loading">
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

          <ul v-else class="course-list">
            <li v-for="course in category.courses" :key="course.slug">
              <a class="course-item" :href="getCoursePath(course.slug)">
                <span class="course-item__copy">
                  <span class="course-item__modes">
                    {{ course.deliveryModes.map(mode => deliveryModeLabels[mode]).join('・') }}
                  </span>
                  <h3 class="course-item__title">{{ course.title }}</h3>
                  <span class="course-item__arrow" aria-hidden="true" />
                </span>
                <span
                  v-if="course.image"
                  class="course-item__visual"
                >
                  <img
                    :src="course.image.src"
                    :alt="course.image.alt"
                    width="640"
                    height="360"
                    loading="lazy"
                  >
                </span>
                <span v-else class="course-item__visual course-item__visual--empty" aria-hidden="true">
                  <span />
                </span>
              </a>
            </li>
          </ul>
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
  grid-template-columns: minmax(300px, 35%) minmax(0, 65%);
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
  color: var(--color-warm-white);
  background: var(--color-oxblood);
  scrollbar-color: color-mix(in srgb, var(--color-saffron) 70%, transparent) transparent;
  scrollbar-width: thin;
}

.course-directory__index h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(46px, 4.8vw, 76px);
  font-weight: 400;
  line-height: 1.28;
  letter-spacing: 0.04em;
}

.course-directory__prompt {
  max-width: 12em;
  margin: 28px 0 0;
  color: #e2d3c6;
  font-size: clamp(17px, 1.4vw, 22px);
  line-height: 1.8;
  letter-spacing: 0.08em;
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
  color: #e2d3c6;
  border-bottom: 1px solid rgb(247 246 244 / 22%);
  text-decoration: none;
  letter-spacing: 0.07em;
  transition: color 180ms ease;
}

.course-directory__index li:first-child a {
  border-top: 1px solid rgb(247 246 244 / 22%);
}

.course-directory__index a:hover,
.course-directory__index a[aria-current='location'] {
  color: var(--color-saffron);
}

.course-directory__count {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  white-space: nowrap;
}

.course-directory__current {
  color: var(--color-warm-white);
  font-size: 9px;
  letter-spacing: 0.14em;
}

.course-directory__current::before {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  background: var(--color-saffron);
  border-radius: 50%;
  content: '';
}

.course-directory__notice {
  max-width: 28em;
  margin: 0;
  color: #cdbbad;
  font-size: 11px;
  line-height: 1.8;
  letter-spacing: 0.08em;
}

.course-directory__content {
  min-width: 0;
}

.course-group {
  padding: clamp(96px, 10vw, 168px) clamp(28px, 6vw, 112px);
  border-bottom: 1px solid color-mix(in srgb, var(--color-oxblood) 20%, transparent);
  scroll-margin-top: calc(var(--home-header-height) + 20px);
}

.course-group__heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 42%);
  align-items: end;
  gap: 40px;
  margin-bottom: clamp(58px, 6vw, 92px);
}

.course-group__heading h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(44px, 4.7vw, 72px);
  font-weight: 400;
  line-height: 1.32;
  letter-spacing: 0.06em;
}

.course-group__heading p {
  max-width: 34em;
  margin: 0;
  color: #71685e;
  font-size: 15px;
  line-height: 1.95;
  letter-spacing: 0.04em;
}

.course-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.course-item {
  display: grid;
  min-height: 238px;
  grid-template-columns: minmax(0, 1fr) minmax(210px, 34%);
  align-items: center;
  gap: clamp(28px, 4vw, 64px);
  padding: 34px 0;
  color: inherit;
  border-top: 1px solid color-mix(in srgb, var(--color-oxblood) 20%, transparent);
  text-decoration: none;
}

.course-list li:last-child .course-item {
  border-bottom: 1px solid color-mix(in srgb, var(--color-oxblood) 20%, transparent);
}

.course-item__copy {
  position: relative;
  display: grid;
  gap: 18px;
  padding-right: 54px;
}

.course-item__modes {
  color: #71685e;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
}

.course-item__title {
  max-width: 15em;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(27px, 3vw, 46px);
  line-height: 1.45;
  letter-spacing: 0.035em;
  overflow-wrap: anywhere;
}

.course-item__arrow {
  position: absolute;
  right: 6px;
  bottom: 10px;
  width: 25px;
  height: 25px;
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.course-item__arrow::before {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 14px;
  height: 14px;
  border-top: 1.5px solid currentColor;
  border-right: 1.5px solid currentColor;
  content: '';
}

.course-item__arrow::after {
  position: absolute;
  top: 12px;
  left: 2px;
  width: 20px;
  border-top: 1.5px solid currentColor;
  content: '';
  transform: rotate(-45deg);
}

.course-item__visual {
  display: block;
  height: 170px;
  overflow: hidden;
  background: #d8cabb;
}

.course-item__visual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.7) sepia(0.08);
  transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
}

.course-item__visual--empty {
  display: grid;
  place-items: center;
  background: #e7ded2;
}

.course-item__visual--empty span {
  width: 12px;
  height: 12px;
  background: var(--color-saffron);
  border: 3px solid var(--color-warm-white);
  border-radius: 50%;
}

.course-item:hover .course-item__visual img {
  transform: scale(1.035);
}

.course-item:hover .course-item__arrow {
  transform: translate(5px, -5px);
}

.course-group__empty {
  padding: 40px 0;
  margin: 0;
  color: #71685e;
  border-top: 1px solid color-mix(in srgb, var(--color-oxblood) 20%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--color-oxblood) 20%, transparent);
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
  font-size: clamp(40px, 5vw, 78px);
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
  background: var(--color-paper);
}

.course-state p {
  max-width: 34em;
  margin: 0 0 32px;
  color: #71685e;
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
  background: color-mix(in srgb, var(--color-oxblood) 20%, transparent);
}

.course-state__line--title {
  width: min(340px, 64%);
  height: 54px;
  margin-bottom: 80px;
  background: #e7ded2;
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

  .course-directory__index h1 {
    font-size: clamp(44px, 10vw, 64px);
  }

  .course-group {
    padding-block: 96px;
  }

  .course-group__heading {
    grid-template-columns: 1fr;
    gap: 28px;
    margin-bottom: 54px;
  }

  .course-item {
    min-height: 0;
    grid-template-columns: 1fr;
    gap: 26px;
    padding: 38px 0;
  }

  .course-item__copy {
    min-height: 110px;
  }

  .course-item__visual {
    height: auto;
    aspect-ratio: 16 / 9;
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
}

@media (prefers-reduced-motion: reduce) {
  .course-directory__index a,
  .course-item__arrow,
  .course-item__visual img {
    transition: none;
  }
}
</style>
