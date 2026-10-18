import { describe, expect, it } from "vitest";
import { parseArticleDetail } from "../../shared/utils/articleDetail";
import { sanityArticleDetail } from "../fixtures/articleDetailSanity";

describe("article detail parser", () => {
  it("maps ordered semantic sections, safe rich text, images, and SEO", () => {
    const content = parseArticleDetail(
      structuredClone(sanityArticleDetail),
      "listening-body",
    );

    expect(content).toMatchObject({
      id: "article-listening-body",
      slug: "listening-body",
      heroStyle: "overlay",
      category: { key: "body", name: "愛身體" },
    });
    expect(content?.body.map((section) => section.type)).toEqual([
      "richTextSection",
      "splitMediaSection",
      "wideImageSection",
    ]);
    expect(content?.coverImage?.objectPosition).toBe("40% 60%");
    const textSection = content?.body[0];
    expect(textSection?.type).toBe("richTextSection");
    if (textSection?.type === "richTextSection") {
      expect(textSection.content[0]).toMatchObject({
        type: "paragraph",
        segments: expect.arrayContaining([
          expect.objectContaining({
            text: "閱讀練習說明",
            strong: true,
            href: "/course",
          }),
        ]),
      });
      expect(textSection.content[1]).toMatchObject({
        type: "list",
        style: "bullet",
        items: expect.arrayContaining([
          expect.objectContaining({ text: "確認身體被支撐的位置" }),
        ]),
      });
    }
    expect(content?.seo?.shareImage?.src).toContain("cdn.sanity.io");
  });

  it("drops invalid, duplicate, and self-related entries without filling replacements", () => {
    const value = structuredClone(sanityArticleDetail);
    value.relatedArticles = [
      value.relatedArticles[0]!,
      value.relatedArticles[0]!,
      { ...value.relatedArticles[0]!, id: value.id, slug: value.slug },
      { ...value.relatedArticles[0]!, id: "article-no-image", coverImage: undefined as never },
    ];
    expect(parseArticleDetail(value)?.relatedArticles).toHaveLength(1);
  });

  it("rejects invalid published core content and unsafe rich-text links", () => {
    expect(
      parseArticleDetail({ ...sanityArticleDetail, body: [] }),
    ).toBeNull();
    expect(
      parseArticleDetail({ ...sanityArticleDetail, coverImage: undefined }),
    ).toBeNull();
    expect(
      parseArticleDetail(sanityArticleDetail, "different-slug"),
    ).toBeNull();

    const unsafe = structuredClone(sanityArticleDetail);
    const section = unsafe.body[0]!;
    if ("content" in section) {
      section.content[0]!.markDefs[0]!.href = "javascript:alert(1)";
    }
    expect(parseArticleDetail(unsafe)).toBeNull();
  });

  it("supports split articles without a cover and omits malformed optional SEO", () => {
    const content = parseArticleDetail({
      ...sanityArticleDetail,
      heroStyle: "split",
      coverImage: undefined,
      seoTitle: "short",
      seoDescription: "short",
      shareImage: { src: "https://example.com/image.jpg" },
    });
    expect(content?.coverImage).toBeUndefined();
    expect(content?.seo).toBeUndefined();
  });
});
