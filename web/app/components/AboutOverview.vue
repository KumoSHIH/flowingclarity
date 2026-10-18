<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AboutPageContent, AboutPageStatus } from '#shared/types/about'

const props = withDefaults(defineProps<{
  content: AboutPageContent
  status?: AboutPageStatus
}>(), {
  status: 'ready',
})

const emit = defineEmits<{ retry: [] }>()
const activeIndex = ref(0)
const touchStartX = ref<number | null>(null)
const failedImages = ref(new Set<string>())

const moments = computed(() => props.content.featuredMoments.items)
const currentMoment = computed(() => moments.value[activeIndex.value])
const countLabel = computed(() => (
  `${String(activeIndex.value + 1).padStart(2, '0')} / ${String(moments.value.length).padStart(2, '0')}`
))

watch(() => moments.value.length, length => {
  if (!length || activeIndex.value >= length) activeIndex.value = 0
})

function previousMoment() {
  if (activeIndex.value > 0) activeIndex.value -= 1
}

function nextMoment() {
  if (activeIndex.value < moments.value.length - 1) activeIndex.value += 1
}

function onTouchStart(event: TouchEvent) {
  touchStartX.value = event.changedTouches[0]?.clientX ?? null
}

function onTouchEnd(event: TouchEvent) {
  const start = touchStartX.value
  const end = event.changedTouches[0]?.clientX
  touchStartX.value = null
  if (start === null || end === undefined || Math.abs(end - start) < 48) return
  end < start ? nextMoment() : previousMoment()
}

function markImageFailed(src: string) {
  failedImages.value = new Set(failedImages.value).add(src)
}

function imageHasFailed(src: string) {
  return failedImages.value.has(src)
}
</script>

