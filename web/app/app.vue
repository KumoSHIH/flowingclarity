<script setup lang="ts">
import { ref } from 'vue'
import { useRevealMotion } from './composables/useRevealMotion'

const appRoot = ref<HTMLElement>()

useRevealMotion(appRoot)

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
  <div ref="appRoot">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <GoTopButton />
  </div>
</template>
