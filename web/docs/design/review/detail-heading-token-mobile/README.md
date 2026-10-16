# 詳情頁手機內容標題共用規則驗證

此目錄記錄 2026-10-16 將 `--detail-section-title-size` 手機值統一為 `26px` 後的 390px 跨頁驗證。範圍包含課程詳情、活動詳情（含共用學員心得）與執行師詳情；資料使用既有前端 fixture，只驗證排版，不代表正式內容已發布。

## 驗證結果

- `course-390-full.png` 為課程完整長頁；`course-intro-390.png` 與 `course-registration-390.png` 分別保留淺色長文及深色報名區的近距離證據。12 個內容 `h2` 均為 `26px / 32.5px`，最右界 368px；長標題可換兩行，頁面 `scrollWidth` 與 viewport 同為 390px。
- `event-390-full.png` 包含活動介紹、流程與共用學員心得。4 個內容 `h2` 均為 `26px / 36.4px`、寬 342px、右界 366px；一般標題與後續內容保持 22px 間距，心得標題的既有 34px 下內距與底線完整。
- `session-390-full.png` 包含執行師 Hero、資訊 rail、聯繫方式、完整介紹與經歷。兩個內容 `h2` 均為 `26px / 36.4px`、寬 342px、右界 366px，與後續內容保持 22px 間距。
- 三頁均以既有 Vue 元件與共用 CSS 在本機 Nuxt 頁面渲染，沒有水平溢位、文字裁切或標題互相遮擋。Web 34 個測試檔／190 項測試、typecheck 與 production build 同輪通過；Safari／Firefox 與實體裝置未在本輪重驗。
