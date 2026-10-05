---
name: verify-ui-behavior
description: 驗證並修正 Flowing Clarity 前端功能的行為、響應式、無障礙與視覺品質。適用於假資料版完成後、CMS 串接前的 UI 驗收。
---

# Verify UI Behavior

以功能規格的驗收條件檢查實際頁面，補齊有價值的測試並修正範圍內缺陷。

## 驗證流程

1. 閱讀功能規格、`web/.impeccable/surfaces/` 中的 surface brief、`web/DESIGN.md`、目標元件與既有測試，建立驗收條件對照表。
2. 補齊可自動化的使用者行為與回歸測試，涵蓋主要操作、empty、error、長內容及條件式顯示。避免只重述實作細節的測試。
3. 檢查規格指定的手機、中間與桌面寬度，以及 200% 文字放大、鍵盤焦點、標題階層、替代文字、觸控尺寸與 `prefers-reduced-motion`。
4. 使用極端但有效的 fixtures 找出裁切、溢位、重疊與錯誤閱讀順序。
5. 視覺檢查依 `.agents/skills/impeccable/SKILL.md` 選擇 `audit`、`adapt` 或 `polish`，遵守一次集中修正與最多一次確認的 bounded review。

可以直接修正驗證中發現的範圍內缺陷；若修正需要改變已核准的資訊架構、內容契約或視覺方向，停止並回到相應規格或設計階段。

## 記錄與完成門檻

在功能規格的驗證段落記錄執行的指令、視窗尺寸、人工檢查結果、截圖路徑及未驗證項目。執行 `npm run test -w web`、`npm run typecheck -w web` 與 `npm run build -w web`。只有自動檢查通過、必要人工檢查完成且沒有阻擋問題時，才將狀態更新為 `ui-verified`；不得把未執行的瀏覽器檢查寫成已通過。
