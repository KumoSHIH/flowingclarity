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
  CourseDetailBodyBlock,
  CourseDetailContent,
  CourseDetailStatus,
} from "../types/courseDetail";
import DetailBreadcrumb from "./DetailBreadcrumb.vue";
import SharedImageTextCarousel from "./SharedImageTextCarousel.vue";
import SharedRelatedArticles from "./SharedRelatedArticles.vue";
import SharedTestimonials from "./SharedTestimonials.vue";

const props = withDefaults(
  defineProps<{
    content?: CourseDetailContent;
    status?: CourseDetailStatus;
  }>(),
  { content: undefined, status: "ready" },
);

const emit = defineEmits<{ retry: [] }>();

const chapterLabels: Record<CourseDetailBodyBlock["type"], string> = {
  introduction: "課程介紹",
  text: "文字段落",
  gallery: "圖文內容",
  teacher: "帶領者",
  quote: "課程引言",
  curriculum: "課程架構",
  video: "課程影片",
  audience: "適合對象",
  testimonials: "學員心得分享",
  carousel: "圖片輪播",
};
const blockId = (key: string) => `content-${key}`;
const contentBody = computed(
  () =>
    props.content?.body.filter(
      (block) => block.type !== "testimonials" && block.type !== "carousel",
    ) ?? [],
);
const testimonialsBlock = computed(
  () =>
    props.content?.testimonials ??
    props.content?.body.find((block) => block.type === "testimonials"),
);
const highlightsBlock = computed(
  () =>
    props.content?.highlights ??
    props.content?.body.find((block) => block.type === "carousel"),
);
const isPrimaryChapter = (block: CourseDetailBodyBlock) =>
  block.type !== "quote" &&
  block.type !== "testimonials" &&
  block.type !== "carousel";
const curriculumPanelKey = (blockKey: string, unitKey: string) =>
  `${blockKey}:${unitKey}`;
const chapterLinks = computed(() => [
  ...contentBody.value.filter(isPrimaryChapter).map((block) => ({
    id: blockId(block.key),
    label:
      block.type === "gallery" && block.contentRole === "curriculum"
        ? "課程架構"
        : block.type === "gallery" || block.type === "text"
          ? block.title
          : chapterLabels[block.type],
  })),
  { id: "schedule", label: "課程梯次" },
  ...(testimonialsBlock.value
    ? [{ id: "testimonials", label: "學員分享" }]
    : []),
  ...(highlightsBlock.value ? [{ id: "highlights", label: "課程花絮" }] : []),
  { id: "registration", label: "報名" },
]);

const activeChapter = ref("");
const openCurriculumKeys = ref<string[]>([]);
const courseDetailRoot = ref<HTMLElement>();
const chapterNav = ref<HTMLElement>();
const observedSections = new Map<string, HTMLElement>();
const chapterAnchors = new Map<string, HTMLAnchorElement>();
let isMounted = false;
let scrollFrame: number | undefined;
let pendingChapter = "";
let pendingChapterUntil = 0;

const setObservedSection = (
  element: Element | ComponentPublicInstance | null,
) => {
  if (element instanceof HTMLElement) observedSections.set(element.id, element);
};

const setChapterNav = (element: Element | ComponentPublicInstance | null) => {
  if (element instanceof HTMLElement) chapterNav.value = element;
};

const setChapterAnchor = (
  id: string,
  element: Element | ComponentPublicInstance | null,
) => {
  if (element instanceof HTMLAnchorElement) chapterAnchors.set(id, element);
};

const toggleCurriculum = (key: string) => {
  openCurriculumKeys.value = openCurriculumKeys.value.includes(key)
    ? openCurriculumKeys.value.filter((item) => item !== key)
    : [...openCurriculumKeys.value, key];
};

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const chapterActivationTop = () => {
  const headerHeight =
    Number.parseFloat(
      getComputedStyle(
        courseDetailRoot.value ?? document.documentElement,
      ).getPropertyValue("--home-header-height"),
    ) || 87;
  const navHeight = chapterNav.value?.getBoundingClientRect().height || 68;
  return headerHeight + navHeight + 16;
};

