# 文章詳情桌機設計方向

2026-10-15 依 [`articles-detail.md`](../../../specs/articles-detail.md) 製作三款 1440px 桌機比較稿，入口為 [`articles-detail-concepts.html`](../../articles-detail-concepts.html)。三案使用相同示意內容、正文區塊與相關文章資料，方便只比較構圖；所有文字與圖片皆非正式發布素材。

## 三款方向

- A「潮汐章頁」：以大面積章節色場、滿版圖片與交替圖文建立沉浸式長卷，適合圖片份量較高的敘事文章。
- B「頁邊星圖」：使用 sticky 頁邊導讀與穩定正文欄，圖片可突破欄寬，最適合長篇、章節清楚的閱讀情境。
- C「雙頁書冊」：以左右書頁、十二欄格線與頁邊圖說建立編輯刊物感，圖文比重最均衡。

三案均包含共用 Header／Footer、麵包屑、文章分類與標籤、標題、摘要、日期、左／右圖文、大圖圖說及 3 筆延伸閱讀 swiper 靜態狀態。設計刻意不包含手機版；待選定方向後才依流程延伸響應式構圖。

## 驗證證據

- 首屏：[`a-1440.png`](a-1440.png)、[`b-1440.png`](b-1440.png)、[`c-1440.png`](c-1440.png)
- 完整頁：[`a-1440-full.png`](a-1440-full.png)、[`b-1440-full.png`](b-1440-full.png)、[`c-1440-full.png`](c-1440-full.png)
- Chrome headless 以 1440 × 1100 及 1440 × 4300、強制 reduced-motion 渲染；三案圖片、字型、選案 query 與完整頁內容均成功載入。
- Impeccable detector 已執行一次；已修正實質文字對比、功能文字小於 11px 及正文寬字距。剩餘 cramped-padding 為跨欄色場的結構性誤判，字級提示為本比較器與頁面專屬編排，未提升為全站 token。
- 完整審查後補齊三案的兩種圖文方向、延伸閱讀主要分類與 SVG 控制圖示，並將未在契約內的 pull quote／章節目錄改為合法正文與單一閱讀位置標記；第二輪對比回歸修正完成，最終 disposition 為 `ship`。

目前未選案，規格維持 `draft`，未製作手機稿、Vue 元件或 Sanity schema。
