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
  CourseDetailGalleryLayout,
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
  gallery: "圖文內容",
  teacher: "帶領者",
  quote: "課程引言",
  curriculum: "課程架構",
  video: "課程影片",
  audience: "適合對象",
  testimonials: "學員心得分享",
  carousel: "圖片輪播",
};
const galleryLayoutLabels: Record<CourseDetailGalleryLayout, string> = {
  collage: "編輯拼貼",
  stages: "分階圖譜",
  weave: "交錯章節",
  folio: "單元圖冊",
  dossier: "方法檔案",
};

const blockId = (key: string) => `content-${key}`;
const curriculumPanelKey = (blockKey: string, unitKey: string) => `${blockKey}:${unitKey}`;
const chapterLinks = computed(() => [
  ...(props.content?.body.map((block) => ({
    id: blockId(block.key),
    label: block.type === "gallery" ? block.title : chapterLabels[block.type],
  })) ?? []),
  { id: "schedule", label: "課程梯次" },
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

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const chapterActivationTop = () => {
  const headerHeight = Number.parseFloat(
    getComputedStyle(courseDetailRoot.value ?? document.documentElement)
      .getPropertyValue("--home-header-height"),
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
    left: Math.max(0, anchorLeft - ((nav.clientWidth - anchor.offsetWidth) / 2)),
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
  const isAtPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  const current = isAtPageEnd
    ? sections.at(-1)
    : [...sections].reverse().find(section => section.getBoundingClientRect().top <= activationTop + 1) ?? sections[0];
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
  if (window.location.hash !== `#${id}`) window.history.pushState(null, "", `#${id}`);
  const top = window.scrollY + section.getBoundingClientRect().top - chapterActivationTop();
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
};

watch(
  () => props.content,
  (content) => {
    if (!content) return;
    activeChapter.value = content.body[0] ? blockId(content.body[0].key) : "schedule";
    openCurriculumKeys.value = content.body.flatMap((block) =>
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

watch(activeChapter, id => scrollActiveChapterIntoView(id));

onMounted(() => {
  isMounted = true;
  window.addEventListener("scroll", scheduleChapterSync, { passive: true });
  window.addEventListener("resize", scheduleChapterSync, { passive: true });
  window.addEventListener("wheel", releasePendingChapter, { passive: true });
  window.addEventListener("touchstart", releasePendingChapter, { passive: true });
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
  <div ref="courseDetailRoot" class="course-detail" :aria-busy="status === 'loading'">
    <DetailBreadcrumb
      class="course-detail__breadcrumb"
      :items="[
        { label: '首頁', to: '/' },
        { label: '課程探索', to: '/course' },
        { label: content?.hero.title.replace('\n', '') ?? '課程內容' },
      ]"
    />

    <section v-if="status === 'loading'" class="course-detail-state" aria-live="polite">
      <div class="course-detail-state__lines" aria-hidden="true"><span /><span /><span /></div>
      <h1>正在整理課程內容</h1>
      <p>請稍候，課程章節即將呈現。</p>
    </section>

    <section v-else-if="status === 'error'" class="course-detail-state" aria-live="assertive">
      <h1>課程內容暫時無法載入</h1>
      <p>連線可能暫時中斷，請稍後再試一次。</p>
      <button type="button" @click="emit('retry')">重新載入</button>
    </section>

    <section v-else-if="status === 'not-found' || !content" class="course-detail-state">
      <h1>找不到這門課程</h1>
      <p>課程可能尚未公開，或網址已經變更。</p>
      <NuxtLink to="/course">回到課程探索</NuxtLink>
    </section>

    <template v-else>
      <aside v-if="content.notice" class="course-detail__notice">{{ content.notice }}</aside>

      <section class="course-hero">
        <div class="course-hero__visual">
          <img
            :src="content.hero.image.src"
            :alt="content.hero.image.alt"
            :style="content.hero.image.objectPosition ? { objectPosition: content.hero.image.objectPosition } : undefined"
            width="1200"
            height="960"
          >
          <span v-if="content.hero.image.label" class="asset-label">{{ content.hero.image.label }}</span>
          <h1>{{ content.hero.title }}</h1>
        </div>
        <div class="course-hero__copy">
          <div>
            <p v-if="content.hero.englishTitle" class="course-hero__english">{{ content.hero.englishTitle }}</p>
            <p class="lede">{{ content.hero.summary }}</p>
            <hr>
            <dl>
              <div v-for="item in content.hero.meta" :key="item.label">
                <dt>{{ item.label }}</dt><dd>{{ item.value }}</dd>
              </div>
            </dl>
          </div>
          <a v-if="content.hero.actionUrl" class="primary-action" :href="content.hero.actionUrl">
            <span>{{ content.hero.actionLabel }}</span><i aria-hidden="true" />
          </a>
          <button v-else class="primary-action" type="button" disabled>
            <span>{{ content.hero.actionLabel }}</span><i aria-hidden="true" />
          </button>
        </div>
      </section>

      <nav :ref="setChapterNav" class="course-chapters" aria-label="課程頁面章節">
        <a
          v-for="chapter in chapterLinks"
          :key="chapter.id"
          :ref="element => setChapterAnchor(chapter.id, element)"
          :href="`#${chapter.id}`"
          :aria-current="activeChapter === chapter.id ? 'location' : undefined"
          @click.prevent="selectChapter(chapter.id)"
        >{{ chapter.label }}</a>
      </nav>

      <template v-for="block in content.body" :key="block.key">
        <section
          v-if="block.type === 'introduction'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-intro"
        >
          <h2>{{ block.title }}</h2>
          <div>
            <p class="lede preserve-lines">{{ block.lead }}</p>
            <p v-for="paragraph in block.paragraphs" :key="paragraph" class="body-copy preserve-lines">{{ paragraph }}</p>
          </div>
        </section>

        <section
          v-else-if="block.type === 'gallery'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-gallery"
        >
          <header>
            <h2>{{ block.title }}</h2>
            <p class="body-copy preserve-lines">{{ block.description }}</p>
          </header>
          <div v-if="block.items.length" :class="['gallery-panel', `gallery-panel--${block.layout}`]">
            <article v-for="(item, index) in block.items" :key="item.key" class="gallery-item">
              <figure>
                <img :src="item.image.src" :alt="item.image.alt" width="900" height="680" loading="lazy">
                <figcaption v-if="block.layout === 'collage'" class="preserve-lines">{{ item.description }}</figcaption>
              </figure>
              <div v-if="block.layout !== 'collage'" class="gallery-item__copy">
                <span v-if="item.group">{{ item.group }}</span>
                <h3>{{ item.title }}</h3>
                <p class="preserve-lines">{{ item.description }}</p>
                <ul v-if="item.points?.length">
                  <li v-for="point in item.points" :key="point">{{ point }}</li>
                </ul>
                <strong v-if="block.layout === 'folio'" aria-hidden="true">{{ index + 1 }}</strong>
              </div>
            </article>
            <blockquote v-if="block.statement" class="preserve-lines">{{ block.statement }}</blockquote>
            <footer><strong>{{ galleryLayoutLabels[block.layout] }}</strong><span>{{ block.note }}</span></footer>
          </div>
          <p v-if="!block.items.length" class="inline-empty">圖文內容仍在整理，其他課程資訊可繼續閱讀。</p>
        </section>

        <section
          v-else-if="block.type === 'teacher'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-teacher"
        >
          <div class="course-teacher__portrait">
            <img v-if="block.image" :src="block.image.src" :alt="block.image.alt">
            <span v-else>帶領者正式肖像待提供</span>
          </div>
          <div class="course-teacher__copy">
            <h2>{{ block.name }}<small v-if="block.englishName">{{ block.englishName }}</small></h2>
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
          <header><h2>{{ block.title }}</h2><p class="body-copy preserve-lines">{{ block.description }}</p></header>
          <div v-if="block.units.length" class="curriculum-list">
            <article v-for="unit in block.units" :key="unit.key">
              <button
                type="button"
                :aria-expanded="openCurriculumKeys.includes(curriculumPanelKey(block.key, unit.key))"
                :aria-controls="`curriculum-panel-${block.key}-${unit.key}`"
                @click="toggleCurriculum(curriculumPanelKey(block.key, unit.key))"
              >
                <span>{{ unit.stage }}</span><strong>{{ unit.title }}</strong><i aria-hidden="true" />
              </button>
              <div
                v-show="openCurriculumKeys.includes(curriculumPanelKey(block.key, unit.key))"
                :id="`curriculum-panel-${block.key}-${unit.key}`"
                class="curriculum-panel preserve-lines"
              >{{ unit.description }}</div>
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
          <img :src="block.image.src" :alt="block.image.alt" loading="lazy">
          <span v-if="block.image.label" class="asset-label">{{ block.image.label }}</span>
          <div><h2>{{ block.title }}</h2>
            <a v-if="block.url" class="video-control" :href="block.url" aria-label="播放課程影片"><i aria-hidden="true" /></a>
            <button v-else class="video-control" type="button" disabled :aria-label="block.statusLabel"><i aria-hidden="true" /></button>
          </div>
          <strong>{{ block.statusLabel }}</strong>
        </section>

        <section
          v-else-if="block.type === 'audience'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-audience"
        >
          <h2>{{ block.title }}</h2>
          <div><p class="body-copy preserve-lines">{{ block.description }}</p>
            <ul v-if="block.items.length"><li v-for="item in block.items" :key="item"><i aria-hidden="true" />{{ item }}</li></ul>
            <p v-else class="inline-empty">適合對象資訊仍在整理中。</p>
          </div>
        </section>

        <div
          v-else-if="block.type === 'testimonials'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-testimonials"
        >
          <SharedTestimonials :id="`course-testimonials-${block.key}`" :title="block.title" :items="block.items" />
        </div>

        <div
          v-else-if="block.type === 'carousel'"
          :id="blockId(block.key)"
          :ref="setObservedSection"
          class="course-carousel"
        >
          <SharedImageTextCarousel :items="block.items" :label="block.title">
            <template #heading><h2>{{ block.title }}</h2></template>
            <template #copy><p class="body-copy preserve-lines">{{ block.text }}</p></template>
            <template #empty><p>輪播圖片仍在整理中。</p></template>
          </SharedImageTextCarousel>
        </div>
      </template>

      <section id="schedule" :ref="setObservedSection" class="course-schedule">
        <header><h2>{{ content.schedule.title }}</h2><p class="body-copy preserve-lines">{{ content.schedule.description }}</p></header>
        <div v-if="content.schedule.sessions.length" class="schedule-grid">
          <article v-for="session in content.schedule.sessions" :key="session.key">
            <h3>{{ session.title }}</h3><strong>{{ session.status }}</strong>
            <p v-for="detail in session.details" :key="detail">{{ detail }}</p>
          </article>
        </div>
        <p v-else class="inline-empty">目前沒有已確認的課程梯次。</p>
      </section>

      <section id="registration" :ref="setObservedSection" class="course-registration">
        <div><h2>{{ content.registration.title }}</h2><p class="preserve-lines">{{ content.registration.description }}</p>
          <a v-if="content.registration.actionUrl" class="primary-action" :href="content.registration.actionUrl"><span>{{ content.registration.actionLabel }}</span><i aria-hidden="true" /></a>
          <button v-else class="primary-action" type="button" disabled><span>{{ content.registration.actionLabel }}</span><i aria-hidden="true" /></button>
        </div>
        <figure v-if="content.registration.image"><img :src="content.registration.image.src" :alt="content.registration.image.alt" loading="lazy"><figcaption v-if="content.registration.image.label" class="asset-label">{{ content.registration.image.label }}</figcaption></figure>
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
.course-detail { --chapter-height: 68px; --line: #cec3b5; --local-muted: #696158; color: var(--color-ink); background: var(--color-paper); line-height: 1.9; letter-spacing: .045em; }
.course-detail :is([id^="content-"], #schedule, #registration) { scroll-margin-top: calc(var(--home-header-height) + var(--chapter-height) + 16px); }
.course-detail :is(h1, h2, h3, blockquote) { margin: 0; font-family: var(--font-display); font-weight: 400; line-height: 1.25; text-wrap: balance; }
.course-detail img { display: block; width: 100%; height: 100%; object-fit: cover; }
.preserve-lines { white-space: pre-line; }
.course-detail__notice { min-height: 52px; padding: 14px clamp(22px, 5.4vw, 84px); color: var(--color-warm-white); background: var(--color-night); font-size: 11px; letter-spacing: .12em; }
.body-copy { max-width: 70ch; margin: 0; color: var(--local-muted); line-height: 2; }
.lede { margin: 0; font-size: clamp(17px, 1.35vw, 21px); line-height: 1.9; }
.asset-label { position: absolute; z-index: 3; right: 16px; bottom: 16px; padding: 5px 9px; color: var(--color-warm-white); background: rgb(36 23 16 / 78%); font-size: 9px; font-weight: 700; letter-spacing: .14em; }
.course-hero { display: grid; grid-template-columns: minmax(0, 58%) minmax(0, 42%); min-height: 720px; color: var(--color-warm-white); background: var(--color-oxblood); }
.course-hero__visual { position: relative; min-height: 720px; }
.course-hero__visual::after { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 68%, rgb(57 38 24 / 28%)); content: ""; }
.course-hero h1 { position: absolute; z-index: 2; right: -100px; bottom: 86px; max-width: 650px; color: var(--color-warm-white); font-size: clamp(66px, 6.4vw, 104px); line-height: 1.05; white-space: pre-line; }
.course-hero__copy { display: flex; flex-direction: column; justify-content: space-between; padding: 96px clamp(54px, 6vw, 112px) 72px 142px; }
.course-hero__english { margin: 0 0 24px; color: var(--color-saffron); font-size: 12px; font-weight: 700; letter-spacing: .14em; }
.course-hero hr { margin: 32px 0 22px; border: 0; border-top: 1px solid rgb(255 255 255 / 25%); }
.course-hero dl { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 30px; margin: 0; font-size: 11px; }
.course-hero dl div { min-width: 0; }
.course-hero dt { color: var(--color-saffron); font-weight: 700; letter-spacing: .12em; }
.course-hero dd { margin: 0; }
.primary-action { display: flex; min-height: 82px; align-items: center; justify-content: space-between; gap: 24px; width: 100%; padding: 0 30px; border: 0; border-radius: 0; color: var(--color-warm-white); background: var(--color-persimmon); font-size: 18px; font-weight: 700; text-decoration: none; cursor: pointer; }
.primary-action:hover { background: var(--button-primary-hover); }
.primary-action:disabled { color: #dfd5ca; background: #8a6153; cursor: not-allowed; }
.primary-action i { position: relative; width: 34px; border-top: 1px solid currentColor; }
.primary-action i::after { position: absolute; top: -5px; right: 0; width: 9px; height: 9px; border-top: 1px solid currentColor; border-right: 1px solid currentColor; transform: rotate(45deg); content: ""; }
.course-chapters { position: sticky; z-index: 20; top: var(--home-header-height); display: grid; grid-auto-columns: minmax(150px, 1fr); grid-auto-flow: column; padding: 0 clamp(28px, 5.4vw, 84px); overflow-x: auto; background: rgb(248 245 239 / 96%); border-bottom: 1px solid var(--line); backdrop-filter: blur(10px); scrollbar-width: thin; }
.course-chapters a { display: grid; min-height: 68px; place-items: center; border-right: 1px solid var(--line); color: inherit; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-decoration: none; white-space: nowrap; }
.course-chapters a:first-child { border-left: 1px solid var(--line); }
.course-chapters a[aria-current="location"] { background: var(--color-saffron); }
.course-intro { display: grid; grid-template-columns: .92fr 1.08fr; gap: clamp(70px, 10vw, 170px); padding: 150px clamp(42px, 7vw, 112px) 176px; }
.course-intro h2, .course-audience h2 { font-size: clamp(52px, 5.4vw, 86px); white-space: pre-line; }
.course-intro .lede { max-width: 34ch; margin-bottom: 32px; }
.course-intro .body-copy + .body-copy { margin-top: 22px; }
.course-gallery { padding: 136px clamp(42px, 7vw, 112px) 160px; background: var(--color-sand); }
.course-gallery > header, .course-schedule > header { display: grid; grid-template-columns: 1fr .9fr; gap: 90px; align-items: end; margin-bottom: 70px; }
.course-gallery h2, .course-schedule h2, .course-curriculum h2 { font-size: clamp(50px, 5vw, 78px); }
.gallery-panel { display: grid; gap: 0; }
.gallery-panel footer { display: flex; justify-content: space-between; gap: 40px; margin-top: 38px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 12px; }
.gallery-panel footer span { color: var(--local-muted); }
.gallery-item figure { position: relative; margin: 0; overflow: hidden; background: var(--color-bark); }
.gallery-item figcaption { position: absolute; right: 0; bottom: 0; max-width: 24em; padding: 18px 22px; color: var(--color-warm-white); background: rgb(36 23 16 / 90%); font-size: 12px; }
.gallery-item__copy > span { color: var(--color-oxblood); font-size: 11px; font-weight: 700; }
.gallery-item__copy h3 { margin: 8px 0 18px; font-size: 30px; }
.gallery-item__copy p { margin: 0; color: var(--local-muted); }
.gallery-item__copy ul { padding-left: 1.25em; }
.gallery-item__copy li::marker { color: var(--color-persimmon); }
.gallery-panel--collage { position: relative; min-height: 980px; display: block; }
.gallery-panel--collage .gallery-item { position: absolute; }
.gallery-panel--collage .gallery-item:nth-child(1) { top: 0; left: 0; width: 57%; height: 450px; }
.gallery-panel--collage .gallery-item:nth-child(2) { top: 198px; right: 0; width: 38%; height: 525px; }
.gallery-panel--collage .gallery-item:nth-child(3) { bottom: 40px; left: 13%; width: 31%; height: 420px; }
.gallery-panel--collage .gallery-item:nth-child(4) { right: 22%; bottom: 64px; width: 18%; height: 300px; }
.gallery-panel--collage .gallery-item figure { height: 100%; }
.gallery-panel--collage blockquote { position: absolute; z-index: 2; top: 345px; left: 41%; width: 315px; padding: 32px; color: var(--color-warm-white); background: var(--color-bark); font-size: 23px; line-height: 1.65; }
.gallery-panel--collage footer { position: absolute; right: 0; bottom: 0; left: 0; }
.gallery-panel--stages { grid-template-columns: repeat(4, 1fr); gap: 42px 24px; }
.gallery-panel--stages .gallery-item:nth-child(even) { margin-top: 76px; }
.gallery-panel--stages figure { height: 275px; }
.gallery-panel--stages .gallery-item__copy { padding-top: 18px; }
.gallery-panel--stages footer { grid-column: 1 / -1; }
.gallery-panel--weave .gallery-item { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(58px, 7vw, 112px); align-items: center; padding: 70px 0; border-block-start: 1px solid var(--line); }
.gallery-panel--weave .gallery-item:nth-child(even) figure { order: 2; }
.gallery-panel--weave figure { height: 430px; }
.gallery-panel--folio { grid-template-columns: 1fr 1fr; gap: 84px 12%; }
.gallery-panel--folio .gallery-item:nth-child(even) { margin-top: 84px; }
.gallery-panel--folio figure { height: 310px; }
.gallery-panel--folio .gallery-item__copy { position: relative; padding: 18px 0 0 52px; }
.gallery-panel--folio .gallery-item__copy > strong { position: absolute; top: 17px; left: 0; font-family: var(--font-display); font-size: 24px; }
.gallery-panel--folio footer { grid-column: 1 / -1; }
.gallery-panel--dossier { grid-template-columns: .85fr 1.15fr; gap: 70px; align-items: start; }
.gallery-panel--dossier .gallery-item { grid-column: 2; display: grid; grid-template-columns: 180px 1fr; gap: 28px; padding: 34px 0; border-top: 1px solid var(--line); }
.gallery-panel--dossier .gallery-item figure { height: 150px; }
.gallery-panel--dossier blockquote { position: sticky; top: 104px; grid-column: 1; grid-row: 1 / span 3; padding-top: 18px; border-top: 1px solid var(--color-ink); font-size: 42px; }
.gallery-panel--dossier footer { grid-column: 1 / -1; }
.course-teacher { display: grid; grid-template-columns: 43% 57%; min-height: 620px; }
.course-teacher__portrait { position: relative; display: grid; place-items: center; min-height: 520px; padding: 16px; overflow: hidden; color: var(--color-warm-white); background: var(--color-bark); font-size: 10px; letter-spacing: .14em; }
.course-teacher__portrait::before, .course-teacher__portrait::after { position: absolute; width: 122px; height: 122px; border: 1px solid rgb(248 191 76 / 28%); border-radius: 50%; content: ""; }
.course-teacher__portrait::after { width: 76px; height: 76px; }
.course-teacher__copy { display: flex; flex-direction: column; justify-content: center; padding: 90px clamp(60px, 8vw, 150px); }
.course-teacher h2 { margin-bottom: 28px; font-size: clamp(48px, 4.6vw, 74px); }
.course-carousel { --carousel-edge: clamp(42px, 7vw, 112px); --carousel-muted: var(--local-muted); background: var(--color-paper); }
.course-carousel :deep(.about-carousel__copy) { align-self: start; }
.course-testimonials { background: var(--color-paper); }
.course-related { --related-edge: clamp(42px, 7vw, 112px); }
.course-teacher h2 small { display: block; margin-top: 10px; font: inherit; font-size: .48em; }
.course-teacher .lede { max-width: 31ch; margin-bottom: 22px; }
.course-quote { display: grid; min-height: 520px; place-items: center; padding: 90px 9vw; color: var(--color-warm-white); text-align: center; background: var(--color-bark); }
.course-quote blockquote { max-width: 1030px; font-size: clamp(38px, 4.2vw, 68px); line-height: 1.55; }
.course-quote cite { font-size: 11px; font-style: normal; letter-spacing: .15em; }
.course-curriculum { display: grid; grid-template-columns: .8fr 1.2fr; gap: 110px; padding: 150px clamp(42px, 7vw, 112px); }
.course-curriculum header p { margin-top: 28px; }
.curriculum-list { border-top: 1px solid var(--line); }
.curriculum-list article { border-bottom: 1px solid var(--line); }
.curriculum-list button { display: grid; grid-template-columns: 82px 1fr 30px; gap: 16px; align-items: center; width: 100%; min-height: 96px; padding: 0; border: 0; color: inherit; background: transparent; text-align: left; cursor: pointer; }
.curriculum-list button span { color: var(--color-oxblood); font-size: 11px; font-weight: 700; }
.curriculum-list button strong { font-family: var(--font-display); font-size: 20px; font-weight: 500; }
.curriculum-list button i { position: relative; width: 18px; border-top: 1px solid currentColor; }
.curriculum-list button i::after { position: absolute; top: -1px; left: 0; width: 18px; border-top: 1px solid currentColor; transform: rotate(90deg); transition: transform .3s ease; content: ""; }
.curriculum-list button[aria-expanded="true"] i::after { transform: rotate(0); }
.curriculum-panel { padding: 0 46px 30px 98px; color: var(--local-muted); line-height: 2; }
.course-video { position: relative; min-height: 650px; overflow: hidden; color: var(--color-warm-white); background: var(--color-night); }
.course-video::after { position: absolute; inset: 0; background: linear-gradient(90deg, rgb(36 23 16 / 86%), rgb(36 23 16 / 18%)); content: ""; }
.course-video > div { position: absolute; z-index: 2; top: 50%; left: clamp(42px, 7vw, 112px); width: min(680px, 52vw); transform: translateY(-50%); }
.course-video h2 { margin-bottom: 38px; font-size: clamp(52px, 5.2vw, 82px); }
.course-video > strong { position: absolute; z-index: 3; right: 24px; bottom: 22px; padding: 7px 11px; color: var(--color-night); background: var(--color-saffron); font-size: 10px; }
.video-control { position: relative; display: block; width: 94px; height: 94px; border: 1px solid rgb(255 255 255 / 70%); border-radius: 50%; color: inherit; background: rgb(255 255 255 / 7%); }
.video-control:disabled { cursor: not-allowed; }
.video-control i { position: absolute; top: 34px; left: 39px; width: 20px; height: 24px; background: currentColor; clip-path: polygon(0 0, 100% 50%, 0 100%); }
.course-audience { display: grid; grid-template-columns: .72fr 1.28fr; gap: 110px; padding: 148px clamp(42px, 7vw, 112px); background: var(--color-sand); }
.course-audience ul { margin: 38px 0 0; padding: 0; border-top: 1px solid var(--line); list-style: none; }
.course-audience li { display: grid; grid-template-columns: 20px 1fr; gap: 18px; align-items: center; min-height: 80px; border-bottom: 1px solid var(--line); }
.course-audience li i { width: 7px; height: 7px; background: var(--color-saffron); border-radius: 50%; }
.course-schedule { padding: 144px clamp(42px, 7vw, 112px) 160px; }
.schedule-grid { display: grid; grid-template-columns: repeat(2, 1fr); border-block: 1px solid var(--color-ink); }
.schedule-grid article { position: relative; min-height: 235px; padding: 36px 44px; }
.schedule-grid article + article { border-left: 1px solid var(--line); }
.schedule-grid h3 { margin-bottom: 38px; font-size: 27px; }
.schedule-grid strong { position: absolute; top: 38px; right: 28px; padding: 5px 9px; background: var(--color-saffron); font-size: 9px; }
.schedule-grid p { margin: 0; color: var(--local-muted); font-size: 13px; }
.course-registration { display: grid; grid-template-columns: 1fr 1fr; min-height: 600px; color: var(--color-warm-white); background: var(--color-night); }
.course-registration > div { display: flex; flex-direction: column; justify-content: space-between; padding: 90px clamp(42px, 7vw, 112px); }
.course-registration h2 { margin-bottom: 26px; font-size: clamp(48px, 4.7vw, 76px); }
.course-detail :is(.course-intro, .course-gallery, .course-teacher, .course-curriculum, .course-video, .course-audience, .course-schedule, .course-registration, .course-carousel) h2 { font-size: var(--detail-section-title-size); line-height: 1.4; letter-spacing: .02em; }
.course-registration p { max-width: 68ch; color: var(--color-warm-muted); }
.course-registration figure { position: relative; min-height: 600px; margin: 0; }
.course-registration .primary-action { max-width: 520px; margin-top: 60px; }
.inline-empty { padding: 36px; border-block: 1px solid var(--line); color: var(--local-muted); }
.course-detail-state { display: grid; min-height: 70svh; place-content: center; justify-items: start; gap: 20px; padding: 64px clamp(24px, 7vw, 112px); background: var(--color-sand); }
.course-detail-state h1 { max-width: 12em; font-size: clamp(48px, 7vw, 92px); }
.course-detail-state p { margin: 0; color: var(--local-muted); }
.course-detail-state :is(button, a) { min-height: 52px; padding: 12px 24px; border: 1px solid var(--color-ink); color: inherit; background: transparent; text-decoration: none; cursor: pointer; }
.course-detail-state__lines { display: grid; gap: 10px; width: min(420px, 70vw); }
.course-detail-state__lines span { height: 10px; background: color-mix(in srgb, var(--color-bark) 35%, transparent); animation: pulse 1.6s ease-in-out infinite; }
.course-detail-state__lines span:nth-child(2) { width: 78%; }.course-detail-state__lines span:nth-child(3) { width: 55%; }
@keyframes pulse { 50% { opacity: .35; } }

@media (max-width: 1099px) {
  .course-hero, .course-teacher, .course-curriculum, .course-audience, .course-registration { grid-template-columns: 1fr; }
  .course-hero__visual { min-height: 610px; }.course-hero h1 { right: 7vw; bottom: 54px; }.course-hero__copy { gap: 70px; padding: 76px 7vw; }
  .course-chapters { grid-template-columns: repeat(8, minmax(138px, 1fr)); padding: 0; }
  .course-intro, .course-gallery > header, .course-schedule > header { grid-template-columns: 1fr; gap: 48px; }
  .course-teacher__portrait { min-height: 500px; }.course-curriculum, .course-audience { gap: 64px; }
  .course-registration figure { min-height: 520px; }
}

@media (max-width: 767px) {
  .course-detail { --chapter-height: 58px; letter-spacing: .035em; }.course-detail__notice { padding-inline: 22px; }
  .course-hero { width: 100%; min-width: 0; max-width: 100vw; min-height: 0; overflow: hidden; }.course-hero__visual { width: 100vw; min-width: 0; max-width: 100vw; min-height: 430px; }.course-hero__visual::after { background: linear-gradient(0deg, rgb(57 38 24 / 70%), transparent 56%); }
  .course-hero h1 { right: auto; bottom: 30px; left: 22px; width: calc(100vw - 44px); max-width: none; overflow-wrap: anywhere; font-size: clamp(36px, 9.5vw, 44px); letter-spacing: 0; text-wrap: wrap; word-break: break-all; }.course-hero__copy { box-sizing: border-box; gap: 48px; width: 100vw; min-width: 0; max-width: 100vw; padding: 48px 22px 54px; overflow-wrap: anywhere; }.course-hero dl { grid-template-columns: 1fr; }
  .primary-action { min-height: 72px; padding: 0 22px; font-size: 17px; }.course-chapters { grid-template-columns: repeat(8, minmax(122px, 1fr)); scrollbar-width: none; }.course-chapters a { min-height: 58px; }
  .course-intro { gap: 34px; padding: 88px 22px 102px; }.course-intro h2, .course-audience h2 { font-size: var(--detail-section-title-size); }
  .course-gallery { padding: 86px 22px 104px; }.course-gallery > header { margin-bottom: 46px; }.course-gallery h2, .course-schedule h2, .course-curriculum h2 { font-size: var(--detail-section-title-size); }
  .gallery-panel footer { display: grid; gap: 8px; }
  .gallery-panel--collage { display: grid; min-height: 0; gap: 26px; }.gallery-panel--collage .gallery-item:nth-child(n) { position: relative; inset: auto; width: 88%; height: auto; }.gallery-panel--collage .gallery-item:nth-child(even) { margin-left: auto; }.gallery-panel--collage .gallery-item figure { height: 330px; }.gallery-panel--collage .gallery-item:nth-child(3) figure { height: 390px; }.gallery-panel--collage blockquote { position: static; width: 88%; margin-left: auto; padding: 26px; font-size: 21px; }.gallery-panel--collage footer { position: static; }
  .gallery-item figcaption { position: static; max-width: none; padding: 15px 17px; }
  .gallery-panel--stages, .gallery-panel--folio, .gallery-panel--dossier { grid-template-columns: 1fr; gap: 42px; }.gallery-panel--stages .gallery-item:nth-child(even), .gallery-panel--folio .gallery-item:nth-child(even) { width: 88%; margin: 0 0 0 auto; }.gallery-panel--stages footer, .gallery-panel--folio footer, .gallery-panel--dossier footer { grid-column: 1; }
  .gallery-panel--weave .gallery-item { grid-template-columns: 1fr; gap: 30px; padding: 54px 0; }.gallery-panel--weave .gallery-item:nth-child(even) figure { order: initial; margin-left: auto; }.gallery-panel--weave figure { width: 90%; height: 330px; }
  .gallery-panel--folio figure { height: 280px; }.gallery-panel--folio .gallery-item:nth-child(even) figure { height: 330px; }
  .gallery-panel--dossier .gallery-item { grid-column: 1; grid-template-columns: 1fr; gap: 20px; }.gallery-panel--dossier .gallery-item figure { width: 90%; height: 290px; }.gallery-panel--dossier .gallery-item:nth-child(even) figure { margin-left: auto; }.gallery-panel--dossier blockquote { position: static; grid-column: 1; grid-row: auto; padding: 24px; background: var(--color-bark); color: var(--color-warm-white); font-size: 30px; }
  .course-teacher__portrait { min-height: 370px; }.course-teacher__copy { padding: 72px 22px 84px; }.course-teacher h2 { font-size: var(--detail-section-title-size); }
  .course-quote { min-height: 440px; padding: 74px 22px; }.course-quote blockquote { font-size: clamp(33px, 9vw, 44px); }.course-quote cite { text-align: center; }
  .course-curriculum, .course-audience { gap: 46px; padding: 90px 22px; }.curriculum-list button { grid-template-columns: 60px 1fr 24px; min-height: 104px; }.curriculum-panel { padding: 0 8px 28px 76px; }
  .course-video { min-height: 560px; }.course-video > div { right: 22px; left: 22px; width: auto; }.course-video h2 { font-size: var(--detail-section-title-size); }
  .course-audience li { min-height: 92px; }
  .course-schedule { padding: 90px 22px 104px; }.course-schedule > header { margin-bottom: 44px; }.schedule-grid { grid-template-columns: 1fr; }.schedule-grid article { padding: 32px 0; }.schedule-grid article + article { border-top: 1px solid var(--line); border-left: 0; }.schedule-grid strong { right: 0; }
  .course-registration > div { min-height: 540px; padding: 72px 22px; }.course-registration h2 { font-size: var(--detail-section-title-size); }.course-registration figure { min-height: 430px; }
}

@media (prefers-reduced-motion: reduce) {
  .course-detail-state__lines span { animation: none; }.curriculum-list button i::after { transition: none; }
}
</style>
