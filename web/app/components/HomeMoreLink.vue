<script setup lang="ts">
withDefaults(defineProps<{
  to: string;
  ariaLabel: string;
  label?: string;
}>(), {
  label: "more",
});
</script>

<template>
  <NuxtLink
    :to="to"
    class="button-primary button-primary--small home-section-more"
    :aria-label="ariaLabel"
  >
    <span>{{ label }}</span>
    <svg
      class="button-primary__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  </NuxtLink>
</template>
