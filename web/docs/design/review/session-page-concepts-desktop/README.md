# 個案諮詢總覽桌機三案驗證

2026-10-14 以本機 Headless Chrome 檢查 [互動概念稿](../../session-page-concepts.html) 的 A「經緯名錄」、B「名帖長卷」與 C「層疊索引」。本輪只驗證 1440 × 1000 桌機；每案另輸出首屏與完整頁截圖，完整頁截圖停在第 2 頁，用來確認分頁後的穩定構圖。

三案 `innerWidth` 均為 1440、文件 `scrollWidth` 為 1429，未出現水平溢位；每案只有一個可見 `h1`、執行師照片為 0、自託管 `Noto Serif TC` 已載入、左欄為 sticky，最小互動高度為 44px。初始資料為 12 位、每頁顯示 5 位；同時選取「北部」與「生物動能頭薦骨」後得到 3 位且隱藏分頁，清除後可切到第 2 頁並顯示 5 位。詳細數值見 `metrics.json`。

Impeccable detector 的低對比問題已修正。最後仍回報兩項不阻擋提示：paper `#f8f5ef` 被泛用規則視為 cream palette，但此色是 `DESIGN.md` 明定品牌 token；比較工具列被判為 padding 過窄，但實際上下 padding 為 12px、內部 tab 高 48px，1440px 截圖沒有貼邊或裁切。字級 advisory 來自概念稿刻意比較三種名錄層級，不提升為全站 token。

本輪未驗證 1023px 以下、實體觸控裝置、Safari／Firefox 或螢幕閱讀器；選定方向後才補手機轉換與完整狀態設計。
