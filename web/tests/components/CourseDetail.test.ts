import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CourseDetail from "../../app/components/CourseDetail.vue";
import {
  courseDetailFixture,
  emptyCourseDetailFixture,
  longCourseDetailFixture,
  minimalCourseDetailFixture,
} from "../../app/fixtures/courseDetail";

const nuxtLinkStub = {
  props: ["to"],
  template: '<a :href="to"><slot /></a>',
};

enableAutoUnmount(afterEach);

describe("CourseDetail", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    window.history.replaceState(null, "", "/course/japanese-facial-massage");
  });

  afterEach(() => vi.unstubAllGlobals());

  it("renders one page heading and keeps unapproved actions disabled", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll("h1")).toHaveLength(1);
    expect(wrapper.get("h1").text()).toContain("日式回春");
    expect(wrapper.findAll(".course-detail__breadcrumb li")).toHaveLength(3);
    expect(
      wrapper.get('.course-detail__breadcrumb [aria-current="page"]').text(),
    ).toBe(courseDetailFixture.hero.title.replace("\n", ""));
    expect(
      wrapper
        .findAll(".course-detail__breadcrumb a")
        .map((link) => link.attributes("href")),
    ).toEqual(["/", "/course"]);
    expect(wrapper.findAll(".button-primary:disabled")).toHaveLength(2);
    expect(wrapper.findAll(".button-primary__icon")).toHaveLength(2);
    expect(wrapper.get(".course-intro__inner > h2").text()).toBe(
      courseDetailFixture.body.find((block) => block.type === "introduction")
        ?.title,
    );
    expect(wrapper.get(".course-intro__body .lede").exists()).toBe(true);
    expect(wrapper.get(".course-testimonials .shared-testimonials").exists()).toBe(
      true,
    );
    expect(wrapper.find(".course-video iframe").exists()).toBe(false);
    expect(wrapper.find(".course-video a").exists()).toBe(false);
    expect(wrapper.get(".course-video__status").text()).toBe("課程影片待上架");
  });

  it("embeds an available YouTube video without rendering an external link", async () => {
    const content = structuredClone(courseDetailFixture);
    const video = content.body.find((block) => block.type === "video");
    if (!video || video.type !== "video") throw new Error("Missing video fixture");
    video.embedUrl = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";

    const wrapper = mount(CourseDetail, {
      props: { content },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    const iframe = wrapper.get(".course-video iframe");
    expect(iframe.attributes()).toMatchObject({
      src: video.embedUrl,
      loading: "lazy",
      referrerpolicy: "strict-origin-when-cross-origin",
      allowfullscreen: "",
    });
    expect(iframe.attributes("title")).toContain(video.title);
    expect(wrapper.find(".course-video a").exists()).toBe(false);
  });

  it("renders each course stage and date range instead of one continuous date", async () => {
    const content = structuredClone(courseDetailFixture);
    content.hero.meta = content.hero.meta.map((item) =>
      item.label === "時間"
        ? { ...item, value: "第一階｜2026/11/11–11/12\n第二階｜2026/11/21–11/22" }
        : item,
    );
    content.schedule.sessions[0]!.stages = [
      { key: "stage-1", title: "第一階", dateRanges: ["2026/11/11–11/12"] },
      { key: "stage-2", title: "第二階", dateRanges: ["2026/11/21–11/22"] },
    ];

    const wrapper = mount(CourseDetail, {
      props: { content },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    const time = wrapper.findAll(".course-hero dl > div").find((item) => item.get("dt").text() === "時間");
    expect(time?.classes()).toContain("course-hero__meta--multiline");
    expect(time?.get("dd").classes()).toContain("preserve-lines");
    expect(time?.get("dd").element.textContent).toContain("第一階｜2026/11/11–11/12\n第二階｜2026/11/21–11/22");
    expect(wrapper.findAll(".schedule-stage-list dt").map((item) => item.text())).toEqual(["第一階", "第二階"]);
    expect(wrapper.findAll(".schedule-stage-list dd span").map((item) => item.text())).toEqual([
      "2026/11/11–11/12",
      "2026/11/21–11/22",
    ]);
    expect(wrapper.get(".schedule-session__location").text()).toBe(
      content.schedule.sessions[0]!.location,
    );
    const firstSession = wrapper.findAll(".schedule-session")[0]!;
    expect(
      firstSession.findAll(".schedule-details dt").map((item) => item.text()),
    ).toEqual(content.schedule.sessions[0]!.details.map((detail) => detail.label));
    expect(wrapper.get(".course-schedule__inner").exists()).toBe(true);
    expect(wrapper.get(".schedule-session__action").attributes("href")).toBe("#registration");
    expect(wrapper.text()).not.toContain("2026/11/11–11/22");
  });

  it("renders multiple gallery layouts in the editor-defined content order", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".course-gallery")).toHaveLength(5);
    expect(wrapper.findAll("section[id^='content-']").map(section => section.attributes("id")).slice(0, 6)).toEqual([
      "content-introduction",
      "content-collage",
      "content-teacher",
      "content-quote",
      "content-stages",
      "content-curriculum",
    ]);
    expect(wrapper.findAll(".gallery-panel").map(panel =>
      panel.classes().find(name => name.startsWith("gallery-panel--")))).toEqual([
      "gallery-panel--collage",
      "gallery-panel--stages",
      "gallery-panel--weave",
      "gallery-panel--folio",
      "gallery-panel--dossier",
    ]);
    expect(wrapper.find(".course-gallery footer").exists()).toBe(false);
  });

  it("uses the teacher name as the section heading without a redundant label", async () => {
    const teacher = courseDetailFixture.body.find(block => block.type === "teacher");
    if (!teacher || teacher.type !== "teacher") throw new Error("Missing teacher fixture");
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".course-teacher__heading").exists()).toBe(false);
    expect(wrapper.get(".course-teacher__name").text()).toContain(teacher.name);
    expect(wrapper.get(".course-teacher__name").element.tagName).toBe("H2");
  });

  it("omits empty optional gallery copy without removing the gallery", async () => {
    const content = structuredClone(courseDetailFixture);
    const gallery = content.body.find(
      block => block.type === "gallery" && block.layout !== "collage",
    );
    if (!gallery || gallery.type !== "gallery") throw new Error("Missing gallery fixture");
    gallery.note = undefined;
    gallery.statement = undefined;
    gallery.items[0]!.title = undefined;

    const wrapper = mount(CourseDetail, {
      props: { content },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    const section = wrapper.get(`#content-${gallery.key}`);
    expect(section.find(".gallery-item:first-child .gallery-item__copy h3").exists()).toBe(false);
    expect(section.find(".gallery-panel > blockquote").exists()).toBe(false);
    expect(section.find(".gallery-item__copy p").exists()).toBe(true);
  });

  it("renders shared testimonials, the reusable image carousel, and related articles in their required positions", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".course-testimonials blockquote")).toHaveLength(1);
    expect(wrapper.get(".course-carousel h2").text()).toContain("在練習之間");
    expect(
      wrapper.get(".course-chapters a[href='#content-practice-carousel']").text(),
    ).toBe("在練習之間，看見方法如何落地。");
    expect(wrapper.get(".course-carousel .about-carousel__controls span").text()).toBe("01 / 03");
    await wrapper.findAll(".course-carousel .about-carousel__controls button")[1]!.trigger("click");
    expect(wrapper.get(".course-carousel .about-carousel__controls span").text()).toBe("02 / 03");
    expect(wrapper.findAll(".course-related .article-related__track > li")).toHaveLength(1);

    const registration = wrapper.get("#registration").element;
    const related = wrapper.get(".course-related").element;
    expect(registration.compareDocumentPosition(related) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("does not render empty paragraphs when optional description fields are omitted", () => {
    const content = structuredClone(courseDetailFixture);
    const gallery = content.body.find((block) => block.type === "gallery");
    const curriculum = content.body.find((block) => block.type === "curriculum");
    const audience = content.body.find((block) => block.type === "audience");
    if (!gallery || gallery.type !== "gallery") throw new Error("Missing gallery fixture");
    if (!curriculum || curriculum.type !== "curriculum") throw new Error("Missing curriculum fixture");
    if (!audience || audience.type !== "audience") throw new Error("Missing audience fixture");

    delete gallery.description;
    delete gallery.items[0]!.description;
    delete curriculum.description;
    delete audience.description;
    delete content.schedule.description;
    delete content.registration.description;

    const wrapper = mount(CourseDetail, {
      props: { content },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });

    const gallerySection = wrapper.get(`#content-${gallery.key}`);
    expect(gallerySection.find("header .body-copy").exists()).toBe(false);
    expect(gallerySection.find(".gallery-item:first-child .gallery-item__copy p").exists()).toBe(false);
    expect(wrapper.find(".course-curriculum > header .body-copy").exists()).toBe(false);
    expect(wrapper.find(".course-audience .body-copy").exists()).toBe(false);
    expect(wrapper.find(".course-schedule__intro .body-copy").exists()).toBe(false);
    expect(wrapper.find(".course-registration > div > p").exists()).toBe(false);
  });

  it("only links to optional sections that are present", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: minimalCourseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.find("a[href='#content-teacher']").exists()).toBe(false);
    expect(wrapper.find("a[href='#content-video']").exists()).toBe(false);
    expect(wrapper.find("a[href='#content-testimonials']").exists()).toBe(false);
    expect(wrapper.find("a[href='#content-practice-carousel']").exists()).toBe(false);
    expect(wrapper.find("a[href='#content-curriculum']").exists()).toBe(true);
    expect(wrapper.find(".gallery-tabs").exists()).toBe(false);
    expect(wrapper.get(".gallery-panel").attributes("role")).toBeUndefined();
  });

  it("keeps a clicked chapter active and accounts for both sticky navigation bars", async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    vi.spyOn(wrapper.get(".course-chapters").element, "getBoundingClientRect").mockReturnValue({
      top: 87,
      bottom: 155,
      left: 0,
      right: 1440,
      width: 1440,
      height: 68,
      x: 0,
      y: 87,
      toJSON: () => undefined,
    });
    vi.spyOn(wrapper.get("#content-teacher").element, "getBoundingClientRect").mockReturnValue({
      top: 800,
      bottom: 1500,
      left: 0,
      right: 1440,
      width: 1440,
      height: 700,
      x: 0,
      y: 800,
      toJSON: () => undefined,
    });

    await wrapper.get("a[href='#content-teacher']").trigger("click");

    expect(scrollTo).toHaveBeenCalledWith({ top: 629, behavior: "smooth" });
    expect(wrapper.get("a[href='#content-teacher']").attributes("aria-current")).toBe("location");
    expect(window.location.hash).toBe("#content-teacher");
  });

  it("moves the mobile chapter rail to keep the vertically active chapter visible", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    const nav = wrapper.get(".course-chapters").element as HTMLElement;
    const navScrollTo = vi.fn();
    Object.defineProperties(nav, {
      clientWidth: { configurable: true, value: 390 },
      scrollLeft: { configurable: true, value: 0 },
      scrollTo: { configurable: true, value: navScrollTo },
    });
    vi.spyOn(nav, "getBoundingClientRect").mockReturnValue({
      top: 87,
      bottom: 145,
      left: 0,
      right: 390,
      width: 390,
      height: 58,
      x: 0,
      y: 87,
      toJSON: () => undefined,
    });

    const targetId = "content-curriculum";
    const targetLink = wrapper.get(`a[href='#${targetId}']`).element as HTMLAnchorElement;
    Object.defineProperties(targetLink, {
      offsetLeft: { configurable: true, value: 750 },
      offsetWidth: { configurable: true, value: 122 },
    });
    const targetIndex = wrapper.findAll(".course-chapters a")
      .findIndex(link => link.attributes("href") === `#${targetId}`);
    wrapper.findAll(".course-chapters a").forEach((link, index) => {
      const id = link.attributes("href")!.slice(1);
      vi.spyOn(wrapper.get(`#${id}`).element, "getBoundingClientRect").mockReturnValue({
        top: index <= targetIndex ? (index === targetIndex ? 150 : -200) : 1000,
        bottom: 1200,
        left: 0,
        right: 390,
        width: 390,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => undefined,
      });
    });
    Object.defineProperties(window, {
      scrollY: { configurable: true, value: 1000 },
      innerHeight: { configurable: true, value: 844 },
    });
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 5000 });
    navScrollTo.mockClear();

    window.dispatchEvent(new Event("scroll"));
    await new Promise(resolve => window.setTimeout(resolve, 30));
    await wrapper.vm.$nextTick();

    expect(wrapper.get(`a[href='#${targetId}']`).attributes("aria-current")).toBe("location");
    expect(navScrollTo).toHaveBeenCalledWith({ left: 616, behavior: "smooth" });
  });

  it("keeps long content and meaningful image alternatives in the document", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: longCourseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".course-intro .body-copy")).toHaveLength(4);
    expect(wrapper.findAll("img").every((item) => Boolean(item.attributes("alt")))).toBe(true);
  });

  it("preserves editor-authored line breaks in multiline content", async () => {
    const content = structuredClone(courseDetailFixture);
    const teacher = content.body.find(block => block.type === "teacher");
    const curriculum = content.body.find(block => block.type === "curriculum");
    if (teacher?.type === "teacher") {
      teacher.lead = "第一段簡介。\n第二段簡介。";
      teacher.biography = "第一段完整介紹。\n第二段完整介紹。";
    }
    if (curriculum?.type === "curriculum") {
      curriculum.units[0]!.title = "日式回春面部按摩\n初級班";
    }

    const wrapper = mount(CourseDetail, {
      props: { content },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    const lead = wrapper.get(".course-teacher .lede");
    const biography = wrapper.get(".course-teacher .body-copy");
    const curriculumTitle = wrapper.get(".curriculum-list button strong");
    expect(lead.classes()).toContain("preserve-lines");
    expect(biography.classes()).toContain("preserve-lines");
    expect(lead.element.textContent).toBe("第一段簡介。\n第二段簡介。");
    expect(biography.element.textContent).toBe("第一段完整介紹。\n第二段完整介紹。");
    expect(curriculumTitle.classes()).toContain("preserve-lines");
    expect(curriculumTitle.element.textContent).toBe("日式回春面部按摩\n初級班");
  });

  it("toggles curriculum panels with their controlling buttons", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll(".curriculum-list button");
    expect(buttons[0]?.attributes("aria-expanded")).toBe("true");
    expect(buttons[1]?.attributes("aria-expanded")).toBe("false");

    await buttons[1]!.trigger("click");
    expect(buttons[1]?.attributes("aria-expanded")).toBe("true");
    expect(wrapper.get("#curriculum-panel-curriculum-advanced").isVisible()).toBe(true);
  });

  it("shows graceful empty collection messages", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: emptyCourseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("圖文內容仍在整理");
    expect(wrapper.text()).toContain("詳細課綱仍在整理中");
    expect(wrapper.text()).toContain("目前沒有已確認的課程梯次");
  });

  it("emits retry from the error state", async () => {
    const wrapper = mount(CourseDetail, {
      props: { status: "error" },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });

  it("explains that a missing course may be unpublished", () => {
    const wrapper = mount(CourseDetail, {
      props: { status: "not-found" },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    expect(wrapper.get("h1").text()).toBe("找不到這門課程");
    expect(wrapper.text()).toContain("尚未公開");
  });
});
