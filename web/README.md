# Flowing Clarity web

以 Vue 3、Nuxt 4、TypeScript 與 Tailwind CSS 4 建立的前端專案。

## 開發

在儲存庫根目錄執行：

```bash
npm install
npm run dev:web
```

開發伺服器預設位於 `http://localhost:3000`。

複製 `.env.example` 為 `.env`，並填入 `NUXT_SANITY_PROJECT_ID` 與 `NUXT_SANITY_DATASET`。首頁 Banner 從 Sanity 讀取已發布的大標題、敘述、按鈕文字與連結；尚未發布、欄位不完整或讀取失敗時顯示本機示範 Banner。

`/course` 透過伺服器 API 讀取課程總覽、四個固定分類及已發布課程。站內詳情 URL 由課程 slug 在前端產生，不存入 CMS。課程內容為空時顯示空狀態，格式無效或讀取失敗時顯示錯誤與重試操作，不以 fixture 替代正式內容。

## 驗證

```bash
npm run test -w web
npm run typecheck -w web
npm run build:web
```

## 專案結構

- `app/pages/`：Nuxt 頁面與路由
- `app/components/`：可重用 Vue 元件
- `app/assets/css/`：全域樣式與 Tailwind 主題
- `server/api/`：只在伺服器端查詢 Sanity 的 API
- `shared/`：前後端共用的內容型別、解析與路由對應
- `tests/`：Vitest 測試
- `public/`：不經建置處理的靜態檔案

## 全域共用元件

`app.vue` 掛載 `GoTopButton.vue`，因此所有 Nuxt 路由自動具有右下角回頂按鈕，不要在個別頁面重複加入。元件捲動超過 480px 才出現，並依 `prefers-reduced-motion` 選擇平滑或立即回頂；樣式與互動契約記錄於 [設計系統規格](docs/specs/design-system.md)。新增其他全域元件時，應同樣由 app shell 掛載、補元件行為測試，並避免依賴單一路由內容。
