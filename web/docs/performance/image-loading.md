# 圖片載入效能

## 目前狀態

2026-10-26 已完成正式 Nuxt 前台的圖片載入策略統一。掃描 `app/**/*.vue` 共 24 個 `<img>`：修改前只有 13 個標籤具載入策略、5 個使用非同步解碼；目前 24 個皆明確設定 `loading` 與 `decoding="async"`。首頁與詳情頁首屏主圖使用 `eager`，其中 6 張主要視覺搭配 `fetchpriority="high"`；列表、內文、輪播、頁尾與其他折疊下方圖片共 16 個使用 `lazy`。About 下方輪播首張亦由 eager 改為 lazy，避免提早競爭首屏頻寬。

## 驗證結果

- `npm run test -- tests/performance/image-loading.test.ts`：2 項通過。
- `npm run typecheck`：通過；Vue language plugin 仍輸出既有相依警告。
- `npm run build`：通過；保留既有 sourcemap 與字型解析警告。
- `npm run test`：320／321 通過；既有 `course-detail-corrections.test.ts` 對 `.course-intro` 高度的契約失敗，與本次圖片屬性變更無關。

## 待處理與下一階段

尚未在正式 CDN、真實 CMS 圖片與行動網路環境量測 LCP／傳輸量。發布後應以 Lighthouse 或 RUM 比對首頁及四種詳情頁；若圖片仍是瓶頸，再評估 Sanity CDN 尺寸參數、`srcset` 與 WebP／AVIF，不把未量測項目標示為完成。
