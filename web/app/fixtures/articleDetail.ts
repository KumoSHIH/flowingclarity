import type {
  ArticleDetailContent,
  ArticleDetailImage,
  ArticleRichContentItem,
  RelatedArticleItem,
} from "#shared/types/articleDetail";
import type { ArticleTag } from "#shared/types/articles";
import { articleOverviewFixture } from "./articles";

const paperImage: ArticleDetailImage = {
  src: "/images/course-detail/facial-class.jpg",
  alt: "雙手進行觸碰練習的示意畫面",
  width: 1200,
  height: 800,
  objectPosition: "center",
};

const portraitImage: ArticleDetailImage = {
  src: "/images/course-detail/facial-portrait-4.jpg",
  alt: "人物臉部與自然光影的示意畫面",
  width: 900,
  height: 1200,
  objectPosition: "center 42%",
};

const roseImage: ArticleDetailImage = {
  src: "/images/generated/home-rose-atlas.png",
  alt: "玫瑰花瓣向外展開的圖像",
  width: 1600,
  height: 1000,
  objectPosition: "center",
};

const paragraphs = (prefix: string): ArticleRichContentItem[] => [
  {
    key: `${prefix}-1`,
    type: "paragraph",
    text: "停頓不是空白，也不是落後。它讓感受有時間完成，讓注意力不必急著離開。",
  },
  {
    key: `${prefix}-2`,
    type: "paragraph",
    text: "可以從最簡單的提問開始：現在有哪些地方被支撐？呼吸在哪裡比較容易發生？",
  },
  {
    key: `${prefix}-3`,
    type: "paragraph",
    text: "這些示意文字只用來驗證長文閱讀與換行，不代表正式服務說明或療效承諾。",
  },
];

const categories = new Map(
  articleOverviewFixture.categories.map((item) => [item.key, item]),
);
const tags = new Map(
  articleOverviewFixture.tags.map((item) => [item.slug, item]),
);
const stressTags: ArticleTag[] = [
  { slug: "breath", name: "呼吸練習", order: 6 },
  { slug: "boundaries", name: "身體界線", order: 7 },
  { slug: "daily-practice", name: "日常練習", order: 8 },
];

function related(index: number): RelatedArticleItem {
  const source = articleOverviewFixture.articles[index]!;
  return {
    id: source.id,
    title: source.title,
    slug: source.slug,
    category: categories.get(source.categoryKey)!,
    excerpt: source.excerpt,
    coverImage: index % 2 === 0 ? roseImage : portraitImage,
  };
}

export const articleDetailFixture: ArticleDetailContent = {
  id: "prototype-article-01",
  title: "在安靜裡，聽見身體的細微回應",
  slug: "prototype-article-01",
  excerpt:
    "一次練習，一段關於停留與感受的記錄。從呼吸開始，觀察當下的身體經驗。",
  publishedAt: "2026-10-08T09:00:00+08:00",
  category: categories.get("body")!,
  tags: [tags.get("craniosacral")!, tags.get("rebalance")!],
  heroStyle: "overlay",
  coverImage: roseImage,
  body: [
    {
      key: "opening",
      type: "richTextSection",
      heading: "圖片向頁面邊界延伸，文字維持穩定軸線",
      content: paragraphs("opening"),
    },
    {
      key: "listen",
      type: "splitMediaSection",
      heading: "把注意力留在身體裡",
      image: paperImage,
      mediaSide: "start",
      content: paragraphs("listen"),
    },
    {
      key: "pause",
      type: "richTextSection",
      heading: "讓停頓成為練習的一部分",
      content: paragraphs("pause"),
    },
    {
      key: "return",
      type: "splitMediaSection",
      heading: "從細節回到整體",
      image: portraitImage,
      mediaSide: "end",
      content: [
        ...paragraphs("return"),
        {
          key: "return-list",
          type: "list",
          style: "bullet",
          items: [
            { key: "return-list-1", text: "確認此刻的支撐" },
            { key: "return-list-2", text: "辨認可以停留的位置" },
            { key: "return-list-3", text: "讓回應保有自己的速度" },
          ],
        },
      ],
    },
    {
      key: "wide",
      type: "wideImageSection",
      image: paperImage,
      caption: "圖片與內容皆為前端版型驗證用示意素材。",
    },
  ],
  relatedArticles: [related(1), related(2), related(3), related(4), related(5)],
  prototypeNotice: "本頁文章、日期與圖片皆為版面及互動驗證用示意內容。",
};

export const splitArticleDetailFixture: ArticleDetailContent = {
  ...articleDetailFixture,
  id: "prototype-article-02",
  slug: "prototype-article-02",
  title: "為自己的節奏，留一點空白",
  heroStyle: "split",
  coverImage: portraitImage,
};

export const minimalArticleDetailFixture: ArticleDetailContent = {
  ...articleDetailFixture,
  id: "prototype-article-minimal",
  slug: "prototype-article-minimal",
  title: "只有文字，也能安靜地讀完",
  heroStyle: "split",
  coverImage: undefined,
  body: [
    {
      key: "text-only",
      type: "richTextSection",
      heading: "一段一段的文字",
      content: paragraphs("minimal"),
    },
  ],
  relatedArticles: [],
};

export const longArticleDetailFixture: ArticleDetailContent = {
  ...articleDetailFixture,
  id: "prototype-article-long",
  slug: "prototype-article-long",
  title: "在變動與未知同時發生的日子裡，練習辨認身體真正想要告訴自己的細微訊息",
  excerpt:
    "這是一段用來驗證一百四十字摘要與窄螢幕自然換行的示意內容。重要資訊不會被省略或裁切，文字會在不同寬度與放大比例下保有清楚、安定且可以逐行閱讀的節奏。",
  tags: [...tags.values(), ...stressTags],
  body: Array.from({ length: 30 }, (_, index) => ({
    key: `long-${index + 1}`,
    type: "richTextSection" as const,
    heading: `長文段落 ${index + 1}`,
    content: paragraphs(`long-${index + 1}`),
  })),
  relatedArticles: Array.from({ length: 8 }, (_, index) =>
    related((index + 1) % 20),
  ),
};

export function getArticleDetailFixture(
  slug: string,
): ArticleDetailContent | undefined {
  if (slug === splitArticleDetailFixture.slug) return splitArticleDetailFixture;
  if (slug === minimalArticleDetailFixture.slug)
    return minimalArticleDetailFixture;
  if (slug === longArticleDetailFixture.slug) return longArticleDetailFixture;
  const overview = articleOverviewFixture.articles.find(
    (item) => item.slug === slug && item.isPublished,
  );
  if (!overview) return undefined;
  return {
    ...articleDetailFixture,
    id: overview.id,
    slug: overview.slug,
    title: overview.title,
    excerpt: overview.excerpt,
    publishedAt: overview.publishedAt,
    category: categories.get(overview.categoryKey)!,
    tags: overview.tagSlugs
      .map((slugValue) => tags.get(slugValue))
      .filter((tag): tag is ArticleTag => Boolean(tag)),
    heroStyle:
      Number(overview.id.replace(/\D/g, "")) % 2 === 0 ? "split" : "overlay",
  };
}
