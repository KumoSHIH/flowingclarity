<script setup lang="ts">
import { ref } from "vue";
import type { AboutPageContent, AboutPageStatus } from "#shared/types/about";
import type { AboutRichTextParagraph } from "#shared/types/about";
import SharedImageTextCarousel from "./SharedImageTextCarousel.vue";

const props = withDefaults(
  defineProps<{
    content: AboutPageContent;
    status?: AboutPageStatus;
  }>(),
  {
    status: "ready",
  },
);

const emit = defineEmits<{ retry: [] }>();
const failedImages = ref(new Set<string>());

function markImageFailed(src: string) {
  failedImages.value = new Set(failedImages.value).add(src);
}

function imageHasFailed(src: string) {
  return failedImages.value.has(src);
}

function paragraphSegments(paragraph: AboutRichTextParagraph) {
  return paragraph.segments.length
    ? paragraph.segments
    : [{ key: `${paragraph.key}-text`, text: paragraph.text }];
}

</script>

<template>
  <div class="about-overview" :aria-busy="status === 'loading'">
    <div
      v-if="status === 'loading'"
      class="about-state about-state--loading"
      aria-live="polite"
    >
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
          <p v-if="content.introduction" class="about-lead">
            {{ content.introduction }}
          </p>
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
          />
          <p v-else class="about-image-fallback">{{ content.heroImage.alt }}</p>
        </div>
      </header>

      <section class="about-brand" aria-labelledby="about-brand-title">
        <div class="about-brand__heading">
          <p class="about-label">品牌理念</p>
          <h2 id="about-brand-title">{{ content.brandStory.heading }}</h2>
        </div>
        <div class="about-copy about-brand__body">
          <p v-for="paragraph in content.brandStory.body" :key="paragraph.key">
            <component
              :is="segment.href ? 'a' : 'span'"
              v-for="segment in paragraphSegments(paragraph)"
              :key="segment.key"
              :href="segment.href"
            >
              <strong v-if="segment.strong">
                <em v-if="segment.emphasis">{{ segment.text }}</em>
                <template v-else>{{ segment.text }}</template>
              </strong>
              <em v-else-if="segment.emphasis">{{ segment.text }}</em>
              <template v-else>{{ segment.text }}</template>
            </component>
          </p>
        </div>
        <figure v-if="content.brandStory.image" class="about-brand__media">
          <img
            v-if="!imageHasFailed(content.brandStory.image.src)"
            :src="content.brandStory.image.src"
            :alt="content.brandStory.image.alt"
            :width="content.brandStory.image.width"
            :height="content.brandStory.image.height"
            @error="markImageFailed(content.brandStory.image.src)"
          />
          <p v-else class="about-image-fallback">
            {{ content.brandStory.image.alt }}
          </p>
        </figure>
      </section>

      <section class="about-place" aria-labelledby="about-place-title">
        <div class="about-place__copy">
          <p class="about-label">空間與團隊</p>
          <h2 id="about-place-title">{{ content.placeAndTeam.heading }}</h2>
          <div class="about-copy">
            <p
              v-for="paragraph in content.placeAndTeam.body"
              :key="paragraph.key"
            >
              <component
                :is="segment.href ? 'a' : 'span'"
                v-for="segment in paragraphSegments(paragraph)"
                :key="segment.key"
                :href="segment.href"
              >
                <strong v-if="segment.strong">
                  <em v-if="segment.emphasis">{{ segment.text }}</em>
                  <template v-else>{{ segment.text }}</template>
                </strong>
                <em v-else-if="segment.emphasis">{{ segment.text }}</em>
                <template v-else>{{ segment.text }}</template>
              </component>
            </p>
          </div>
        </div>
        <div class="about-place__media">
          <img
            v-if="!imageHasFailed(content.placeAndTeam.image.src)"
            :src="content.placeAndTeam.image.src"
            :alt="content.placeAndTeam.image.alt"
            :width="content.placeAndTeam.image.width"
            :height="content.placeAndTeam.image.height"
            :style="{
              objectPosition: content.placeAndTeam.image.objectPosition,
            }"
            @error="markImageFailed(content.placeAndTeam.image.src)"
          />
          <p v-else class="about-image-fallback">
            {{ content.placeAndTeam.image.alt }}
          </p>
        </div>
      </section>

      <SharedImageTextCarousel
        class="about-moments"
        :items="content.featuredMoments.items"
        label="片段"
      >
        <template #heading>
          <p class="about-label">精選片段</p>
          <h2 id="about-moments-title">{{ content.featuredMoments.heading }}</h2>
        </template>
        <template #copy>
          <div class="about-copy">
            <p v-for="paragraph in content.featuredMoments.body" :key="paragraph.key">
              <component
                :is="segment.href ? 'a' : 'span'"
                v-for="segment in paragraphSegments(paragraph)"
                :key="segment.key"
                :href="segment.href"
              >
                <strong v-if="segment.strong">
                  <em v-if="segment.emphasis">{{ segment.text }}</em>
                  <template v-else>{{ segment.text }}</template>
                </strong>
                <em v-else-if="segment.emphasis">{{ segment.text }}</em>
                <template v-else>{{ segment.text }}</template>
              </component>
            </p>
          </div>
        </template>
        <template #empty><p>精選片段仍在整理中。</p></template>
      </SharedImageTextCarousel>

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
                <dd>
                  <a :href="content.contact.phone.href">{{
                    content.contact.phone.display
                  }}</a>
                </dd>
              </div>
              <div v-if="content.contact.email">
                <dt>Email</dt>
                <dd>
                  <a :href="`mailto:${content.contact.email}`">{{
                    content.contact.email
                  }}</a>
                </dd>
              </div>
              <div v-if="content.contact.businessHours.length">
                <dt>營業時間</dt>
                <dd>
                  <p
                    v-for="item in content.contact.businessHours"
                    :key="`${item.days}-${item.hours}`"
                  >
                    {{ item.days }}　{{ item.hours }}
                  </p>
                  <p v-if="content.contact.businessHoursNote">
                    {{ content.contact.businessHoursNote }}
                  </p>
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
                    >{{ social.label }}</a
                  >
                </dd>
              </div>
            </dl>
          </address>
          <p v-else class="about-contact__unavailable">
            聯絡資訊暫時無法顯示，請稍後再試。
          </p>
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
            >在 Google Maps 開啟</a
          >
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.about-overview {
  --about-edge: clamp(28px, 6vw, 116px);
  --about-muted: color-mix(in srgb, var(--color-muted) 60%, var(--color-ink));
  --about-label: color-mix(in srgb, var(--color-clay) 60%, var(--color-ink));
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
  font-family: var(--font-display);
  font-size: var(--type-title-xl-size);
  font-weight: var(--type-title-xl-weight);
  line-height: var(--type-title-xl-leading);
  letter-spacing: var(--type-title-xl-tracking);
  white-space: nowrap;
}

