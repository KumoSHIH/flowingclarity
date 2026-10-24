<script setup lang="ts">
defineProps<{
  items: Array<{
    label: string;
    to?: string;
  }>;
}>();
</script>

<template>
  <nav class="detail-breadcrumb" aria-label="麵包屑">
    <ol>
      <li v-for="item in items" :key="`${item.to ?? 'current'}-${item.label}`">
        <NuxtLink v-if="item.to" :to="item.to">{{ item.label }}</NuxtLink>
        <span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.detail-breadcrumb {
  padding: 24px clamp(28px, 6vw, 116px) 14px;
}

.detail-breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 0;
  margin: 0;
  color: var(--color-muted);
  font-size: var(--type-meta-size);
  font-weight: var(--type-meta-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
  list-style: none;
}

.detail-breadcrumb li {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
}

.detail-breadcrumb li + li::before {
  margin-right: 10px;
  color: var(--color-clay);
  content: "/";
}

.detail-breadcrumb a {
  display: inline-flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-underline-offset: 5px;
}

@media (max-width: 1023px) {
  .detail-breadcrumb {
    padding: 18px var(--page-gutter-mobile) 14px;
  }
}
</style>
