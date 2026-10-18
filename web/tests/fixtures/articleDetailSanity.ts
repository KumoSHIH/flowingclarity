const sanityImage = (alt = "呼吸練習中的雙手與柔和光影") => ({
  src: "https://cdn.sanity.io/images/test/production/article.jpg",
  width: 1200,
  height: 800,
  alt,
  hotspot: { x: 0.4, y: 0.6 },
});

const block = (key: string, content: string, options: Record<string, unknown> = {}) => ({
  _key: key,
  _type: "block",
  style: "normal",
  children: [{ _key: `${key}-span`, _type: "span", text: content, marks: [] }],
  markDefs: [],
  ...options,
});

export const sanityArticleDetail = {
  id: "article-listening-body",
  title: "在安靜裡聽見身體回應",
  slug: "listening-body",
  excerpt: "從呼吸與支撐開始，記錄一段放慢速度、辨認身體細微感受的日常練習過程。",
  publishedAt: "2026-10-08T01:00:00.000Z",
  category: { key: "body", name: "愛身體", order: 1 },
  tags: [
    { slug: "breathing", name: "呼吸練習", order: 1 },
    { slug: "body-awareness", name: "身體覺察", order: 2 },
  ],
  heroStyle: "overlay",
  coverImage: sanityImage(),
  body: [
    {
      key: "opening",
      type: "articleRichTextSection",
      heading: "先感受此刻的支撐",
      content: [
        {
          ...block("opening-p", "停留在這個當下，閱讀練習說明。"),
          children: [
            { _key: "opening-plain", _type: "span", text: "停留在這個當下，", marks: [] },
            { _key: "opening-strong", _type: "span", text: "閱讀練習說明", marks: ["strong", "safe-link"] },
            { _key: "opening-end", _type: "span", text: "。", marks: [] },
          ],
          markDefs: [{ _key: "safe-link", _type: "link", href: "/course" }],
        },
        block("opening-list-1", "確認身體被支撐的位置", { listItem: "bullet", level: 1 }),
        block("opening-list-2", "讓呼吸保持自然", { listItem: "bullet", level: 1 }),
      ],
    },
    {
      key: "practice",
      type: "articleSplitMediaSection",
      heading: "把注意力帶回身體",
      mediaSide: "end",
      image: sanityImage("一雙手輕放在練習者肩膀上"),
      content: [block("practice-p", "每一次回應都可以保有自己的速度。")],
    },
    {
      key: "wide",
      type: "articleWideImageSection",
      image: sanityImage("窗邊安靜的練習空間"),
      caption: "自然光落在練習空間，圖片僅作內容示意。",
    },
  ],
  relatedArticles: [
    {
      id: "article-related-one",
      title: "從一口呼吸開始練習停留",
      slug: "begin-with-breath",
      excerpt: "透過簡單的呼吸觀察，練習在忙碌日常裡留下一點可以感受自己的時間與空間。",
      category: { key: "heart", name: "撫慰心", order: 2 },
      coverImage: sanityImage("一個人在窗邊安靜呼吸"),
    },
  ],
  seoTitle: "在安靜裡聽見身體回應｜Flowing Clarity",
  seoDescription: "從呼吸與支撐開始，透過一段日常練習辨認身體的細微回應，為自己的節奏留下一點安靜而完整的空間。",
  shareImage: sanityImage("文章分享用的安靜練習空間"),
};
