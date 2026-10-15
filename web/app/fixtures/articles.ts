import type {
  ArticleCategoryKey,
  ArticleOverviewContent,
  ArticleOverviewItem,
} from '#shared/types/articles'

const articleSeeds: Array<[
  string,
  string,
  ArticleCategoryKey,
  string[],
  string,
]> = [
  ['在安靜裡，聽見身體的細微回應', '一次練習，一段關於停留與感受的記錄。從呼吸開始，觀察當下的身體經驗。', 'body', ['craniosacral'], '10-08'],
  ['為自己的節奏，留一點空白', '閱讀日常裡的選擇與停頓，讓理解成為一種緩慢而持續的練習。', 'life', ['human-design'], '09-26'],
  ['從關係之間，看見自己的位置', '整理一段關於關係的觀察，練習在靠近與保留之間，找到適合自己的距離。', 'heart', ['family-constellations'], '09-12'],
  ['觸碰之前，先回到自己的呼吸', '照顧者也需要被身體承接。從呼吸與重量開始，重新辨認此刻真正需要的速度。', 'body', ['rebalance', 'craniosacral'], '08-30'],
  ['理解天賦，不急著成為答案', '人類圖可以是一張觀察地圖，而不是限制自己的標籤；保留經驗，也保留重新理解的空間。', 'life', ['human-design'], '08-17'],
  ['讓臉部鬆開，也讓表情回來', '當手的節奏慢下來，臉部不只獲得放鬆，也重新找回細微而真實的表情。', 'beauty', ['facial'], '08-02'],
  ['當情緒有了可以停靠的位置', '不急著分析情緒的原因，先辨認它在身體裡的形狀、溫度與移動方向。', 'heart', ['rebalance'], '07-21'],
  ['在支持與放手之間練習', '身體工作不是替另一個人完成改變，而是提供足夠的支持，讓經驗自己展開。', 'body', ['craniosacral', 'rebalance'], '07-05'],
  ['那些重複出現的家族語句', '從熟悉的語句與角色裡，辨認自己承接了什麼，又有哪些選擇可以慢慢歸還。', 'heart', ['family-constellations'], '06-22'],
  ['美不是修正，而是更靠近自己', '保養可以不是修正缺點，而是一段重新感受輪廓、觸感與生命力的時間。', 'beauty', ['facial', 'rebalance'], '06-08'],
  ['允許決定在身體裡成熟', '當答案還不清楚時，先給身體一點時間；不把立即回應誤認成唯一的誠實。', 'life', ['human-design', 'rebalance'], '05-25'],
  ['頭薦骨工作中的安靜是什麼', '安靜不是什麼都不做，而是讓注意力足夠穩定，聽見更細緻的變化。', 'body', ['craniosacral'], '05-11'],
  ['不替關係找到標準答案', '關係裡的工作不是分辨誰對誰錯，而是看見彼此所站的位置與背後的需要。', 'heart', ['family-constellations', 'human-design'], '04-27'],
  ['一張圖之外，仍然是生活', '理解自己的設計之後，真正的練習仍然發生在每天的選擇、關係與休息之中。', 'life', ['human-design'], '04-13'],
  ['雙手所知道的細節', '觸碰帶來的訊息常常早於語言。練習辨認壓力、溫度與組織回應，讓雙手保持提問。', 'beauty', ['facial', 'craniosacral'], '03-30'],
  ['重新感受腳下的重量', '從站立與步伐開始，找回重量如何被地面承接，也找回行動之前的穩定。', 'body', ['rebalance'], '03-16'],
  ['把不屬於自己的責任放回去', '看見責任的來源，不代表切斷關係；有時只是讓每個人重新回到適合的位置。', 'heart', ['family-constellations'], '03-02'],
  ['在鏡子前少一點評分', '試著不急著為外貌打分數，先看見今天的疲倦、光線，以及臉上正在發生的故事。', 'beauty', ['facial'], '02-17'],
  ['不是每一種累都需要撐過去', '疲累可能是身體傳來的界線。理解它，不是放棄前進，而是重新選擇可持續的方式。', 'life', ['rebalance', 'human-design'], '02-04'],
  ['陪伴改變，也陪伴沒有改變', '有些經驗會立即鬆動，有些只留下很小的空間；陪伴兩者都需要耐心。', 'heart', ['craniosacral'], '01-24'],
  ['練習看見自己的輪廓', '從觸感與視線重新認識身體，不以比較為起點，也不把美交給單一標準。', 'beauty', ['facial', 'rebalance'], '01-17'],
  ['選擇之前，先辨認內在的聲音', '外界有許多建議，身體也有自己的節奏；練習分辨兩者，讓選擇多一點餘裕。', 'life', ['human-design'], '01-10'],
  ['關係裡的靠近，不必失去自己', '靠近不等於取消界線。當自己能被保留，關係也可能有更自由的呼吸。', 'heart', ['family-constellations', 'rebalance'], '01-05'],
  ['從一個溫柔的日常開始', '照顧不一定需要完整計畫；一段有意識的呼吸、一杯水，也能成為回到身體的入口。', 'body', ['craniosacral', 'rebalance'], '01-01'],
]

