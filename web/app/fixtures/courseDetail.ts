import type {
  CourseDetailContent,
  CourseDetailGalleryItem,
} from "../types/courseDetail";

const image = (
  filename: string,
  alt: string,
  label = "舊站影像／設計示意",
) => ({
  src: `/images/course-detail/${filename}`,
  alt,
  label,
});

const galleryItems: CourseDetailGalleryItem[] = [
  {
    key: "support",
    group: "第一階",
    title: "建立觸碰的基礎語彙",
    description:
      "先確認頸部支撐，再開始臉部操作；觀察接受者是否能維持自然呼吸。",
    image: image("facial-class.jpg", "臉部與肩頸觸碰練習示意"),
    points: ["辨認肩頸、臉部與頭部的支撐關係", "練習手掌貼合、移動速度與壓力變化"],
  },
  {
    key: "pace",
    group: "第一階",
    title: "看見表情與節奏",
    description: "由局部觀察表情與兩側差異，不急著判斷或修正。",
    image: image("facial-portrait-4.jpg", "人物臉部局部觀察示意"),
    points: ["在操作中觀察呼吸與肌肉反應", "建立清楚的開始、轉換與結束節奏"],
  },
  {
    key: "response",
    group: "第二階",
    title: "從固定步驟走向回應",
    description: "根據張力、呼吸與回饋調整次序、力道與停留時間。",
    image: image("facial-portrait-3.jpg", "眼部局部觀察練習示意"),
    points: ["比較左右兩側張力與活動差異", "辨認需要停留或減輕力道的訊號"],
  },
  {
    key: "integration",
    group: "第三階",
    title: "把局部放回完整個案",
    description: "把技巧放回溝通與同意之中，建立可說明也能因人調整的流程。",
    image: image("facial-portrait-7.jpg", "人物肖像與完整個案觀察示意"),
    points: ["建立課前溝通、操作與課後回饋", "尊重個別差異，不以固定效果作承諾"],
  },
];

