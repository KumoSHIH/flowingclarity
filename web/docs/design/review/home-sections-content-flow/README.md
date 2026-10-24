# 首頁內容流驗收

## 範圍與環境

- 日期：2026-10-24
- 環境：Sanity `production` dataset、本機 Nuxt、Chrome headless
- 單例：公開 ID `home-page`；驗收後保留最小空白草稿 `drafts.home-page`

## 結果

Sanity schema 部署成功（1/1）。驗收以可辨識前綴建立首頁、4 筆活動、4 門課程與 4 個梯次；草稿階段匿名查詢看不到內容，首次發布後匿名 Data API 可讀取 13 筆驗收文件，首頁依規則顯示 3 筆活動及 3 筆課程，年月均為 `YYYY/MM`。第二版草稿未外洩，發布後匿名查詢可讀到更新。共用信箱與 Sanity CDN 圖片皆可公開讀取。

Chrome 驗證 320、390、768、1023、1024、1440px 及 720px／200% 等效寬度，無水平溢位；單一 `h1`、區塊順序、圖片 alt／lazy loading、44px 以上控制、鍵盤焦點及 reduced motion 均通過。詳見 [結果 JSON](results.json)、[手機截圖](home-390.png)與[桌機截圖](home-1440.png)。

驗收文件已精準清除，登入與匿名查詢均確認無殘留；本機 `/api/home-sections` 回傳 `empty`。其後安全建立只有 `_id` 與 `_type` 內容欄位的 `drafts.home-page`，匿名 published 查詢仍為空。已登入 Studio 實際開啟單例入口，確認四個分組、欄位說明、字數提示、必填狀態及可編輯輸入；見 [Studio 截圖](studio-home-page-authenticated.png)。臨時瀏覽器 token 已於檢查完成後移除，未新增 CORS origin。
