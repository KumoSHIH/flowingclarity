import { createClient } from "@sanity/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sanityArticleDetail } from "../fixtures/articleDetailSanity";

const { fetchMock, routerParamMock, responseStatusMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  routerParamMock: vi.fn(() => "listening-body"),
  responseStatusMock: vi.fn(),
}));
vi.mock("@sanity/client", () => ({
  createClient: vi.fn(() => ({ fetch: fetchMock })),
}));
vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
vi.stubGlobal("getRouterParam", routerParamMock);
vi.stubGlobal("setResponseStatus", responseStatusMock);
vi.stubGlobal("useRuntimeConfig", () => ({
  sanityProjectId: "test-project-id",
  sanityDataset: "production",
}));
const { articleDetailQuery, default: getArticleDetail } = await import(
  "../../server/api/article-detail/[slug].get"
);

describe("article detail API", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    routerParamMock.mockReset();
    responseStatusMock.mockReset();
    routerParamMock.mockReturnValue("listening-body");
    vi.mocked(createClient).mockClear();
  });

  it("queries the published perspective and returns parsed article content", async () => {
    fetchMock.mockResolvedValue(structuredClone(sanityArticleDetail));
    expect(await getArticleDetail({} as never)).toMatchObject({
      state: "ready",
      content: { slug: "listening-body" },
    });
    expect(articleDetailQuery).toContain('slug.current == $slug');
    expect(articleDetailQuery).toContain('"relatedArticles": relatedArticles[]->');
    expect(fetchMock).toHaveBeenCalledWith(articleDetailQuery, {
      slug: "listening-body",
    });
    expect(vi.mocked(createClient).mock.calls[0]?.[0]).toMatchObject({
      perspective: "published",
      useCdn: false,
    });
  });

  it("returns 404 empty states for missing and invalid slugs", async () => {
    fetchMock.mockResolvedValue(null);
    expect(await getArticleDetail({} as never)).toEqual({
      state: "empty",
      content: null,
    });
    expect(responseStatusMock).toHaveBeenCalledWith(expect.anything(), 404);
    routerParamMock.mockReturnValue("../drafts.article");
    expect(await getArticleDetail({} as never)).toEqual({
      state: "empty",
      content: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns error for invalid published data and read failures", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({ ...sanityArticleDetail, body: [] });
    expect(await getArticleDetail({} as never)).toEqual({
      state: "error",
      content: null,
    });
    fetchMock.mockRejectedValue(new Error("unavailable"));
    expect(await getArticleDetail({} as never)).toEqual({
      state: "error",
      content: null,
    });
  });
});
