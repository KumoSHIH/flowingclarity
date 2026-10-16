<script setup lang="ts">
import { computed } from "vue";
import { useSiteSettings } from "../../composables/useSiteSettings";
import { getArticleDetailFixture } from "../../fixtures/articleDetail";
import type { ArticleDetailStatus } from "#shared/types/articleDetail";

const route = useRoute();
const { settings } = useSiteSettings();
const slug = computed(() => {
  const value = route.params.slug;
  return Array.isArray(value) ? (value[0] ?? "") : String(value ?? "");
});
const content = computed(() => getArticleDetailFixture(slug.value));
const status = computed<ArticleDetailStatus>(() =>
  content.value ? "ready" : "not-found",
);

if (import.meta.server && status.value === "not-found") setResponseStatus(404);

useHead(() => ({
  title:
    content.value?.seo?.title ??
    (content.value
      ? `${content.value.title}｜Flowing Clarity`
      : "找不到文章｜Flowing Clarity"),
  meta: content.value
    ? [
        {
          name: "description",
          content: content.value.seo?.description ?? content.value.excerpt,
        },
        {
          property: "og:title",
          content: content.value.seo?.title ?? content.value.title,
        },
        {
          property: "og:description",
          content: content.value.seo?.description ?? content.value.excerpt,
        },
        ...((content.value.seo?.shareImage ?? content.value.coverImage)
          ? [
              {
                property: "og:image",
                content: (content.value.seo?.shareImage ??
                  content.value.coverImage)!.src,
              },
            ]
          : []),
      ]
    : [{ name: "robots", content: "noindex" }],
  link: content.value
    ? [{ rel: "canonical", href: `/articles/${content.value.slug}` }]
    : [],
}));
</script>

<template>
  <div
    class="article-detail-page mx-auto min-h-screen max-w-[1920px] overflow-clip font-sans"
  >
    <SiteHeader always-visible :settings="settings" current-path="/articles" />
    <main><ArticleDetail :content="content" :status="status" /></main>
    <SiteFooter
      v-if="settings"
      :content="settings"
      :current-path="route.path"
    />
    <SiteFooterUnavailable v-else />
  </div>
</template>

<style scoped>
.article-detail-page {
  --home-header-height: 87px;
  padding-top: var(--home-header-height);
  color: var(--color-ink);
  background: var(--color-paper);
}
.article-detail-page ::selection {
  color: var(--color-oxblood);
  background: var(--color-saffron);
}
.article-detail-page :focus-visible {
  outline: var(--control-focus-width) solid var(--color-clay);
  outline-offset: var(--control-focus-offset);
}
</style>
