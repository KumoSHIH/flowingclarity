<script setup lang="ts">
import ArticleRichTextContent from "./ArticleRichTextContent.vue";
import DetailBreadcrumb from "./DetailBreadcrumb.vue";
import SharedRelatedArticles from "./SharedRelatedArticles.vue";
import type {
  ArticleDetailContent,
  ArticleDetailStatus,
} from "#shared/types/articleDetail";

const props = withDefaults(
  defineProps<{
    content?: ArticleDetailContent;
    status?: ArticleDetailStatus;
  }>(),
  {
    content: undefined,
    status: "ready",
  },
);

const emit = defineEmits<{ retry: [] }>();

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replaceAll("/", ".");
}
</script>

<template>
  <article class="article-detail" :aria-busy="status === 'loading'">
    <DetailBreadcrumb
      class="article-breadcrumb"
      :items="[
        { label: '首頁', to: '/' },
        { label: '文章分享', to: '/articles' },
        { label: content?.title ?? '文章內容' },
      ]"
    />

    <div v-if="status === 'loading'" class="article-state" role="status">
      <div aria-hidden="true" class="article-state__skeletons">
        <span class="article-state__skeleton article-state__skeleton--title" />
        <span v-for="index in 4" :key="index" class="article-state__skeleton" />
      </div>
      <p>正在整理文章內容…</p>
    </div>

    <div v-else-if="status === 'error'" class="article-state" role="alert">
      <h1 class="type-title-md">文章內容暫時無法載入</h1>
      <p class="type-body">請稍後再試一次；文章總覽仍可正常瀏覽。</p>
      <div class="article-state__actions">
        <button type="button" @click="emit('retry')">重新載入</button>
        <NuxtLink to="/articles">返回文章分享</NuxtLink>
      </div>
    </div>

    <div v-else-if="status === 'not-found' || !content" class="article-state">
      <h1 class="type-title-md">找不到這篇文章</h1>
      <p class="type-body">文章可能尚未公開、已下架，或網址不正確。</p>
      <NuxtLink to="/articles">返回文章分享</NuxtLink>
    </div>

    <template v-else>
      <header class="article-hero">
        <aside class="article-meta" aria-label="文章資訊">
          <strong class="type-title-sm">{{ content.category.name }}</strong>
          <ul aria-label="文章標籤">
            <li v-for="tag in content.tags" :key="tag.slug" class="type-meta">{{ tag.name }}</li>
          </ul>
          <time class="type-label" :datetime="content.publishedAt">{{
            formatDate(content.publishedAt)
          }}</time>
        </aside>

        <div
          class="article-hero__panel"
          :class="[
            `article-hero__panel--${content.heroStyle}`,
            { 'article-hero__panel--without-cover': !content.coverImage },
          ]"
        >
          <figure v-if="content.coverImage" class="article-hero__media">
            <img
              :src="content.coverImage.src"
              :alt="content.coverImage.alt"
              :width="content.coverImage.width"
              :height="content.coverImage.height"
              decoding="async"
              fetchpriority="high"
              :style="
                content.coverImage.objectPosition
                  ? { objectPosition: content.coverImage.objectPosition }
                  : undefined
              "
            />
          </figure>
          <div class="article-hero__copy">
            <h1 class="type-title-xl">{{ content.title }}</h1>
            <p class="type-lead">{{ content.excerpt }}</p>
          </div>
        </div>
      </header>

      <div class="article-body">
        <template v-for="section in content.body" :key="section.key">
          <section
            v-if="section.type === 'richTextSection'"
            class="article-section article-section--text"
          >
            <h2 v-if="section.heading" class="type-title-md">{{ section.heading }}</h2>
            <ArticleRichTextContent :content="section.content" />
          </section>

          <section
            v-else-if="section.type === 'splitMediaSection'"
            class="article-section article-section--split"
            :class="`article-section--media-${section.mediaSide}`"
          >
            <figure>
              <img
                :src="section.image.src"
                :alt="section.image.alt"
                :width="section.image.width"
                :height="section.image.height"
                decoding="async"
                loading="lazy"
                :style="
                  section.image.objectPosition
                    ? { objectPosition: section.image.objectPosition }
                    : undefined
                "
              />
            </figure>
            <div>
              <h2 v-if="section.heading" class="type-title-md">{{ section.heading }}</h2>
              <ArticleRichTextContent :content="section.content" />
            </div>
          </section>

          <figure v-else class="article-wide-image">
            <img
              :src="section.image.src"
              :alt="section.image.alt"
              :width="section.image.width"
              :height="section.image.height"
              decoding="async"
              loading="lazy"
              :style="
                section.image.objectPosition
                  ? { objectPosition: section.image.objectPosition }
                  : undefined
              "
            />
            <figcaption v-if="section.caption" class="type-meta">
              {{ section.caption }}
            </figcaption>
          </figure>
        </template>
      </div>

      <SharedRelatedArticles
        :key="content.id"
        :items="content.relatedArticles"
        id-base="article-related"
      />

      <aside v-if="content.prototypeNotice" class="article-prototype-notice type-meta">
        {{ content.prototypeNotice }}
      </aside>
    </template>
  </article>
