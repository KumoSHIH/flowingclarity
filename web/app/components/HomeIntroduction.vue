<template>
  <section
    id="about"
    class="grid gap-12 px-[clamp(28px,6vw,116px)] py-28 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-[clamp(56px,8vw,140px)] md:py-44"
    aria-labelledby="about-title"
  >
    <div class="relative z-20 mx-auto w-full max-w-[480px] md:mx-0">
      <div class="aspect-[4/5] overflow-hidden bg-[#d8cbbc]">
        <img
          src="/images/home-banner-2.jpg"
          alt="暖光照進安靜的療癒空間"
          width="1080"
          height="1350"
          loading="lazy"
          class="h-full w-full object-cover object-center"
        >
      </div>
      <p class="absolute -bottom-6 right-0 bg-paper px-6 py-4 font-editorial text-[10px] tracking-[0.2em] text-muted md:-right-8">
        A QUIET PLACE TO BE
      </p>
    </div>

    <div class="relative z-20 max-w-[620px] md:py-12">
      <h2 id="about-title" class="font-display text-[34px] font-medium leading-[1.45] tracking-[0.04em] lg:text-[62px]">
        讓身體被好好聽見，<br class="hidden sm:block">讓心有地方安放。
      </h2>
      <p class="mb-0 mt-10 flex items-center gap-4 text-xs font-semibold tracking-[0.18em] text-clay">
        <span class="h-px w-8 bg-current" aria-hidden="true" />
        關於普那
      </p>
      <div class="mt-7 max-w-[520px] space-y-8 text-base leading-[2] tracking-[0.05em] text-muted md:ml-auto">
        <p>普那生活空間相信，照顧自己不需要急著抵達某個答案。從一次深呼吸、一段安靜的觸碰開始，慢慢認識身體此刻真正的需要。</p>
        <p>我們透過按摩、身體工作與小型課程，陪你在日常之間留下一段可以鬆開、整理、重新感受自己的時間。</p>
      </div>
    </div>
  </section>
</template>
