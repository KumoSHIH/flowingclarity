<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const motionIsActive = ref(true)

const syncMotion = () => {
  motionIsActive.value = document.visibilityState !== 'hidden'
}

onMounted(() => {
  syncMotion()
  document.addEventListener('visibilitychange', syncMotion)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', syncMotion)
})
</script>

<template>
  <div
    class="home-flow-line"
    :class="{ 'is-active': motionIsActive }"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 1000 4000"
      preserveAspectRatio="none"
      role="presentation"
    >
      <path
        class="flow-line-base"
        pathLength="1"
        d="M 235 150 C 105 360 165 650 335 860 C 510 1080 805 1120 790 1450 C 775 1760 610 1920 430 2090 C 225 2280 115 2490 235 2750 C 350 3000 705 2940 750 3240 C 790 3500 430 3760 235 3995"
      />
      <path
        class="flow-line-current flow-line-current-soft"
        pathLength="1"
        d="M 235 150 C 105 360 165 650 335 860 C 510 1080 805 1120 790 1450 C 775 1760 610 1920 430 2090 C 225 2280 115 2490 235 2750 C 350 3000 705 2940 750 3240 C 790 3500 430 3760 235 3995"
      />
      <path
        class="flow-line-current flow-line-current-veil"
        pathLength="1"
        d="M 235 150 C 105 360 165 650 335 860 C 510 1080 805 1120 790 1450 C 775 1760 610 1920 430 2090 C 225 2280 115 2490 235 2750 C 350 3000 705 2940 750 3240 C 790 3500 430 3760 235 3995"
      />
    </svg>
  </div>
</template>

<style scoped>
.home-flow-line {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow: hidden;
  pointer-events: none;
}

.home-flow-line svg {
  display: block;
  width: 100%;
  height: 100%;
}

.home-flow-line path {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.flow-line-base {
  stroke: color-mix(in srgb, var(--color-clay) 45%, transparent);
  stroke-width: 1.1;
}

.flow-line-current {
  stroke-linecap: round;
  opacity: 0;
  mix-blend-mode: screen;
}

.flow-line-current-soft {
  stroke: rgba(255, 255, 255, 0.72);
  stroke-width: 20;
  stroke-dasharray: 0.075 0.925;
  filter: blur(10px);
}

.flow-line-current-veil {
  stroke: rgba(255, 255, 255, 0.82);
  stroke-width: 8;
  stroke-dasharray: 0.038 0.962;
  filter: blur(3px);
}

.home-flow-line.is-active .flow-line-current {
  opacity: 0.88;
  animation: flow-current 12s linear infinite;
}

.home-flow-line.is-active .flow-line-current-veil {
  opacity: 0.72;
  animation-delay: -0.32s;
}

@keyframes flow-current {
  from {
    stroke-dashoffset: 0;
  }

  to {
    stroke-dashoffset: -1;
  }
}

@media (max-width: 767px) {
  .flow-line-base {
    stroke-width: 0.8;
  }

  .flow-line-current-soft {
    stroke-width: 14;
  }

  .flow-line-current-veil {
    stroke-width: 6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-flow-line.is-active .flow-line-current {
    opacity: 0;
    animation: none;
  }
}
</style>
