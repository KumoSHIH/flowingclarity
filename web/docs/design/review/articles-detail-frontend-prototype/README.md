# 文章詳情 Nuxt 前端原型驗證

此目錄記錄 `build-ui-prototype` 階段的瀏覽器證據。頁面使用型別化 fixture，不代表 Sanity schema、正式 API、正式內容或發布流程已完成。

## 實作與量測結果

原型包含 `overlay`、`split`、無代表圖純文字及最大長度 fixtures，並呈現富文字、左右圖文與滿寬圖片三種可排序正文。相關文章依 320／390、768／1023、1024／1440px 分別顯示 1、2、3 張；一般位移為 `1500ms`，reduced motion 為 `0s`。所有量測寬度的 `scrollWidth` 均等於 viewport，頁面只有一個 `h1`，圖片 alt 完整，正文 computed line-height 為 `33.6px`，互動目標至少 44px。320px 麵包屑允許目前頁自然換行但不溢位。

最大 fixture 已驗證 50 字級長標題、8 個標籤、30 個正文區塊及 8 筆推薦；最小 fixture 無代表圖、只有一段純文字且省略推薦。實際點擊 swiper 後 live region 會回報目前位置，上一筆／下一筆的 disabled 狀態同步更新。已知 slug 回應 HTTP 200，未知 slug 回應 404；loading、error 與 not found 另由元件及頁面測試覆蓋。

## 證據與限制

- `overlay-1440-full.png`、`overlay-390-full.png`：滿版遮罩 Hero 與完整長頁。
- `split-390-full.png`：右側圖片窗在手機轉為自然文件流。
- `long-390.png`：長標題與 8 標籤首屏壓力測試。
- Web 35 個測試檔、198 項測試、typecheck 與 production build 通過；build 僅保留既知的 Volar route-block、字型與 sourcemap 警告。

本階段最初交付狀態為 `frontend-ready`；後續 UI 行為驗收已完成，結果與修正證據見 [`articles-detail-ui-verified`](../articles-detail-ui-verified/README.md)。正式 Sanity schema、published-only API、parser、草稿隔離、正式內容與發布流程仍未驗證。
