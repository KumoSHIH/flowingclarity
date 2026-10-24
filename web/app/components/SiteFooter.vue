<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { SiteSettings } from "../types/siteSettings";
import { useFooterMotion } from "../composables/useFooterMotion";

const props = defineProps<{ content: SiteSettings; currentPath?: string }>();
const root = ref<HTMLElement | null>(null);
const logoFailed = ref(false);
watch(
  () => props.content.footerLogo?.src,
  () => {
    logoFailed.value = false;
  },
);
const { flowing, reduced } = useFooterMotion(root);
const copyrightText = computed(() => {
  const year = new Date().getFullYear();
  const text = props.content.legal.copyrightText.trim();
  if (/©\s*(?:\d{4}(?:\s*[-–—]\s*\d{4})?\s*)?/.test(text)) {
    return text.replace(/©\s*(?:\d{4}(?:\s*[-–—]\s*\d{4})?\s*)?/, `© ${year} `);
  }
  if (/^copyright\b/i.test(text)) {
    return text.replace(/^copyright\b\s*/i, `Copyright © ${year} `);
  }
  return `${text} © ${year}`;
});
const hasContact = computed(() =>
  Boolean(
    props.content.contact?.address ||
    props.content.contact?.phone ||
    props.content.contact?.email ||
    props.content.socialLinks.length,
  ),
);
const paths = [
  "M-80 690C120 620 120 410 330 350S520 110 760 155 960 380 1200 260 1390 90 1520 150",
  "M-60 780C180 700 185 520 390 455S645 245 860 315 1055 575 1280 440 1450 260 1540 300",
  "M210 930C205 730 430 665 365 500S505 310 585 175 850 55 940 225 1050 440 1240 335",
];
</script>

<template>
  <footer
    ref="root"
    class="site-footer relative overflow-hidden"
    :class="{ 'is-flowing': flowing }"
  >
    <svg
      class="site-footer__flow"
      viewBox="0 0 1440 850"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        v-for="(path, index) in paths"
        :key="path"
        :d="path"
        class="site-footer__line"
        :style="{ opacity: [0.58, 0.36, 0.22][index] }"
      />
      <g v-if="!reduced" class="site-footer__dots">
        <g
          v-for="(path, index) in paths.slice(0, 2)"
          :key="path"
          :class="{ 'site-footer__slow': index === 1 }"
        >
          <path :d="path" pathLength="1" class="site-footer__glow" />
          <path :d="path" pathLength="1" class="site-footer__core" />
        </g>
      </g>
    </svg>
    <div class="site-footer__shell relative grid">
      <div class="site-footer__brand-column flex flex-col justify-between">
        <NuxtLink
          class="site-footer__brand"
          :to="content.brandDestination ?? '/'"
          :aria-label="`${content.brandName}首頁`"
        >
          <img
            v-if="content.footerLogo && !logoFailed"
            :src="content.footerLogo.src"
            :width="content.footerLogo.width"
            :height="content.footerLogo.height"
            alt=""
            @error="logoFailed = true"
          />
          <span v-else class="site-footer__brand-name">{{
            content.brandName
          }}</span>
        </NuxtLink>
        <p
          v-if="content.brandMessages.closingStatement"
          class="site-footer__closing"
        >
          {{ content.brandMessages.closingStatement }}
        </p>
      </div>
      <div class="site-footer__content flex min-w-0 flex-col justify-between">
        <p class="site-footer__statement" lang="en">
          {{ content.brandMessages.englishStatement }}
        </p>
        <div>
          <div
            class="site-footer__bottom grid"
            :class="{ 'site-footer__bottom--minimal': !hasContact }"
          >
            <address v-if="hasContact" class="site-footer__contact not-italic">
              <span v-if="content.contact?.address">{{
                content.contact.address
              }}</span>
              <a
                v-if="content.contact?.phone"
                :href="content.contact.phone.href"
                >{{ content.contact.phone.display }}</a
              >
              <a
                v-if="content.contact?.email"
                :href="`mailto:${content.contact.email}`"
                >{{ content.contact.email }}</a
              >
              <div
                v-if="content.socialLinks.length"
                class="flex flex-wrap gap-x-6"
              >
                <a
                  v-for="social in content.socialLinks"
                  :key="social.label"
                  :href="social.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ social.label }}</a
                >
              </div>
            </address>
            <nav aria-label="頁尾導覽">
              <ul class="site-footer__nav">
                <li v-for="item in content.navigationItems" :key="item.href">
                  <NuxtLink
                    :to="item.href"
                    :aria-label="item.accessibleLabel"
                    :aria-current="
                      currentPath === item.href ? 'page' : undefined
                    "
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{{ item.label }}</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M4 16 16 4M4 4h12v12"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                    </svg>
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
          <p class="site-footer__legal">{{ copyrightText }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-bark);
  color: var(--color-paper);
  font-family: var(--font-sans);
  overflow-wrap: anywhere;
}
.site-footer__shell {
  grid-template-columns: 36% 64%;
  min-height: 850px;
}
.site-footer__brand-column {
  min-width: 0;
  padding: 48px clamp(28px, 4vw, 76px);
}
.site-footer__brand {
  align-self: flex-start;
  max-width: 100%;
  color: var(--color-paper);
  letter-spacing: normal;
  text-decoration: none;
  transition: opacity 0.3s ease-in-out;
}
.site-footer__brand:hover {
  color: var(--color-paper);
  text-decoration: none;
  opacity: 0.72;
}
.site-footer__brand img {
  display: block;
  width: clamp(145px, 15vw, 220px);
  height: auto;
}
.site-footer__brand-name {
  color: var(--color-paper);
  font-family: var(--font-display);
  font-size: var(--type-title-sm-size);
  font-weight: var(--type-title-sm-weight);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}
