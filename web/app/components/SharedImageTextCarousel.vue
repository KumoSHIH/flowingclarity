<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

interface CarouselImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  objectPosition?: string;
}

interface CarouselItem {
  id: string;
  image: CarouselImage;
  caption?: string;
}

const props = withDefaults(
  defineProps<{
    items: CarouselItem[];
    label: string;
    autoplay?: boolean;
  }>(),
  {
    autoplay: true,
  },
);

const root = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const failedImages = ref(new Set<string>());
const dragStartX = ref<number | null>(null);
const dragOffset = ref(0);
const dragging = ref(false);
const activePointerId = ref<number | null>(null);
const visualIndex = ref(1);
const transitionEnabled = ref(true);
const transitionRunning = ref(false);
const isHovered = ref(false);
const hasFocus = ref(false);
const isVisible = ref(true);
const documentIsVisible = ref(true);
const reducedMotion = ref(false);
let autoplayTimer: ReturnType<typeof setInterval> | undefined;
let transitionTimer: ReturnType<typeof setTimeout> | undefined;
let observer: IntersectionObserver | undefined;
let motionQuery: MediaQueryList | undefined;
let mounted = false;

const AUTOPLAY_DELAY_MS = 2_500;
const SLIDE_TRANSITION_MS = 2_000;
const DRAG_THRESHOLD_PX = 48;

const currentItem = computed(() => props.items[activeIndex.value]);
const renderedItems = computed(() => {
  if (props.items.length < 2) {
    return props.items.map((item, originalIndex) => ({
      key: item.id,
      item,
      originalIndex,
    }));
  }

  const firstItem = props.items[0]!;
  const lastItem = props.items.at(-1)!;
  return [
    {
      key: `loop-before-${lastItem.id}`,
      item: lastItem,
      originalIndex: props.items.length - 1,
    },
    ...props.items.map((item, originalIndex) => ({
      key: item.id,
      item,
      originalIndex,
    })),
    { key: `loop-after-${firstItem.id}`, item: firstItem, originalIndex: 0 },
  ];
});
const countLabel = computed(
  () =>
    `${String(activeIndex.value + 1).padStart(2, "0")} / ${String(props.items.length).padStart(2, "0")}`,
);
const trackStyle = computed(() => ({
  transform: `translate3d(calc(${-visualIndex.value * 100}% + ${dragOffset.value}px), 0, 0)`,
}));
const autoplayCanRun = computed(
  () =>
    props.autoplay &&
    props.items.length > 1 &&
    !isHovered.value &&
    !hasFocus.value &&
    !dragging.value &&
    isVisible.value &&
    documentIsVisible.value &&
    !reducedMotion.value,
);

watch(
  () => props.items.length,
  (length) => {
    if (!length || activeIndex.value >= length) activeIndex.value = 0;
    visualIndex.value = length > 1 ? activeIndex.value + 1 : 0;
  },
  { immediate: true },
);
watch(autoplayCanRun, syncAutoplay);

function previousItem() {
  if (props.items.length < 2 || transitionRunning.value) return;
  startTransitionTimer();
  activeIndex.value =
    (activeIndex.value - 1 + props.items.length) % props.items.length;
  visualIndex.value -= 1;
}

function nextItem() {
  if (props.items.length < 2 || transitionRunning.value) return;
  startTransitionTimer();
  activeIndex.value = (activeIndex.value + 1) % props.items.length;
  visualIndex.value += 1;
}

function syncAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = undefined;
  if (!mounted || !autoplayCanRun.value) return;
  autoplayTimer = setInterval(nextItem, AUTOPLAY_DELAY_MS);
}

function startTransitionTimer() {
  transitionRunning.value = true;
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(finishTrackTransition, SLIDE_TRANSITION_MS + 50);
}

function finishTrackTransition() {
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = undefined;
  if (props.items.length < 2) {
    transitionRunning.value = false;
    return;
  }

  if (visualIndex.value !== 0 && visualIndex.value !== props.items.length + 1) {
    transitionRunning.value = false;
    return;
  }

  transitionEnabled.value = false;
  visualIndex.value = visualIndex.value === 0 ? props.items.length : 1;
  requestAnimationFrame(() => {
    transitionEnabled.value = true;
    transitionRunning.value = false;
  });
}

