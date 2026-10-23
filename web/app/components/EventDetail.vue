<script setup lang="ts">
import type { EventDetailContent, EventDetailStatus } from '#shared/types/eventDetail'
import DetailBreadcrumb from './DetailBreadcrumb.vue'
import SharedTestimonials from './SharedTestimonials.vue'

withDefaults(defineProps<{
  content?: EventDetailContent
  status?: EventDetailStatus
}>(), {
  content: undefined,
  status: 'ready',
})

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="event-detail" :aria-busy="status === 'loading'">
    <DetailBreadcrumb
      class="event-detail__breadcrumb"
      :items="[
        { label: '首頁', to: '/' },
        { label: '近期活動', to: '/events' },
        { label: content?.hero.title ?? '活動內容' },
      ]"
    />

    <div v-if="status === 'loading'" class="event-detail__state" role="status">
      <span class="event-detail__skeleton event-detail__skeleton--title" />
      <span v-for="index in 4" :key="index" class="event-detail__skeleton" />
      <p>正在整理活動內容…</p>
    </div>

    <div v-else-if="status === 'error'" class="event-detail__state">
      <h1>活動內容暫時無法載入</h1>
      <p>請稍後再試一次；其他頁面仍可正常瀏覽。</p>
      <button type="button" @click="emit('retry')">重新載入</button>
    </div>

    <div v-else-if="status === 'not-found' || !content" class="event-detail__state">
      <h1>找不到這個活動</h1>
      <p>活動可能尚未公開、已下架，或網址不正確。</p>
      <NuxtLink to="/events">返回活動列表</NuxtLink>
    </div>

    <template v-else>
      <header class="event-detail__hero">
        <div class="event-detail__hero-copy">
          <h1>{{ content.hero.title }}</h1>
          <p class="event-detail__summary">{{ content.hero.summary }}</p>
        </div>
        <figure v-if="content.hero.image" class="event-detail__hero-media">
          <img
            :src="content.hero.image.src"
            :alt="content.hero.image.alt"
            :style="content.hero.image.objectPosition ? { objectPosition: content.hero.image.objectPosition } : undefined"
          >
        </figure>
      </header>

      <div class="event-detail__layout">
        <aside class="event-detail__facts" aria-label="活動資訊與報名">
          <div class="event-detail__facts-inner">
            <dl>
              <div v-for="fact in content.facts" :key="fact.label" class="event-detail__fact">
                <dt>{{ fact.label }}</dt>
                <dd>
                  <time v-if="fact.dateTime" :datetime="fact.dateTime">{{ fact.value }}</time>
                  <span v-else>{{ fact.value }}</span>
                </dd>
              </div>
            </dl>
            <div class="event-detail__action-wrap">
              <a
                v-if="content.registration.status === 'open' && content.registration.actionUrl"
                class="event-detail__action button-primary"
                :href="content.registration.actionUrl"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`${content.registration.actionLabel}（另開新視窗）`"
              >
                <span>{{ content.registration.actionLabel }}</span>
                <svg class="button-primary__icon" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </a>
              <span v-else class="event-detail__action event-detail__action--disabled">
                {{ content.registration.actionLabel }}
              </span>
              <small v-if="content.registration.note">{{ content.registration.note }}</small>
            </div>
          </div>
        </aside>

        <div class="event-detail__content">
          <section class="event-detail__section">
            <h2>活動介紹</h2>
            <p>{{ content.intro }}</p>
          </section>

          <template v-for="block in content.body" :key="block.key">
            <section v-if="block.type === 'text'" class="event-detail__section">
              <h2>{{ block.title }}</h2>
              <p v-for="paragraph in block.paragraphs" :key="paragraph">{{ paragraph }}</p>
            </section>

            <section v-else-if="block.type === 'facilitator'" class="event-detail__section">
              <h2>帶領者介紹</h2>
              <p class="event-detail__facilitator-name">
                {{ block.name }}
                <span v-if="block.role">{{ block.role }}</span>
              </p>
              <p>{{ block.biography }}</p>
            </section>

            <section v-else-if="block.type === 'agenda'" class="event-detail__section">
              <h2>{{ block.title }}</h2>
              <p>{{ block.description }}</p>
              <ol class="event-detail__agenda">
                <li v-for="item in block.items" :key="item.key">
                  <time v-if="item.dateTime" :datetime="item.dateTime">{{ item.timeLabel }}</time>
                  <span v-else class="event-detail__agenda-time">{{ item.timeLabel }}</span>
                  <div>
                    <h3>{{ item.title }}</h3>
                    <p v-if="item.description">{{ item.description }}</p>
                  </div>
                </li>
              </ol>
            </section>

            <SharedTestimonials
              v-else-if="block.type === 'testimonials'"
              :id="`event-testimonials-${block.key}`"
              :title="block.title"
              :items="block.items"
            />

            <section v-else-if="block.type === 'list'" class="event-detail__section">
              <h2>{{ block.title }}</h2>
              <ul class="event-detail__list">
                <li v-for="item in block.items" :key="item">{{ item }}</li>
              </ul>
            </section>

            <blockquote v-else-if="block.type === 'quote'" class="event-detail__quote">
              <p>{{ block.text }}</p>
              <cite v-if="block.attribution">{{ block.attribution }}</cite>
            </blockquote>

            <section v-else-if="block.type === 'media'" class="event-detail__section">
              <h2 v-if="block.title">{{ block.title }}</h2>
              <div class="event-detail__media" :class="{ 'event-detail__media--pair': block.items.length === 2 }">
                <figure v-for="item in block.items" :key="item.key">
                  <img
                    :src="item.image.src"
                    :alt="item.image.alt"
                    :style="item.image.objectPosition ? { objectPosition: item.image.objectPosition } : undefined"
                  >
                  <figcaption v-if="item.caption">{{ item.caption }}</figcaption>
                </figure>
              </div>
            </section>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.event-detail {
  min-height: 70vh;
  color: var(--color-ink);
  background: var(--color-paper);
}