<template>
  <div class="about-overview" :aria-busy="status === 'loading'">
    <div v-if="status === 'loading'" class="about-state about-state--loading" aria-live="polite">
      <span class="about-state__line about-state__line--title" />
      <span v-for="index in 4" :key="index" class="about-state__line" />
      <p>正在整理關於我們的內容…</p>
    </div>

    <div v-else-if="status === 'error'" class="about-state" role="alert">
      <p class="about-label">關於我們</p>
      <h1>頁面內容暫時無法顯示</h1>
      <p>請稍後再試一次；主要導覽與頁尾仍可正常使用。</p>
      <button type="button" @click="emit('retry')">重新載入</button>
    </div>

    <template v-else>
      <header class="about-hero">
        <div class="about-hero__copy">
          <div class="about-hero__index" aria-hidden="true">
            <span>ABOUT</span>
            <span>FLOWING CLARITY</span>
          </div>
          <h1>{{ content.title }}</h1>
          <p v-if="content.introduction" class="about-lead">{{ content.introduction }}</p>
          <p v-if="content.prototypeNotice" class="about-prototype-note">
            {{ content.prototypeNotice }}
          </p>
        </div>
        <div class="about-hero__media">
          <img
            v-if="!imageHasFailed(content.heroImage.src)"
            :src="content.heroImage.src"
            :alt="content.heroImage.alt"
            :width="content.heroImage.width"
            :height="content.heroImage.height"
            :style="{ objectPosition: content.heroImage.objectPosition }"
            @error="markImageFailed(content.heroImage.src)"
          >
          <p v-else class="about-image-fallback">{{ content.heroImage.alt }}</p>
        </div>
      </header>

      <section class="about-brand" aria-labelledby="about-brand-title">
        <div class="about-brand__heading">
          <p class="about-label">品牌理念</p>
          <h2 id="about-brand-title">{{ content.brandStory.heading }}</h2>
        </div>
        <div class="about-copy about-brand__body">
          <p v-for="paragraph in content.brandStory.body" :key="paragraph">{{ paragraph }}</p>
        </div>
        <figure v-if="content.brandStory.image" class="about-brand__media">
          <img
            v-if="!imageHasFailed(content.brandStory.image.src)"
            :src="content.brandStory.image.src"
            :alt="content.brandStory.image.alt"
            :width="content.brandStory.image.width"
            :height="content.brandStory.image.height"
            @error="markImageFailed(content.brandStory.image.src)"
          >
          <p v-else class="about-image-fallback">{{ content.brandStory.image.alt }}</p>
        </figure>
      </section>

      <section class="about-place" aria-labelledby="about-place-title">
        <div class="about-place__copy">
          <p class="about-label">空間與團隊</p>
          <h2 id="about-place-title">{{ content.placeAndTeam.heading }}</h2>
          <div class="about-copy">
            <p v-for="paragraph in content.placeAndTeam.body" :key="paragraph">{{ paragraph }}</p>
          </div>
        </div>
        <div class="about-place__media">
          <img
            v-if="!imageHasFailed(content.placeAndTeam.image.src)"
            :src="content.placeAndTeam.image.src"
            :alt="content.placeAndTeam.image.alt"
            :width="content.placeAndTeam.image.width"
            :height="content.placeAndTeam.image.height"
            :style="{ objectPosition: content.placeAndTeam.image.objectPosition }"
            @error="markImageFailed(content.placeAndTeam.image.src)"
          >
          <p v-else class="about-image-fallback">{{ content.placeAndTeam.image.alt }}</p>
        </div>
      </section>

      <section class="about-moments" aria-labelledby="about-moments-title">
        <div class="about-moments__heading">
          <p class="about-label">精選片段</p>
          <h2 id="about-moments-title">{{ content.featuredMoments.heading }}</h2>
        </div>

        <div v-if="currentMoment" class="about-carousel" role="region" aria-roledescription="carousel" aria-label="精選片段">
          <figure
            class="about-carousel__figure"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
          >
            <div class="about-carousel__stage">
              <img
                v-if="!imageHasFailed(currentMoment.image.src)"
                :key="currentMoment.id"
                :src="currentMoment.image.src"
                :alt="currentMoment.image.alt"
                :width="currentMoment.image.width"
                :height="currentMoment.image.height"
                :style="{ objectPosition: currentMoment.image.objectPosition }"
                @error="markImageFailed(currentMoment.image.src)"
              >
              <p v-else class="about-image-fallback">{{ currentMoment.image.alt }}</p>
            </div>
            <figcaption v-if="currentMoment.caption">{{ currentMoment.caption }}</figcaption>
          </figure>

          <div class="about-carousel__controls">
            <button
              type="button"
              :disabled="activeIndex === 0"
              aria-label="上一張片段"
              @click="previousMoment"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7M8 12h12" /></svg>
            </button>
            <span aria-live="polite" aria-atomic="true">{{ countLabel }}</span>
            <button
              type="button"
              :disabled="activeIndex === moments.length - 1"
              aria-label="下一張片段"
              @click="nextMoment"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7M4 12h12" /></svg>
            </button>
          </div>
          <div class="about-carousel__copy about-copy">
            <p v-for="paragraph in content.featuredMoments.body" :key="paragraph">{{ paragraph }}</p>
          </div>
        </div>
        <div v-else class="about-moments__empty">
          <p>精選片段仍在整理中。</p>
        </div>
      </section>

      <section class="about-contact" aria-labelledby="about-contact-title">
        <div class="about-contact__copy">
          <div>
            <p class="about-label">聯絡我們</p>
            <h2 id="about-contact-title">{{ content.contactHeading }}</h2>
            <p v-if="content.contactIntroduction" class="about-copy">
              {{ content.contactIntroduction }}
            </p>
          </div>

          <address v-if="content.contact" class="about-contact__list">
            <dl>
              <div v-if="content.contact.address">
                <dt>地址</dt>
                <dd>{{ content.contact.address }}</dd>
              </div>
              <div v-if="content.contact.phone">
                <dt>電話</dt>
                <dd><a :href="content.contact.phone.href">{{ content.contact.phone.display }}</a></dd>
              </div>
              <div v-if="content.contact.email">
                <dt>Email</dt>
                <dd><a :href="`mailto:${content.contact.email}`">{{ content.contact.email }}</a></dd>
              </div>
              <div v-if="content.contact.businessHours.length">
                <dt>營業時間</dt>
                <dd>
                  <p v-for="item in content.contact.businessHours" :key="`${item.days}-${item.hours}`">
                    {{ item.days }}　{{ item.hours }}
                  </p>
                  <p v-if="content.contact.businessHoursNote">{{ content.contact.businessHoursNote }}</p>
                </dd>
              </div>
              <div v-if="content.contact.socialLinks.length">
                <dt>社群</dt>
                <dd class="about-contact__socials">
                  <a
                    v-for="social in content.contact.socialLinks"
                    :key="social.label"
                    :href="social.href"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{{ social.label }}</a>
                </dd>
              </div>
            </dl>
          </address>
          <p v-else class="about-contact__unavailable">聯絡資訊暫時無法顯示，請稍後再試。</p>
        </div>

        <div v-if="content.contact?.map" class="about-map">
          <iframe
            :title="`${content.contact.map.placeName} Google Maps 地圖`"
            :src="content.contact.map.embedUrl"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
          <a
            :href="content.contact.map.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
          >在 Google Maps 開啟</a>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.about-overview {
  --about-edge: clamp(28px, 6vw, 116px);
  color: var(--color-ink);
  background: var(--color-paper);
}

