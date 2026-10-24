<script setup lang="ts">
import type { HomeSectionsContent } from '#shared/types/homeSections'

const content: HomeSectionsContent['events'] = {
  heading: '近期活動',
  introduction: '在不大的空間裡相遇，分享一段專心感受當下的時間。',
  emptyMessage: '目前沒有近期活動。',
  items: [{
    id: 'two-day-event',
    href: '/events/two-day-event',
    date: '2027-01-30',
    period: '2027/01',
    day: '30、31',
    weekday: '週六、週日',
    title: '家族系統排列工作坊',
    category: '兩日工作坊',
    time: '兩日皆為 09:00—18:00',
  }],
}
</script>

<template>
  <main>
    <HomeEvents :content="content" />
  </main>
</template>