.event-detail__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 30%);
  align-items: center;
  gap: clamp(48px, 7vw, 110px);
  width: min(100%, var(--detail-hero-max-width));
  min-height: 560px;
  padding: var(--detail-hero-padding-block-start)
    var(--detail-hero-padding-inline)
    var(--detail-hero-padding-block-end);
  margin: 0 auto;
}

.event-detail__hero:not(:has(.event-detail__hero-media)) {
  grid-template-columns: 1fr;
}

.event-detail__hero-copy { min-width: 0; }
.event-detail__hero h1 { max-width: 11em; margin: 0; font-family: var(--font-display); font-size: var(--detail-hero-title-size); font-weight: 400; line-height: 1.22; letter-spacing: 0.025em; text-wrap: balance; }
.event-detail__summary { max-width: 42em; margin: 30px 0 0; color: #625a51; font-size: var(--detail-summary-size); line-height: 2; letter-spacing: 0.035em; white-space: pre-line; }
.event-detail__hero-media { margin: 0; }
.event-detail__hero-media img { display: block; width: 100%; height: auto; object-fit: cover; }

.event-detail__layout { display: grid; grid-template-columns: var(--split-layout-rail-width) minmax(0, 1fr); width: min(100%, var(--detail-layout-max-width)); margin: 0 auto; }
.event-detail__facts { background: var(--color-sand); }
.event-detail__facts-inner { position: sticky; top: 87px; }
.event-detail__facts dl { margin: 0; }
.event-detail__fact { padding: var(--detail-rail-row-padding); border-bottom: 1px solid rgb(56 52 46 / 24%); }
.event-detail__fact dt { margin-bottom: 8px; color: #745142; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; }
.event-detail__fact dd { margin: 0; font-family: var(--font-display); font-size: 20px; line-height: 1.55; }
.event-detail__action-wrap { padding: var(--detail-rail-action-padding); }
.event-detail__action { color: var(--color-warm-white); font-weight: 700; }
.event-detail__action .button-primary__icon { fill: none; stroke: currentcolor; stroke-width: 1.5; transition: transform var(--button-primary-transition); }
.event-detail__action:is(:hover, :focus-visible) .button-primary__icon { transform: translateX(4px); }
.event-detail__action--disabled { display: flex; min-height: 76px; align-items: center; padding: 0 28px; color: var(--color-warm-white); background: var(--color-bark); cursor: not-allowed; }
.event-detail__action-wrap small { display: block; margin-top: 12px; color: #745142; font-size: 14px; line-height: 1.7; }

.event-detail__content { min-width: 0; }
.event-detail__section { padding: var(--detail-content-padding-block) var(--detail-content-padding-inline); border-bottom: 1px solid rgb(56 52 46 / 24%); }
.event-detail__section h2 { max-width: 14em; margin: 0 0 22px; font-family: var(--font-display); font-size: var(--detail-section-title-size); font-weight: 400; line-height: 1.4; letter-spacing: 0.02em; }
.event-detail__section > p { max-width: 68ch; margin: 0; color: #625a51; font-size: var(--detail-body-size); line-height: 2.1; letter-spacing: 0.025em; white-space: pre-line; }
.event-detail__section > p + p { margin-top: 18px; }
.event-detail__facilitator-name { color: var(--color-ink) !important; font-family: var(--font-display); font-size: 24px !important; line-height: 1.6 !important; }
.event-detail__facilitator-name span { display: block; margin-top: 7px; color: #745142; font-family: var(--font-sans); font-size: 14px; font-weight: 700; letter-spacing: 0.08em; }

.event-detail__agenda { padding: 0; margin: 38px 0 0; list-style: none; }
.event-detail__agenda li { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 30px; padding: 28px 0; border-bottom: 1px solid rgb(56 52 46 / 24%); }
.event-detail__agenda time, .event-detail__agenda-time { color: #745142; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; }
.event-detail__agenda h3 { margin: 0 0 8px; font-family: var(--font-display); font-size: 22px; font-weight: 400; line-height: 1.5; }
.event-detail__agenda p { margin: 0; color: #625a51; font-size: 16px; line-height: 1.9; }
.event-detail__list { max-width: 68ch; padding-left: 1.2em; margin: 0; color: #625a51; font-size: 16px; line-height: 2.1; }
.event-detail__quote { padding: 72px clamp(48px, 7vw, 104px); margin: 0; border-bottom: 1px solid rgb(56 52 46 / 24%); }
.event-detail__quote p { max-width: 28em; margin: 0; font-family: var(--font-display); font-size: 28px; line-height: 1.7; }
.event-detail__quote cite { display: block; margin-top: 20px; color: #745142; font-size: 14px; font-style: normal; }
.event-detail__media { display: grid; gap: 20px; }
.event-detail__media--pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.event-detail__media figure { margin: 0; }
.event-detail__media img { display: block; width: 100%; max-height: 640px; object-fit: cover; }
.event-detail__media figcaption { margin-top: 10px; color: #745142; font-size: 14px; line-height: 1.7; }

.event-detail__state { display: grid; min-height: 64vh; place-content: center; justify-items: start; gap: 18px; padding: 80px 24px; }
.event-detail__state h1 { margin: 0; font-family: var(--font-display); font-size: 42px; font-weight: 400; }
.event-detail__state p { max-width: 42em; margin: 0; color: #625a51; line-height: 2; }
.event-detail__state a, .event-detail__state button { display: inline-flex; min-height: 48px; align-items: center; padding: 0 20px; color: var(--color-warm-white); background: var(--color-bark); border: 0; text-decoration: none; }
.event-detail__skeleton { width: min(68vw, 620px); height: 18px; background: var(--color-sand); animation: event-detail-pulse 1.4s ease-in-out infinite alternate; }
.event-detail__skeleton--title { width: min(48vw, 420px); height: 54px; }
@keyframes event-detail-pulse { to { opacity: 0.42; } }

@media (max-width: 1023px) {
  .event-detail__hero { grid-template-columns: 1fr; min-height: auto; }
  .event-detail__layout { display: block; }
  .event-detail__facts { border-bottom: 1px solid rgb(56 52 46 / 24%); }
  .event-detail__facts-inner { position: static; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .event-detail__fact:nth-child(odd) { border-right: 1px solid rgb(56 52 46 / 24%); }
  .event-detail__action-wrap { grid-column: 1 / -1; }
  .event-detail__section { padding: var(--detail-content-padding-block) var(--detail-content-padding-inline); }
  .event-detail__quote { padding: 64px 24px; }
  .event-detail__agenda li { grid-template-columns: 88px minmax(0, 1fr); gap: 20px; }
}

@media (max-width: 560px) {
  .event-detail__media--pair { grid-template-columns: 1fr; }
  .event-detail__facts-inner { grid-template-columns: 1fr; }
  .event-detail__fact:nth-child(odd) { border-right: 0; }
  .event-detail__action-wrap { grid-column: auto; }
  .event-detail__fact dd { font-size: 16px; }
  .event-detail__agenda li { grid-template-columns: 1fr; gap: 8px; }
}

@media (prefers-reduced-motion: reduce) {
  .event-detail__skeleton { animation: none; }
  .event-detail__action .button-primary__icon { transition: none; }
}
</style>

