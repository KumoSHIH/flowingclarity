---
name: shape-ui-direction
description: 根據已確認的功能規格，為 Flowing Clarity 頁面探索並確認 UX 與視覺方向。適用於切版前的設計階段；不負責正式 Vue 實作。
---

# Shape UI Direction

將功能規格轉成可供前端實作的設計方向，並沿用既有品牌世界。

## 必要輸入

閱讀 `web/PRODUCT.md`、`web/DESIGN.md`、目標 `web/docs/specs/<feature>.md`、相關實作與既有設計稿。規格若缺少主要目的、內容契約或關鍵狀態，先使用 `define-feature-spec` 補齊，不在設計階段自行發明。

## 設計流程

此階段使用專案既有的 `.agents/skills/impeccable/SKILL.md`：

1. 從 `web/` 執行一次 Impeccable context，確認產品、設計系統與 surface brief。
2. 新頁面或構圖仍未確定時使用 Impeccable `shape` 流程；既有頁面只做指定範圍的延伸。
3. 以真實內容範圍設計桌面與手機，涵蓋 empty、error、長文字及互動狀態。
4. 將頁面專屬方向寫入 `web/.impeccable/surfaces/`；概念稿與必要截圖放在 `web/docs/design/`。
5. 只有全站規則真的改變時才更新 `web/DESIGN.md`，不要把單頁構圖提升成設計 token。

至少提出足以比較的方向，說明資訊順序、主要焦點、響應式轉換與實作影響。不得以漂亮但不符合內容契約的理想資料設計。

品質標準以 awwwards、webby awards、FWA 獲得獎項的程度為目標，透過自我檢查，反覆自行提升品質，直到達到該品質標準為止。

## 完成門檻

使用者已選定方向，surface brief 記錄主要構圖、互動、狀態、素材需求及不可變更範圍後，將功能規格狀態更新為 `design-approved`。若尚未選定，只保留設計候選，不更新狀態，也不開始正式切版。
