<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'zh-Hant' },
  title: 'Flowing Clarity',
  meta: [
    {
      name: 'description',
      content: 'Flowing Clarity 身心療癒與按摩，在溫柔的觸碰中找回自己的節奏。',
    },
  ],
  link: [
    {
      rel: 'icon',
      href: '/assets/logo.png',
      type: 'image/png',
    },
  ],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <GoTopButton />
  </div>
</template>
