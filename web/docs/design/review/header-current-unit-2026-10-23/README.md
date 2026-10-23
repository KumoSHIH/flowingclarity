# Header 目前單元驗證

2026-10-23 以本機 Nuxt 開發環境與 Chrome Headless 驗證 Header 目前單元下底線。桌機使用 1440 × 900，手機使用 390 × 844；檢查 `/events`、`/course`、`/session` 的總覽與 fixture 詳情路由。

## 結果

- 六個路由各只有一個 `aria-current="page"`，文字分別為「近期活動」「課程探索」「個案諮詢」，計算後 `text-decoration-line` 均為 `underline`。
- 桌機 Header 可見且沒有水平溢位；[桌機截圖](desktop-events.png) 顯示「近期活動」下底線。
- 手機展開選單後，`aria-expanded="true"`、導覽可見、背景捲動鎖定，焦點移至第一個項目；[手機截圖](mobile-events-menu.png) 顯示目前單元下底線與焦點框。
- 完整 DOM 量測保存在 [metrics.json](metrics.json)。本次未執行 Safari、Firefox、實體觸控裝置或螢幕閱讀器驗證。
