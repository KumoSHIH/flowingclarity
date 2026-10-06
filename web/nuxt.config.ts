import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  runtimeConfig: {
    sanityProjectId: process.env.NUXT_SANITY_PROJECT_ID || '',
    sanityDataset: process.env.NUXT_SANITY_DATASET || 'production',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
