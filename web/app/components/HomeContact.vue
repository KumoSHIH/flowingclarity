<template>
  <section
    id="contact"
    class="px-[var(--page-gutter-mobile)] pb-8 md:pb-16 lg:px-[clamp(20px,4vw,64px)]"
    aria-labelledby="contact-title"
  >
    <div
      class="relative overflow-hidden bg-[var(--color-sand)] px-[var(--page-gutter-mobile)] py-20 text-[var(--color-bark)] md:py-36 lg:px-[clamp(56px,8vw,140px)]"
    >
      <div
        class="relative grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20"
      >
        <div>
          <h2 id="contact-title" class="type-title-xl max-w-[760px]">
            留一段時間，<br />好好照顧自己。
          </h2>
        </div>
        <div class="max-w-[460px] lg:justify-self-end">
          <p class="type-body text-[var(--color-bark)]">
            想了解按摩、近期活動或課程，歡迎來信與我們說說你的需要。
          </p>
          <a href="mailto:hello@flowingclarity.tw" class="button-primary mt-6">
            寫信給我們
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M5 19 19 5M5 5h14v14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
