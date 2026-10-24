<script setup lang="ts">
import { computed } from "vue";
import DetailBreadcrumb from "./DetailBreadcrumb.vue";
import type {
  SessionDetailContent,
  SessionDetailStatus,
  SessionServiceLocation,
} from "#shared/types/sessionDetail";

const props = withDefaults(
  defineProps<{
    content?: SessionDetailContent;
    status?: SessionDetailStatus;
  }>(),
  {
    content: undefined,
    status: "ready",
  },
);

const emit = defineEmits<{ retry: [] }>();

const publicCities = computed(() => {
  if (!props.content) return "";
  const cities = props.content.serviceLocations.flatMap(
    (location) => location.cities,
  );
  return [...new Set(cities.length ? cities : props.content.regions)].join(
    "・",
  );
});

function locationDetail(location: SessionServiceLocation): string | undefined {
  if (location.publicDetail === "fullAddress")
    return location.address ?? location.venueName;
  if (location.publicDetail === "venue") return location.venueName;
  return undefined;
}

function opensNewTab(href?: string): boolean {
  return Boolean(href?.startsWith("https://"));
}
</script>

<template>
  <div class="session-detail" :aria-busy="status === 'loading'">
    <DetailBreadcrumb
      class="session-detail__breadcrumb"
      :items="[
        { label: '首頁', to: '/' },
        { label: '個案諮詢', to: '/session' },
        { label: content?.name ?? '執行師資料' },
      ]"
    />

    <div
      v-if="status === 'loading'"
      class="session-detail__state"
      role="status"
    >
      <span class="session-detail__skeleton session-detail__skeleton--title" />
      <span v-for="index in 4" :key="index" class="session-detail__skeleton" />
      <p>正在整理執行師資料…</p>
    </div>

    <div
      v-else-if="status === 'error'"
      class="session-detail__state"
      role="alert"
    >
      <h1 class="type-title-md">執行師資料暫時無法載入</h1>
      <p class="type-body">請稍後再試一次，或先返回執行師名錄。</p>
      <button type="button" @click="emit('retry')">重新載入</button>
    </div>

    <div
      v-else-if="status === 'not-found' || !content"
      class="session-detail__state"
    >
      <h1 class="type-title-md">找不到這位執行師</h1>
      <p class="type-body">資料可能尚未公開、已下架，或網址不正確。</p>
      <NuxtLink to="/session">返回執行師名錄</NuxtLink>
    </div>

    <template v-else>
      <header
        class="session-detail__hero"
        :class="{ 'session-detail__hero--without-portrait': !content.portrait }"
      >
        <div class="session-detail__hero-copy">
          <div>
            <h1 class="type-title-xl">{{ content.name }}</h1>
            <p v-if="content.englishName" class="session-detail__english-name type-label">
              {{ content.englishName }}
            </p>
            <div class="session-detail__summary-grid">
              <p class="session-detail__summary type-lead">{{ content.summary }}</p>
              <div>
                <span class="session-detail__label type-label">服務地區</span>
                <p class="session-detail__value type-title-sm">{{ publicCities }}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="content.portrait"
          class="session-detail__portrait-stage"
          :class="`session-detail__portrait-stage--${content.portrait.displayMode}`"
        >
          <figure class="session-detail__portrait">
            <img
              :src="content.portrait.src"
              :alt="content.portrait.alt"
              :style="
                content.portrait.objectPosition
                  ? { objectPosition: content.portrait.objectPosition }
                  : undefined
              "
            />
          </figure>
        </div>
      </header>

      <div class="session-detail__layout">
        <aside class="session-detail__rail" aria-label="服務與聯繫資訊">
          <div class="session-detail__rail-inner">
            <dl class="session-detail__facts">
              <div class="session-detail__fact">
                <dt class="type-label">服務項目</dt>
                <dd>
                  <ul class="session-detail__methods type-body">
                    <li v-for="method in content.methods" :key="method">
                      {{ method }}
                    </li>
                  </ul>
                </dd>
              </div>
              <div class="session-detail__fact">
                <dt class="type-label">服務地區</dt>
                <dd>
                  <ul class="session-detail__locations">
                    <li
                      v-for="location in content.serviceLocations"
                      :key="location.key"
                    >
                      <strong class="type-title-sm">{{ location.cities.join("、") }}</strong>
                      <span v-if="locationDetail(location)">{{
                        locationDetail(location)
                      }}</span>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>

            <section
              class="session-detail__contact"
              aria-labelledby="session-contact-title"
            >
              <h2 id="session-contact-title" class="type-label">聯繫方式</h2>
              <p v-if="content.contactIntro">{{ content.contactIntro }}</p>
              <ul>
                <li v-for="item in content.contactItems" :key="item.key">
                  <a
                    v-if="item.href"
                    :href="item.href"
                    :target="opensNewTab(item.href) ? '_blank' : undefined"
                    :rel="
                      opensNewTab(item.href) ? 'noopener noreferrer' : undefined
                    "
                  >
                    <span
                      >{{ item.label
                      }}<small>{{ item.displayText }}</small></span
                    >
                    <span aria-hidden="true" />
                  </a>
                  <span v-else class="session-detail__contact-text">
                    <span
                      >{{ item.label
                      }}<small>{{ item.displayText }}</small></span
                    >
                  </span>
                </li>
              </ul>
              <a
                v-if="content.bookingAction"
                class="session-detail__booking button-primary"
                :href="content.bookingAction.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{{ content.bookingAction.label }}</span>
                <svg class="button-primary__icon" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </a>
            </section>
          </div>
        </aside>

        <div class="session-detail__content">
          <section
            class="profile-section"
            aria-labelledby="session-about-title"
          >
            <h2 id="session-about-title" class="type-title-md">關於執行師</h2>
            <p v-for="paragraph in content.bio" :key="paragraph" class="type-body">
              {{ paragraph }}
            </p>
          </section>

          <section
            v-if="content.experienceItems.length"
            class="profile-section"
            aria-labelledby="session-experience-title"
          >
            <h2 id="session-experience-title" class="type-title-md">經歷</h2>
            <ul class="session-detail__experience">
              <li v-for="item in content.experienceItems" :key="item">
                {{ item }}
              </li>
            </ul>
          </section>

          <p v-if="content.prototypeNotice" class="session-detail__notice type-meta">
            {{ content.prototypeNotice }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.session-detail {
  min-height: 70vh;
  color: var(--color-ink);
  background: var(--color-paper);
}
.session-detail__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 30%);
  align-items: center;
  gap: clamp(48px, 7vw, 110px);
  width: min(100%, var(--detail-hero-max-width));
  min-height: 560px;
  padding-block: var(--detail-hero-padding-block-start)
    var(--detail-hero-padding-block-end);
  padding-inline: 0;
  margin: 0 auto;
}
.session-detail__hero--without-portrait {
  grid-template-columns: 1fr;
}
.session-detail__hero-copy {
  min-width: 0;
}
.session-detail__hero-copy > div {
  padding-top: 0;
}
.session-detail h1 {
  max-width: 11em;
  margin: 0;
  text-wrap: balance;
}
.session-detail__english-name {
  margin: 14px 0 0;
  color: #745142;
  letter-spacing: 0.14em;
}
.session-detail__summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(210px, 0.45fr);
  gap: 54px;
  align-items: end;
  margin-top: 58px;
  padding-top: 28px;
  border-top: 1px solid var(--color-ink);
}
.session-detail__summary {
  max-width: 42em;
  margin: 0;
  color: #625a51;
}
.session-detail__label {
  display: block;
  margin-bottom: 8px;
  color: #745142;
}
.session-detail__value {
  margin: 0;
}
.session-detail__portrait-stage {
  display: grid;
  min-width: 0;
  min-height: 440px;
  place-items: center;
  padding: 50px;
  background: var(--color-sand);
}
.session-detail__portrait {
  width: 260px;
  margin: 0;
  overflow: hidden;
  background: var(--color-paper);
}
.session-detail__portrait img {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  margin: 0 auto;
  object-fit: cover;
  filter: saturate(0.55) sepia(0.12);
}
.session-detail__portrait-stage--cover {
  padding: 0;
  place-items: stretch;
}
.session-detail__portrait-stage--cover .session-detail__portrait {
  position: relative;
  width: 100%;
  height: 100%;
}
.session-detail__portrait-stage--cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  max-width: none;
  height: 100%;
  aspect-ratio: auto;
  object-fit: cover;
}