.site-footer__closing {
  max-width: 13em;
  margin: 0;
  color: var(--color-paper);
  font-family: var(--font-display);
  font-size: var(--type-title-md-size);
  font-weight: var(--type-title-md-weight);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}
.site-footer__content {
  padding: clamp(80px, 10vw, 150px) clamp(28px, 6vw, 116px) 48px
    clamp(45px, 6vw, 100px);
}
.site-footer__statement {
  color: var(--color-paper);
  font-family: var(--font-display);
  font-size: var(--type-title-lg-size);
  font-weight: var(--type-title-lg-weight);
  line-height: var(--type-title-lg-leading);
  letter-spacing: var(--type-title-lg-tracking);
  text-wrap: balance;
}
.site-footer__bottom {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(24px, 4vw, 60px);
  padding-top: 110px;
}
.site-footer__bottom--minimal {
  grid-template-columns: minmax(0, 1fr);
}
.site-footer__contact {
  min-width: 0;
  color: var(--color-paper);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.site-footer__bottom nav {
  max-width: 400px;
  width: 100%;
  margin-left: auto;
}
.site-footer__contact > span,
.site-footer__contact a {
  display: flex;
  align-items: center;
  min-height: 48px;
  transition: color 0.3s ease-in-out;
}
.site-footer__nav {
  list-style: none;
  padding: 0;
  margin: 0;
}
.site-footer__nav li {
  border-bottom: 1px solid rgba(202, 198, 191, 0.813);
}
.site-footer__nav a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 58px;
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  color: var(--color-paper);
}
.site-footer__nav svg {
  flex-shrink: 0;
}
.site-footer a:not(.site-footer__brand) {
  color: var(--color-paper);
  text-decoration: none;
  transition: color 0.3s ease-in-out;
}
.site-footer a:not(.site-footer__brand):hover,
.site-footer a[aria-current="page"] {
  color: var(--color-saffron);
}
.site-footer a:focus-visible {
  outline: 2px solid var(--color-paper);
  outline-offset: 4px;
}
.site-footer__legal {
  margin: 42px 0 0;
  text-align: right;
  font-size: var(--type-meta-size);
  font-weight: var(--type-meta-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
  color: var(--color-paper);
}
.site-footer__flow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.site-footer__flow path {
  fill: none;
  stroke: var(--color-warm-white);
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.site-footer__line {
  stroke-width: 1;
}
.site-footer__glow,
.site-footer__core {
  --flow-period: 0.222;
  stroke-dasharray: 0.002 0.22;
  stroke-dashoffset: var(--flow-period);
  animation:
    footer-flow 4.44s linear infinite,
    footer-pulse 3.6s ease-in-out -1.2s infinite;
  animation-play-state: paused;
}
.site-footer__glow {
  stroke-width: 22;
  filter: blur(9px);
  opacity: 0.24;
}
.site-footer__core {
  stroke-width: 3;
  opacity: 0.52;
}
.site-footer__slow path {
  --flow-period: 0.282;
  stroke-dasharray: 0.002 0.28;
  animation-duration: 7.614s, 5.1s;
  animation-delay:
    -11s,
    -3.8s;
}
.site-footer__slow .site-footer__glow {
  stroke-width: 19;
}
.site-footer__slow .site-footer__core {
  stroke-width: 2.5;
}
.is-flowing .site-footer__dots path {
  animation-play-state: running;
}
@keyframes footer-flow {
  from {
    stroke-dashoffset: var(--flow-period);
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes footer-pulse {
  0%,
  100% {
    opacity: 0.14;
  }
  38% {
    opacity: 0.5;
  }
  58% {
    opacity: 0.22;
  }
  76% {
    opacity: 0.4;
  }
}
@media (max-width: 900px) {
  .site-footer__shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .site-footer__brand-column {
    padding: 48px var(--page-gutter-mobile) 0;
  }
  .site-footer__brand img {
    width: 140px;
  }
  .site-footer__closing {
    display: none;
  }
  .site-footer__content {
    padding: 40px var(--page-gutter-mobile) 42px;
  }
  .site-footer__bottom {
    grid-template-columns: minmax(0, 1fr);
    gap: 30px;
  }
  .site-footer__bottom nav {
    margin: 0;
  }
  .site-footer__flow {
    width: 150%;
    transform: translateX(-17%);
  }
  .site-footer__legal {
    margin-top: 20px;
    padding-bottom: 50px;
    text-align: center;
  }
}
@media (max-width: 560px) {
  .site-footer__brand-column {
    padding-inline: var(--page-gutter-mobile);
  }
  .site-footer__content {
    padding-inline: var(--page-gutter-mobile);
    padding-top: 20px;
  }
  .site-footer__bottom {
    padding-top: 40px;
    gap: 40px;
  }
  .site-footer__bottom nav {
    max-width: none;
  }
  .site-footer__flow {
    width: 190%;
    transform: translateX(-24%);
  }
  .site-footer__contact > span,
  .site-footer a {
    min-height: auto;
    padding-bottom: 10px;
  }
  .site-footer__nav li {
    margin-bottom: 20px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .site-footer a,
  .site-footer__contact > span {
    transition: none;
  }
  .site-footer__dots {
    display: none;
  }
  .site-footer__dots path {
    animation: none;
  }
}
</style>