</template>

<style scoped>
.article-detail {
  --article-edge: clamp(28px, 6vw, 116px);
  --article-section-gap: 96px;
  min-height: 70vh;
  overflow: clip;
  color: var(--color-ink);
  background: var(--color-paper);
}
.article-hero {
  display: grid;
  grid-template-columns: minmax(230px, 24%) minmax(0, 1fr);
  gap: clamp(36px, 5vw, 84px);
  padding: 0 var(--article-edge) 58px;
}
.article-meta {
  display: flex;
  min-height: 510px;
  flex-direction: column;
  padding: 42px 34px;
  background: var(--color-sand);
}
.article-meta ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 36px 0 0;
  list-style: none;
}
.article-meta li {
  padding: 7px 10px;
  border: 1px solid rgb(56 52 46 / 24%);
  color: #745142;
}
.article-meta time {
  margin-top: auto;
}
.article-hero__panel {
  position: relative;
  min-width: 0;
  min-height: 510px;
}
.article-hero__media {
  min-width: 0;
  margin: 0;
}
.article-hero__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.article-hero__copy h1 {
  margin: 0;
  text-wrap: balance;
}
.article-hero__copy p {
  max-width: 48em;
  margin: 28px 0 0;
}
.article-hero__panel--overlay {
  display: grid;
  align-items: end;
  overflow: hidden;
}
.article-hero__panel--overlay::after {
  position: absolute;
  inset: 0;
  background: rgb(20 13 9 / 48%);
  content: "";
}
.article-hero__panel--overlay .article-hero__media {
  position: absolute;
  inset: 0;
}
.article-hero__panel--overlay .article-hero__copy {
  position: relative;
  z-index: 1;
  width: min(760px, 78%);
  padding: clamp(42px, 6vw, 88px);
  color: var(--color-warm-white);
}
.article-hero__panel--overlay .article-hero__copy p {
  color: rgb(247 246 244 / 88%);
}
.article-hero__panel--split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 38%);
  align-items: center;
  gap: clamp(36px, 5vw, 74px);
}
.article-hero__panel--split .article-hero__media {
  height: 510px;
  order: 2;
}
.article-hero__panel--split .article-hero__copy {
  padding-block: 42px;
}
.article-hero__panel--without-cover {
  grid-template-columns: 1fr;
}
.article-hero__panel--without-cover .article-hero__copy {
  max-width: 880px;
}
.article-body {
  display: grid;
  gap: var(--article-section-gap);
  padding: 0 var(--article-edge) 94px;
}
.article-section {
  min-width: 0;
}
.article-section h2 {
  max-width: 18em;
  margin: 0 0 26px;
}
.article-section h3 {
  margin: 34px 0 12px;
  font-family: var(--font-display);
  font-size: var(--type-title-sm-size);
  font-weight: var(--type-title-sm-weight);
  line-height: var(--type-title-sm-leading);
  letter-spacing: var(--type-title-sm-tracking);
}
.article-section p,
.article-section li {
  color: #625a51;
}
.article-section p {
  margin: 0;
}
.article-section p + p {
  margin-top: 0;
}
.article-section ul,
.article-section ol {
  padding-left: 1.3em;
  margin: 24px 0 0;
}
.article-section--text {
  max-width: 900px;
  margin: 0 auto;
}
.article-section--split {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
  align-items: center;
  gap: clamp(48px, 7vw, 110px);
}
.article-section--split figure {
  width: calc(100% + var(--article-edge));
  height: 500px;
  margin: 0 0 0 calc(0px - var(--article-edge));
}
.article-section--split figure img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.article-section--media-end figure {
  grid-column: 2;
  width: calc(100% + var(--article-edge));
  margin: 0 calc(0px - var(--article-edge)) 0 0;
}
.article-section--media-end > div {
  grid-column: 1;
  grid-row: 1;
}
.article-wide-image {
  margin: 0 calc(0px - var(--article-edge));
}
.article-wide-image img {
  display: block;
  width: 100%;
  max-height: 720px;
  object-fit: cover;
}
.article-wide-image figcaption {
  padding: 12px var(--article-edge) 0;
  color: #745142;
}
.article-prototype-notice {
  padding: 24px var(--article-edge);
  color: var(--color-warm-white);
  background: var(--color-bark);
}
.article-state {
  display: grid;
  min-height: 64vh;
  place-content: center;
  justify-items: start;
  gap: 18px;
  padding: 80px var(--article-edge);
}
.article-state h1 {
  margin: 0;
}
.article-state p {
  max-width: 42em;
  margin: 0;
  color: #625a51;
}
.article-state__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.article-state :is(button, a) {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  padding: 0 22px;
  border: 1px solid var(--color-ink);
  color: inherit;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
}
.article-state__skeleton {
  display: block;
  width: min(620px, 75vw);
  height: 12px;
  background: color-mix(in srgb, var(--color-bark) 30%, transparent);
  animation: article-pulse 1.6s ease-in-out infinite;
}
.article-state__skeletons {
  display: grid;
  gap: 18px;
}
.article-state__skeleton--title {
  width: min(460px, 65vw);
  height: 48px;
}
@keyframes article-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 1023px) {
  .article-detail {
    --article-edge: var(--page-gutter-mobile);
    --article-section-gap: 64px;
  }
  .article-hero {
    grid-template-columns: 1fr;
    gap: 18px;
    padding-bottom: 48px;
  }
  .article-meta {
    display: grid;
    min-height: 112px;
    grid-template-columns: 1fr auto;
    align-items: start;
    padding: 18px 20px;
  }
  .article-meta ul {
    justify-content: end;
    margin: 0;
  }
  .article-meta time {
    grid-column: 2;
    margin-top: 10px;
    text-align: right;
  }
  .article-hero__panel {
    min-height: 0;
  }
  .article-hero__panel--overlay {
    min-height: 520px;
  }
  .article-hero__panel--overlay .article-hero__copy {
    width: 100%;
    padding: 36px var(--article-edge);
  }
  .article-hero__panel--split {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .article-hero__panel--split .article-hero__media {
    grid-row: 2;
    width: calc(100% + var(--article-edge) + var(--article-edge));
    height: 360px;
    margin-left: calc(0px - var(--article-edge));
    order: initial;
  }
  .article-hero__panel--split .article-hero__copy {
    grid-row: 1;
    padding: 28px 0 0;
  }
  .article-body {
    padding-bottom: 72px;
  }
  .article-section--text {
    width: min(100%, 68ch);
    margin-left: 0;
  }
  .article-section--split {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .article-section--split figure,
  .article-section--media-end figure {
    grid-column: 1;
    grid-row: 1;
    width: calc(100% + var(--article-edge));
    height: 320px;
    margin: 0 0 0 calc(0px - var(--article-edge));
  }
  .article-section--media-end figure {
    margin: 0 calc(0px - var(--article-edge)) 0 0;
    justify-self: end;
  }
  .article-section--split > div,
  .article-section--media-end > div {
    grid-column: 1;
    grid-row: 2;
  }
  .article-wide-image {
    margin-inline: -24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-state__skeleton {
    animation: none;
  }
}
</style>