.session-detail__layout {
  display: grid;
  grid-template-columns: var(--split-layout-rail-width) minmax(0, 1fr);
  padding-inline-start: max(
    0px,
    calc((100% - var(--detail-layout-max-width)) / 2)
  );
}
.session-detail__rail {
  background: var(--color-sand);
}
.session-detail__rail-inner {
  position: sticky;
  top: 87px;
}
.session-detail__facts {
  margin: 0;
}
.session-detail__fact {
  padding: var(--detail-rail-row-padding);
  border-bottom: 1px solid rgb(56 52 46 / 24%);
}
.session-detail__fact dt,
.session-detail__contact h2 {
  margin: 0 0 8px;
  color: #745142;
}
.session-detail__fact dd {
  margin: 0;
}
.session-detail__locations,
.session-detail__methods,
.session-detail__contact ul,
.session-detail__experience {
  padding: 0;
  margin: 0;
  list-style: none;
}
.session-detail__locations {
  display: grid;
  gap: 16px;
}
.session-detail__locations strong {
  display: block;
}
.session-detail__locations span {
  display: block;
  margin-top: 4px;
  color: #625a51;
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.session-detail__methods li {
  position: relative;
  padding: 5px 0 5px 16px;
  line-height: 1.8;
}
.session-detail__methods li::before {
  position: absolute;
  top: 0.85em;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-saffron);
  content: "";
}
.session-detail__contact {
  padding: var(--detail-rail-row-padding);
}
.session-detail__contact > p {
  margin: 0 0 18px;
  color: #625a51;
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.session-detail__contact a:not(.session-detail__booking),
.session-detail__contact-text {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 0;
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
  text-decoration: none;
}
.session-detail__contact a:not(.session-detail__booking) > span:last-child {
  width: 18px;
  height: 1px;
  background: currentcolor;
}
.session-detail__contact small {
  display: block;
  color: #745142;
  font-size: var(--type-label-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-label-leading);
  letter-spacing: var(--type-label-tracking);
}
.session-detail__booking {
  margin-top: 28px;
}

.session-detail__content {
  min-width: 0;
  padding: var(--detail-content-padding-block)
    var(--detail-content-padding-inline);
}
.profile-section {
  max-width: none;
}
.profile-section + .profile-section {
  margin-top: 76px;
}
.profile-section h2 {
  max-width: 14em;
  margin: 0 0 22px;
}
.profile-section > p {
  max-width: 68ch;
  margin: 0;
  color: #625a51;
  white-space: pre-line;
}
.profile-section > p + p {
  margin-top: 18px;
}
.session-detail__experience {
  max-width: 68ch;
  border-top: 1px solid var(--color-ink);
}
.session-detail__experience li {
  padding: 22px 0;
  border-bottom: 1px solid rgb(56 52 46 / 24%);
  font-family: var(--font-display);
  font-size: var(--type-body-size);
  font-weight: var(--type-body-weight);
  line-height: var(--type-body-leading);
  letter-spacing: var(--type-body-tracking);
}
.session-detail__notice {
  max-width: 68ch;
  margin: 64px 0 0;
  padding-top: 18px;
  border-top: 1px solid rgb(56 52 46 / 24%);
  color: #745142;
}

.session-detail__state {
  display: grid;
  min-height: 64vh;
  place-content: center;
  justify-items: start;
  gap: 18px;
  padding: 80px var(--page-gutter-mobile);
}
.session-detail__state h1 {
  margin: 0;
}
.session-detail__state p {
  max-width: 42em;
  margin: 0;
  color: #625a51;
}
.session-detail__state a,
.session-detail__state button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  padding: 0 20px;
  border: 0;
  color: var(--color-warm-white);
  background: var(--color-bark);
  text-decoration: none;
  cursor: pointer;
}
.session-detail__skeleton {
  width: min(68vw, 620px);
  height: 18px;
  background: var(--color-sand);
  animation: session-detail-pulse 1.4s ease-in-out infinite alternate;
}
.session-detail__skeleton--title {
  width: min(48vw, 420px);
  height: 54px;
}
@keyframes session-detail-pulse {
  to {
    opacity: 0.42;
  }
}

