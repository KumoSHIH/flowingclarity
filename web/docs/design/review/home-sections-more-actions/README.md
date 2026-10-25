# 首頁活動與課程 More 操作驗收

## 修改範圍

首頁近期活動與近期課程的 `HomeMoreLink` 使用共用 `.button-primary--small`，沿用 `.button-primary` 的配色、箭頭、hover、focus 與 reduced-motion，尺寸為 170 × 56px；文字桌機 16px、手機 14px。每筆活動的按鈕位於該列最右側，連往同筆 `event.href`；每張課程的按鈕位於內容下方靠左，連往同筆 `course.href`。原有整列／整卡詳情連結保留，空狀態不顯示沒有詳情目標的按鈕。

近期課程維持原有雙欄錯落卡片，桌機固定保留兩欄軌道，因此只有一筆資料時仍只占一欄，不會放大成滿版；手機維持單欄。每筆依序顯示 5:4 圖片、分類日期、`title-sm` 課名、摘要與小按鈕，末端以暖灰細線分隔。整張內容連結、圖片替代文字與 lazy loading 不變。本次未修改 Sanity schema、查詢或遠端內容。

## 瀏覽器結果

- 1440px：活動與課程按鈕皆為 170 × 56px、16px 文字；活動按鈕位於各列最右側，課程按鈕位於各張卡片內容下方靠左。近期課程內容區寬約 1252px，單筆卡片寬約 569px，只占左側一欄（約 45%），圖片維持 5:4。
- 390px：按鈕維持 170 × 56px、文字切換為 14px；活動按鈕移到內容下方靠右，課程按鈕維持靠左。近期課程改為 350px 單欄，圖片維持 5:4；頁面 `scrollWidth` 與 `clientWidth` 同為 390px，沒有水平溢位。
- hover：按鈕背景變為 `rgb(201, 79, 52)`，箭頭向右移動 4px；鍵盤焦點沿用全站 `.button-primary:focus-visible` 外框規格。
- 自動測試逐筆比對 more 的 href 與對應活動／課程詳情路徑，並驗證含標題的輔助名稱及裝飾箭頭 `aria-hidden` 正確。
- Web 全套 48 檔／313 項測試、typecheck、production build、Impeccable detector 與 `git diff --check` 通過；typecheck／build 僅保留既有的 Volar package export、sourcemap 與字型 runtime resolve 警告。

## 證據

- [活動桌機 1440px](events-desktop.png)
- [活動手機 390px](events-mobile.png)
- [課程桌機 1440px](courses-desktop.png)
- [課程手機 390px](courses-mobile.png)

Safari、Firefox、實體觸控裝置與螢幕閱讀器尚未驗收。代表畫面使用臨時本機 fixture 掛載正式元件；驗證頁及擷取腳本已移除，沒有新增公開測試路由。
