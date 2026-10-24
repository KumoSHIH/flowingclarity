<script setup lang="ts">
import type { HomeSectionsContent } from "#shared/types/homeSections";

defineProps<{ content: HomeSectionsContent["courses"] }>();
</script>

<template>
  <section
    id="courses"
    class="px-[var(--page-gutter-mobile)] py-28 md:py-44 lg:px-[clamp(28px,6vw,116px)]"
    aria-labelledby="courses-title"
  >
    <div class="relative z-20 mx-auto max-w-[1520px]">
      <div class="mb-14">
        <div>
          <h2 id="courses-title" class="type-title-xl text-center">
            {{ content.heading }}
          </h2>
        </div>
        <p class="type-body mx-auto mt-8 max-w-[470px] text-center text-muted">
          {{ content.introduction }}
        </p>
      </div>

      <div
        v-if="content.items.length"
        class="grid gap-20 md:grid-cols-2 md:gap-[clamp(56px,8vw,128px)]"
      >
        <article
          v-for="(course, index) in content.items"
          :key="course.id"
          :class="index % 2 !== 0 ? 'md:mt-36' : ''"
        >
          <NuxtLink
            :to="course.href"
            class="home-course-link block text-inherit no-underline"
          >
            <div
              class="home-course-link__media aspect-[5/4] overflow-hidden bg-[#d8cbbc]"
            >
              <img
                :src="course.image.src"
                :alt="course.image.alt"
                :width="course.image.width"
                :height="course.image.height"
                loading="lazy"
                class="h-full w-full object-cover"
                :class="index === 0 ? 'object-[60%_center]' : 'object-center'"
                :style="
                  course.image.objectPosition
                    ? { objectPosition: course.image.objectPosition }
                    : undefined
                "
              />
            </div>
            <div class="border-b border-[#c9bcac] pb-10 pt-8 md:pt-10">
              <div>
                <p class="type-label mb-4 text-clay">
                  {{ course.meta }}
                </p>
                <h3 class="type-title-sm home-course-link__title">
                  {{ course.title }}
                </h3>
              </div>
              <p class="type-body mt-3 text-muted">
                {{ course.description }}
              </p>
            </div>
          </NuxtLink>
        </article>
      </div>
      <p
        v-else
        class="type-body mx-auto max-w-[470px] border-t border-[#c9bcac] py-9 text-center text-muted"
      >
        {{ content.emptyMessage }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.home-course-link__media img {
  transition:
    filter 420ms ease,
    transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
}

.home-course-link__title {
  transition: color 220ms ease;
}

.home-course-link:focus-visible .home-course-link__media img {
  filter: saturate(1.06) contrast(1.025);
  transform: scale(1.025);
}

.home-course-link:focus-visible .home-course-link__title {
  color: var(--interactive-title-hover);
}

@media (hover: hover) and (pointer: fine) {
  .home-course-link:hover .home-course-link__media img {
    filter: saturate(1.06) contrast(1.025);
    transform: scale(1.025);
  }

  .home-course-link:hover .home-course-link__title {
    color: var(--interactive-title-hover);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-course-link__media img,
  .home-course-link__title {
    transition: none;
  }

  .home-course-link:is(:hover, :focus-visible) .home-course-link__media img {
    transform: none;
  }
}
</style>
