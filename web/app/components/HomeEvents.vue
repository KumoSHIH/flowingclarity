<script setup lang="ts">
const events = [
  {
    date: "2026-10-12",
    month: "OCT",
    day: "12",
    title: "秋日靜心練習",
    category: "小型聚會",
    time: "週六 14:00—16:00",
  },
  {
    date: "2026-10-26",
    month: "OCT",
    day: "26",
    title: "身體書寫之夜",
    category: "主題活動",
    time: "週六 19:00—21:00",
  },
  {
    date: "2026-11-09",
    month: "NOV",
    day: "09",
    title: "一杯茶的慢時光",
    category: "生活練習",
    time: "週六 15:00—17:00",
  },
];
</script>

<template>
  <section
    id="events"
    class="bg-[#e8dfd2] px-[clamp(28px,6vw,116px)] py-28 md:py-36"
    aria-labelledby="events-title"
  >
    <div
      class="relative z-20 mx-auto grid max-w-[1520px] gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-[clamp(64px,8vw,140px)]"
    >
      <div class="flex flex-col items-start gap-8">
        <div>
          <h2
            id="events-title"
            class="font-display text-[40px] font-medium tracking-[0.05em] lg:text-[72px]"
          >
            近期活動
          </h2>
        </div>
        <p
          class="max-w-[330px] text-base leading-8 tracking-[0.05em] text-muted"
        >
          在不大的空間裡相遇，分享一段專心感受當下的時間。
        </p>
      </div>

      <ol class="border-t border-[#bcae9c]">
        <li
          v-for="event in events"
          :key="event.title"
          class="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-7 gap-y-4 border-b border-[#c9bcac] py-9 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-x-10 sm:py-11"
        >
          <time
            class="row-span-2 flex flex-col items-start gap-1"
            :datetime="event.date"
          >
            <span
              class="font-editorial text-[11px] tracking-[0.14em] text-muted"
              >{{ event.month }}</span
            >
            <span
              class="font-editorial text-[56px] leading-none text-clay sm:text-[72px]"
              >{{ event.day }}</span
            >
          </time>
          <div>
            <p
              class="mb-2 text-[10px] font-semibold tracking-[0.18em] text-clay"
            >
              {{ event.category }}
            </p>
            <h3 class="font-display text-xl tracking-[0.06em] md:text-3xl">
              {{ event.title }}
            </h3>
          </div>
          <p class="col-start-2 text-xs tracking-[0.08em] text-muted">
            {{ event.time }}
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>
