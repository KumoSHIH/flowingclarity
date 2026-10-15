<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const revealOffset = 480
const isVisible = ref(false)

function updateVisibility() {
  isVisible.value = window.scrollY > revealOffset
}

function goToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
}

onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', updateVisibility, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateVisibility)
})
</script>

<template>
  <Transition name="go-top">
    <button
      v-if="isVisible"
      class="go-top-button"
      type="button"
      aria-label="回到頁面頂端"
      title="回到頂端"
      @click="goToTop"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d="M5 8.5 12 2l7 6.5M12 2v20" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.go-top-button {
  position: fixed;
  right: max(clamp(20px, 3vw, 48px), env(safe-area-inset-right));
  bottom: max(clamp(20px, 3vw, 48px), env(safe-area-inset-bottom));
  z-index: 40;
  display: grid;
  width: 56px;
  height: 56px;
  padding: 0;
  place-items: center;
  color: var(--color-paper);
  background: var(--color-night);
  border: 1px solid color-mix(in srgb, var(--color-paper) 24%, transparent);
  border-radius: 0;
  cursor: pointer;
  transition:
    color 180ms ease,
    background 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease;
}

.go-top-button:hover {
  color: var(--color-warm-white);
  background: var(--color-clay);
}

.go-top-button:focus-visible {
  outline: var(--control-focus-width) solid var(--color-saffron);
  outline-offset: var(--control-focus-offset);
}

.go-top-button svg {
  width: 22px;
  height: 22px;
  overflow: visible;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: square;
  stroke-linejoin: miter;
  stroke-width: 1.7;
}

.go-top-enter-active,
.go-top-leave-active {
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease;
}

.go-top-enter-from,
.go-top-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 767px) {
  .go-top-button {
    width: 52px;
    height: 52px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .go-top-button,
  .go-top-enter-active,
  .go-top-leave-active {
    transition: none;
  }
}
</style>
