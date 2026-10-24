<script setup lang="ts">
import type { HomeSectionsContent } from "#shared/types/homeSections";

defineProps<{ content: HomeSectionsContent["events"] }>();
</script>

<template>
  <section
    id="events"
    class="bg-[#e8dfd2] px-[var(--page-gutter-mobile)] py-28 md:py-36 lg:px-[clamp(28px,6vw,116px)]"
    aria-labelledby="events-title"
  >
    <div
      class="relative z-20 mx-auto grid max-w-[1520px] gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-[clamp(64px,8vw,140px)]"
    >
      <div class="flex flex-col items-start gap-8">
        <div>
          <h2 id="events-title" class="type-title-xl">{{ content.heading }}</h2>
        </div>
        <p class="type-body max-w-[330px] text-muted">
          {{ content.introduction }}
        </p>
      </div>

      <ol v-if="content.items.length" class="border-t border-[#bcae9c]">
        <li
          v-for="event in content.items"
          :key="event.id"
          class="home-event-item"
        >
          <NuxtLink :to="event.href" class="home-event-link">
            <time class="home-event-link__date" :datetime="event.date">
              <span class="home-event-link__period type-lead font-editorial">{{
                event.period
              }}</span>
              <span
                class="home-event-link__day type-title-md font-editorial leading-none"
                >{{ event.day }}</span
              >
            </time>
            <div class="home-event-link__copy">
              <p class="home-event-link__category type-label">
                {{ event.category }}
              </p>
              <h3 class="type-title-sm home-event-link__title">
                {{ event.title }}
              </h3>
              <p class="home-event-link__meta type-label">
                <span>{{ event.weekday }}</span>
                <span>{{ event.time }}</span>
              </p>
            </div>
          </NuxtLink>
        </li>
      </ol>
      <p v-else class="type-body border-t border-[#bcae9c] py-9 text-muted">
        {{ content.emptyMessage }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.home-event-item {
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 16%, transparent);
}

.home-event-link {
  display: grid;
  grid-template-columns: minmax(180px, 0.9fr) minmax(0, 3fr);
  gap: clamp(22px, 3vw, 46px);
  align-items: center;
  min-height: 150px;
  padding: 24px 0;
  color: inherit;
  text-decoration: none;
}

.home-event-link__date {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--color-muted);
  white-space: nowrap;
}

.home-event-link__day {
  color: var(--color-clay);
  font-variant-numeric: tabular-nums;
}

.home-event-link__day--range {
  font-size: var(--home-event-date-range-size);
}

.home-event-link__period {
  font-variant-numeric: tabular-nums;
}

.home-event-link__category {
  margin: 0 0 4px;
  color: var(--color-clay);
}

.home-event-link__title {
  margin: 0;
  overflow-wrap: anywhere;
  transition: color 220ms ease;
}

.home-event-link__meta {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.6em;
  margin: 6px 0 0;
  color: var(--color-muted);
}

.home-event-link:focus-visible .home-event-link__title {
  color: var(--interactive-title-hover);
}

@media (hover: hover) and (pointer: fine) {
  .home-event-link:hover .home-event-link__title {
    color: var(--interactive-title-hover);
  }
}

@media (max-width: 1023px) {
  .home-event-link {
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 18px;
    min-height: 0;
  }
}

@media (max-width: 520px) {
  .home-event-link__meta {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-event-link__title {
    transition: none;
  }
}
</style>
