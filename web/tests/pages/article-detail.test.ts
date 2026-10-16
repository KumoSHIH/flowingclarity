import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ArticleDetail from "../../app/components/ArticleDetail.vue";
import ArticleDetailPage from "../../app/pages/articles/[slug].vue";
import {
  articleDetailFixture,
  longArticleDetailFixture,
  minimalArticleDetailFixture,
  splitArticleDetailFixture,
} from "../../app/fixtures/articleDetail";

const NuxtLinkStub = defineComponent({
  props: { to: { type: [String, Object], required: true } },
  template: "<a :href=\"typeof to === 'string' ? to : to.path\"><slot /></a>",
});

function mountDetail(content = articleDetailFixture, status = "ready") {
  return mount(ArticleDetail, {
    props: { content, status },
    global: { stubs: { NuxtLink: NuxtLinkStub } },
  });
}

describe("article detail", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
  });

  it("renders the approved hero, ordered body blocks, semantics, and related content", () => {
    const wrapper = mountDetail();

    expect(wrapper.findAll("h1")).toHaveLength(1);
    expect(wrapper.get("h1").text()).toBe(articleDetailFixture.title);
    expect(wrapper.get(".article-hero__panel").classes()).toContain(
      "article-hero__panel--overlay",
    );
    expect(wrapper.findAll(".article-breadcrumb li")).toHaveLength(3);
    expect(
      wrapper.get('.article-breadcrumb [aria-current="page"]').text(),
    ).toBe(articleDetailFixture.title);
    expect(wrapper.findAll(".article-body > *")).toHaveLength(
      articleDetailFixture.body.length,
    );
    expect(wrapper.findAll(".article-section--split")).toHaveLength(2);
    expect(wrapper.find(".article-section--media-end").exists()).toBe(true);
    expect(wrapper.get(".article-wide-image figcaption").text()).toContain(
      "版型驗證",
    );
    expect(wrapper.findAll(".article-related__track > li")).toHaveLength(5);
    expect(wrapper.find(".article-related time").exists()).toBe(false);
    expect(wrapper.findAll("h1")).toHaveLength(1);
  });

  it("moves the related-article track with bounded controls and live feedback", async () => {
    const wrapper = mountDetail();
    await wrapper.vm.$nextTick();
    const controls = wrapper.findAll(".article-related__controls button");

    expect(controls).toHaveLength(2);
    expect(wrapper.get('[aria-live="polite"]').text()).toBe("");
    expect(controls[0]!.attributes("disabled")).toBeDefined();
    expect(controls[1]!.attributes("disabled")).toBeUndefined();
    await controls[1]!.trigger("click");
    expect(wrapper.get('[aria-live="polite"]').text()).toBe(
      "目前顯示第 2 篇，共 5 篇",
    );
    expect(
      wrapper.get(".article-related__track").attributes("style"),
    ).toContain("translateX");

    await controls[1]!.trigger("click");
    await controls[1]!.trigger("click");
    await controls[1]!.trigger("click");
    expect(controls[1]!.attributes("disabled")).toBeDefined();
  });

  it("keeps only visible carousel links in the enhanced tab order and resets for new content", async () => {
    const wrapper = mountDetail();
    await wrapper.vm.$nextTick();
    let links = wrapper.findAll(".article-related__track a");

    expect(links[0]!.attributes("tabindex")).toBeUndefined();
    expect(links[1]!.attributes("tabindex")).toBe("-1");

    await wrapper
      .findAll(".article-related__controls button")[1]!
      .trigger("click");
    expect(wrapper.get('[aria-live="polite"]').text()).toBe(
      "目前顯示第 2 篇，共 5 篇",
    );
    links = wrapper.findAll(".article-related__track a");
    expect(links[0]!.attributes("tabindex")).toBe("-1");
    expect(links[1]!.attributes("tabindex")).toBeUndefined();

    await wrapper.setProps({ content: splitArticleDetailFixture });
    expect(wrapper.get('[aria-live="polite"]').text()).toBe("");
    expect(
      wrapper.get(".article-related__track").attributes("style"),
    ).toContain("translateX(calc(-0");
  });

  it("supports split hero without a cover and omits an empty related section", () => {
    const split = mountDetail(splitArticleDetailFixture);
    expect(split.get(".article-hero__panel").classes()).toContain(
      "article-hero__panel--split",
    );
    expect(split.get(".article-hero__media img").attributes("alt")).toContain(
      "人物臉部",
    );

    const minimal = mountDetail(minimalArticleDetailFixture);
    expect(minimal.get(".article-hero__panel").classes()).toContain(
      "article-hero__panel--without-cover",
    );
    expect(minimal.find(".article-hero__media").exists()).toBe(false);
    expect(minimal.find(".article-related").exists()).toBe(false);
    expect(minimal.findAll(".article-body > *")).toHaveLength(1);
  });

  it("keeps maximum-length fixture content complete", () => {
    const wrapper = mountDetail(longArticleDetailFixture);
    expect(wrapper.get("h1").text()).toBe(longArticleDetailFixture.title);
    expect(wrapper.findAll(".article-meta li")).toHaveLength(8);
    expect(wrapper.findAll(".article-body > section")).toHaveLength(30);
    expect(wrapper.findAll(".article-related__track > li")).toHaveLength(8);
    expect(wrapper.text()).toContain("長文段落 30");
  });

  it("renders loading, error retry, and not-found states without fixture fallback", async () => {
    const loading = mountDetail(undefined, "loading");
    expect(loading.attributes("aria-busy")).toBe("true");
    expect(loading.text()).toContain("正在整理文章內容");

    const error = mountDetail(undefined, "error");
    await error.get("button").trigger("click");
    expect(error.emitted("retry")).toHaveLength(1);
    expect(error.text()).toContain("文章內容暫時無法載入");

    const missing = mountDetail(undefined, "not-found");
    expect(missing.text()).toContain("找不到這篇文章");
    expect(missing.get(".article-state a").attributes("href")).toBe(
      "/articles",
    );
    expect(missing.findAll("h1")).toHaveLength(1);
  });
});

