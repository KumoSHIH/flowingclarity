# 首頁活動與課程連結驗收

## 範圍

驗證首頁「近期活動」與「近期課程」使用正式 Vue 元件時，整列／整卡可連往詳情頁，並具有一致的 hover、鍵盤焦點與 reduced-motion 行為。因 production `home-page` 目前尚未發布，畫面以臨時本機代表內容掛載元件後擷取；驗證頁已移除，沒有新增公開測試路由，圖片與文案不代表正式 CMS 內容。

## 結果

- 1440 × 1000：三筆活動皆為 `/events/{slug}`，兩筆課程皆為 `/course/{slug}`；活動 hover 顯示 8% 陶土底與陶土標題，課程 hover 顯示 1.025 倍圖片縮放與陶土標題，兩區皆不顯示箭頭。
- 鍵盤焦點：活動連結顯示 2px solid 外框，同步套用與 hover 相同的標題及底色回饋。
- 390 × 844：`scrollWidth` 與 `clientWidth` 同為 390px；活動與課程最小連結高度約 178px／518px，無水平溢位。
- reduced motion：活動與課程圖片轉場皆為 `0s`，transform 為 `none`。
- 自動驗證：Web 48 檔／310 項測試、typecheck、production build、Impeccable detector 與 `git diff --check` 均通過。既有 Volar package export、sourcemap 與字型 runtime resolve 警告不影響結果。

## 證據

- [桌機活動（無箭頭）](desktop-event-hover.png)
- [桌機課程（無箭頭）](desktop-course-hover.png)
- [手機 390px](mobile-390.png)
- [量測結果](results.json)

Safari、Firefox、實體觸控裝置與螢幕閱讀器尚未驗收。本次沒有修改 Sanity schema、部署或遠端內容。
