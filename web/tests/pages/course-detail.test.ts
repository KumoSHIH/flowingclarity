import { mount } from "@vue/test-utils";
import { ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CourseDetailPage from "../../app/pages/course/[slug].vue";
import { courseDetailFixture } from "../../app/fixtures/courseDetail";
import type { CourseDetailApiResponse } from "../../app/types/courseDetail";

const SiteHeaderStub = {
  props: ["alwaysVisible", "currentPath"],
  template: '<header data-site-header :data-always-visible="String(alwaysVisible)" :data-current-path="currentPath" />',
};

describe("course detail page", () => {
  const refresh = vi.fn();
  const courseResponse = ref<CourseDetailApiResponse>({
    state: "ready",
    content: courseDetailFixture,
  });
  const courseRequestStatus = ref("success");
  const useFetchMock = vi.fn((request: unknown) => typeof request === "function"
    ? { data: courseResponse, status: courseRequestStatus, refresh }
    : { data: ref(undefined), status: ref("success"), refresh });

  beforeEach(() => {
    refresh.mockReset();
    useFetchMock.mockClear();
    courseResponse.value = { state: "ready", content: courseDetailFixture };
    courseRequestStatus.value = "success";
    vi.stubGlobal("useRoute", () => ({
      params: { slug: "japanese-facial-massage" },
      path: "/course/japanese-facial-massage",
    }));
    vi.stubGlobal("useHead", vi.fn());
    vi.stubGlobal("useFetch", useFetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uses the shared header and requests published content by slug", () => {
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
    expect(wrapper.get("[data-site-header]").attributes("data-current-path")).toBe("/course");
    expect(wrapper.get("[data-detail]").attributes("data-status")).toBe("ready");
    expect(wrapper.get("[data-detail]").attributes("data-title")).toContain("日式回春");
    const endpoint = useFetchMock.mock.calls.find(([request]) => typeof request === "function")?.[0] as () => string;
    expect(endpoint()).toBe("/api/course-detail/japanese-facial-massage");
  });

  it("maps empty and failed API responses to explicit page states", async () => {
    courseResponse.value = { state: "empty", content: null };
    const emptyWrapper = mount(CourseDetailPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          CourseDetail: {
            props: ["content", "status"],
            template: '<div data-detail :data-status="status" />',
          },
        },
      },
    });
    expect(emptyWrapper.get("[data-detail]").attributes("data-status")).toBe("not-found");

    courseResponse.value = { state: "error", content: null };
    const errorWrapper = mount(CourseDetailPage, {
      global: {
        stubs: {
          SiteHeader: SiteHeaderStub,
          SiteFooter: true,
          SiteFooterUnavailable: true,
          CourseDetail: {
            emits: ["retry"],
            props: ["content", "status"],
            template: '<button data-detail :data-status="status" @click="$emit(\'retry\')" />',
          },
        },
      },
    });
    expect(errorWrapper.get("[data-detail]").attributes("data-status")).toBe("error");
    await errorWrapper.get("[data-detail]").trigger("click");
    expect(refresh).toHaveBeenCalledOnce();
  });
});
