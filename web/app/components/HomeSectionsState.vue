<script setup lang="ts">
defineProps<{ state: 'loading' | 'unavailable' }>()
</script>

<template>
  <section class="px-[var(--page-gutter-mobile)] py-28 text-center md:py-40" aria-live="polite">
    <h2 class="type-title-lg">
      {{ state === 'loading' ? '首頁內容載入中' : '首頁內容準備中' }}
    </h2>
    <p class="type-body mx-auto mt-6 max-w-[520px] text-muted">
      {{ state === 'loading' ? '請稍候，我們正在整理內容。' : '目前無法顯示完整內容，請稍後再回來看看。' }}
    </p>
  </section>
</template>
