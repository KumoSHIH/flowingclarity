<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import type { SiteSettings } from "../types/siteSettings";
import { siteNavigationItems } from "../constants/siteNavigation";
import type { SiteNavigationItem } from "../constants/siteNavigation";
import { useSiteHeader } from "../composables/useSiteHeader";

const props = withDefaults(
  defineProps<{
    revealAfter?: HTMLElement | null;
    alwaysVisible?: boolean;
    settings?: SiteSettings | null;
    currentPath?: string;
  }>(),
  {
    revealAfter: null,
    alwaysVisible: false,
    currentPath: undefined,
  },
);

const logoFailed = ref(false);
watch(
  () => props.settings?.brandLogo?.src,
  () => {
    logoFailed.value = false;
  },
);
const items = computed<readonly SiteNavigationItem[]>(
  () => props.settings?.navigationItems ?? siteNavigationItems,
);

function itemIsCurrent(href: string) {
  if (!props.currentPath) return false;
  return props.currentPath === href || props.currentPath.startsWith(`${href}/`);
}

const menuButton = ref<HTMLButtonElement | null>(null);
const navigation = ref<HTMLElement | null>(null);

const {
  closeMobileMenu,
  isVisible,
  mobileMenuIsOpen,
  toggleMobileMenu,
  usesCompactHeader,
} = useSiteHeader({
  alwaysVisible: toRef(props, "alwaysVisible"),
  revealAfter: toRef(props, "revealAfter"),
  menuButton,
  navigation,
});
</script>

<template>
  <header
    class="home-sticky-header"
    :class="{ 'is-visible': isVisible }"
    :aria-hidden="!isVisible"
    :inert="!isVisible"
    aria-label="主要導覽"
  >
    <a
      class="home-sticky-header__brand"
      :href="settings?.brandDestination ?? '/'"
      :aria-label="settings ? `${settings.brandName}首頁` : '首頁'"
      @click="closeMobileMenu()"
    >
      <img
        v-if="settings?.brandLogo && !logoFailed"
        class="home-sticky-header__brand-logo"
        :src="settings.brandLogo.src"
        alt=""
        :width="settings.brandLogo.width"
        :height="settings.brandLogo.height"
        draggable="false"
        @error="logoFailed = true"
      />
      <span v-else class="leading-normal">{{
        settings?.brandName ?? "首頁"
      }}</span>
    </a>
    <button
      ref="menuButton"
      type="button"
      class="home-sticky-header__menu-toggle"
      :class="{ 'is-open': mobileMenuIsOpen }"
      :aria-expanded="mobileMenuIsOpen"
      aria-controls="home-primary-nav"
      :aria-label="mobileMenuIsOpen ? '關閉主要選單' : '開啟主要選單'"
      @click="toggleMobileMenu"
    >
      <span />
      <span />
      <span />
    </button>
    <nav
      id="home-primary-nav"
      ref="navigation"
      class="home-sticky-header__nav"
      :class="{ 'is-open': mobileMenuIsOpen }"
      :inert="usesCompactHeader && !mobileMenuIsOpen"
      aria-label="主要選單"
    >
      <a
        v-for="item in items"
        :key="item.href"
        :href="item.href"
        :aria-label="item.accessibleLabel"
        :aria-current="itemIsCurrent(item.href) ? 'page' : undefined"
        @click="closeMobileMenu()"
      >
        {{ item.label }}
      </a>
    </nav>
  </header>
</template>

<style scoped>
.home-sticky-header {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 50;
  display: flex;
  width: min(100%, 1920px);
  min-height: var(--home-header-height);
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 10px clamp(24px, 4vw, 72px);
  color: var(--color-oxblood);
  background: rgb(255 255 255 / 72%);
  border-bottom: 1px solid rgb(255 255 255 / 68%);
  -webkit-backdrop-filter: blur(20px) saturate(125%);
  backdrop-filter: blur(20px) saturate(125%);
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, -105%);
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease;
}

.home-sticky-header.is-visible {
  pointer-events: auto;
  opacity: 1;
  transform: translate(-50%, 0);
}

.home-sticky-header__brand {
  display: block;
  color: inherit;
  text-decoration: none;
  line-height: 0;
}

.home-sticky-header__brand-logo {
  display: block;
  width: clamp(120px, 18vw, 140px);
  pointer-events: none;
  user-select: none;
}

.home-sticky-header__nav {
  display: flex;
  align-items: center;
  gap: clamp(18px, 2.4vw, 42px);
  font-size: 13px;
  letter-spacing: 0.12em;
}

.home-sticky-header__nav a {
  color: inherit;
  text-decoration: none;
}

.home-sticky-header__nav a[aria-current="page"] {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 8px;
}

.home-sticky-header__menu-toggle {
  display: none;
}

@media (max-width: 1023px) {
  .home-sticky-header {
    pointer-events: auto;
    opacity: 1;
    transform: translate(-50%, 0);
  }

  .home-sticky-header__nav {
    position: fixed;
    top: var(--home-header-height);
    left: 0;
    display: flex;
    width: 100%;
    height: calc(100dvh - var(--home-header-height));
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 18px clamp(24px, 6vw, 56px) max(24px, env(safe-area-inset-bottom));
    overflow-y: auto;
    color: var(--color-oxblood);
    background: rgb(255 255 255 / 92%);
    -webkit-backdrop-filter: blur(24px) saturate(120%);
    backdrop-filter: blur(24px) saturate(120%);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-14px);
    transition:
      opacity 180ms ease,
      transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
      visibility 0s linear 260ms;
  }

  .home-sticky-header__nav.is-open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
    transition-delay: 0s;
  }

  .home-sticky-header__nav a {
    display: flex;
    min-height: 72px;
    align-items: center;
    border-bottom: 1px solid
      color-mix(in srgb, var(--color-oxblood) 14%, transparent);
    font-size: clamp(18px, 3vw, 22px);
    font-weight: 600;
    letter-spacing: 0.12em;
  }

  .home-sticky-header__menu-toggle {
    position: relative;
    display: block;
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .home-sticky-header__menu-toggle span {
    position: absolute;
    left: 10px;
    width: 24px;
    height: 1px;
    background: currentColor;
    transition:
      opacity 160ms ease,
      transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .home-sticky-header__menu-toggle span:nth-child(1) {
    top: 14px;
  }

  .home-sticky-header__menu-toggle span:nth-child(2) {
    top: 21px;
  }

  .home-sticky-header__menu-toggle span:nth-child(3) {
    top: 28px;
  }

  .home-sticky-header__menu-toggle.is-open span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }

  .home-sticky-header__menu-toggle.is-open span:nth-child(2) {
    opacity: 0;
  }

  .home-sticky-header__menu-toggle.is-open span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-sticky-header,
  .home-sticky-header__nav,
  .home-sticky-header__menu-toggle span {
    transition: none;
  }
}
</style>
