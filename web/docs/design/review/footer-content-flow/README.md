# Footer 真實 Published 內容流預檢

2026-10-07 23:20（Asia/Taipei）先完成唯讀 published 預檢；2026-10-08 經使用者授權後，部署 schema 並完成可復原的草稿／發布／還原驗收。沒有留下測試草稿或測試標記。

## 結果

- 不帶 token、`published` perspective 的 Data API 回傳 HTTP 200；固定 ID `site-settings` 與類型正確，必要文字存在，五項導覽依序為 `/events`、`/course`、`/session`、`/articles`、`/about`。
- 遠端已有 Header Logo，但尚無 Footer Logo；本機 `/api/site-settings` 回傳 `ready`，Footer 正確顯示品牌文字，沒有誤用 Header Logo。登入後唯讀計數為 published 1、draft 0。
- `/`、`/course` 回傳 200；其餘四個導覽目的頁回傳 404，仍是正式發布門檻。
- Chrome 以真實 published 資料檢查首頁及課程頁 320／1440px：無文字或操作元素溢位，五項導覽均為 58px 高；首頁 hero-menu 與 Footer 順序一致，課程頁只有 `/course` 標示 `aria-current="page"`。
- 電話、Email、兩個社群及五項導覽共 9 個連結可依 DOM 順序 Tab，均有實線焦點；站內 Footer 連結的新分頁行為都有 `noopener noreferrer`。200% Chrome zoom 無水平捲動。
- reduced motion 下移動光點為 0、靜態線為 3、`flowing=false`。`footer`、具名稱的 `nav`、`address` 與裝飾 SVG 隱藏語意皆正確。

量測詳見 [results.json](results.json)，畫面為首頁／課程頁的 320px 與 1440px PNG。截圖含目前公開內容，不代表其文案已完成品牌核准。

## 遠端生命週期結果

- Schema 部署成功（1/1）。測試前為 published 1、draft 0；只在第一項導覽的 `accessibleLabel` 使用「近期活動（內容流驗收）」標記。
- 草稿階段：登入 raw 查詢看見 draft 與標記；匿名 published 查詢仍看不到標記或草稿。
- 發布階段：匿名查詢看見標記，本機 API 為 `ready`；Header、hero-menu、Footer 三處 `aria-label` 同步。
- 還原階段：公開標記移除、draft 回到 0；原始與還原後完整內容雜湊同為 `a7539e20838f`。還原文件 schema validation 為 1 valid、0 errors、0 warnings。

詳細機器紀錄見 [lifecycle-results.json](lifecycle-results.json)。Studio deploy dry-run 因沒有設定 hostname 而停止，未建立新網址；實際 Studio 表單、Footer Logo 上傳及四個 404 目的頁尚未驗收，因此規格維持 `cms-integrated`。
