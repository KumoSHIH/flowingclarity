<script setup lang="ts">
import { courseOverviewFixture } from '../fixtures/courseOverview'
</script>

<template>
  <div class="course-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans">
    <SiteHeader always-visible />

    <main>
      <CourseOverview :content="courseOverviewFixture" />
    </main>

    <footer class="course-footer">
      <span>FLOWING CLARITY</span>
      <span>循著需要，找到學習的方向。</span>
    </footer>
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

.course-footer {
  display: flex;
  min-height: 84px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 clamp(28px, 6vw, 116px);
  color: var(--color-warm-muted);
  background: var(--color-oxblood);
  font-family: var(--font-editorial);
  font-size: 10px;
  letter-spacing: 0.16em;
}

@media (max-width: 640px) {
  .course-footer {
    min-height: 120px;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(html) {
    scroll-behavior: auto;
  }
}
</style>
