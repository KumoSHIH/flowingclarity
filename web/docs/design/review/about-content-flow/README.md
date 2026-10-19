# About 內容流驗收

**日期：** 2026-10-19  
**狀態：** `verified`

## 驗收範圍

以 Sanity production dataset、匿名 published perspective 與本機 Nuxt production build 驗證 `/about`。驗收沒有建立、修改或發布遠端文件；開始檢查時 `about-page` 與 `site-settings` 已是 published，兩者皆無草稿。

## 結果

- 匿名內容契約解析成功：標題為「關於我們」、精選片段 3 張、營業時間 1 組，Google Maps embed host 為 `www.google.com`。
- 5 個不重複 Sanity 圖片資產皆可公開讀取；Nuxt `/api/about` 回傳 `state: ready`，SSR `/about` 包含標題、營業時間與地圖嵌入網址。
- 320px production browser 回歸無水平溢位、圖片失敗或缺漏 alt；輪播、焦點、暫停條件、循環與 reduced motion 均通過。電話、Email 與社群維持文字連結尺寸；44px 驗證只套用輪播與地圖行動按鈕。
- Web 226/226、Studio 31/31 測試、兩端 typecheck 與 production build 均成功。

## 已知事項

全 dataset schema 驗證為 33/34 有效；唯一錯誤是既有 article `ac387124-91ae-4143-8492-8d1894fce00c` 缺少 `heroStyle` 與 `body`，與 About 無關。現行已發布文案仍包含「示意／待核准」字樣，營業時間備註也標示待核准；照片授權、人物同意與 Google Maps 隱私揭露仍須由內容負責人確認。技術內容流已驗證，但這些內容治理事項不應被視為已核准。

## 證據與重驗

- [發布內容流結果](./published-flow.json)
- [320px 瀏覽器回歸](../about-ui-verified/final-check.json)

重驗指令：`cd studio && npx sanity exec scripts/validateAboutFlow.ts --with-user-token -- preflight`。若重新編輯內容，先保留草稿並預覽；發布後再重跑此指令與 Web production browser 檢查。需要回復時，從 Sanity History 還原前一版本並發布，再確認 `/api/about` 仍為 `ready`。
