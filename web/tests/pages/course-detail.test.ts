import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CourseDetailPage from "../../app/pages/course/[slug].vue";

const SiteHeaderStub = {
  props: ["alwaysVisible"],
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" />',
};

describe("course detail page", () => {
  beforeEach(() => {
    vi.stubGlobal("useRoute", () => ({
      params: { slug: "japanese-facial-massage" },
      path: "/course/japanese-facial-massage",
    }));
    vi.stubGlobal("useHead", vi.fn());
    vi.stubGlobal("useFetch", () => ({
      data: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uses the shared header and resolves the local fixture by slug", () => {
    const wrapper = mount(CourseDetailPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          CourseDetail: {
            props: ["content", "status"],
            template: '<div data-detail :data-title="content?.hero.title" :data-status="status" />',
          },
        },
      },
    });

    expect(wrapper.get("[data-site-header]").attributes("data-always-visible")).toBeDefined();
    expect(wrapper.get("[data-detail]").attributes("data-status")).toBe("ready");
    expect(wrapper.get("[data-detail]").attributes("data-title")).toContain("日式回春");
  });
});
