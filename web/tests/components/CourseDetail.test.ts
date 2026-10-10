import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CourseDetail from "../../app/components/CourseDetail.vue";
import {
  courseDetailFixture,
  emptyCourseDetailFixture,
} from "../../app/fixtures/courseDetail";

const nuxtLinkStub = { template: "<a><slot /></a>" };

class IntersectionObserverStub {
  observe = vi.fn();
  disconnect = vi.fn();
}

describe("CourseDetail", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
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
    expect(wrapper.findAll(".primary-action:disabled")).toHaveLength(2);
    expect(wrapper.get(".course-video button").attributes("disabled")).toBeDefined();
  });

  it("switches gallery modes with click and keyboard", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: courseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    const stageTab = wrapper.get("#gallery-tab-stages");
    await stageTab.trigger("click");
    expect(stageTab.attributes("aria-selected")).toBe("true");
    expect(wrapper.get("[role='tabpanel']").classes()).toContain("gallery-panel--stages");
    expect(window.location.search).toBe("?gallery=stages");

    await stageTab.trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.get("#gallery-tab-weave").attributes("aria-selected")).toBe("true");
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
    expect(wrapper.get("#curriculum-panel-advanced").isVisible()).toBe(true);
  });

  it("shows graceful empty collection messages", async () => {
    const wrapper = mount(CourseDetail, {
      props: { content: emptyCourseDetailFixture },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("多圖內容仍在整理");
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