@media (max-width: 1023px) {
  .session-detail__hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-inline: var(--detail-hero-padding-inline);
  }
  .session-detail__hero-copy {
    min-height: 0;
  }
  .session-detail__summary-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 38px;
  }
  .session-detail__portrait-stage {
    min-height: 340px;
    padding: 48px var(--page-gutter-mobile);
  }
  .session-detail__portrait {
    width: min(220px, 70vw);
  }
  .session-detail__portrait-stage--cover {
    min-height: 0;
    padding: 0;
  }
  .session-detail__portrait-stage--cover .session-detail__portrait {
    height: auto;
    min-height: 0;
    aspect-ratio: 4 / 3;
  }
  .session-detail__layout {
    display: block;
    padding-inline-start: 0;
  }
  .session-detail__rail {
    border-bottom: 1px solid rgb(56 52 46 / 24%);
  }
  .session-detail__rail-inner {
    position: static;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .session-detail__facts {
    display: contents;
  }
  .session-detail__fact:nth-child(odd) {
    border-right: 1px solid rgb(56 52 46 / 24%);
  }
  .session-detail__contact {
    grid-column: 1 / -1;
  }
  .session-detail__content {
    padding: var(--detail-content-padding-block)
      var(--detail-content-padding-inline);
  }
  .profile-section + .profile-section {
    margin-top: 64px;
  }
}

@media (max-width: 560px) {
  .session-detail__portrait-stage--cover .session-detail__portrait {
    aspect-ratio: 4 / 5;
  }
  .session-detail__rail-inner {
    grid-template-columns: 1fr;
  }
  .session-detail__fact:nth-child(odd) {
    border-right: 0;
  }
  .session-detail__contact {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .session-detail__skeleton {
    animation: none;
  }
}
</style>
