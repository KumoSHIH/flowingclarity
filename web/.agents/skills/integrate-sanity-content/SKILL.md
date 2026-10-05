---
name: integrate-sanity-content
description: 把已完成的 Flowing Clarity 假資料頁面接上 Sanity，包含內容模型、Studio schema、查詢、轉換、fallback 與測試。
---

# Integrate Sanity Content

將 `web` 功能規格的內容契約落實為可編輯、可驗證且不綁定版面位置的 Sanity 資料流程。

## 建模與串接

1. 閱讀功能規格、現有 fixtures 與型別、`studio/schemaTypes/`、Studio structure、server API 及既有 Banner 模式。
2. 先確認文件類型、單例或集合、reference 關係、排序、發布與顯示規則。欄位依內容語意命名，不使用 `leftColumn`、`card2` 等版面名稱。
3. 建立 schema、欄位說明、preview 與必要 validation。不要把可由前端推導的純展示資料存入 CMS。
4. 建立最小 GROQ projection、伺服器端讀取與明確的資料轉換層；前端元件繼續依自己的內容型別運作，不直接依賴 Sanity document shape。
5. 定義未設定、草稿、欄位不完整、查詢失敗及無結果時的行為。fallback 必須和規格一致，不能讓示範內容看似正式發布資料。
6. 新增 Studio 結構／validation 測試，以及 web 查詢、轉換與 fallback 測試。

不要提交 project ID、token 或個人設定；新增環境變數時同步更新 `.env.example`。除非使用者已明確授權，這個階段不部署 schema、不修改遠端 dataset，也不建立正式內容。

## 完成門檻

執行 web 與 studio 的相關測試、typecheck 及 build。以本機或測試資料證明正常、空資料、無效資料與讀取失敗路徑。前端不再依賴該功能的硬編碼主要資料後，將規格狀態更新為 `cms-integrated`，並列出仍需真實帳號完成的發布驗證。
