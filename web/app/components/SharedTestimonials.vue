<script setup lang="ts">
import type { SharedTestimonialItem } from "#shared/types/content";

defineProps<{
  title?: string;
  items: SharedTestimonialItem[];
}>();
</script>

<template>
  <section
    v-if="items.length"
    class="shared-testimonials"
    :aria-labelledby="`${$attrs.id ?? 'testimonials'}-title`"
  >
    <h2 :id="`${$attrs.id ?? 'testimonials'}-title`" class="type-title-md">
      {{ title ?? "學員心得分享" }}
    </h2>
    <div class="shared-testimonials__list">
      <blockquote
        v-for="(item, index) in items"
        :key="`${item.sharerName}-${index}`"
      >
        <p class="type-body">{{ item.text }}</p>
        <cite class="type-label">{{ item.sharerName }}</cite>
      </blockquote>
    </div>
  </section>
</template>

<style scoped>
.shared-testimonials {
  padding: 90px clamp(48px, 7vw, 104px) 100px;
  border-bottom: 1px solid rgb(56 52 46 / 24%);
}

.shared-testimonials > h2 {
  margin: 0 auto;
}

blockquote {
  padding: 54px 0 58px;
  margin: 0;
  border-bottom: 1px solid rgb(56 52 46 / 24%);
}

blockquote:last-child {
  border-bottom: 0;
}

blockquote p {
  margin: 0;
  color: #625a51;
  white-space: pre-line;
}

cite {
  display: block;
  margin-top: 26px;
  color: #745142;
  font-style: normal;
}

cite::before {
  display: inline-block;
  width: 28px;
  margin-right: 12px;
  border-top: 1px solid currentcolor;
  vertical-align: middle;
  content: "";
}

@media (max-width: 1023px) {
  .shared-testimonials {
    padding: 72px var(--page-gutter-mobile) 80px;
  }

  blockquote {
    padding: 42px 0 46px;
  }
}
</style>
