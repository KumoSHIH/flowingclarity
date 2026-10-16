# 文章詳情選定方向桌機與手機稿

目錄與原型檔名保留早期的 `selected-desktop` 命名，但 [`articles-detail-selected-desktop.html`](../../articles-detail-selected-desktop.html) 現在是桌機與響應式手機共用的設計參考，不只代表桌機版本。

本稿整合使用者選定的桌機方向：首區固定使用 A 的暖砂文章資訊牌，右側由後台 `heroStyle` 選擇 `overlay` 橫圖滿版遮罩或 `split` 右側圖片窗；兩者的橫式圖片都使用 `cover` 置中裁切。正文沿用 B 的圖片破邊與固定文字軸線，移除所有段落分隔線。

正文另包含一組純文字 `richTextSection`：章節標題下接三個連續段落，與圖文區塊共用 `16px / 2.1` 正文字級與約 `68ch` 行寬。原型以 `--paragraph-gap: 0px` 移除相鄰段落的額外 margin，因此段落內換行與段落之間都維持相同的 computed `33.6px` 基線節奏；正文區塊 row gap 在桌機為 `96px`、手機為 `64px`。手機內容章節與延伸閱讀標題統一為 `26px`，`.edge-body` 上內距為 `0`。

延伸閱讀沿用頁面暖紙底，不顯示日期或卡片底板；每筆顯示圖片、分類、完整標題、最多兩行摘要及閱讀按鈕。手動切換位移使用 `1500ms`，reduced motion 下停用動畫。比較稿可直接以 `?hero=overlay` 與 `?hero=split` 開啟兩種首區。

桌機方向、純文字版型與 390px 手機方向均已確認，包含兩種 Hero、單欄圖文、純文字、滿寬圖、單張 swiper，以及 `split` 無代表圖＋無相關文章狀態。後續 Nuxt fixture 原型與最大長度壓力測試已完成，證據位於 [`articles-detail-frontend-prototype`](../articles-detail-frontend-prototype/README.md)；Sanity schema 與正式內容尚未開始。

## 最終結論

Finish review disposition 為 `ship`：既有 6 項發現均已解決；純文字版型、統一段落節奏、390px 手機，以及缺少代表圖／無相關文章狀態也已完成 finish review。使用者已允許接續，規格現為 `frontend-ready`；下一階段是正式 Nuxt 原型的 UI 行為驗收。

## 素材與驗證

`paper-thread.png` 與 `clay-breath.png` 為本專案針對文章詳情概念稿生成的示意素材；完整生成描述保存在同目錄的 `paper-thread.prompt.txt` 與 `clay-breath.prompt.txt`，PNG 亦已嵌入 prompt provenance。它們只用於版型與裁切驗證，不代表正式文章圖片。

本輪 source review disposition 初次為 `fix`，已修正滿版 Hero 圖片的替代文字、可操作的 swiper 前後控制與 live-region 回饋，以及「右側圖片窗」命名。靜態 detector 已執行一次，並修正 11px 小字與非既有 disabled 色票；依 bounded-pass 規則未執行第二次 detector。

Safari WebDriver 因本機尚未啟用 Allow Remote Automation，改以一次性 Chromium 補拍。2026-10-16 最新桌機 `overlay-1440.png`、`split-1440.png` 為 1440 × 1100 首屏，兩張 `*-1440-full.png` 皆為 1440 × 4289 完整長頁。手機 `overlay-390.png`、`split-390.png` 為 390 × 844 首屏；`overlay-390-full.png` 為 390 × 4353、`split-390-full.png` 為 390 × 4477；`split-no-cover-no-related-390-full.png` 為 390 × 3417。人工檢視確認 Hero、純文字段落、破邊正文、滿寬圖、延伸閱讀與 Footer 均完整出現。

真實瀏覽器量測確認桌機與手機 7 個正文段落的 computed line-height 均為 `33.6px`（`16px × 2.1`），3 個連續段落的 margin-top 均為 `0px`；正文區塊 row-gap 桌機為 `96px`、手機為 `64px`。1440px 與 390px 的 `scrollWidth` 均等於 viewport，沒有頁面水平溢位。三個麵包屑項目在 390px 的中心點皆為 `180px`、在 1440px 皆為 `213px`；`.edge-body` computed `padding-top` 為 `0px`。手機內容章節與延伸閱讀標題皆為 `26px`，桌機維持 `38px`。swiper transition duration 為 `1.5s`，reduced motion 為 `0s`；手機卡片與 viewport 同為 `342px`，點擊下一筆後 live region 顯示「目前顯示第 2 篇，共 5 篇」。行動版選單可切換 `aria-expanded` 並顯示導覽；缺圖／無推薦 query 亦確認相應區塊省略且無水平溢位。