describe("article detail page", () => {
  const route = {
    params: { slug: "prototype-article-01" },
    path: "/articles/prototype-article-01",
  };
  const head = vi.fn();

  beforeEach(() => {
    head.mockReset();
    route.params.slug = "prototype-article-01";
    route.path = "/articles/prototype-article-01";
    vi.stubGlobal("useRoute", () => route);
    vi.stubGlobal("useHead", head);
    vi.stubGlobal("useFetch", () => ({
      data: ref(undefined),
      status: ref("success"),
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  function mountPage() {
    return mount(ArticleDetailPage, {
      global: {
        stubs: {
          SiteHeader: {
            props: ["alwaysVisible", "currentPath"],
            template:
              '<header data-site-header :data-current-path="currentPath" />',
          },
          SiteFooter: true,
          SiteFooterUnavailable: true,
          ArticleDetail: {
            props: ["content", "status"],
            template:
              '<div data-detail :data-title="content?.title" :data-status="status" />',
          },
        },
      },
    });
  }

  it("uses the shared shell, fixture slug, and article navigation state", () => {
    const wrapper = mountPage();
    expect(
      wrapper.get("[data-site-header]").attributes("data-current-path"),
    ).toBe("/articles");
    expect(wrapper.get("[data-detail]").attributes("data-status")).toBe(
      "ready",
    );
    expect(wrapper.get("[data-detail]").attributes("data-title")).toBe(
      articleDetailFixture.title,
    );
    expect(head).toHaveBeenCalledOnce();
  });

  it("maps unknown fixture slugs to not-found", () => {
    route.params.slug = "missing-article";
    route.path = "/articles/missing-article";
    const wrapper = mountPage();
    expect(wrapper.get("[data-detail]").attributes("data-status")).toBe(
      "not-found",
    );
    expect(
      wrapper.get("[data-detail]").attributes("data-title"),
    ).toBeUndefined();
  });
});
