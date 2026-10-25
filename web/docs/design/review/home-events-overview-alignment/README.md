# 首頁近期活動與總覽格式對齊

## 範圍

首頁近期活動維持最多三筆、整列連往詳情頁及既有 CMS 內容契約，只將可共用的日期、內容層級、列高、欄寬、間距與分隔線比照活動總覽。首頁不新增地點、摘要、報名狀態或跨日日期清單，避免與總覽重複，也不擴充本次 CMS 範圍。

## 瀏覽器結果

- 1440px：活動列最小列高 150px；日期維持年月在上、陶土色 `title-md` 日期在下，名稱維持 `title-sm`，hover 名稱轉為陶土色。
- 鍵盤焦點：整列連結保留 2px 外框；連結目的地與無箭頭規則未改變。
- 390px：日期欄為 112px，日期沿用行動版 `title-md` 26px；日期與內容皆完整顯示，沒有水平溢位。
- 跨日活動：首頁依 Asia/Taipei 的開始日與實際涵蓋結束日顯示日期範圍；同月兩日活動顯示 `30-31`／`2027/01`，跨月活動顯示如 `30-01`／`2026/11–12`。午夜結束不會誤算為額外一天。
- 星期顯示：右側時間資訊列由結構化起訖時間自動產生星期；單日顯示如 `週六`，兩日顯示如 `週六、週日`。桌機與時段並排，520px 以下改為同欄上下排列，避免長時段截字；不需編輯者重複維護星期。
- 代表畫面使用臨時本機 fixture 掛載正式 `HomeEvents` 元件；驗證頁及腳本已移除，沒有新增公開測試路由。
- Web 全套 48 檔／313 項測試、typecheck、production build 與 `git diff --check` 通過；typecheck／build 僅保留既有的 Volar package export、sourcemap 與字型 runtime resolve 警告。

## 證據

- [桌機 1440px hover](desktop-1440-hover.png)
- [手機 390px](mobile-390.png)
- [恢復日期樣式後的桌機 1440px](desktop-date-restored.png)
- [恢復日期樣式後的手機 390px](mobile-date-restored.png)
- [日期與星期桌機 1440px](desktop-weekdays.png)
- [日期與星期手機 390px](mobile-weekdays.png)
- [星期移至右側桌機 1440px](desktop-weekdays-right.png)
- [星期移至右側手機 390px](mobile-weekdays-right.png)
- [DOM 與 computed style 量測](results.json)

Safari、Firefox、實體觸控裝置與螢幕閱讀器尚未驗收。本次沒有修改 Sanity schema、部署或遠端內容。
