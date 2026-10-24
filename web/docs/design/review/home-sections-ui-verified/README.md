# 首頁內容區塊 UI 驗收

**狀態：** `ui-verified`

2026-10-24 以本機 Nuxt 與 Chrome CDP 驗證首頁 Banner 後的品牌介紹、近期活動、近期課程與聯絡區。檢查寬度為 320、390、768、1023、1024 與 1440px，並以 720px 驗證 1440px／200% 縮放等效版面。

## 結果

- 所有尺寸的 `scrollWidth` 等於 `clientWidth`，區塊順序正確，單一 `h1` 後依序使用 `h2`／`h3`。
- 近期活動為 3 筆，年月顯示 `2026/10`／`2026/11`；近期課程由 4 筆重複 fixture 修正為 2 筆不重複內容，符合最多 3 筆。
- 內容圖片皆有替代文字並使用 lazy loading，滾動後無圖片載入失敗。
- 可見操作目標皆至少 44px 高；聯絡按鈕以鍵盤 Tab 聚焦時顯示 `2px` 實線外框與 `6px` offset。
- `prefers-reduced-motion: reduce` 下主要按鈕與圖示 transition 為 `0s`。320px 極長標題與段落也沒有水平溢位。
- 實機截圖為 [`home-390.png`](home-390.png) 與 [`home-1440.png`](home-1440.png)；完整量測見 [`results.json`](results.json)。

## 自動驗證

Web 全套 46 檔／299 項測試、typecheck、production build 與 Impeccable detector 通過。typecheck／build 仍有既知的 Volar package export、sourcemap 與字型 runtime resolve 警告。Safari、Firefox、實體觸控裝置與螢幕閱讀器尚未驗收。
