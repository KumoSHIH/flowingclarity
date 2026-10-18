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
    <component
      :is="item.type === 'paragraph' ? 'p' : itemTag(item)"
      v-if="item.type !== 'list'"
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
    <component :is="item.style === 'number' ? 'ol' : 'ul'" v-else>
      <li v-for="entry in item.items" :key="entry.key">
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