function makeArticle(
  seed: typeof articleSeeds[number],
  index: number,
): ArticleOverviewItem {
  const [title, excerpt, categoryKey, tagSlugs, date] = seed
  const id = String(index + 1).padStart(2, '0')
  return {
    id: `prototype-article-${id}`,
    title,
    slug: `prototype-article-${id}`,
    categoryKey,
    tagSlugs,
    excerpt,
    publishedAt: `2026-${date}T09:00:00+08:00`,
    isPublished: true,
  }
}

export const articleOverviewFixture: ArticleOverviewContent = {
  pageTitle: '文章分享',
  intro: '從身體的感受出發，記錄練習與理解。\n在閱讀之間，慢慢靠近自己的節奏。',
  allLabel: '全部文章',
  tagFilterLabel: '相關標籤',
  resultsHeading: '最新文章',
  emptyMessage: '目前還沒有已發布的文章，請稍後再回來看看。',
  noMatchesMessage: '目前沒有符合這組條件的文章，可以調整或清除篩選。',
  prototypeNotice: '本頁文章、日期與圖片皆為版面及互動驗證用示意內容。',
  categories: [
    { key: 'body', name: '愛身體', order: 1 },
    { key: 'heart', name: '撫慰心', order: 2 },
    { key: 'life', name: '究生命', order: 3 },
    { key: 'beauty', name: '展現美', order: 4 },
  ],
  tags: [
    { slug: 'craniosacral', name: '頭薦骨', order: 1 },
    { slug: 'rebalance', name: '再平衡按摩', order: 2 },
    { slug: 'human-design', name: '人類圖', order: 3 },
    { slug: 'family-constellations', name: '家族系統排列', order: 4 },
    { slug: 'facial', name: '日式臉部按摩', order: 5 },
  ],
  articles: [
    ...articleSeeds.map(makeArticle),
    {
      ...makeArticle(articleSeeds[0]!, 99),
      id: 'prototype-unpublished',
      slug: 'prototype-unpublished',
      isPublished: false,
    },
  ],
}

export const emptyArticleOverviewFixture: ArticleOverviewContent = {
  ...articleOverviewFixture,
  articles: [],
}

export const missingOptionalArticleOverviewFixture: ArticleOverviewContent = {
  ...articleOverviewFixture,
  articles: articleOverviewFixture.articles.map((article, index) => index === 0
    ? { ...article, coverImage: undefined }
    : article),
}

export const longArticleOverviewFixture: ArticleOverviewContent = {
  ...articleOverviewFixture,
  tags: [
    ...articleOverviewFixture.tags,
    { slug: 'long-topic', name: '在日常關係裡練習溫柔而清楚地表達', order: 6 },
  ],
  articles: articleOverviewFixture.articles.map((article, index) => index === 0
    ? {
        ...article,
        title: '在變動與未知同時發生的日子裡，練習辨認身體真正想要告訴自己的細微訊息',
        excerpt: '這是一段用來驗證長內容如何在版面中自然換行的示意摘要。我們不急著縮短重要資訊，也不以省略號隱藏內容，而是讓文字在不同寬度與放大比例下，仍然保有清楚、安定且可以逐行閱讀的節奏。',
        tagSlugs: [...article.tagSlugs, 'long-topic'],
      }
    : article),
}
