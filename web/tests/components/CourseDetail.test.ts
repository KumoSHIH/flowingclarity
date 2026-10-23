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
    expect(wrapper.findAll(".primary-action:disabled")).toHaveLength(2);
    expect(wrapper.get(".course-video button").attributes("disabled")).toBeDefined();
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
  });

  it("renders shared testimonials, the reusable image carousel, and related articles in their required positions", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".course-testimonials blockquote")).toHaveLength(1);
    expect(wrapper.get(".course-carousel h2").text()).toContain("在練習之間");
    expect(wrapper.get(".course-carousel .about-carousel__controls span").text()).toBe("01 / 03");
    await wrapper.findAll(".course-carousel .about-carousel__controls button")[1]!.trigger("click");
    expect(wrapper.get(".course-carousel .about-carousel__controls span").text()).toBe("02 / 03");
    expect(wrapper.findAll(".course-related .article-related__track > li")).toHaveLength(1);

    const registration = wrapper.get("#registration").element;
    const related = wrapper.get(".course-related").element;
    expect(registration.compareDocumentPosition(related) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
    if (teacher?.type === "teacher") {
      teacher.lead = "第一段簡介。\n第二段簡介。";
      teacher.biography = "第一段完整介紹。\n第二段完整介紹。";
    }

    const wrapper = mount(CourseDetail, {
      props: { content },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    const lead = wrapper.get(".course-teacher .lede");
    const biography = wrapper.get(".course-teacher .body-copy");
    expect(lead.classes()).toContain("preserve-lines");
    expect(biography.classes()).toContain("preserve-lines");
    expect(lead.element.textContent).toBe("第一段簡介。\n第二段簡介。");
    expect(biography.element.textContent).toBe("第一段完整介紹。\n第二段完整介紹。");
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
