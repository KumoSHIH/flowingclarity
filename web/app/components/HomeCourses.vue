<script setup lang="ts">
const courses = [
  {
    title: "回到身體的呼吸練習",
    description:
      "從呼吸與緩慢的動作，練習辨認緊繃，也練習在生活裡為自己留下一點空間。",
    meta: "四週入門課程",
    image: "/images/home-banner.jpg",
    imageAlt: "鋪著亞麻布的安靜按摩空間",
  },
  {
    title: "溫柔觸碰按摩課",
    description:
      "認識安全而有界線的觸碰，學習適合日常使用的肩頸與手部放鬆方法。",
    meta: "週末工作坊",
    image: "/images/home-banner-2.jpg",
    imageAlt: "暖光中的療癒空間",
  },
  {
    title: "回到身體的呼吸練習",
    description:
      "從呼吸與緩慢的動作，練習辨認緊繃，也練習在生活裡為自己留下一點空間。",
    meta: "四週入門課程",
    image: "/images/home-banner.jpg",
    imageAlt: "鋪著亞麻布的安靜按摩空間",
  },
  {
    title: "回到身體的呼吸練習",
    description:
      "從呼吸與緩慢的動作，練習辨認緊繃，也練習在生活裡為自己留下一點空間。",
    meta: "四週入門課程",
    image: "/images/home-banner.jpg",
    imageAlt: "鋪著亞麻布的安靜按摩空間",
  },
];
</script>

<template>
  <section
    id="courses"
    class="px-[clamp(28px,6vw,116px)] py-28 md:py-44"
    aria-labelledby="courses-title"
  >
    <div class="relative z-20 mx-auto max-w-[1520px]">
      <div class="mb-14">
        <div>
          <h2
            id="courses-title"
            class="text-center font-display text-[40px] font-medium tracking-[0.05em] lg:text-[72px]"
          >
            近期課程
          </h2>
        </div>
        <p
          class="max-w-[470px] text-base leading-8 tracking-[0.05em] text-muted mx-auto text-center"
        >
          用可以帶回日常的練習，一點一點培養對身體的覺察與信任。
        </p>
      </div>

      <div class="grid gap-20 md:grid-cols-2 md:gap-[clamp(56px,8vw,128px)]">
        <article
          v-for="(course, index) in courses"
          :key="course.title"
          :class="index % 2 !== 0 ? 'md:mt-36' : ''"
        >
          <div class="aspect-[5/4] overflow-hidden bg-[#d8cbbc]">
            <img
              :src="course.image"
              :alt="course.imageAlt"
              width="900"
              height="720"
              loading="lazy"
              class="h-full w-full object-cover"
              :class="index === 0 ? 'object-[60%_center]' : 'object-center'"
            />
          </div>
          <div class="border-b border-[#d2c8bc] pb-10 pt-8 md:pb-12 md:pt-10">
            <div>
              <p
                class="mb-4 text-[10px] font-semibold tracking-[0.18em] text-clay"
              >
                {{ course.meta }}
              </p>
              <h3
                class="font-display text-2xl leading-relaxed tracking-[0.05em] md:text-[30px]"
              >
                {{ course.title }}
              </h3>
            </div>
            <p
              class="mt-6 max-w-[440px] text-base leading-8 tracking-[0.04em] text-muted"
            >
              {{ course.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