.about-overview h1,
.about-overview h2,
.about-overview p,
.about-overview figure,
.about-overview dl,
.about-overview dd {
  margin: 0;
}

.about-overview h1 {
  font: 400 var(--detail-hero-title-size)/1.22 var(--font-display);
  letter-spacing: 0.025em;
  white-space: nowrap;
}

.about-overview h2 {
  max-width: 18em;
  font: 400 var(--detail-section-title-size)/1.4 var(--font-display);
  letter-spacing: 0.02em;
}

.about-label {
  margin-bottom: 18px !important;
  color: var(--color-clay);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.7;
  letter-spacing: 0.18em;
}

.about-copy,
.about-lead {
  font-size: var(--detail-body-size);
  line-height: 2.1;
  letter-spacing: 0.025em;
}

.about-copy p + p {
  margin-top: 18px;
}

.about-hero {
  display: grid;
  min-height: clamp(620px, calc(100vh - 87px), 850px);
  grid-template-columns: 41% 59%;
  background: var(--color-sand);
}

.about-hero__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: 72px clamp(32px, 4.7vw, 90px) 72px var(--about-edge);
}

.about-hero__index {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: clamp(70px, 10vh, 116px);
  color: var(--color-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.about-lead {
  max-width: 31em;
  margin-top: 38px !important;
  font-size: var(--detail-summary-size);
  line-height: 2;
  letter-spacing: 0.035em;
}

.about-prototype-note {
  max-width: 52em;
  margin-top: 36px !important;
  color: var(--color-muted);
  font-size: 11px;
  line-height: 1.8;
  letter-spacing: 0.07em;
}

.about-hero__media,
.about-place__media,
.about-carousel__stage,
.about-brand__media {
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: var(--color-sand);
}

.about-hero__media img,
.about-place__media img,
.about-carousel__stage img,
.about-brand__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-image-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 280px;
  place-items: center;
  padding: 32px;
  color: var(--color-muted);
  text-align: center;
  line-height: 1.8;
}

.about-brand {
  display: grid;
  justify-items: center;
  gap: 36px;
  padding: 104px var(--about-edge) 116px;
  text-align: center;
}

.about-brand__heading {
  display: grid;
  justify-items: center;
}

.about-brand__body {
  max-width: 68ch;
}

.about-brand__media {
  width: min(100%, 980px);
  aspect-ratio: 3 / 2;
  margin-top: 20px;
}

.about-place {
  display: grid;
  min-height: 720px;
  grid-template-columns: 42% 58%;
  background: color-mix(in srgb, var(--color-sand) 66%, var(--color-paper));
}

.about-place__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 90px clamp(36px, 5vw, 84px) 90px var(--about-edge);
}

.about-place__copy .about-copy {
  max-width: 38em;
  margin-top: 36px;
}

.about-moments {
  display: grid;
  grid-template-columns: minmax(0, 56%) minmax(0, 44%);
  grid-template-areas:
    "media heading"
    "media copy"
    "media controls";
  background: var(--color-paper);
}

.about-moments__heading {
  grid-area: heading;
  align-self: end;
  padding: 104px var(--about-edge) 42px clamp(44px, 5vw, 88px);
}

.about-carousel {
  display: contents;
}

.about-carousel__figure {
  grid-area: media;
  min-width: 0;
  background: var(--color-sand);
  touch-action: pan-y;
}

.about-carousel__stage {
  aspect-ratio: 3 / 2;
}

.about-carousel__figure figcaption {
  min-height: 76px;
  padding: 20px var(--about-edge) 20px;
  color: var(--color-muted);
  font-size: 12px;
  line-height: 1.8;
  letter-spacing: 0.05em;
}

.about-carousel__copy {
  grid-area: copy;
  max-width: 36em;
  padding: 0 var(--about-edge) 48px clamp(44px, 5vw, 88px);
}

