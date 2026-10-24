<script setup lang="ts">
import type {
  ArticleRichContentItem,
  ArticleRichTextLine,
} from "#shared/types/articleDetail";

defineProps<{ content: ArticleRichContentItem[] }>();

function itemTag(item: ArticleRichContentItem) {
  if (item.type !== "heading") return undefined;
  return item.level === 2 ? "h2" : "h3";
}

function segments(line: ArticleRichTextLine) {
  return line.segments?.length
    ? line.segments
    : [{ key: `${line.key}-text`, text: line.text }];
}
</script>

<template>
  <template v-for="item in content" :key="item.key">
    <p
      v-if="item.type === 'paragraph' && !item.text"
      class="article-rich-text__paragraph article-rich-text__spacer"
      aria-hidden="true"
    />
    <component
      :is="item.type === 'paragraph' ? 'p' : itemTag(item)"
      v-else-if="item.type !== 'list'"
      :class="[
        item.type === 'paragraph'
          ? 'article-rich-text__paragraph type-body'
          : 'article-rich-text__heading',
        item.type === 'heading'
          ? item.level === 2
            ? 'type-title-md'
            : 'type-title-sm'
          : undefined,
      ]"
    >
      <component
        :is="segment.href ? 'a' : 'span'"
        v-for="segment in segments(item)"
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
    </component>
    <component
      :is="item.style === 'number' ? 'ol' : 'ul'"
      v-else
      class="article-rich-text__list"
    >
      <li
        v-for="entry in item.items"
        :key="entry.key"
        class="article-rich-text__list-item type-body"
      >
        <component
          :is="segment.href ? 'a' : 'span'"
          v-for="segment in segments(entry)"
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
      </li>
    </component>
  </template>
</template>

<style scoped>
.article-rich-text__paragraph,
.article-rich-text__list-item {
  color: #625a51;
}

.article-rich-text__paragraph {
  margin: 0;
}

.article-rich-text__spacer {
  min-height: calc(var(--type-body-size) * var(--type-body-leading));
}
</style>
