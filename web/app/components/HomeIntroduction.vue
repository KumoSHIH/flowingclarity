<script setup lang="ts">
import type { HomeIntroductionContent } from '#shared/types/homeSections'

defineProps<{ content: HomeIntroductionContent }>()
</script>

<template>
  <section
    id="about"
    class="grid gap-12 px-[var(--page-gutter-mobile)] py-28 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-[clamp(56px,8vw,140px)] md:py-44 lg:px-[clamp(28px,6vw,116px)]"
    aria-labelledby="about-title"
  >
    <div class="relative z-20 mx-auto w-full max-w-[480px] md:mx-0">
      <div class="aspect-[4/5] overflow-hidden bg-[#d8cbbc]">
        <img
          :src="content.image.src"
          :alt="content.image.alt"
          :width="content.image.width"
          :height="content.image.height"
          loading="lazy"
          class="h-full w-full object-cover object-center"
          :style="content.image.objectPosition ? { objectPosition: content.image.objectPosition } : undefined"
        >
      </div>
      <p v-if="content.caption" class="type-meta absolute -bottom-6 right-0 bg-paper px-6 py-4 font-editorial text-muted md:-right-8">
        {{ content.caption }}
      </p>
    </div>

    <div class="relative z-20 max-w-[620px] md:py-12">
      <h2 id="about-title" class="type-title-lg whitespace-pre-line">
        {{ content.heading }}
      </h2>
      <p class="type-label mb-0 mt-10 flex items-center gap-4 text-clay">
        <span class="h-px w-8 bg-current" aria-hidden="true" />
        {{ content.label }}
      </p>
      <div class="type-body mt-7 max-w-[520px] space-y-8 text-muted md:ml-auto">
        <p v-for="paragraph in content.paragraphs" :key="paragraph">{{ paragraph }}</p>
      </div>
    </div>
  </section>
</template>