.about-carousel__controls {
  display: flex;
  grid-area: controls;
  align-items: center;
  gap: 22px;
  padding: 0 var(--about-edge) 104px clamp(44px, 5vw, 88px);
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

.about-carousel__controls button:disabled {
  cursor: not-allowed;
  opacity: 0.34;
}

.about-carousel__controls svg {
  width: 22px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.5;
}

.about-carousel__controls span {
  min-width: 64px;
  color: var(--color-muted);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-align: center;
}

.about-moments__empty {
  grid-area: media / media / copy / copy;
  display: grid;
  min-height: 340px;
  place-items: center;
  padding: 48px var(--about-edge);
  color: var(--color-muted);
  background: var(--color-sand);
}

.about-contact {
  display: grid;
  min-height: 760px;
  grid-template-columns: 48% 52%;
  background: color-mix(in srgb, var(--color-sand) 72%, var(--color-paper));
}

.about-contact__copy {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 80px;
  padding: 104px clamp(42px, 5.6vw, 96px) 104px var(--about-edge);
}

.about-contact__copy > div > .about-copy {
  max-width: 38em;
  margin-top: 32px;
}

.about-contact__list {
  font-style: normal;
}

.about-contact__list dl {
  margin: 0;
}

.about-contact__list dl > div {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 20px;
  padding: 18px 0;
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
}

.about-contact__list dl > div:last-child {
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
}

.about-contact__list dt {
  color: var(--color-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.about-contact__list dd,
.about-contact__list a {
  color: var(--color-ink);
  font-size: 14px;
  line-height: 1.9;
  letter-spacing: 0.04em;
  overflow-wrap: anywhere;
}

.about-contact__socials {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
}

.about-contact__unavailable {
  padding: 24px 0;
  border-block: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
  color: var(--color-muted);
  line-height: 1.9;
}

.about-map {
  position: relative;
  min-height: 540px;
  background: var(--color-sand);
}

.about-map iframe {
  width: 100%;
  height: 100%;
  min-height: 540px;
  border: 0;
  filter: saturate(0.65) sepia(0.12);
}

.about-map a {
  position: absolute;
  right: 24px;
  bottom: 24px;
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  padding: 0 22px;
  color: var(--color-paper);
  background: var(--color-oxblood);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-decoration: none;
}

.about-state {
  display: grid;
  min-height: 620px;
  place-content: center;
  justify-items: start;
  gap: 20px;
  padding: 72px var(--about-edge);
  background: var(--color-sand);
}

.about-state h1 {
  white-space: normal;
}

.about-state > p:not(.about-label) {
  max-width: 42em;
  line-height: 2;
}

.about-state button {
  min-height: 48px;
  padding: 0 24px;
  color: var(--color-paper);
  background: var(--color-oxblood);
  border: 0;
  border-radius: 0;
  cursor: pointer;
}

.about-state--loading {
  align-content: center;
  justify-items: stretch;
  width: 100%;
}

.about-state__line {
  display: block;
  width: min(100%, 680px);
  height: 14px;
  background: color-mix(in srgb, var(--color-muted) 18%, transparent);
}

.about-state__line--title {
  width: min(58%, 360px);
  height: 54px;
}

@media (max-width: 1023px) {
  .about-overview {
    --about-edge: clamp(24px, 6vw, 56px);
  }

  .about-hero {
    min-height: 0;
    grid-template-columns: 1fr;
  }

  .about-hero__copy {
    min-height: 420px;
    padding: 58px var(--about-edge) 62px;
  }

  .about-hero__index {
    margin-bottom: 60px;
  }

  .about-lead {
    margin-top: 28px !important;
  }

  .about-prototype-note {
    margin-top: 28px !important;
  }

  .about-hero__media {
    aspect-ratio: 4 / 3;
  }

  .about-brand {
    gap: 28px;
    padding-top: 78px;
    padding-bottom: 84px;
  }

  .about-place {
    min-height: 0;
    grid-template-columns: 1fr;
  }

  .about-place__copy {
    padding: 80px var(--about-edge) 64px;
  }

  .about-place__copy .about-copy {
    margin-top: 28px;
  }

  .about-place__media {
    aspect-ratio: 4 / 3;
  }

  .about-moments {
    display: block;
  }

  .about-moments__heading {
    padding: 80px var(--about-edge) 36px;
  }

  .about-carousel {
    display: flex;
    flex-direction: column;
  }

  .about-carousel__figure {
    order: 1;
  }

  .about-carousel__stage {
    aspect-ratio: 4 / 3;
  }

  .about-carousel__figure figcaption {
    min-height: 0;
    padding: 18px var(--about-edge) 0;
  }

  .about-carousel__copy {
    order: 3;
    max-width: none;
    padding: 32px var(--about-edge) 84px;
  }

  .about-carousel__controls {
    order: 2;
    padding: 24px var(--about-edge) 0;
  }

  .about-contact {
    min-height: 0;
    grid-template-columns: 1fr;
  }

  .about-contact__copy {
    gap: 56px;
    padding: 80px var(--about-edge);
  }

  .about-map,
  .about-map iframe {
    min-height: min(72vw, 540px);
  }
}

@media (max-width: 520px) {
  .about-hero__copy {
    min-height: 390px;
  }

  .about-hero__index {
    margin-bottom: 48px;
  }

  .about-contact__list dl > div {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .about-map a {
    right: 16px;
    bottom: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-overview *,
  .about-overview *::before,
  .about-overview *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
