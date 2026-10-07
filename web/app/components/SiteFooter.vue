<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SiteSettings } from '../types/siteSettings'
import { useFooterMotion } from '../composables/useFooterMotion'

const props = defineProps<{ content: SiteSettings; currentPath?: string }>()
const root = ref<HTMLElement | null>(null)
const logoFailed = ref(false)
watch(() => props.content.brandLogo?.src, () => { logoFailed.value = false })
const { flowing, reduced } = useFooterMotion(root)
const hasContact = computed(() => Boolean(props.content.contact?.address || props.content.contact?.phone || props.content.contact?.email || props.content.socialLinks.length))
const paths = [
  'M-80 690C120 620 120 410 330 350S520 110 760 155 960 380 1200 260 1390 90 1520 150',
  'M-60 780C180 700 185 520 390 455S645 245 860 315 1055 575 1280 440 1450 260 1540 300',
  'M210 930C205 730 430 665 365 500S505 310 585 175 850 55 940 225 1050 440 1240 335',
]
</script>

<template>
  <footer ref="root" class="site-footer relative overflow-hidden" :class="{ 'is-flowing': flowing }">
    <svg class="site-footer__flow" viewBox="0 0 1440 850" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path v-for="(path, index) in paths" :key="path" :d="path" class="site-footer__line" :style="{ opacity: [.58, .36, .22][index] }" />
      <g v-if="!reduced" class="site-footer__dots">
        <g v-for="(path, index) in paths.slice(0, 2)" :key="path" :class="{ 'site-footer__slow': index === 1 }">
          <path :d="path" pathLength="1" class="site-footer__glow" />
          <path :d="path" pathLength="1" class="site-footer__core" />
        </g>
      </g>
    </svg>
    <div class="site-footer__shell relative grid">
      <div class="site-footer__brand flex flex-col justify-between">
        <img v-if="content.brandLogo && !logoFailed" :src="content.brandLogo.src" :width="content.brandLogo.width" :height="content.brandLogo.height" :alt="content.brandName" @error="logoFailed = true" />
        <span v-else class="site-footer__brand-name">{{ content.brandName }}</span>
        <p v-if="content.brandMessages.closingStatement" class="site-footer__closing">{{ content.brandMessages.closingStatement }}</p>
      </div>
      <div class="site-footer__content flex min-w-0 flex-col justify-between">
        <p class="site-footer__statement" lang="en">{{ content.brandMessages.englishStatement }}</p>
        <div>
          <div class="site-footer__bottom grid" :class="{ 'site-footer__bottom--minimal': !hasContact }">
            <address v-if="hasContact" class="site-footer__contact not-italic">
              <span v-if="content.contact?.address">{{ content.contact.address }}</span>
              <a v-if="content.contact?.phone" :href="content.contact.phone.href">{{ content.contact.phone.display }}</a>
              <a v-if="content.contact?.email" :href="`mailto:${content.contact.email}`">{{ content.contact.email }}</a>
              <div v-if="content.socialLinks.length" class="flex flex-wrap gap-x-6">
                <a v-for="social in content.socialLinks" :key="social.label" :href="social.href">{{ social.label }}</a>
              </div>
            </address>
            <nav aria-label="頁尾導覽" class="min-w-0">
              <ul class="site-footer__nav">
                <li v-for="item in content.navigationItems" :key="item.href">
                  <NuxtLink :to="item.href" :aria-current="currentPath === item.href ? 'page' : undefined">
                    <span>{{ item.label }}</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" stroke-width="1.5" /></svg>
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
          <p class="site-footer__legal">{{ content.legal.copyrightText }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  color: var(--color-ink);
  background: var(--color-sand);
  font-family: var(--font-sans);
  overflow-wrap: anywhere;
}
.site-footer__shell { grid-template-columns: 36% 64%; min-height: 850px; }
.site-footer__brand { min-width: 0; padding: 48px clamp(28px, 4vw, 76px); }
.site-footer__brand img { width: clamp(145px, 15vw, 220px); height: auto; }
.site-footer__brand-name { font: 400 28px/1.5 var(--font-display); }
.site-footer__closing { max-width: 13em; margin: 0; font: 400 clamp(31px, 3.4vw, 52px)/1.35 var(--font-display); }
.site-footer__content { padding: clamp(80px, 10vw, 150px) clamp(28px, 6vw, 116px) 48px clamp(45px, 6vw, 100px); }
.site-footer__statement { max-width: 11em; margin: 0; font: 400 clamp(48px, 6vw, 92px)/1.18 var(--font-display); letter-spacing: -.015em; text-wrap: balance; }
.site-footer__bottom { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(24px, 4vw, 60px); padding-top: 110px; }
.site-footer__bottom--minimal { grid-template-columns: minmax(0, 1fr); }
.site-footer__contact { min-width: 0; font-size: 14px; line-height: 1.75; }
.site-footer__contact > span, .site-footer__contact a { display: flex; align-items: center; min-height: 48px; }
.site-footer__nav { list-style: none; padding: 0; margin: 0; border-top: 1px solid rgb(56 52 46 / 42%); }
.site-footer__nav li { border-bottom: 1px solid rgb(56 52 46 / 22%); }
.site-footer__nav a { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 58px; font-size: 14px; }
.site-footer__nav svg { flex-shrink: 0; }
.site-footer a { color: inherit; text-decoration: none; text-underline-offset: 5px; }
.site-footer a:hover, .site-footer a[aria-current='page'] { text-decoration: underline; }
.site-footer a:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 4px; }
.site-footer__legal { margin: 42px 0 0; text-align: right; font-size: 12px; line-height: 1.7; }
.site-footer__flow { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.site-footer__flow path { fill: none; stroke: var(--color-warm-white); stroke-linecap: round; vector-effect: non-scaling-stroke; }
.site-footer__line { stroke-width: 1; }
.site-footer__glow, .site-footer__core { stroke-dasharray: .002 .22; stroke-dashoffset: 1; animation: footer-flow 20s linear infinite, footer-pulse 3.6s ease-in-out -1.2s infinite; animation-play-state: paused; }
.site-footer__glow { stroke-width: 22; filter: blur(9px); opacity: .24; }
.site-footer__core { stroke-width: 3; opacity: .52; }
.site-footer__slow path { stroke-dasharray: .002 .28; animation-duration: 27s, 5.1s; animation-delay: -11s, -3.8s; }
.site-footer__slow .site-footer__glow { stroke-width: 19; }
.site-footer__slow .site-footer__core { stroke-width: 2.5; }
.is-flowing .site-footer__dots path { animation-play-state: running; }
@keyframes footer-flow { to { stroke-dashoffset: 0; } }
@keyframes footer-pulse { 0%, 100% { opacity: .14; } 38% { opacity: .5; } 58% { opacity: .22; } 76% { opacity: .4; } }
@media (max-width: 900px) {
  .site-footer__shell { grid-template-columns: minmax(0, 1fr); }
  .site-footer__brand { padding: 48px 28px 0; }
  .site-footer__brand img { width: 140px; }
  .site-footer__closing { display: none; }
  .site-footer__content { padding: 70px 28px 42px; }
  .site-footer__bottom { grid-template-columns: minmax(0, 1fr); gap: 65px; }
  .site-footer__flow { width: 150%; transform: translateX(-17%); }
}
@media (max-width: 560px) {
  .site-footer__brand { padding-inline: 24px; }
  .site-footer__content { padding-inline: 24px; }
  .site-footer__statement { font-size: clamp(36px, 8.4vw, 47px); }
  .site-footer__bottom { padding-top: 100px; }
  .site-footer__flow { width: 190%; transform: translateX(-24%); }
}
@media (prefers-reduced-motion: reduce) {
  .site-footer__dots { display: none; }
  .site-footer__dots path { animation: none; }
}
</style>
