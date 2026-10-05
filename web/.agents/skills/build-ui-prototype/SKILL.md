---
name: build-ui-prototype
description: 依核准規格與設計方向，以型別化假資料完成 Flowing Clarity 的 Nuxt 前端頁面。適用於 CMS 串接前的切版與互動實作。
---

# Build UI Prototype

用接近正式內容結構的假資料，完成可操作、可響應且可測試的前端版本。

## 開始前

閱讀 `AGENTS.md`、`web/AGENTS.md`、`web/PRODUCT.md`、`web/DESIGN.md`、功能規格與 `web/.impeccable/surfaces/` 中的對應 surface brief。規格原則上應為 `design-approved`；若使用者明確要求先探索性實作，保留 `draft` 並在交付時說明未確認項目。

## 實作

1. 依內容契約定義 TypeScript 型別與 fixtures。至少包含典型內容、最長合理內容、缺少選填欄位及空集合；不要複製 Sanity SDK 型別到元件。
2. 使用 Vue Single-File Components、`<script setup lang="ts">` 與既有 Nuxt 結構。優先使用 Tailwind utility，重用 `web/app/assets/css/main.css` 的 token 與元件角色。
3. 實作 surface brief 指定的桌面、手機、鍵盤、loading、empty 與 error 呈現。語意內容留在 HTML，不烘焙進圖片。
4. 新增互動時同步加入必要的 Vue Test Utils 行為測試；不要等驗證階段才建立最基本的回歸保護。
5. 此階段維持本機資料來源，不建立 Sanity schema、GROQ 或正式發布內容。

元件接受內容物件或可替換的資料介面，避免把示範文案散落在版面邏輯中。不要為未出現的變體提前建立抽象層。

## 完成門檻

執行相關 Vitest、`npm run typecheck -w web`，並在變更可能影響正式輸出時執行 `npm run build -w web`。以規格列出的關鍵寬度檢查內容不裁切、不重疊且閱讀順序正確。符合後將規格狀態更新為 `frontend-ready`，並記錄仍屬示範的內容與素材。