function onTrackTransitionEnd(event: TransitionEvent) {
  if (event.propertyName === "transform") finishTrackTransition();
}

function onPointerDown(event: PointerEvent) {
  if (
    transitionRunning.value ||
    (event.pointerType === "mouse" && event.button !== 0)
  )
    return;
  dragStartX.value = event.clientX;
  activePointerId.value = event.pointerId;
  dragging.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
}

function onPointerMove(event: PointerEvent) {
  if (
    !dragging.value ||
    dragStartX.value === null ||
    activePointerId.value !== event.pointerId
  )
    return;
  dragOffset.value = event.clientX - dragStartX.value;
}

function finishDrag(event: PointerEvent) {
  if (!dragging.value || activePointerId.value !== event.pointerId) return;
  const completedOffset = dragOffset.value;
  dragging.value = false;
  dragStartX.value = null;
  activePointerId.value = null;
  dragOffset.value = 0;
  if (Math.abs(completedOffset) < DRAG_THRESHOLD_PX) return;
  completedOffset < 0 ? nextItem() : previousItem();
}

function onFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget;
  if (
    !(nextTarget instanceof Node) ||
    !(event.currentTarget as HTMLElement).contains(nextTarget)
  ) {
    hasFocus.value = false;
  }
}

function markImageFailed(src: string) {
  failedImages.value = new Set(failedImages.value).add(src);
}

function onVisibilityChange() {
  documentIsVisible.value = document.visibilityState !== "hidden";
}

function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches;
}

onMounted(() => {
  mounted = true;
  documentIsVisible.value = document.visibilityState !== "hidden";
  document.addEventListener("visibilitychange", onVisibilityChange);

  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion.value = motionQuery.matches;
  motionQuery.addEventListener?.("change", onMotionChange);

  if ("IntersectionObserver" in window && root.value) {
    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry?.isIntersecting ?? true;
      },
      { threshold: 0.15 },
    );
    observer.observe(root.value);
  }
  syncAutoplay();
});

onBeforeUnmount(() => {
  mounted = false;
  if (autoplayTimer) clearInterval(autoplayTimer);
  if (transitionTimer) clearTimeout(transitionTimer);
  observer?.disconnect();
  document.removeEventListener("visibilitychange", onVisibilityChange);
  motionQuery?.removeEventListener?.("change", onMotionChange);
});
</script>

<template>
  <section
    ref="root"
    class="shared-image-carousel"
    role="region"
    aria-roledescription="carousel"
    :aria-label="label"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focusin="hasFocus = true"
    @focusout="onFocusOut"
  >
    <div class="about-carousel__heading"><slot name="heading" /></div>
    <template v-if="currentItem">
      <figure
        class="about-carousel__figure"
        :class="{ 'is-dragging': dragging }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="finishDrag"
        @pointercancel="finishDrag"
        @pointerleave="finishDrag"
      >
        <div class="about-carousel__stage">
          <div
            class="about-carousel__track"
            :class="{
              'is-dragging': dragging,
              'is-jumping': !transitionEnabled,
            }"
            :style="trackStyle"
            @transitionend.self="onTrackTransitionEnd"
          >
            <div
              v-for="(slide, index) in renderedItems"
              :key="slide.key"
              class="about-carousel__slide"
              :aria-hidden="index !== visualIndex"
            >
              <img
                v-if="!failedImages.has(slide.item.image.src)"
                :src="slide.item.image.src"
                :alt="slide.item.image.alt"
                :width="slide.item.image.width"
                :height="slide.item.image.height"
                :style="{ objectPosition: slide.item.image.objectPosition }"
                :loading="slide.originalIndex === 0 ? 'eager' : 'lazy'"
                decoding="async"
                draggable="false"
                @error="markImageFailed(slide.item.image.src)"
              />
              <p v-else class="about-carousel__fallback about-image-fallback">
                {{ slide.item.image.alt }}
              </p>
            </div>
          </div>
        </div>
        <figcaption v-if="currentItem.caption">
          {{ currentItem.caption }}
        </figcaption>
      </figure>

      <div class="about-carousel__controls">
        <button
          type="button"
          :disabled="items.length < 2"
          :aria-disabled="transitionRunning ? 'true' : undefined"
          :aria-label="`上一張${label}`"
          @click="previousItem"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 5-7 7 7 7M8 12h12" />
          </svg>
        </button>
        <span aria-live="off" aria-atomic="true">{{ countLabel }}</span>
        <button
          type="button"
          :disabled="items.length < 2"
          :aria-disabled="transitionRunning ? 'true' : undefined"
          :aria-label="`下一張${label}`"
          @click="nextItem"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 5 7 7-7 7M4 12h12" />
          </svg>
        </button>
      </div>
      <div class="about-carousel__copy"><slot name="copy" /></div>
    </template>
    <div v-else class="about-carousel__empty"><slot name="empty" /></div>
  </section>