const scrollActiveChapterIntoView = async (id: string) => {
  await nextTick();
  const nav = chapterNav.value;
  const anchor = chapterAnchors.get(id);
  if (!nav || !anchor || typeof nav.scrollTo !== "function") return;

  const gutter = 12;
  const anchorLeft = anchor.offsetLeft;
  const anchorRight = anchorLeft + anchor.offsetWidth;
  const visibleLeft = nav.scrollLeft + gutter;
  const visibleRight = nav.scrollLeft + nav.clientWidth - gutter;
  if (anchorLeft >= visibleLeft && anchorRight <= visibleRight) return;

  nav.scrollTo({
    left: Math.max(0, anchorLeft - (nav.clientWidth - anchor.offsetWidth) / 2),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
};

const syncActiveChapter = () => {
  scrollFrame = undefined;
  if (!isMounted || props.status !== "ready" || !props.content) return;

  const now = Date.now();
  if (pendingChapter && now < pendingChapterUntil) {
    activeChapter.value = pendingChapter;
    return;
  }
  pendingChapter = "";

  const sections = chapterLinks.value
    .map(({ id }) => observedSections.get(id))
    .filter((section): section is HTMLElement => Boolean(section));
  if (!sections.length) return;

  const activationTop = chapterActivationTop();
  const isAtPageEnd =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 2;
  const current = isAtPageEnd
    ? sections.at(-1)
    : ([...sections]
        .reverse()
        .find(
          (section) => section.getBoundingClientRect().top <= activationTop + 1,
        ) ?? sections[0]);
  if (current) activeChapter.value = current.id;
};

const scheduleChapterSync = () => {
  if (scrollFrame !== undefined) return;
  scrollFrame = window.requestAnimationFrame(syncActiveChapter);
};

const releasePendingChapter = () => {
  pendingChapter = "";
  scheduleChapterSync();
};

const selectChapter = (id: string) => {
  const section = observedSections.get(id);
  if (!section) return;

  pendingChapter = id;
  pendingChapterUntil = Date.now() + 1800;
  activeChapter.value = id;
  if (window.location.hash !== `#${id}`)
    window.history.pushState(null, "", `#${id}`);
  const top =
    window.scrollY +
    section.getBoundingClientRect().top -
    chapterActivationTop();
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
};

watch(
  () => props.content,
  (content) => {
    if (!content) return;
    activeChapter.value = chapterLinks.value[0]?.id ?? "schedule";
    openCurriculumKeys.value = contentBody.value.flatMap((block) =>
      block.type === "curriculum" && block.units[0]
        ? [curriculumPanelKey(block.key, block.units[0].key)]
        : [],
    );
  },
  { immediate: true },
);

watch(
  [() => props.status, () => props.content],
  async () => {
    await nextTick();
    scheduleChapterSync();
  },
  { flush: "post" },
);

watch(activeChapter, (id) => scrollActiveChapterIntoView(id));

onMounted(() => {
  isMounted = true;
  window.addEventListener("scroll", scheduleChapterSync, { passive: true });
  window.addEventListener("resize", scheduleChapterSync, { passive: true });
  window.addEventListener("wheel", releasePendingChapter, { passive: true });
  window.addEventListener("touchstart", releasePendingChapter, {
    passive: true,
  });
  scheduleChapterSync();
});

onBeforeUnmount(() => {
  isMounted = false;
  window.removeEventListener("scroll", scheduleChapterSync);
  window.removeEventListener("resize", scheduleChapterSync);
  window.removeEventListener("wheel", releasePendingChapter);
  window.removeEventListener("touchstart", releasePendingChapter);
  if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
});
</script>

<template>
  <div
    ref="courseDetailRoot"
    class="course-detail"
    :aria-busy="status === 'loading'"
  >
    <DetailBreadcrumb
      class="course-detail__breadcrumb"
      :items="[
        { label: '首頁', to: '/' },
        { label: '課程探索', to: '/course' },
        { label: content?.hero.title.replace('\n', '') ?? '課程內容' },
      ]"
    />

    <section
      v-if="status === 'loading'"
      class="course-detail-state"
      aria-live="polite"
    >
      <div class="course-detail-state__lines" aria-hidden="true">
        <span /><span /><span />
      </div>
      <h1>正在整理課程內容</h1>
      <p>請稍候，課程章節即將呈現。</p>
    </section>

    <section
      v-else-if="status === 'error'"
      class="course-detail-state"
      aria-live="assertive"
    >
      <h1>課程內容暫時無法載入</h1>
      <p>連線可能暫時中斷，請稍後再試一次。</p>
      <button type="button" @click="emit('retry')">重新載入</button>
    </section>

    <section
      v-else-if="status === 'not-found' || !content"
      class="course-detail-state"
    >
      <h1>找不到這門課程</h1>
      <p>課程可能尚未公開，或網址已經變更。</p>
      <NuxtLink to="/course">回到課程探索</NuxtLink>
    </section>

    <template v-else>
      <aside v-if="content.notice" class="course-detail__notice">
        {{ content.notice }}
      </aside>

      <section class="course-hero">
        <div
          :class="{
            'course-hero__visual': true,
            'course-hero__visual--portrait':
              content.hero.image.width &&
              content.hero.image.height &&
              content.hero.image.height > content.hero.image.width,
          }"
        >
          <img
            :src="content.hero.image.src"
            :alt="content.hero.image.alt"
            :style="
              content.hero.image.objectPosition
                ? { objectPosition: content.hero.image.objectPosition }
                : undefined
            "
            :width="content.hero.image.width ?? 1200"
            :height="content.hero.image.height ?? 960"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <span v-if="content.hero.image.label" class="asset-label">{{
            content.hero.image.label
          }}</span>
          <h1>{{ content.hero.title }}</h1>
        </div>
        <div class="course-hero__copy">
          <div>
            <p v-if="content.hero.englishTitle" class="course-hero__english">
              {{ content.hero.englishTitle }}
            </p>
            <p class="lede">{{ content.hero.summary }}</p>
            <hr />
            <dl>
              <div
                v-for="item in content.hero.meta"
                :key="item.label"
                :class="{
                  'course-hero__meta--multiline': item.value.includes('\n'),
                }"
              >
                <dt>{{ item.label }}</dt>
                <dd class="preserve-lines">{{ item.value }}</dd>
              </div>
            </dl>
          </div>
          <a
            v-if="content.hero.actionUrl"
            class="button-primary"
            :href="content.hero.actionUrl"
          >
            <span>{{ content.hero.actionLabel }}</span>
            <svg
              class="button-primary__icon"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M4 10h11M11 6l4 4-4 4" />
            </svg>
          </a>
          <button v-else class="button-primary" type="button" disabled>
            <span>{{ content.hero.actionLabel }}</span>
            <svg
              class="button-primary__icon"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M4 10h11M11 6l4 4-4 4" />
            </svg>
          </button>
        </div>
      </section>

      <nav
        :ref="setChapterNav"
        class="course-chapters"
        aria-label="課程頁面章節"
      >
        <a
          v-for="chapter in chapterLinks"
          :key="chapter.id"
          :ref="(element) => setChapterAnchor(chapter.id, element)"
          :href="`#${chapter.id}`"
          :aria-current="activeChapter === chapter.id ? 'location' : undefined"
          @click.prevent="selectChapter(chapter.id)"
          >{{ chapter.label }}</a
        >
      </nav>

      <template v-for="block in contentBody" :key="block.key">
        <section
          v-if="block.type === 'introduction'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-intro"
        >
          <div class="course-intro__inner">
            <h2>{{ block.title }}</h2>
            <div class="course-intro__body">
              <p class="lede preserve-lines">{{ block.lead }}</p>
              <p
                v-for="paragraph in block.paragraphs"
                :key="paragraph"
                class="body-copy preserve-lines"
              >
                {{ paragraph }}
              </p>
            </div>
          </div>
        </section>

        <section
          v-else-if="block.type === 'text'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-text course-intro"
        >
          <div class="course-intro__inner">
            <h2>{{ block.title }}</h2>
            <p class="body-copy preserve-lines">{{ block.text }}</p>
          </div>
        </section>

        <section
          v-else-if="block.type === 'gallery'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          :class="['course-gallery', `course-gallery--${block.layout}`]"
        >
          <header>
            <h2>{{ block.title }}</h2>
            <p v-if="block.description" class="body-copy preserve-lines">
              {{ block.description }}
            </p>
          </header>
          <div
            v-if="block.items.length"
            :class="['gallery-panel', `gallery-panel--${block.layout}`]"
          >
            <article
              v-for="item in block.items"
              :key="item.key"
              class="gallery-item"
            >
              <figure>
                <img
                  :src="item.image.src"
                  :alt="item.image.alt"
                  width="900"
                  height="680"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption
                  v-if="block.layout === 'collage' && item.description"
                  class="preserve-lines"
                >
                  {{ item.description }}
                </figcaption>
              </figure>
              <div v-if="block.layout !== 'collage'" class="gallery-item__copy">
                <span v-if="item.group">{{ item.group }}</span>
                <h3 v-if="item.title">{{ item.title }}</h3>
                <p v-if="item.description" class="preserve-lines">
                  {{ item.description }}
                </p>
                <ul v-if="item.points?.length">
                  <li v-for="point in item.points" :key="point">{{ point }}</li>
                </ul>
              </div>
            </article>
            <blockquote v-if="block.statement" class="preserve-lines">
              {{ block.statement }}
            </blockquote>
          </div>
          <p v-if="!block.items.length" class="inline-empty">
            圖文內容仍在整理，其他課程資訊可繼續閱讀。
          </p>
        </section>

        <section
          v-else-if="block.type === 'teacher'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-teacher"
        >
          <div class="course-teacher__portrait">
            <img
              v-if="block.image"
              :src="block.image.src"
              :alt="block.image.alt"
              :width="block.image.width"
              :height="block.image.height"
              :class="{
                'course-teacher__portrait-image--non-portrait':
                  block.image.width &&
                  block.image.height &&
                  block.image.width >= block.image.height,
              }"
              loading="lazy"
              decoding="async"
            />
            <span v-else>帶領者正式肖像待提供</span>
          </div>
          <div class="course-teacher__copy">
            <h2 class="course-teacher__name">
              {{ block.name
              }}<small v-if="block.englishName">{{ block.englishName }}</small>
            </h2>
            <p class="lede preserve-lines">{{ block.lead }}</p>
            <p class="body-copy preserve-lines">{{ block.biography }}</p>
          </div>
        </section>

        <section
          v-else-if="block.type === 'quote'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-quote"
        >
          <blockquote class="preserve-lines">「{{ block.text }}」</blockquote>
          <cite>{{ block.attribution }}</cite>
        </section>

        <section
          v-else-if="block.type === 'curriculum'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-curriculum"
        >
          <header>
            <h2>{{ block.title }}</h2>
            <p v-if="block.description" class="body-copy preserve-lines">
              {{ block.description }}
            </p>
          </header>
          <div v-if="block.units.length" class="curriculum-list">
            <article v-for="unit in block.units" :key="unit.key">
              <button
                type="button"
                :aria-expanded="
                  openCurriculumKeys.includes(
                    curriculumPanelKey(block.key, unit.key),
                  )
                "
                :aria-controls="`curriculum-panel-${block.key}-${unit.key}`"
                @click="
                  toggleCurriculum(curriculumPanelKey(block.key, unit.key))
                "
              >
                <span>{{ unit.stage }}</span
                ><strong class="preserve-lines">{{ unit.title }}</strong
                ><i aria-hidden="true" />
              </button>
              <div
                v-show="
                  openCurriculumKeys.includes(
                    curriculumPanelKey(block.key, unit.key),
                  )
                "
                :id="`curriculum-panel-${block.key}-${unit.key}`"
                class="curriculum-panel preserve-lines"
              >
                {{ unit.description }}
              </div>
            </article>
          </div>
          <p v-else class="inline-empty">詳細課綱仍在整理中。</p>
        </section>

        <section
          v-else-if="block.type === 'video'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-video"
        >
          <div class="course-video__inner">
            <h2>{{ block.title }}</h2>
            <div
              v-if="block.embedUrl || block.image"
              class="course-video__media"
            >
              <iframe
                v-if="block.embedUrl"
                :src="block.embedUrl"
                :title="`${block.title}｜YouTube 影片`"
                loading="lazy"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                  web-share;
                "
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              />
              <template v-else-if="block.image">
                <img
                  :src="block.image.src"
                  :alt="block.image.alt"
                  loading="lazy"
                  decoding="async"
                />
                <span v-if="block.image.label" class="asset-label">{{
                  block.image.label
                }}</span>
              </template>
            </div>
            <p class="course-video__status">
              {{ block.statusLabel }}
            </p>
          </div>
        </section>

        <section
          v-else-if="block.type === 'audience'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-audience"
        >
          <h2>{{ block.title }}</h2>
          <div>
            <p v-if="block.description" class="body-copy preserve-lines">
              {{ block.description }}
            </p>
            <ul v-if="block.items.length">
              <li v-for="item in block.items" :key="item">
                <i aria-hidden="true" />{{ item }}
              </li>
            </ul>
            <p v-else class="inline-empty">適合對象資訊仍在整理中。</p>
          </div>
        </section>
      </template>

      <section id="schedule" :ref="setObservedSection" class="course-schedule">
        <div class="course-schedule__inner">
          <header class="course-schedule__intro">
            <h2>{{ content.schedule.title }}</h2>
            <p
              v-if="content.schedule.description"
              class="body-copy preserve-lines"
            >
              {{ content.schedule.description }}
            </p>
          </header>
          <div v-if="content.schedule.sessions.length" class="schedule-grid">
            <article
              v-for="session in content.schedule.sessions"
              :key="session.key"
              class="schedule-session"
            >
              <header class="schedule-session__identity">
                <strong>{{ session.status }}</strong>
                <h3 class="preserve-lines">{{ session.title }}</h3>
                <p v-if="session.location" class="schedule-session__location">
                  {{ session.location }}
                </p>
              </header>
              <div class="schedule-session__content">
                <dl
                  v-if="session.stages.length"
                  class="schedule-stage-list"
                  aria-label="分階段上課日期"
                >
                  <div v-for="stage in session.stages" :key="stage.key">
                    <dt>{{ stage.title }}</dt>
                    <dd>
                      <span
                        v-for="dateRange in stage.dateRanges"
                        :key="dateRange"
                      >
                        {{ dateRange }}
                      </span>
                    </dd>
                  </div>
                </dl>
                <dl v-if="session.details.length" class="schedule-details">
                  <div
                    v-for="detail in session.details"
                    :key="`${detail.label}:${detail.value}`"
                  >
                    <dt>{{ detail.label }}</dt>
                    <dd>{{ detail.value }}</dd>
                  </div>
                </dl>
                <footer class="schedule-session__footer">
                  <p>正式地點、費用與參與條件，請以報名頁面公告為準。</p>
                  <a
                    class="schedule-session__action"
                    href="#registration"
                    @click.prevent="selectChapter('registration')"
                    >查看報名方式</a
                  >
                </footer>
              </div>
            </article>
          </div>
          <p v-else class="inline-empty">目前沒有已確認的課程梯次。</p>
        </div>
      </section>

      <div
        v-if="testimonialsBlock"
        id="testimonials"
        :ref="setObservedSection"
        class="course-testimonials"
      >
        <SharedTestimonials
          :id="`course-testimonials-${testimonialsBlock.key}`"
          :title="testimonialsBlock.title"
          :items="testimonialsBlock.items"
        />
      </div>

      <div
        v-if="highlightsBlock"
        id="highlights"
        :ref="setObservedSection"
        class="course-carousel"
      >
        <SharedImageTextCarousel
          :items="highlightsBlock.items"
          :label="highlightsBlock.title"
        >
          <template #heading
            ><h2>{{ highlightsBlock.title }}</h2></template
          >
          <template #copy>
            <p class="body-copy preserve-lines">{{ highlightsBlock.text }}</p>
          </template>
          <template #empty><p>輪播圖片仍在整理中。</p></template>
        </SharedImageTextCarousel>
      </div>

      <section
        id="registration"
        :ref="setObservedSection"
        class="course-registration"
      >
        <div>
          <h2>{{ content.registration.title }}</h2>
          <p v-if="content.registration.description" class="preserve-lines">
            {{ content.registration.description }}
          </p>
          <a
            v-if="content.registration.actionUrl"
            class="button-primary"
            :href="content.registration.actionUrl"
          >
            <span>{{ content.registration.actionLabel }}</span>
            <svg
              class="button-primary__icon"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M4 10h11M11 6l4 4-4 4" />
            </svg>
          </a>
          <button v-else class="button-primary" type="button" disabled>
            <span>{{ content.registration.actionLabel }}</span>
            <svg
              class="button-primary__icon"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M4 10h11M11 6l4 4-4 4" />
            </svg>
          </button>
        </div>
        <figure v-if="content.registration.image">
          <img
            :src="content.registration.image.src"
            :alt="content.registration.image.alt"
            loading="lazy"
            decoding="async"
          />
          <figcaption
            v-if="content.registration.image.label"
            class="asset-label"
          >
            {{ content.registration.image.label }}
          </figcaption>
        </figure>
      </section>

      <SharedRelatedArticles
        :items="content.relatedArticles"
        id-base="course-related"
        class="course-related"
      />
    </template>
  </div>
