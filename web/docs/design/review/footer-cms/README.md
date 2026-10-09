# Footer 本機 CMS／樹皮棕驗證

2026-10-07：依使用者手動 CSS 檢查目前 `SiteFooter.vue`。此目錄圖片由本機 Nuxt 臨時元件測試頁渲染典型、最少、最長 fixtures 擷取；測試頁已移除，不是正式 CMS 內容或目的頁完成證據。截圖中的聯絡資訊與 Logo 僅為示範，未核准發布。舊 `footer-frontend` 暖砂截圖保留為歷史紀錄。

## 實際結果

- 典型內容：320、560、900、1024、1440px；最少／最長：320、1440px。文字／操作元素無水平溢位，五項導覽高 58px。截圖保存 320 與 1440px；已檢視桌面典型與手機長內容。
- 缺少 Footer Logo 顯示品牌名稱，沒有沿用 Header Logo；長 Email 自然換行。
- 瀏覽器動畫 seek 到循環交界前後 0.1ms，位移模週期差約 0.000010／0.0000077，等於正常流速造成的微小位移。週期 4.44s／7.614s，無額外重設跳接。
- 長內容桌面用 Tab 量測 Email、四個社群與前四個導覽，皆有 solid 焦點。reduced motion：0 組移動光點、3 條靜態線、flowing=false。
- paper／bark 對比約 5.29:1；純 saffron／bark 約 3.44:1，因此互動小字調為 saffron 35% + paper 65% 混色。沒有改動使用者的構圖、字距與分隔線。

量測詳見 [results.json](results.json)。元件與資料層測試涵蓋圖片失敗／替換、可選欄位、API 空值／無效／錯誤、共用 hero-menu 及 singleton validation。

自動檢查：Web 79 項、Studio 11 項測試通過，兩邊 typecheck／build 通過。Impeccable detector 為 0 個反模式錯誤，3 項 advisory（既定分隔色、12px 版權、手機主張字級）；皆保留為有文件記錄的區域樣式，不增加全站 token。

## 尚未驗證

新版 200% 文字放大、完整鍵盤／輔助技術驗收、正式內容、四個未建立目的頁、Sanity 編輯者草稿／發布與匿名公開讀取。舊版文字放大紀錄不能取代新版驗收。未執行遠端部署或 dataset 寫入。
