import type {
  ArticleCategory,
  ArticleCoverImage,
  ArticleTag,
} from "./articles";

export type ArticleDetailStatus = "ready" | "loading" | "error" | "not-found";
export type ArticleHeroStyle = "overlay" | "split";

export interface ArticleDetailImage extends ArticleCoverImage {
  objectPosition?: string;
}

export interface ArticleRichTextSegment {
  key: string;
  text: string;
  strong?: boolean;
  emphasis?: boolean;
  href?: string;
}

export interface ArticleRichTextLine {
  key: string;
  text: string;
  segments?: ArticleRichTextSegment[];
}

export type ArticleRichContentItem =
  | ({ type: "paragraph" } & ArticleRichTextLine)
  | ({ type: "heading"; level: 2 | 3 } & ArticleRichTextLine)
  | { key: string; type: "list"; style: "bullet" | "number"; items: ArticleRichTextLine[] };

export interface ArticleRichTextSection {
  key: string;
  type: "richTextSection";
  heading?: string;
  content: ArticleRichContentItem[];
}

export interface ArticleSplitMediaSection {
  key: string;
  type: "splitMediaSection";
  heading?: string;
  image: ArticleDetailImage;
  mediaSide: "start" | "end";
  content: ArticleRichContentItem[];
}

export interface ArticleWideImageSection {
  key: string;
  type: "wideImageSection";
  image: ArticleDetailImage;
  caption?: string;
}

export type ArticleDetailSection =
  ArticleRichTextSection | ArticleSplitMediaSection | ArticleWideImageSection;

export interface RelatedArticleItem {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  excerpt: string;
  coverImage: ArticleDetailImage;
}

export interface ArticleDetailContent {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category: ArticleCategory;
  tags: ArticleTag[];
  heroStyle: ArticleHeroStyle;
  coverImage?: ArticleDetailImage;
  body: ArticleDetailSection[];
  relatedArticles: RelatedArticleItem[];
  prototypeNotice?: string;
  seo?: {
    title?: string;
    description?: string;
    shareImage?: ArticleDetailImage;
  };
}

export type ArticleDetailApiResponse =
  | { state: "ready"; content: ArticleDetailContent }
  | { state: "empty" | "error"; content: null };
