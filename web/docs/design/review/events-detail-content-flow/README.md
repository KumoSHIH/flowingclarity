# 活動詳情 production 內容流驗收

2026-10-13 於 Sanity production dataset 以明確標示的暫存活動驗證 `/events/[slug]`。測試文件 ID 為 `event-detail-validation-20261013`，完成後已刪除 published 與 draft 文件；匿名 Data API 與本機 API 均再次確認查無內容。

## 驗證結果

- production schema 成功部署（1/1）。
- 初始草稿不會出現在匿名查詢；首次發布後，本機 API 回傳 `ready`，並正確省略選填圖片與費用。
- 完整更新草稿發布前，匿名查詢與前台仍保留上一版；再次發布後，依序顯示文字、引言、帶領者、流程、心得、兩種清單與雙圖內容。
- 公開心得資料只包含文字與分享者名稱；HTTPS 報名連結在 `open` 且活動未開始時啟用。
- Chrome headless 於 1440×1000、390×844 及加長 viewport 檢查完整頁面，未見水平溢位、遮擋或裁切。
- dataset 文件驗證為 15 valid、0 errors；另有 2 項既有且與本功能無關的 stale-field warnings：`eventsPage.pastIntro`、`homeBanner.slides`。

## 證據

- `published-1440.png`、`published-390.png`：標準 viewport。
- `published-full-1440.png`、`published-full-390.png`：加長 viewport 的完整內容與頁尾。

瀏覽器控制程序在本次執行中無法啟動，因此改以本機 Chrome headless 取得畫面證據；Safari、Firefox、實體觸控裝置與螢幕閱讀器仍未驗收。
