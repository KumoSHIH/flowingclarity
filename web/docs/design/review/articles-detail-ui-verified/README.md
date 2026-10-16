# 文章詳情 UI 行為驗收

本目錄記錄 `verify-ui-behavior` 階段的最終 Chromium 證據。驗收使用 fixture 驅動的 `/articles/[slug]`，不代表 Sanity schema、正式 API、草稿隔離或發布流程已完成。

## 驗收結果

320、390、768、1023、1024、1440px，以及 720px（1440px／200% 文字縮放等效）均無水平溢位。所有 ready 頁只有一個 `h1`，正文 computed line-height 為 `33.6px`；內容 `h2` 在 `<=1023px` 為 26px、桌機為 38px。互動控制至少 44px，圖片都有 alt；正文、資訊標籤、相關分類與示範聲明對比分別為 6.22、5.31、6.44、5.33:1。

Swiper 以真實鍵盤 Enter 驗證：切換後 transform、live region、disabled 狀態與可進入 Tab 的單張手機卡片同步；抵達第 5 篇後下一步停用。不可見卡片不進入 Tab 或輔助技術閱讀順序。SSR 無 JavaScript 時不輸出控制或隱藏屬性，5 篇推薦改為完整響應式網格且連結皆可使用。一般 transition 為 1.5s，`prefers-reduced-motion` 為 0s。已知與未知 slug 分別回應 200 與 404。

## 修正與證據

本輪修正 carousel 漸進增強、路由內容切換索引重設、狀態播報、reduced-motion specificity、SVG 箭頭及非首屏圖片 lazy loading。`overlay-1440.png`、`overlay-390.png`、`split-390.png` 為最終完整頁；`metrics.json` 保存可重跑量測，腳本位於 `web/scripts/captureArticleDetailValidation.mjs`。

Impeccable detector 為 0 個反模式；20 個 advisory 經核對為核准的文章角色字級與既有 Header 半透明色階。Audit Health Score 為 19/20：Accessibility 4、Performance 4、Responsive 4、Theming 3、Implementation Integrity 4。Web 35 個測試檔／199 項測試、typecheck、production build 與 `git diff --check` 通過；僅保留既知 Volar、字型與 sourcemap 警告。狀態更新為 `ui-verified`，下一階段為 `integrate-sanity-content`。
