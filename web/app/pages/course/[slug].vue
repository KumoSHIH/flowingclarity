<script setup lang="ts">
import { computed } from "vue";
import { useSiteSettings } from "../../composables/useSiteSettings";
import type {
  CourseDetailApiResponse,
  CourseDetailStatus,
} from "../../types/courseDetail";

const route = useRoute();
const { settings } = useSiteSettings();

const slug = computed(() => {
  const value = route.params.slug;
  return Array.isArray(value) ? value[0] ?? "" : String(value ?? "");
});
const {
  data: response,
  status: requestStatus,
  refresh,
} = useFetch<CourseDetailApiResponse>(
  () => `/api/course-detail/${encodeURIComponent(slug.value)}`,
);
const content = computed(() => response.value?.content ?? undefined);
const status = computed<CourseDetailStatus>(() => {
  if (requestStatus.value === "pending") return "loading";
  if (requestStatus.value === "error" || response.value?.state === "error")
    return "error";
  if (response.value?.state === "empty") return "not-found";
  return response.value?.state === "ready" && content.value ? "ready" : "error";
});

useHead(() => ({
  title: content.value
    ? `${content.value.hero.title.replace("\n", "")}｜Flowing Clarity`
    : "找不到課程｜Flowing Clarity",
  meta: content.value
    ? [{ name: "description", content: content.value.hero.summary }]
    : [{ name: "robots", content: "noindex" }],
}));
</script>

<template>
  <div class="course-detail-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible :settings="settings" current-path="/course" />
    <main>
      <CourseDetail :content="content" :status="status" @retry="refresh" />
    </main>
    <SiteFooter v-if="settings" :content="settings" :current-path="route.path" />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.course-detail-page {
  --home-header-height: 87px;
  padding-top: var(--home-header-height);
  color: var(--color-ink);
  background: var(--color-paper);
}

.course-detail-page ::selection {
  color: var(--color-warm-white);
  background: var(--color-bark);
}

.course-detail-page :focus-visible {
  outline: var(--control-focus-width) solid var(--color-persimmon);
  outline-offset: var(--control-focus-offset);
}

:global(html) {
  scroll-behavior: smooth;
  scrollbar-color: var(--color-bark) var(--color-sand);
}

@media (prefers-reduced-motion: reduce) {
  :global(html) { scroll-behavior: auto; }
}
</style>
