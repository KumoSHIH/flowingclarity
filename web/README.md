# Flowing Clarity web

以 Vue 3、Nuxt 4、TypeScript 與 Tailwind CSS 4 建立的前端專案。

## 開發

在儲存庫根目錄執行：

```bash
npm install
npm run dev:web
```

開發伺服器預設位於 `http://localhost:3000`。

首頁 Banner 從 Sanity 專案 `hnypuj6l` 的 `production` dataset 讀取已發布內容。多張圖片與敘述使用 Swiper 每 2500ms 自動輪播，以 800ms 淡入淡出；若還沒有發布或暫時無法讀取，首頁會顯示示範 Banner。其他部署環境可用 `NUXT_SANITY_PROJECT_ID` 和 `NUXT_SANITY_DATASET` 覆寫設定。

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
- `tests/`：Vitest 測試
- `public/`：不經建置處理的靜態檔案
