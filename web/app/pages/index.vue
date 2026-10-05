<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { HomeBannerContent } from '#shared/utils/homeBanner'

const { data: banner } = useFetch<HomeBannerContent | null>('/api/home-banner')

const heroElement = ref<HTMLElement | null>(null)
const headerIsVisible = ref(false)
const usesCompactHeader = ref(false)
const mobileMenuIsOpen = ref(false)
const shouldShowHeader = computed(() => usesCompactHeader.value || headerIsVisible.value)
let heroObserver: IntersectionObserver | null = null
let compactHeaderMedia: MediaQueryList | null = null

const setMobileMenuOpen = (isOpen: boolean) => {
  mobileMenuIsOpen.value = isOpen
  document.documentElement.classList.toggle('home-menu-open', isOpen)
}

const syncCompactHeader = (event: MediaQueryListEvent | MediaQueryList) => {
  usesCompactHeader.value = event.matches
  if (!event.matches) setMobileMenuOpen(false)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && mobileMenuIsOpen.value) {
    setMobileMenuOpen(false)
  }
}

onMounted(() => {
  compactHeaderMedia = window.matchMedia('(max-width: 1023px)')
  syncCompactHeader(compactHeaderMedia)
  compactHeaderMedia.addEventListener('change', syncCompactHeader)
  window.addEventListener('keydown', handleKeydown)

  if (!heroElement.value) return

  heroObserver = new IntersectionObserver(([entry]) => {
    headerIsVisible.value = !entry?.isIntersecting
  }, { threshold: 0 })
  heroObserver.observe(heroElement.value)
})

onBeforeUnmount(() => {
  heroObserver?.disconnect()
  compactHeaderMedia?.removeEventListener('change', syncCompactHeader)
  window.removeEventListener('keydown', handleKeydown)
  document.documentElement.classList.remove('home-menu-open')
})
</script>

<template>
  <div class="home-page relative isolate mx-auto min-h-screen max-w-[1920px] overflow-clip">
    <header
      class="home-sticky-header"
      :class="{ 'is-visible': shouldShowHeader }"
      :aria-hidden="!shouldShowHeader"
      aria-label="主要導覽"
    >
      <a
        class="home-sticky-header__brand"
        href="#course-map"
        aria-label="普那生活空間首頁"
        @click="setMobileMenuOpen(false)"
      >
        <img
          class="home-sticky-header__brand-logo"
          src="/assets/logo-main.png"
          alt=""
          width="896"
          height="496"
          draggable="false"
        />
      </a>
      <button
        type="button"
        class="home-sticky-header__menu-toggle"
        :class="{ 'is-open': mobileMenuIsOpen }"
        :aria-expanded="mobileMenuIsOpen"
        aria-controls="home-primary-nav"
        :aria-label="mobileMenuIsOpen ? '關閉主要選單' : '開啟主要選單'"
        @click="setMobileMenuOpen(!mobileMenuIsOpen)"
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        id="home-primary-nav"
        class="home-sticky-header__nav"
        :class="{ 'is-open': mobileMenuIsOpen }"
        :inert="usesCompactHeader && !mobileMenuIsOpen"
        aria-label="主要選單"
      >
        <a href="#courses" @click="setMobileMenuOpen(false)">近期課程</a>
        <a href="#course-map" @click="setMobileMenuOpen(false)">課程探索</a>
        <a href="#articles" @click="setMobileMenuOpen(false)">文章分享</a>
        <a href="#contact" @click="setMobileMenuOpen(false)">個案諮詢</a>
      </nav>
    </header>

    <main>
      <div ref="heroElement">
        <HomeBanner :banner="banner" />
      </div>
      <div class="relative">
        <HomeIntroduction />
        <HomeEvents />
        <HomeCourses />
        <HomeContact />
      </div>
    </main>

    <footer class="home-footer">
      <span>FLOWING CLARITY</span>
      <span>留一點空白，給自己。</span>
    </footer>
  </div>
</template>
