<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="directory-intro">
    <h1>{{ title }}</h1>
    <p class="directory-intro__description">{{ description }}</p>
  </div>
</template>

<style scoped>
.directory-intro h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-title-lg-size);
  font-weight: var(--type-title-lg-weight);
  line-height: var(--type-title-lg-leading);
  letter-spacing: var(--type-title-lg-tracking);
}

.directory-intro__description {
  margin: 25px 0 0;
  font-size: var(--type-lead-size);
  font-weight: var(--type-lead-weight);
  line-height: var(--type-lead-leading);
  letter-spacing: var(--type-lead-tracking);
}

@media (max-width: 1023px) {
  .directory-intro__description {
    max-width: none;
  }
}
</style>
