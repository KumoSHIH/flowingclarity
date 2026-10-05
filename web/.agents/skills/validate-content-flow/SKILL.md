---
name: validate-content-flow
description: 驗證 Flowing Clarity 從 Sanity 編輯、草稿與發布到前台顯示的完整內容流程。適用於 CMS 串接完成後的最終驗收。
---

# Validate Content Flow

確認編輯者能安全完成內容工作，Web 訪客只看到符合規格的已發布結果。

## 自動驗證

先閱讀功能規格、schema、query、轉換層與現有測試。執行兩個 workspace 的測試與 typecheck，並執行 web、studio build。核對 GROQ projection、欄位 validation、fallback、連結安全與公開資料範圍，不以單元測試取代真實發布流程。

## 編輯與發布流程

使用測試內容逐項驗證：

1. Studio 中的欄位名稱、說明、preview、必填與錯誤訊息可理解。
2. 只儲存草稿時，公開前台維持上一個已發布版本。
3. 發布後重新載入前台，文字、圖片、排序、連結及條件式內容正確。
4. 最少、典型與最大內容量，以及長標題、缺少選填內容和空集合符合規格。
5. 無文件、無效資料與讀取失敗時顯示指定 fallback 或 empty state。
6. 手機與桌面均不裁切、不重疊，鍵盤操作與焦點狀態仍然有效。

若需要修改遠端 dataset、發布測試文件或部署 schema，先確認使用者已授權該具體環境與動作；優先使用可辨識、可清理的測試內容，且不覆寫既有正式資料。

## 驗收紀錄

在功能規格記錄環境、dataset、測試時間、內容案例、結果、截圖與任何未驗證項目。只有自動檢查及實際編輯／發布流程都通過時，才把狀態更新為 `verified`。缺少帳號或遠端環境時，保留 `cms-integrated`，清楚列出人工步驟，不宣稱完整驗收完成。
