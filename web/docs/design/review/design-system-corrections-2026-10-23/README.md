# Design System 修正驗證

日期：2026-10-23

## 範圍

依 `docs/specs/design-system.md` 待修正清單，驗證固定桌機／手機字級、主要按鈕尺寸與一般字重、可點擊內容標題 hover／focus 色彩，以及響應式版面是否溢位。Chrome 量測 `/`、`/course`、`/events`、`/session`、`/articles`。

## 結果

- 1440 × 1000、1023 × 900、390 × 844 共 15 組頁面／斷點皆無水平溢位。
- 首頁與活動主要 CTA computed style：桌機 `18px / 400`，平板及手機 `14px / 400`。
- 所有可見原生按鈕、主要 CTA 及其文字後代均未出現 `600` 以上字重。
- 活動標題由 `rgb(56, 52, 46)` 切換為 hover／focus `rgb(164, 107, 84)`；兩者皆引用同一 `--interactive-title-hover` 語意 token，focus outline 為可見 `solid`。
- 自動化原始量測見 [`browser-validation.json`](browser-validation.json)；代表截圖包含桌機首頁、桌機活動 hover、1023px 課程及 390px 執行師列表。

## 尚未執行

Safari／Firefox、實體觸控裝置、瀏覽器文字放大與螢幕閱讀器未於本輪驗證，不記為完成。