export const courseDetailFixture: CourseDetailContent = {
  slug: "japanese-facial-massage",
  notice: "本頁為前端示範內容；日期、師資與報名資訊正式發布前仍需核准。",
  hero: {
    title: "日式回春\n面部按摩",
    englishTitle: "Japanese Facial Massage",
    summary:
      "從觸碰、呼吸與細微觀察開始，學習一套能回到完整個案的面部按摩方法。",
    image: image("facial-class.jpg", "日式面部按摩課堂操作示意"),
    meta: [
      { label: "形式", value: "實體課程" },
      { label: "地點", value: "高雄・待確認" },
      { label: "時間", value: "三階段・日期待確認" },
      { label: "狀態", value: "報名尚未開放" },
    ],
    actionLabel: "報名資訊待確認",
  },
  body: [
    {
      key: "introduction",
      type: "introduction",
      title: "不是矯正，\n而是聽見身體。",
      lead: "按摩不只是一連串手法。課程從操作者如何站立、呼吸與接觸開始，讓技巧建立在清楚的支持與界線上。",
      paragraphs: [
        "你會練習觀察臉部、肩頸與呼吸之間的關係，也學習如何依照當下反應調整速度、力道與停留時間。",
        "所有內容皆為課程結構示意，不宣稱固定效果；正式師資資格、課程時數與參與條件仍待內容負責人核准。",
      ],
    },
    {
      key: "collage",
      type: "gallery",
      title: "從觀看，到親手辨認。",
      description: "每組圖文可使用不同閱讀節奏，並穿插在課程內容需要的位置。",
      layout: "collage",
      note: "適合方法介紹、品牌形象與情緒建立。",
      statement: "觸碰不是矯正；是讓身體感覺自己被聽見。",
      items: galleryItems,
    },
    {
      key: "teacher",
      type: "teacher",
      name: "威珀爾",
      englishName: "Vipal Robert Cohen",
      lead: "從心理學、靜心與身體工作出發，將日式面部按摩帶入跨文化的教學實踐。",
      biography: "本區保留長文空間，讓資格、方法來源與生命經歷可以被完整閱讀；肖像未核准前不以其他人物照片代替。姓名與經歷正式發布前仍須確認。",
    },
    {
      key: "quote",
      type: "quote",
      text: "當我們慢下來、靜下來，不是去矯正，而是陪伴與傾聽。",
      attribution: "內容結構示意・正式發布前須取得核准",
    },
    {
      key: "stages",
      type: "gallery",
      title: "讓每個階段都有位置。",
      description: "依學習階段整理影像與方法，讓內容順序更清楚。",
      layout: "stages",
      note: "適合把案例或技法對應到學習階段。",
      items: galleryItems,
    },
    {
      key: "curriculum",
      type: "curriculum",
      title: "三階段，讓技巧成為一種覺察。",
      description: "每一階都能展開閱讀；預設只開啟第一階，避免長篇課綱一次淹沒讀者。",
      units: [
        { key: "foundation", stage: "第一階", title: "日式回春面部按摩初級班", description: "學習健康與美麗的觀念、面部按摩技巧、頸前區按摩，以及手工淋巴引流技巧。" },
        { key: "advanced", stage: "第二階", title: "高級班：整合完整個案", description: "深化面部、後頸、頭部與頭皮技巧，整合前兩階段並建立完整個案流程。" },
        { key: "integration", stage: "第三階", title: "除皺指壓與能量激活", description: "認識面部經絡、穴位與指壓步驟，以溫和方式支持臉部能量流動。" },
      ],
    },
    {
      key: "video",
      type: "video",
      title: "先看見碰觸的節奏，再決定是否走進課堂。",
      statusLabel: "課程影片待上架",
      image: image("facial-class.jpg", "課程影片封面示意"),
    },
    {
      key: "weave",
      type: "gallery",
      title: "圖像與文字交錯前進。",
      description: "讓每個方法都有完整說明、重點與代表圖片。",
      layout: "weave",
      note: "適合每個階段都有完整說明、條列與代表圖片。",
      items: galleryItems.slice(0, 3),
    },
    {
      key: "audience",
      type: "audience",
      title: "這門課\n適合誰",
      description: "不需要按摩基礎。課程以大量親手操練，支持你把所學帶回日常照顧或專業工作。",
      items: [
        "對美與按摩感興趣，想學習完整手法的人",
        "希望深化觸碰品質的美容師與身體工作者",
        "想在照顧他人的同時，也練習與自己相處的人",
      ],
    },
    {
      key: "testimonials",
      type: "testimonials",
      title: "學員心得分享",
      items: [
        { text: "這段示意文字用來確認課程頁能以共用元件呈現經核准的學員分享。", sharerName: "測試分享者" },
      ],
    },
    {
      key: "practice-carousel",
      type: "carousel",
      title: "在練習之間，看見方法如何落地。",
      text: "圖片可以依課程內容排序，右側文字在切換時維持固定，讓閱讀者專注比較不同練習片段。",
      items: galleryItems.slice(0, 3).map(item => ({ id: item.key, image: item.image, caption: item.title })),
    },
    {
      key: "folio",
      type: "gallery",
      title: "把練習整理成一冊。",
      description: "以錯落圖冊承載完整導言與較長的圖文內容。",
      layout: "folio",
      note: "適合完整導言搭配多張操作圖與長圖說。",
      items: galleryItems,
    },
    {
      key: "dossier",
      type: "gallery",
      title: "把方法拆成可查閱的檔案。",
      description: "讓密集內容保有索引、條列與大幅情境影像。",
      layout: "dossier",
      note: "適合內容密集、需要條列細項與大幅情境照片的培訓。",
      statement: "技法提供路徑；覺察決定每一步如何發生。",
      items: galleryItems.slice(0, 3),
    },
  ],
  schedule: {
    title: "把參與條件看清楚，再安心決定。",
    description: "日期、地點與時間取自舊站內容作版面示意；正式發布前需由內容負責人確認。",
    sessions: [
      {
        key: "kaohsiung-foundation",
        title: "高雄・第一階",
        status: "日期待確認",
        location: "高雄・普那生活空間",
        stages: [],
        details: [
          { label: "上課時間", value: "舊站時間 09:30–18:30" },
          { label: "招生資訊", value: "地點、名額與費用待確認" },
        ],
      },
      {
        key: "kaohsiung-advanced",
        title: "高雄・第二階",
        status: "尚未開放",
        location: "高雄・普那生活空間",
        stages: [],
        details: [
          { label: "參與條件", value: "需完成第一階" },
          { label: "招生資訊", value: "日期、名額與報名狀態待發布" },
        ],
      },
    ],
  },
  registration: {
    title: "為自己留下一段完整的學習時間。",
    description: "報名連結與本期招生資訊尚未核准，因此不顯示假價格、倒數或可點擊的報名連結。",
    actionLabel: "報名資訊待確認",
    image: image("facial-portrait-1.jpg", "人物臉部特寫示意"),
  },
  relatedArticles: [{
    id: "article-course-related",
    title: "從呼吸開始整理觸碰的節奏",
    slug: "breath-and-touch",
    excerpt: "以一段完整文章整理呼吸、支撐與觸碰之間的關係，作為進入課程前的延伸閱讀。",
    category: { key: "body", name: "愛身體", order: 1 },
    coverImage: { src: "/images/course-detail/facial-class.jpg", alt: "肩頸支撐與觸碰練習", width: 1200, height: 900 },
  }],
};

export const longCourseDetailFixture: CourseDetailContent = {
  ...courseDetailFixture,
  slug: "long-form-course",
  body: courseDetailFixture.body.map((block) => block.type === "introduction"
    ? { ...block, paragraphs: [...block.paragraphs, ...block.paragraphs] }
    : block),
};

export const minimalCourseDetailFixture: CourseDetailContent = {
  ...courseDetailFixture,
  slug: "minimal-course",
  body: courseDetailFixture.body.filter((block) =>
    !["teacher", "quote", "video", "testimonials", "carousel"].includes(block.type)
    && (block.type !== "gallery" || block.key === "collage")),
  registration: { ...courseDetailFixture.registration, image: undefined },
  relatedArticles: [],
};

export const emptyCourseDetailFixture: CourseDetailContent = {
  ...minimalCourseDetailFixture,
  slug: "empty-course",
  body: minimalCourseDetailFixture.body.map((block) => {
    if (block.type === "gallery") return { ...block, items: [] };
    if (block.type === "curriculum") return { ...block, units: [] };
    if (block.type === "audience") return { ...block, items: [] };
    return block;
  }),
  schedule: { ...minimalCourseDetailFixture.schedule, sessions: [] },
};

export const courseDetailFixtures: Record<string, CourseDetailContent> = {
  [courseDetailFixture.slug]: courseDetailFixture,
  [longCourseDetailFixture.slug]: longCourseDetailFixture,
  [minimalCourseDetailFixture.slug]: minimalCourseDetailFixture,
  [emptyCourseDetailFixture.slug]: emptyCourseDetailFixture,
};
