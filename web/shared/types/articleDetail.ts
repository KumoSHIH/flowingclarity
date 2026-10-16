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

export type ArticleRichContentItem =
  | { key: string; type: "paragraph"; text: string }
  | { key: string; type: "heading"; level: 2 | 3; text: string }
  | { key: string; type: "list"; style: "bullet" | "number"; items: string[] };

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
