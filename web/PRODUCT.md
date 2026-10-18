# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主要使用者是希望學習身心相關知識與實作技能、正在評估適合課程的人。

## Product Purpose

提供身心相關課程資訊，協助使用者理解學習內容、選擇適合的課程，並找到報名入口。

## Positioning

以溫暖、真誠且重視人際連結的方式介紹課程，讓使用者理解學習內容與參與方式。

## Operating Context

使用者在網站了解課程後，前往外部 Google 表單報名；付款採匯款方式，匯款資訊提供與付款確認流程待確認。網站不提供會員功能。

## Capabilities and Constraints

### 已確認需求

Sanity 為正式內容管理方式。課程分類與授課形式如下：

| 分類 | 課程 | 授課形式 |
|---|---|---|
| 愛身體 | 頭薦骨、再平衡按摩、日式臉部按摩 | 實體 |
| 撫慰心 | 童年依附創傷療癒 | 實體、線上 |
| 究生命 | 人類圖 | 線上 |
| 展現美 | 曼陀羅靜心彩繪 | 線上 |

### 目前實作

- 技術架構為 Nuxt 4、Vue 3、TypeScript 與 Tailwind CSS 4。
- 全站設定已完成 Sanity 單例、遠端 schema、published-only 查詢及前台串接：Header、hero-menu、Footer 共用五項導覽；Header Logo 與 Footer Logo 在同一文件內獨立設定。2026-10-08 已驗證草稿隔離、匿名發布讀取、三處同步及完整還原；目前公開文件未設定 Footer Logo，因此顯示品牌文字備援。Studio 尚無部署 hostname，且三個目的頁尚未建立，仍是發布門檻。
- 首頁包含品牌介紹、活動、課程與聯絡區塊，內容仍為示範資料；課程區塊尚未提供報名連結。
- Banner 從 Sanity 讀取已發布的大標題、敘述、按鈕文字及按鈕連結；內容不完整或讀取失敗時使用本機示範內容。玫瑰底圖、課程分類與動畫由前端維護。
- `/course` 已完成 Sanity 課程總覽、固定分類、課程與梯次 schema、伺服器查詢及 production 內容流驗收；遠端 schema 已部署，公開分類 ID migration 已完成。頁面不再以 fixture 作為主要資料，目前 production 有 1 門初步課程，其餘正式內容仍待內容負責人審核與發布。
- `/course/[slug]` 已完成響應式前端、Sanity 整合與 production 內容流驗收：課程總覽與詳情頁共用單一公開開關，公開前必須有完整詳情與代表圖；另包含 published-only slug API、共用資料契約、可排序內容編排、五款可重複圖文版型、公開梯次及安全報名連結。草稿隔離、兩次發布、匿名讀取、1440px／390px 完整頁及測試內容清除均已驗證；正式內容仍待核准。
- `/events` 已完成 fixture 驅動的前端原型：左側可切換近期／過去活動，右側以月份長譜呈現目前集合，支援每頁 8 筆、URL query、自動截止、結束後歸檔，以及 loading／empty／error 狀態。此階段尚未串接 Sanity，頁面活動內容皆為明確標示的示範資料。
- `/events/[slug]` 已完成前端、Sanity 整合與 production 內容流驗收：活動總覽與詳情頁共用單一公開開關，公開前必須有完整詳情；另提供可排序語意區塊、published-only slug API 與安全 parser。心得只包含文字與分享者名稱，不設逐筆公開同意欄位；草稿隔離、兩次發布、匿名讀取、1440px／390px 完整頁及測試內容清除均已驗證。正式活動內容仍待核准，課程詳情也尚未接入共用心得 schema。
- `/articles/[slug]` 已完成響應式前端、UI 行為驗收與本機 Sanity 整合：同一份 `article` 文件提供 `overlay`／`split` 首區、三種可排序正文區塊、受限 Portable Text、人工排序延伸閱讀與 SEO；published-only slug API 以嚴格 parser 區分 404、無效發布內容及讀取失敗，前端不再以 fixture 作為主要資料。遠端 schema 尚未部署，草稿隔離、匿名發布讀取、真實圖片與 production 內容流程仍待驗證。
- `/session` 已完成無人物照片的 A「經緯名錄」響應式前端、Sanity 整合與 production 內容流驗收：桌機使用 30%／70% sticky 雙域，手機改為單欄篩選與人物長列；支援服務地區／服務項目多選、URL 還原、每頁 8 筆、狀態處理及後台標題純文字換行契約。遠端 schema 已部署，Studio 提供總覽單例、可新增的服務地區／服務項目 taxonomy 與可複選 references 的執行師文件；草稿隔離、兩次發布、匿名讀取、48 筆分頁、1440px／390px 前台與清理後空狀態均已驗證。隔離測試資料已清除，production 保留一份無內容且未發布的 `drafts.session-page` 供後台直接編輯；正式總覽、taxonomy 與執行師內容仍待內容負責人建立及發布。
- `/session/[slug]` 已完成 C「靜謐檔案」＋A 單欄經歷的響應式 UI、Sanity schema、published-only API 與 production 內容流程驗收。人物照可由後台選擇限制寬度或滿版裁切，並支援無圖及選填主要預約按鈕；詳情字級與 rail padding 為活動／執行師詳情共用 token。聯繫支援電話、LINE ID、Facebook、LINE 官方連結與預約表單；城市可新增，每筆服務地區可多選 1–6 個城市，地點名稱／完整地址由公開層級控制，`practitioner` 不設對外公開同意欄位。目前為 `verified`；隔離測試資料已清除。
- `/about` 已完成 A「顯影室」的響應式前端原型：依序呈現品牌理念、空間／團隊、手動精選片段與聯絡資訊，含營業時間、Google Maps、觸控切換與狀態備援。頁面目前由明確標示的型別化示意資料驅動，尚未串接 `aboutPage` 或擴充 `siteSettings`，正式文案、影像授權與聯絡資料仍待核准。
- Production 正式內容矩陣目前覆蓋 1／6 門；其餘五門缺少核准摘要與 slug，選填代表圖若使用則需替代文字。舊 `courseCategory.*` reference 已確認為 0，舊文件尚未刪除。

### 待確認事項

- 正式報名表單連結，以及匯款資訊提供與付款確認流程。

## Evidence on Hand

已確認的課程分類與授課形式如上。現有頁面的品牌名稱、文案、課程範例、活動日期、照片及聯絡資訊，尚未確認可正式發布；不得當作真實產品證據。

正式課程介紹、師資、費用與時程待補齊。尚無可供公開使用的學員見證或成效資料，不得自行虛構內容或將示範資料視為已確認資訊。

## Product Principles

1. 幫助使用者快速理解可學習的身心技能及其適用情境。
2. 讓課程資訊足以支持使用者判斷是否符合自己的學習需求。
3. 以真誠且有人情味的方式建立信任，避免制式或過度銷售的溝通。
4. 清楚區分已確認內容、示範內容與尚未決定的產品資訊。
