# Flowing Clarity Studio

Sanity Studio 用來編輯首頁 Banner、課程總覽、四個固定課程分類、課程與課程梯次。Banner 與課程總覽各是固定的一份文件；課程以分類 reference 關聯，公開網站只查詢已發布且 `isPublished` 為 `true` 的課程。儲存草稿後仍需發布，公開網站才會使用更新內容。

## 初次設定

1. 在 [Sanity Manage](https://www.sanity.io/manage) 找到有權限使用的 Project ID 與 dataset 名稱。
2. 若在新環境設定，複製 `.env.example` 為 `studio/.env.local`，填入 Project ID，確認 dataset 名稱。
3. 從儲存庫根目錄執行 `npm install`，再執行 `npm run dev:studio`。
4. 開啟終端顯示的本機網址並登入；如需讓其他成員編輯，請在 Sanity 專案設定邀請並賦予編輯權限。

## 內容結構

- 「首頁 Banner」提供大標題、敘述、按鈕文字與按鈕連結，文件 ID 固定為 `homeBanner`。
- 「課程總覽」提供頁面標題、目錄提示與收束文案，文件 ID 固定為 `courseOverviewPage`。
- 四個分類的 key、名稱與順序固定；編輯者維護分類摘要。固定 document ID 使用 `course-category-*`，不得包含句點，確保 public dataset 的未驗證前台可讀取。
- 課程包含 slug、分類、授課形式、摘要、選填代表圖、分類內順序及公開開關。代表圖需包含替代文字。
- 課程梯次以 stage 與 ISO 日期區間記錄；schema 阻止日期倒置、重疊、順序重複或倒退。首日與末日由日期區間推導，不重複儲存。

## 驗收

打開「首頁 Banner」，填入四個欄位後發布。按鈕連結接受 HTTP(S) 網址、以 `/` 開頭的站內路徑或 `#courses` 形式的頁面錨點；未填齊或網址無效時應無法發布。文件 ID 固定為 `homeBanner`。重新整理首頁，應看到發布後的文字及按鈕連結；草稿不會顯示。

課程內容先建立四個固定分類摘要與課程總覽，再建立課程、設定分類及 `isPublished`，最後發布相關文件。確認草稿不出現在公開頁、缺少必要欄位不能發布、未設定代表圖時仍能正常顯示。尚未發布課程時 `/course` 顯示空狀態，讀取失敗時顯示重試操作。

目前已完成 schema、Studio 結構、網站串接與 production 內容流驗收；遠端 schema 及分類公開 ID migration 已部署，草稿隔離、匿名 published 查詢與測試內容清除均已驗證。production 目前有 1／6 門初步課程，其摘要與圖片及其餘課程內容仍待內容負責人核准。舊 `courseCategory.*` reference 已確認為 0，舊文件保留至獨立清理變更。完整紀錄見 [Banner 規格](../web/docs/specs/home-banner.md)與[課程總覽規格](../web/docs/specs/course.md)。

若既有分類使用 `courseCategory.*` ID，需先複製為對應的 `course-category-*` 文件並更新課程 reference；舊 ID 含句點，Sanity 公開 API 會將其視為受保護路徑而拒絕未驗證讀取。完成遷移前不要刪除舊文件。

登入 Sanity CLI 後，可先在 `studio/` 執行下列 dry run；確認輸出後，再加上 `--no-dry-run` 執行。遷移只建立新的公開分類文件並更新課程 reference，不刪除舊分類。

```bash
npx sanity migrations run 20261006-public-course-category-ids
```
