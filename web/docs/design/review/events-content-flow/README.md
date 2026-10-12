# 活動內容流驗收

2026-10-12 19:35–19:44（Asia/Taipei）在 production dataset 執行可回復驗收。先確認 `events-page`、活動及草稿皆為 0，再部署 1/1 schema。測試文件使用 `events-validation-20261012-*`，不修改既有內容。

草稿階段建立 1 份頁面與 48 份活動草稿；登入查詢可見 49 份草稿，匿名 Data API 仍回傳頁面不存在、活動 0 筆。遠端 schema validation 共檢查 62 份文件，結果為 62 valid、0 errors。發布後匿名查詢可讀 `events-page` 與 48 筆活動，包括 40 字標題、100 字摘要、80 字場地、取消狀態及安全 HTTPS 報名入口。

本機 `/api/events` 回傳 `ready` 與 48 筆資料。公開頁推導為近期 45、過去 2，取消活動不顯示；近期第 1 頁 8 筆、第 6 頁 5 筆，過去活動沒有報名 action。1440px 維持雙域、390px 改為單欄，截圖未見裁切或重疊。更新草稿建立後，匿名查詢仍保留舊公開文字；再次發布後才顯示更新標記。

畫面證據：[近期 1440px](upcoming-1440.png)、[近期 390px](upcoming-390.png)、[過去 1440px](past-1440.png)、[過去 390px](past-390.png)。截圖只包含驗收文字，不代表正式活動內容。

驗收後刪除 49 份當時存在的測試文件，並檢查全部 98 個 published／draft 目標 ID；登入與匿名查詢均為 0，本機 API 回到 `empty`。

20:20–20:30 使用既有登入工作階段開啟本機 Studio，確認「活動總覽頁」欄位名稱與說明。活動清單中一筆既有「活動測試」的 preview 正確顯示代表圖、標題，以及開始時間／報名狀態／公開狀態副標；該文件不是驗收腳本建立，未修改或刪除。另建立 `drafts.event-validation-20261012-invalid` 未發布隔離草稿，確認標題、slug、活動形式與摘要出現 inline validation，且發布按鈕停用。檢查後只刪除該草稿；最終 authenticated inspect 顯示全部 validation ID 為 0。事件規格狀態更新為 `verified`；實體觸控裝置與螢幕閱讀器仍未執行。

20:41 因已刪除單例無法從 Draft 視角還原，安全建立空白、未發布的 `drafts.events-page`。建立前確認 published／draft 都不存在；建立後 authenticated inspect 顯示只有此頁面草稿，Studio 的刪除提示已消失且欄位可編輯。所有 `event-validation-20261012-*` 活動驗收文件維持清除狀態，公開頁面未建立。

20:53 依編輯需求移除未使用的 `pastIntro`，並將 `emptyMessage` 契約調整為必填 3–80 字；Studio、GROQ、共享型別、解析器、前端元件與測試已同步。production schema 部署 1/1 成功，schema list 確認 `_.schemas.default` 位於 production dataset；既有文件中的舊欄位不做破壞性刪除，前台停止讀取。
