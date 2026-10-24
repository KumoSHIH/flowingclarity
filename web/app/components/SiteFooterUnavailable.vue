<script setup lang="ts">
import { siteNavigationItems } from '../constants/siteNavigation'
</script>

<template>
  <footer class="bg-bark px-[var(--page-gutter-mobile)] py-12 text-paper lg:px-6">
    <p>聯絡資訊暫時無法顯示，請稍後再試。</p>
    <nav aria-label="頁尾導覽" class="mt-6 flex flex-wrap gap-x-8 gap-y-2">
      <NuxtLink v-for="item in siteNavigationItems" :key="item.href" :to="item.href" class="inline-flex min-h-12 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{{ item.label }}</NuxtLink>
    </nav>
  </footer>
</template>
