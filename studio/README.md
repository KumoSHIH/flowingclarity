# Flowing Clarity Studio

Sanity Studio 用來編輯首頁 Banner。Banner 是固定的一份文件，只有四個必填欄位：大標題、敘述、按鈕文字與按鈕連結。大標題可換行；玫瑰底圖、分類及動畫由前端維護。儲存草稿後仍需發布，公開網站才會使用更新的內容。

## 初次設定

1. 在 [Sanity Manage](https://www.sanity.io/manage) 找到專案的 Project ID。本專案目前使用 `hnypuj6l` 和 `production` dataset。
2. 若在新環境設定，複製 `.env.example` 為 `studio/.env.local`，填入 Project ID，確認 dataset 名稱。
3. 從儲存庫根目錄執行 `npm install`，再執行 `npm run dev:studio`。
4. 開啟終端顯示的本機網址並登入；如需讓其他成員編輯，請在 Sanity 專案設定邀請並賦予編輯權限。

## 驗收

打開「首頁 Banner」，填入四個欄位後發布。按鈕連結接受 HTTP(S) 網址、以 `/` 開頭的站內路徑或 `#courses` 形式的頁面錨點；未填齊或網址無效時應無法發布。文件 ID 固定為 `homeBanner`。重新整理首頁，應看到發布後的文字及按鈕連結；草稿不會顯示。

既有文件請補上按鈕文字與連結後重新發布。舊輪播欄位不再編輯或讀取，本次未刪除 CMS 中的既有資料。尚未發布、內容不完整或讀取失敗時，首頁顯示本機示範內容。完整條件見 [Banner 規格](../docs/specs/home-banner.md)。
