import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  runtimeConfig: {
    sanityProjectId: 'hnypuj6l',
    sanityDataset: 'production',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