</template>

<style scoped>
.course-detail {
  --chapter-height: 68px;
  --course-section-block: 96px;
  --course-section-inline: clamp(42px, 7vw, 112px);
  --line: #cec3b5;
  --local-muted: #696158;
  color: var(--color-ink);
  background: var(--color-paper);
}
.course-detail :is([id^="content-"], #schedule, #registration) {
  scroll-margin-top: calc(
    var(--home-header-height) + var(--chapter-height) + 16px
  );
}
.course-detail :is(h1, h2, h3, blockquote) {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.25;
  text-wrap: balance;
}
.course-detail img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preserve-lines {
  white-space: pre-line;
}
.course-detail__notice {
  min-height: 52px;
  padding: 14px clamp(22px, 5.4vw, 84px);
  color: var(--color-warm-white);
  background: var(--color-night);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.body-copy {
  margin: 0;
  color: var(--local-muted);
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}
.lede {
  margin: 0;
  font-size: var(--type-lead-size);
  font-weight: var(--type-lead-weight);
  line-height: var(--type-lead-leading);
  letter-spacing: var(--type-lead-tracking);
}
.asset-label {
  position: absolute;
  z-index: 3;
  right: 16px;
  bottom: 16px;
  padding: 5px 9px;
  color: var(--color-warm-white);
  background: rgb(36 23 16 / 78%);
  font-size: var(--type-meta-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}
.course-hero {
  display: grid;
  grid-template-columns: minmax(0, 58%) minmax(0, 42%);
  min-height: 720px;
  color: var(--color-warm-white);
  background: var(--color-oxblood);
}
.course-hero__visual {
  position: relative;
  min-height: 720px;
}
.course-hero__visual--portrait {
  align-self: start;
  height: 720px;
  min-height: 0;
  overflow: visible;
}
.course-hero__visual::after {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  content: "";
}
.course-hero h1 {
  position: absolute;
  z-index: 2;
  right: -100px;
  top: 140px;
  color: var(--color-warm-white);
  font-size: var(--type-title-xl-size);
  line-height: var(--type-title-xl-leading);
  letter-spacing: var(--type-title-xl-tracking);
  white-space: pre-line;
  text-shadow: 2px 3px 25px #dfd5ca;
}
.course-hero__copy {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 96px clamp(54px, 6vw, 112px) 72px 142px;
}
.course-hero__english {
  margin: 0 0 24px;
  color: var(--color-saffron);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.course-hero hr {
  margin: 32px 0 22px;
  border: 0;
  border-top: 1px solid rgb(255 255 255 / 25%);
}
.course-hero dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 30px;
  margin: 0;
  font-size: var(--type-body-size);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}
.course-hero dl div {
  min-width: 0;
}
.course-hero__meta--multiline {
  grid-column: 1 / -1;
}
.course-hero dt {
  color: var(--color-saffron);
  font-weight: var(--type-label-weight);
}
.course-hero dd {
  margin: 0;
}
.course-chapters {
  position: sticky;
  z-index: 20;
  top: var(--home-header-height);
  display: grid;
  grid-auto-columns: minmax(150px, 1fr);
  grid-auto-flow: column;
  padding: 0 clamp(28px, 5.4vw, 84px);
  overflow-x: auto;
  background: rgb(248 245 239 / 96%);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(10px);
  scrollbar-width: thin;
}
.course-chapters a {
  display: grid;
  min-height: 68px;
  place-items: center;
  border-right: 1px solid var(--line);
  color: inherit;
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  text-decoration: none;
  white-space: nowrap;
}
.course-chapters a:first-child {
  border-left: 1px solid var(--line);
}
.course-chapters a[aria-current="location"] {
  background: var(--color-saffron);
}
.course-intro {
  display: flex;
  align-items: center;
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
}
.course-intro__inner {
  width: min(100%, 900px);
  margin-inline: auto;
}
.course-intro__inner > h2,
.course-intro__body {
  margin-inline: auto;
}
.course-intro__inner > h2 {
  margin-bottom: 48px;
}
.course-intro h2,
.course-audience h2 {
  white-space: pre-line;
}
.course-intro .lede {
  margin-bottom: 32px;
}
.course-intro .body-copy + .body-copy {
  margin-top: 22px;
}
.course-gallery {
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
  background: var(--color-sand);
}
.course-gallery > header,
.course-schedule > header {
  display: grid;
  grid-template-columns: 1fr 0.9fr;
  gap: 90px;
  align-items: end;
  margin-bottom: 70px;
}
.course-gallery--stages > header,
.course-gallery--folio > header {
  padding-bottom: 28px;
  border-bottom: 1px solid var(--line);
}
.gallery-panel {
  display: grid;
  gap: 0;
}
.gallery-item figure {
  position: relative;
  margin: 0;
  overflow: hidden;
  background: var(--color-bark);
}
.gallery-item figcaption {
  position: absolute;
  right: 0;
  bottom: 0;
  max-width: 24em;
  padding: 18px 22px;
  color: var(--color-warm-white);
  background: rgb(36 23 16 / 90%);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}
.gallery-item__copy > span {
  color: var(--color-oxblood);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.gallery-item__copy h3 {
  margin: 8px 0 18px;
  font-size: var(--type-title-sm-size);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}
.gallery-item__copy p {
  margin: 0;
  color: var(--local-muted);
}
.gallery-item__copy :is(p, li),
.curriculum-panel,
.course-audience li,
.course-registration p,
.inline-empty,
.course-detail-state p {
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}
.gallery-item__copy ul {
  padding-left: 1.25em;
}
.gallery-item__copy li::marker {
  color: var(--color-persimmon);
}
.gallery-panel--collage {
  position: relative;
  min-height: 980px;
  display: block;
}
.gallery-panel--collage .gallery-item {
  position: absolute;
}
.gallery-panel--collage .gallery-item:nth-child(1) {
  top: 0;
  left: 0;
  width: 57%;
  height: 450px;
}
.gallery-panel--collage .gallery-item:nth-child(2) {
  top: 198px;
  right: 0;
  width: 38%;
  height: 525px;
}
.gallery-panel--collage .gallery-item:nth-child(3) {
  bottom: 40px;
  left: 13%;
  width: 31%;
  height: 420px;
}
.gallery-panel--collage .gallery-item:nth-child(4) {
  right: 22%;
  bottom: 64px;
  width: 18%;
  height: 300px;
}
.gallery-panel--collage .gallery-item figure {
  height: 100%;
}
.gallery-panel--collage blockquote {
  position: absolute;
  z-index: 2;
  top: 345px;
  left: 41%;
  width: 315px;
  padding: 32px;
  color: var(--color-warm-white);
  background: var(--color-bark);
  font-size: var(--type-title-sm-size);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}
.gallery-panel--stages {
  grid-template-columns: repeat(4, 1fr);
  gap: 42px 24px;
}
.gallery-panel--stages .gallery-item:nth-child(even) {
  margin-top: 76px;
}
.gallery-panel--stages figure {
  height: 275px;
}
.gallery-panel--stages .gallery-item__copy {
  padding-top: 18px;
}
.gallery-panel--weave .gallery-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(58px, 7vw, 112px);
  align-items: center;
  padding: 70px 0;
  border-block-start: 1px solid var(--line);
}
.gallery-panel--weave .gallery-item:nth-child(even) figure {
  order: 2;
}
.gallery-panel--weave figure {
  height: 430px;
}
.gallery-panel--folio {
  grid-template-columns: 1fr 1fr;
  gap: 84px 12%;
}
.gallery-panel--folio .gallery-item:nth-child(even) {
  margin-top: 84px;
}
.gallery-panel--folio figure {
  height: 310px;
}
.gallery-panel--folio .gallery-item__copy {
  padding: 18px 20px 0;
}
.gallery-panel--folio .gallery-item__copy > span {
  font-size: var(--type-title-sm-size);
}
.gallery-panel--folio .gallery-item__copy h3 {
  font-size: var(--type-body-size);
}
.gallery-panel--dossier {
  grid-template-columns: 0.85fr 1.15fr;
  gap: 70px;
  align-items: start;
}
.gallery-panel--dossier .gallery-item {
  grid-column: 2;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 28px;
  padding: 34px 0;
  border-top: 1px solid var(--line);
}
.gallery-panel--dossier .gallery-item figure {
  height: 150px;
}
.gallery-panel--dossier blockquote {
  position: sticky;
  top: 104px;
  grid-column: 1;
  grid-row: 1 / span 3;
  padding-top: 18px;
  border-top: 1px solid var(--color-ink);
  font-size: var(--type-title-md-size);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}
.course-teacher {
  display: grid;
  grid-template-columns: 43% 57%;
  min-height: 620px;
}
.course-teacher__portrait {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 520px;
  padding: 16px;
  overflow: hidden;
  color: var(--color-warm-white);
  background: var(--color-bark);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}
.course-teacher__portrait img {
  max-width: 500px;
}
.course-teacher__portrait img.course-teacher__portrait-image--non-portrait {
  width: 100%;
  max-width: none;
  height: auto;
  object-fit: contain;
}
.course-teacher__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
}
.course-teacher__name {
  margin-bottom: 28px;
  font-size: var(--type-title-sm-size);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}
.course-carousel {
  --carousel-edge: var(--course-section-inline);
  --carousel-section-block: var(--course-section-block);
  --carousel-muted: var(--local-muted);
  background: var(--color-paper);
}
.course-carousel :deep(.about-carousel__copy) {
  align-self: start;
}
.course-testimonials {
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
  background: var(--color-paper);
}
.course-testimonials :deep(.shared-testimonials) {
  width: min(100%, 900px);
  margin-inline: auto;
  padding: 0;
  border-bottom: 0;
}
.course-related {
  --related-edge: var(--course-section-inline);
  --related-section-block: var(--course-section-block);
}
.course-teacher__name small {
  display: block;
  font-family: var(--font-sans);
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}
.course-teacher .lede {
  margin: 20px 0;
}
.course-quote {
  display: grid;
  min-height: 520px;
  place-items: center;
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
  color: var(--color-warm-white);
  text-align: center;
  background: var(--color-bark);
}
.course-quote blockquote {
  max-width: 1030px;
  font-size: var(--type-title-md-size);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}
.course-quote cite {
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  font-style: normal;
}
.course-curriculum {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 110px;
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
}
.course-curriculum header p {
  margin-top: 28px;
}
.curriculum-list {
  border-top: 1px solid var(--line);
}
.curriculum-list article {
  border-bottom: 1px solid var(--line);
}
.curriculum-list button {
  display: grid;
  grid-template-columns: 82px 1fr 30px;
  gap: 16px;
  align-items: center;
  width: 100%;
  min-height: 96px;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.curriculum-list button span {
  color: var(--color-oxblood);
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.curriculum-list button strong {
  font-family: var(--font-display);
  font-size: var(--type-title-sm-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}
.curriculum-list button i {
  position: relative;
  width: 18px;
  border-top: 1px solid currentColor;
}
.curriculum-list button i::after {
  position: absolute;
  top: -1px;
  left: 0;
  width: 18px;
  border-top: 1px solid currentColor;
  transform: rotate(90deg);
  transition: transform 0.3s ease;
  content: "";
}
.curriculum-list button[aria-expanded="true"] i::after {
  transform: rotate(0);
}
.curriculum-panel {
  padding: 0 46px 30px 98px;
  color: var(--local-muted);
}
.course-video {
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
  color: var(--color-warm-white);
  background: var(--color-night);
}
.course-video__inner {
  width: min(100%, 760px);
  margin-inline: auto;
}
.course-video h2 {
  margin: 0 0 32px;
}
.course-video__media {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--color-film);
}
.course-video__media iframe,
.course-video__media img {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
.course-video__media img {
  object-fit: cover;
}
.course-video__status {
  margin: 18px 0 0;
  color: var(--color-warm-muted);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}
.course-audience {
  display: grid;
  grid-template-columns: 0.72fr 1.28fr;
  gap: 110px;
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
  background: var(--color-sand);
}
.course-audience ul {
  margin: 38px 0 0;
  padding: 0;
  border-top: 1px solid var(--line);
  list-style: none;
}
.course-audience li {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 18px;
  align-items: center;
  min-height: 80px;
  border-bottom: 1px solid var(--line);
}
.course-audience li i {
  width: 7px;
  height: 7px;
  background: var(--color-saffron);
  border-radius: 50%;
}
.course-schedule {
  display: flex;
  min-height: 100svh;
  align-items: center;
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
}
.course-schedule__inner {
  width: min(100%, 900px);
  margin-inline: auto;
}
.course-schedule__intro {
  display: grid;
  grid-template-columns: minmax(220px, 0.75fr) minmax(0, 1.25fr);
  gap: clamp(48px, 7vw, 80px);
  align-items: end;
  padding-bottom: 36px;
  border-bottom: 1px solid var(--color-ink);
}
.course-detail .course-schedule .course-schedule__intro h2 {
  font-size: var(--type-title-lg-size);
  font-weight: var(--type-title-lg-weight);
  line-height: var(--type-title-lg-leading);
  letter-spacing: var(--type-title-lg-tracking);
}
.course-schedule__intro > *,
.schedule-session > * {
  min-width: 0;
}
.course-schedule__intro .body-copy {
  max-width: 620px;
  overflow-wrap: anywhere;
}
.schedule-grid {
  display: grid;
  gap: 44px;
  padding-top: 40px;
}
.schedule-session {
  display: grid;
  grid-template-columns: minmax(220px, 0.75fr) minmax(0, 1.25fr);
  gap: clamp(48px, 7vw, 80px);
}
.schedule-session + .schedule-session {
  padding-top: 44px;
  border-top: 1px solid var(--color-ink);
}
.schedule-session__identity {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}
.schedule-session__identity strong {
  padding: 6px 10px 5px;
  background: var(--color-saffron);
  font-size: var(--type-meta-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}
.schedule-session__identity h3 {
  font-size: var(--type-title-sm-size);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
  overflow-wrap: anywhere;
}
.schedule-session__location {
  margin: 0;
  color: var(--local-muted);
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.schedule-session__content {
  min-width: 0;
}
.schedule-stage-list {
  display: grid;
  margin: 0;
}
.schedule-stage-list > div {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 25px;
  align-items: center;
  min-height: 88px;
  border-bottom: 1px solid var(--line);
}
.schedule-stage-list dt {
  font-family: var(--font-display);
  font-size: var(--type-lead-size);
  font-weight: var(--type-lead-weight);
  line-height: var(--type-lead-leading);
  letter-spacing: var(--type-lead-tracking);
}
.schedule-stage-list dd {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: var(--type-lead-size);
  font-weight: var(--type-lead-weight);
  font-variant-numeric: tabular-nums;
  line-height: var(--type-lead-leading);
  letter-spacing: var(--type-lead-tracking);
}
.schedule-details {
  display: grid;
  gap: 25px;
  margin: 0;
  padding: 28px 0 30px;
}
.schedule-details > div {
  display: grid;
  gap: 8px;
}
.schedule-details dt {
  color: #965039;
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.schedule-details dd {
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: var(--type-lead-size);
  font-weight: var(--type-lead-weight);
  font-variant-numeric: tabular-nums;
  line-height: var(--type-lead-leading);
  letter-spacing: var(--type-lead-tracking);
}
.schedule-session__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}
.schedule-session__footer p {
  max-width: 430px;
  margin: 0;
  color: var(--local-muted);
  font-size: var(--type-meta-size);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}
.schedule-session__action {
  display: flex;
  width: fit-content;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 0 26px;
  color: var(--color-warm-white);
  background: var(--color-persimmon);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  text-decoration: none;
  transition: background-color 180ms ease-out;
}
@media (hover: hover) {
  .schedule-session__action:hover {
    background: var(--color-oxblood);
  }
}
.schedule-session__action:focus-visible {
  outline: 3px solid var(--color-saffron);
  outline-offset: 4px;
}
.course-registration {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
  color: var(--color-warm-white);
  background: var(--color-night);
}
.course-registration > div {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: var(--course-section-block);
  padding-inline: var(--course-section-inline);
}
.course-registration h2 {
  margin-bottom: 26px;
}
.course-detail
  :is(
    .course-intro,
    .course-gallery,
    .course-teacher,
    .course-curriculum,
    .course-video,
    .course-audience,
    .course-schedule,
    .course-registration,
    .course-carousel
  )
  h2 {
  font-size: var(--type-title-md-size);
  font-weight: var(--type-title-md-weight);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}
.course-registration p {
  max-width: 68ch;
  color: var(--color-warm-muted);
}
.course-registration figure {
  position: relative;
  align-self: center;
  width: 100%;
  height: 600px;
  max-height: 600px;
  min-height: 0;
  margin: 0;
  overflow: hidden;
}
.course-registration figure img {
  object-fit: cover;
}
.course-registration .button-primary {
  margin-top: 60px;
}
.course-hero .button-primary {
  margin-top: 1rem;
}
.inline-empty {
  padding: 36px;
  border-block: 1px solid var(--line);
  color: var(--local-muted);
}
.course-detail-state {
  display: grid;
  min-height: 70svh;
  place-content: center;
  justify-items: start;
  gap: 20px;
  padding: 64px clamp(24px, 7vw, 112px);
  background: var(--color-sand);
}
.course-detail-state h1 {
  max-width: 12em;
  font-size: var(--type-title-xl-size);
  font-weight: var(--type-title-xl-weight);
  line-height: var(--type-title-xl-leading);
  letter-spacing: var(--type-title-xl-tracking);
}
.course-detail-state p {
  margin: 0;
  color: var(--local-muted);
}
.course-detail-state :is(button, a) {
  min-height: 52px;
  padding: 12px 24px;
  border: 1px solid var(--color-ink);
  color: inherit;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
}
.course-detail-state__lines {
  display: grid;
  gap: 10px;
  width: min(420px, 70vw);
}
.course-detail-state__lines span {
  height: 10px;
  background: color-mix(in srgb, var(--color-bark) 35%, transparent);
  animation: pulse 1.6s ease-in-out infinite;
}
.course-detail-state__lines span:nth-child(2) {
  width: 78%;
}
.course-detail-state__lines span:nth-child(3) {
  width: 55%;
}
@keyframes pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 1099px) {
  .course-hero,
  .course-teacher,
  .course-curriculum,
  .course-audience,
  .course-registration {
    grid-template-columns: 1fr;
  }
  .course-hero__visual {
    min-height: 610px;
  }
  .course-hero__visual--portrait {
    height: 610px;
    min-height: 0;
  }
  .course-hero h1 {
    top: auto;
    right: auto;
    bottom: 30px;
    left: 50px;
    width: calc(100vw - 100px);
    max-width: none;
    overflow-wrap: anywhere;
    font-size: var(--type-title-xl-size);
  }
  .course-hero__copy {
    gap: 70px;
    padding: 76px 7vw;
  }
  .course-chapters {
    grid-template-columns: repeat(8, minmax(138px, 1fr));
    padding: 0;
  }
  .course-gallery > header,
  .course-schedule__intro,
  .schedule-session {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .course-teacher__portrait {
    min-height: 500px;
  }
  .course-curriculum,
  .course-audience {
    gap: 64px;
  }
  .course-registration figure {
    height: 520px;
    max-height: 520px;
  }
  .gallery-panel--folio .gallery-item__copy {
    padding: 18px 0px 0;
  }
}

@media (max-width: 767px) {
  .course-detail {
    --chapter-height: 58px;
    --course-section-block: 40px;
    --course-section-inline: var(--page-gutter-mobile);
  }
  .course-detail__notice {
    padding-inline: var(--page-gutter-mobile);
  }
  .course-hero {
    width: 100%;
    min-width: 0;
    max-width: 100vw;
    min-height: 0;
    overflow: hidden;
  }
  .course-hero__visual {
    width: 100vw;
    min-width: 0;
    max-width: 100vw;
    min-height: 430px;
  }
  .course-hero__visual--portrait {
    height: 430px;
    min-height: 0;
  }
  .course-hero__visual::after {
    background: linear-gradient(0deg, rgb(57 38 24 / 70%), transparent 56%);
  }
  .course-hero h1 {
    right: auto;
    bottom: 30px;
    left: var(--page-gutter-mobile);
    width: calc(100vw - var(--page-gutter-mobile) - var(--page-gutter-mobile));
    max-width: none;
    overflow-wrap: anywhere;
    text-wrap: wrap;
    word-break: break-all;
  }
  .course-hero__copy {
    box-sizing: border-box;
    gap: 48px;
    width: 100vw;
    min-width: 0;
    max-width: 100vw;
    padding: 48px var(--page-gutter-mobile) 54px;
    overflow-wrap: anywhere;
  }
  .course-hero dl {
    grid-template-columns: 1fr;
  }
  .course-chapters {
    grid-template-columns: repeat(8, minmax(122px, 1fr));
    scrollbar-width: none;
  }
  .course-chapters a {
    min-height: 58px;
  }
  .course-intro {
    min-height: 0;
  }
  .course-intro__inner > h2 {
    margin-bottom: 34px;
  }
  .course-intro h2,
  .course-audience h2 {
    font-size: var(--type-title-md-size);
  }
  .course-gallery > header {
    margin-bottom: 46px;
  }
  .course-gallery h2,
  .course-curriculum h2 {
    font-size: var(--type-title-md-size);
  }
  .course-detail .course-schedule .course-schedule__intro h2 {
    font-size: var(--type-title-md-size);
  }
  .gallery-panel--collage {
    display: grid;
    min-height: 0;
    gap: 26px;
  }
  .gallery-panel--collage .gallery-item:nth-child(n) {
    position: relative;
    inset: auto;
    width: 88%;
    height: auto;
  }
  .gallery-panel--collage .gallery-item:nth-child(even) {
    margin-left: auto;
  }
  .gallery-panel--collage .gallery-item figure {
    height: 330px;
  }
  .gallery-panel--collage .gallery-item:nth-child(3) figure {
    height: 390px;
  }
  .gallery-panel--collage blockquote {
    position: static;
    width: 88%;
    margin-left: auto;
    padding: 26px;
  }
  .gallery-item figcaption {
    position: static;
    max-width: none;
    padding: 15px 17px;
  }
  .gallery-panel--stages,
  .gallery-panel--folio,
  .gallery-panel--dossier {
    grid-template-columns: 1fr;
    gap: 42px;
  }
  .gallery-panel--stages .gallery-item:nth-child(even),
  .gallery-panel--folio .gallery-item:nth-child(even) {
    width: 100%;
    margin: 0 0 0 auto;
  }
  .gallery-panel--weave .gallery-item {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 54px 0;
  }
  .gallery-panel--weave .gallery-item:nth-child(even) figure {
    order: initial;
    margin-left: auto;
  }
  .gallery-panel--weave figure {
    width: 100%;
    height: 330px;
  }
  .gallery-panel--folio figure {
    height: 280px;
  }
  .gallery-panel--folio .gallery-item:nth-child(even) figure {
    height: 330px;
  }
  .gallery-panel--dossier .gallery-item {
    grid-column: 1;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .gallery-panel--dossier .gallery-item figure {
    width: 100%;
    height: 290px;
  }
  .gallery-panel--dossier .gallery-item:nth-child(even) figure {
    margin-left: auto;
  }
  .gallery-panel--dossier blockquote {
    position: static;
    grid-column: 1;
    grid-row: auto;
    padding: 24px;
    background: var(--color-bark);
    color: var(--color-warm-white);
    font-size: var(--type-title-md-size);
  }
  .course-teacher__portrait {
    min-height: 370px;
  }
  .course-quote {
    min-height: 440px;
  }
  .course-quote cite {
    text-align: center;
  }
  .course-curriculum,
  .course-audience {
    gap: 46px;
  }
  .curriculum-list button {
    grid-template-columns: 60px 1fr 24px;
    min-height: 104px;
  }
  .curriculum-panel {
    padding: 0 8px 28px 76px;
  }
  .course-video h2 {
    font-size: var(--type-title-md-size);
  }
  .course-audience li {
    min-height: 92px;
  }
  .course-schedule {
    min-height: 0;
  }
  .course-schedule__intro {
    gap: 24px;
    padding-bottom: 30px;
  }
  .schedule-grid {
    gap: 40px;
    padding-top: 34px;
  }
  .schedule-session {
    gap: 30px;
  }
  .schedule-session + .schedule-session {
    padding-top: 40px;
  }
  .schedule-session__identity h3 {
    text-wrap: wrap;
  }
  .schedule-stage-list > div {
    grid-template-columns: 76px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
    padding-block: 20px;
  }
  .schedule-stage-list dd {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .schedule-details {
    grid-template-columns: 1fr;
    gap: 10px;
    padding-block: 24px 28px;
  }
  .schedule-session__footer {
    align-items: stretch;
    flex-direction: column;
  }
  .schedule-session__action {
    width: 100%;
    min-height: 56px;
  }
  .course-registration h2 {
    font-size: var(--type-title-md-size);
  }
  .course-registration figure {
    height: 430px;
    max-height: 430px;
  }
  .course-detail-state {
    padding-inline: var(--page-gutter-mobile);
  }
}

@media (prefers-reduced-motion: reduce) {
  .course-detail-state__lines span {
    animation: none;
  }
  .curriculum-list button i::after {
    transition: none;
  }
}
</style>
