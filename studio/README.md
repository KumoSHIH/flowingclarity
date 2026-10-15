# Flowing Clarity Studio

Sanity Studio 用來編輯首頁 Banner、課程、活動、個案諮詢與文章分享內容。各總覽頁使用固定單例；課程、活動、執行師與文章使用獨立文件及 reference 關聯，公開網站只查詢已發布且符合各內容契約的文件。儲存草稿後仍需發布，公開網站才會使用更新內容。

## 初次設定

1. 在 [Sanity Manage](https://www.sanity.io/manage) 找到有權限使用的 Project ID 與 dataset 名稱。
2. 若在新環境設定，複製 `.env.example` 為 `studio/.env.local`，填入 Project ID，確認 dataset 名稱。
3. 從儲存庫根目錄執行 `npm install`，再執行 `npm run dev:studio`。
4. 開啟終端顯示的本機網址並登入；如需讓其他成員編輯，請在 Sanity 專案設定邀請並賦予編輯權限。

## 內容結構

- 「首頁 Banner」提供大標題、敘述、按鈕文字與按鈕連結，文件 ID 固定為 `homeBanner`。
- 「課程總覽」提供頁面標題、目錄提示與收束文案，文件 ID 固定為 `courseOverviewPage`。
- 四個分類的 key、名稱與順序固定；編輯者維護分類摘要。固定 document ID 使用 `course-category-*`，不得包含句點，確保 public dataset 的未驗證前台可讀取。
- 課程包含 slug、分類、授課形式、摘要、代表圖、詳情內容及單一公開開關。詳情的「內容編排」可新增並拖曳介紹、圖文版型、帶領者、引言、課綱、影片與適合對象；圖文版型可重複新增，每一區塊可選擇不同呈現方式。多行文字欄位可用 Enter 分段，前台會保留換行。Banner、梯次與報名維持固定位置；所有正式圖片需有替代文字。
- 課程梯次以 stage 與 ISO 日期區間記錄，並可設定城市、場地、時間、名額、費用、報名網址及補充事項；schema 阻止日期倒置、重疊、順序重複或倒退。首日與末日由日期區間推導，不重複儲存。公開且開放報名的梯次必須使用 HTTPS 報名網址。
- 「活動總覽頁」是固定 ID `events-page` 的單例；「活動」是獨立文件，可選填一門已公開課程。活動使用結構化起訖時間、參與方式、地點、報名狀態、HTTPS 報名網址、保存設定與同時段順序；公開文件 ID 不得包含句點。
- 「個案諮詢總覽頁」是固定 ID `session-page` 的單例；服務地區與服務項目是可新增 taxonomy，識別碼與順序在同類別內不可重複。執行師可複選服務地區與服務項目，總覽不使用人物照片；`isPublished` 關閉或契約不完整的文件不會出現在前台。
- 「文章分享總覽頁」是固定 ID `articles-page` 的單例；文章固定 reference 四個課程分類之一，另可選 1–8 個可新增的文章標籤。文章與標籤使用 Sanity draft／published 狀態，不另設公開開關；總覽只讀摘要資料，不查詢正文。

## 驗收

打開「首頁 Banner」，填入四個欄位後發布。按鈕連結接受 HTTP(S) 網址、以 `/` 開頭的站內路徑或 `#courses` 形式的頁面錨點；未填齊或網址無效時應無法發布。文件 ID 固定為 `homeBanner`。重新整理首頁，應看到發布後的文字及按鈕連結；草稿不會顯示。

課程內容先建立四個固定分類摘要與課程總覽，再建立課程、設定分類並填妥代表圖與詳情欄位，最後開啟 `isPublished` 並發布。公開且開放報名的梯次須有 HTTPS 報名網址。確認草稿不出現在公開頁、缺少必要欄位不能發布。尚未發布課程時 `/course` 顯示空狀態，未發布的 `/course/[slug]` 顯示不存在，讀取失敗時顯示重試操作。

無法發布時，先開啟 Studio 的驗證清單並點選錯誤；跨欄位規則會直接定位到需修正的欄位。心得只填寫已核准的文字與分享者名稱，不另設逐筆公開同意開關。

課程總覽與課程詳情皆已完成 schema、Studio 結構、網站串接及 production 內容流驗收；遠端 schema 與分類公開 ID migration 已部署。課程與活動各自只使用一個 `isPublished`：公開前必須通過詳情完整性驗證，前台總覽與詳情頁使用相同狀態。課程詳情已驗證草稿隔離、兩次發布、匿名 published 查詢、五款圖文版型混排與測試內容清除；正式內容仍待內容負責人核准。舊 `courseCategory.*` reference 已確認為 0，舊文件保留至獨立清理變更。完整紀錄見 [Banner 規格](../web/docs/specs/home-banner.md)、[課程總覽規格](../web/docs/specs/course.md)與[課程內頁規格](../web/docs/specs/course-detail.md)。

活動 schema 已部署至 production，並以 48 筆隔離文件完成草稿隔離、兩次發布、匿名 published 查詢、長內容、分頁、近期／過去分類與清理驗收。登入 Studio 後亦已確認活動總覽欄位說明、活動 preview、無效草稿的 inline validation 與停用發布狀態；隔離活動草稿已精準清除，活動規格為 `verified`。2026-10-12 20:24 另看到一筆非驗收腳本建立的既有「活動測試」，驗收未修改或刪除。20:41 已建立空白、未發布的 `drafts.events-page`，後台表單可正常編輯；20:53 移除未使用的「過去活動說明」、將「近期活動空狀態」調整為 3–80 字，並重新部署 production schema 1/1 成功。正式活動總覽文案仍待內容負責人填寫與發布。完整紀錄見 [活動規格](../web/docs/specs/events.md)。

個案諮詢 schema 已部署至 production，並以 7 筆 taxonomy、1 筆總覽與 48 位執行師完成草稿隔離、兩次發布、匿名 published 查詢、分頁、地區篩選、1440px／390px 前台與清理後空狀態驗收。隔離測試內容已精準清除；production 只保留無內容、未發布的 `drafts.session-page`，避免單例在刪除驗收內容後停在不可編輯狀態，匿名前台仍讀不到此草稿。正式總覽文案、taxonomy 與執行師資料仍待內容負責人建立及發布。完整紀錄見 [個案諮詢規格](../web/docs/specs/session.md)。

文章 schema 已部署至 production，並以 10 個標籤、1 筆總覽與 24 篇文章完成草稿隔離、兩次發布、匿名 published 查詢、分類／標籤篩選、三頁分頁、桌機／手機與清理後空狀態驗收。70 個隔離測試文件已精準清除；人工後台測試另發現主要分類 picker 同時顯示新舊分類文件，現已限制為四個正式 `course-category-*` ID 並完成回歸。production 的 `articles-page` 已由 Studio 人工發布，前台 API 可匿名讀取 4 個主要分類、3 個標籤與 3 篇文章，文章總覽規格為 `verified`；單篇文章頁與正式內容核准仍待後續處理。完整紀錄見 [文章分享規格](../web/docs/specs/articles.md)。

固定單例若曾被內容流驗收建立後刪除，不要把 published 與 draft 同時為 0 當成最終收尾。先確認兩者都不存在，再建立只含 `_id: drafts.<單例 ID>` 與 `_type` 的空白草稿；這份草稿不可發布，也不可用覆寫操作取代既有內容。Session 使用 `validateSessionFlow.ts`，文章分享使用 `validateArticlesFlow.ts`；在 `studio/` 以 `npx sanity exec scripts/<檔名> --with-user-token -- seed-page-draft` 建立，再以 `verify-page-draft` 確認登入者可見草稿而匿名 published 查詢仍為空。

若既有分類使用 `courseCategory.*` ID，需先複製為對應的 `course-category-*` 文件並更新課程 reference；舊 ID 含句點，Sanity 公開 API 會將其視為受保護路徑而拒絕未驗證讀取。完成遷移前不要刪除舊文件。

登入 Sanity CLI 後，可先在 `studio/` 執行下列 dry run；確認輸出後，再加上 `--no-dry-run` 執行。遷移只建立新的公開分類文件並更新課程 reference，不刪除舊分類。

```bash
npx sanity migrations run 20261006-public-course-category-ids
```
