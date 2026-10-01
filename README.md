# Flowing Clarity

身心課程與活動介紹網站，採用 npm workspaces 管理 Nuxt 前端與 Sanity 內容管理後台。

首頁包含輪播 Banner、品牌介紹、近期活動、課程與聯絡資訊。目前僅 Banner 串接 Sanity，其他區塊仍為示範內容，課程尚未提供報名連結。產品方向與待確認事項見 [產品說明](web/PRODUCT.md)。

## 技術與目錄

| 路徑 | 用途 |
| --- | --- |
| `web/` | Nuxt 4、Vue 3、TypeScript、Tailwind CSS 4 前端 |
| `web/app/` | 頁面、元件與全域樣式 |
| `web/server/api/` | 讀取 Sanity 內容的伺服器 API |
| `web/tests/` | Vitest 與 Vue Test Utils 測試 |
| `studio/` | Sanity Studio、內容 schema 與測試 |
| `docs/specs/` | 功能規格與驗收條件 |

## 本機開發

準備 Node.js 22.12 以上版本與 npm。以下指令皆在儲存庫根目錄執行：

```bash
npm install
npm run dev:web
```

前端預設位於 `http://localhost:3000`。尚無已發布 Banner 或讀取失敗時，會顯示本機示範內容。

需要編輯 Banner 時，先建立後台環境設定：

```bash
cp studio/.env.example studio/.env.local
```

在 `studio/.env.local` 填入有權限使用的 Sanity 專案：

```dotenv
SANITY_STUDIO_PROJECT_ID=replace-with-your-project-id
SANITY_STUDIO_DATASET=production
```

另開終端啟動後台，再依終端顯示的網址登入：

```bash
npm run dev:studio
```

在 Studio 編輯「首頁 Banner」後須發布，網站才會讀取更新；僅儲存草稿不會生效。請勿提交 `.env` 或憑證。

## 驗證與建置

```bash
npm run test -w web
npm run test -w studio
npm run typecheck -w web
npm run typecheck -w studio
npm run build:web
npm run build:studio
```

後台建置也需要上述 Sanity 環境設定。前端建置完成後，可執行 `npm run preview -w web` 預覽。

## 開發指南

修改前請閱讀 [專案規範](AGENTS.md)；前端另有 [開發規範](web/AGENTS.md)。元件採 PascalCase，共用設計 token 位於 `web/app/assets/css/main.css`。

更多說明見 [前端指南](web/README.md)、[後台指南](studio/README.md)、[Banner 規格](docs/specs/home-banner.md)與[首頁區塊規格](docs/specs/home-sections.md)。