</template>

<style scoped>
.shared-image-carousel {
  display: grid;
  grid-template-columns: minmax(0, 56%) minmax(0, 44%);
  grid-template-areas: "media heading" "media copy" "media controls";
  color: var(--color-ink);
  background: var(--color-paper);
}
.about-carousel__heading {
  grid-area: heading;
  align-self: end;
  padding: var(--carousel-section-block, 104px) var(--carousel-edge) 42px
    clamp(44px, 5vw, 88px);
}
.about-carousel__figure {
  grid-area: media;
  min-width: 0;
  margin: 0;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}
.about-carousel__figure.is-dragging {
  cursor: grabbing;
}
.about-carousel__stage {
  aspect-ratio: 3 / 2;
  overflow: hidden;
}
.about-carousel__track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 2000ms cubic-bezier(0.16, 1, 0.3, 1);
}
.about-carousel__track.is-dragging,
.about-carousel__track.is-jumping {
  transition: none;
}
.about-carousel__slide {
  width: 100%;
  height: 100%;
  flex: 0 0 100%;
}
.about-carousel__slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.about-carousel__fallback {
  display: grid;
  height: 100%;
  place-items: center;
  padding: 24px;
  margin: 0;
  background: var(--color-sand);
}
.about-carousel__figure figcaption {
  min-height: 76px;
  padding: 20px var(--carousel-edge);
  color: var(--carousel-muted);
  font-size: var(--type-meta-size);
  font-weight: var(--type-meta-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}
.about-carousel__copy {
  grid-area: copy;
  max-width: 36em;
  padding: 0 var(--carousel-edge) 48px clamp(44px, 5vw, 88px);
}
.about-carousel__controls {
  display: flex;
  grid-area: controls;
  align-items: center;
  gap: 22px;
  padding: 0 var(--carousel-edge) var(--carousel-section-block, 104px)
    clamp(44px, 5vw, 88px);
}
.about-carousel__controls button {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  padding: 0;
  color: var(--color-ink);
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--color-ink) 35%, transparent);
  border-radius: 0;
  cursor: pointer;
}
.about-carousel__controls button:focus-visible {
  outline: 2px solid var(--color-clay);
  outline-offset: 5px;
}
.about-carousel__controls button:disabled {
  cursor: not-allowed;
  opacity: 0.34;
}
.about-carousel__controls button[aria-disabled="true"] {
  cursor: wait;
  opacity: 0.6;
}
.about-carousel__controls svg {
  width: 22px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.5;
}
.about-carousel__controls span {
  min-width: 64px;
  color: var(--carousel-muted);
  font-size: var(--type-meta-size);
  font-weight: var(--type-meta-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.about-carousel__empty {
  grid-area: media / media / copy / copy;
  display: grid;
  min-height: 340px;
  place-items: center;
  padding: var(--carousel-section-block, 48px) var(--carousel-edge);
  color: var(--carousel-muted);
  background: var(--color-sand);
}
@media (max-width: 767px) {
  .shared-image-carousel {
    display: flex;
    flex-direction: column;
  }
  .about-carousel__heading {
    order: 0;
    padding: var(--carousel-section-block, 30px) var(--carousel-edge) 30px;
    align-self: auto;
  }
  .about-carousel__figure {
    order: 1;
  }
  .about-carousel__stage {
    aspect-ratio: 4 / 3;
  }
  .about-carousel__figure figcaption {
    min-height: 0;
    padding: 18px var(--carousel-edge) 0;
  }
  .about-carousel__controls {
    order: 2;
    padding: 24px var(--carousel-edge) 0;
  }
  .about-carousel__copy {
    order: 3;
    max-width: none;
    padding: 32px var(--carousel-edge) var(--carousel-section-block, 84px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .about-carousel__track {
    transition: none;
  }
}
</style>