.about-overview h2 {
  max-width: 18em;
  font-family: var(--font-display);
  font-size: var(--type-title-md-size);
  font-weight: var(--type-title-md-weight);
  line-height: var(--type-title-md-leading);
  letter-spacing: var(--type-title-md-tracking);
}

.about-label {
  margin-bottom: 18px !important;
  color: var(--about-label);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}

.about-copy,
.about-lead {
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
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
  color: var(--about-muted);
  font-size: var(--type-meta-size);
  font-weight: var(--type-meta-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
}

.about-lead {
  max-width: 31em;
  margin-top: 38px !important;
  font-size: var(--type-lead-size);
  font-weight: var(--type-lead-weight);
  line-height: var(--type-lead-leading);
  letter-spacing: var(--type-lead-tracking);
}

.about-prototype-note {
  max-width: 52em;
  margin-top: 36px !important;
  color: var(--about-muted);
  font-size: var(--type-meta-size);
  font-weight: var(--type-meta-weight);
  line-height: var(--type-meta-leading);
  letter-spacing: var(--type-meta-tracking);
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
  color: var(--about-muted);
  text-align: center;
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
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
  margin-bottom: 250px;
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
  --carousel-edge: var(--about-edge);
  --carousel-muted: var(--about-muted);
}

.about-contact {
  display: grid;
  margin-top: 150px;
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
  border-bottom: 0;
}

.about-contact__list dt {
  color: var(--about-muted);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  text-transform: uppercase;
}

.about-contact__list dd,
.about-contact__list a {
  color: var(--color-ink);
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  overflow-wrap: anywhere;
}

.about-contact__list a {
  display: inline-flex;
  align-items: center;
}

.about-contact__socials {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
}

.about-contact__unavailable {
  padding: 24px 0;
  border-block: 1px solid color-mix(in srgb, var(--color-ink) 18%, transparent);
  color: var(--about-muted);
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
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
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
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
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}

.about-state button {
  min-height: 48px;
  padding: 0 24px;
  color: var(--color-paper);
  background: var(--color-oxblood);
  border: 0;
  border-radius: 0;
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
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
    --about-edge: var(--page-gutter-mobile);
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
    margin-bottom: 0px;
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

  .about-contact {
    margin-top: 50px;
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

</style>
