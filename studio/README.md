# Flowing Clarity Studio

Sanity Studio 用來編輯首頁 Banner。Banner 是固定的一份文件，包含必填的大標題、摘要與輪播內容；每筆輪播內容需有圖片、圖片替代文字及敘述。拖曳可調整順序。儲存草稿後仍需發布，公開網站才會使用更新的內容。

## 初次設定

1. 在 [Sanity Manage](https://www.sanity.io/manage) 找到專案的 Project ID。本專案目前使用 `hnypuj6l` 和 `production` dataset。
2. 若在新環境設定，複製 `.env.example` 為 `studio/.env.local`，填入 Project ID，確認 dataset 名稱。
3. 從儲存庫根目錄執行 `npm install`，再執行 `npm run dev:studio`。
4. 開啟終端顯示的本機網址並登入；如需讓其他成員編輯，請在 Sanity 專案設定邀請並賦予編輯權限。

## 驗收

打開「首頁 Banner」，輸入大標題、摘要，並在「輪播內容」新增至少一筆圖片與敘述。未填齊時應無法發布；發布成功後，這份文件的 ID 為 `homeBanner`。重新整理 `web` 首頁，應看到剛發布的內容；若尚未發布，則顯示示範 Banner。舊版單張圖片資料在新輪播發布前仍能顯示。完整驗收條件見 `docs/specs/home-banner.md`。
