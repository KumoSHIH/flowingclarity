<script setup lang="ts">
import { computed } from "vue";
import { useSiteSettings } from '../../composables/useSiteSettings';
import type {
  CourseOverviewApiResponse,
  CourseOverviewStatus,
} from "#shared/types/course";
import { emptyCourseOverviewContent } from "#shared/utils/courseOverview";
const { settings } = useSiteSettings();

const {
  data: response,
  status: requestStatus,
  refresh,
} = useFetch<CourseOverviewApiResponse>("/api/course-overview");

const content = computed(
  () => response.value?.content ?? emptyCourseOverviewContent,
);
const overviewStatus = computed<CourseOverviewStatus>(() => {
  if (requestStatus.value === "pending") return "loading";
  if (requestStatus.value === "error" || response.value?.state === "error")
    return "error";
  return "ready";
});
</script>

<template>
  <div
    class="course-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans"
  >
    <SiteHeader always-visible :settings="settings" />

    <main>
      <CourseOverview
        :content="content"
        :status="overviewStatus"
        @retry="refresh"
      />
    </main>

    <SiteFooter v-if="settings" :content="settings" current-path="/course" />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.course-page {
  --home-header-height: 87px;
  padding-top: var(--home-header-height);
  color: var(--color-ink);
  background: var(--color-paper);
}

.course-page ::selection {
  color: var(--color-oxblood);
  background: var(--color-saffron);
}

.course-page :focus-visible {
  outline: var(--control-focus-width) solid var(--color-clay);
  outline-offset: var(--control-focus-offset);
}

:global(html) {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  :global(html) {
    scroll-behavior: auto;
  }
}
</style>
