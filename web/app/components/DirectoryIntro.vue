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
  font-size: 60px;
  font-weight: 400;
  line-height: 1.28;
  letter-spacing: 0.04em;
}

.directory-intro__description {
  max-width: 12em;
  margin: 28px 0 0;
  font-size: 22px;
  line-height: 1.8;
  letter-spacing: 0.08em;
}

@media (max-width: 1023px) {
  .directory-intro h1 {
    font-size: 44px;
  }

  .directory-intro__description {
    max-width: none;
    font-size: 17px;
  }
}
</style>
