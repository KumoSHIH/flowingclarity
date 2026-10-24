# 課程內頁修正驗收

日期：2026-10-23

## 範圍

以 production 公開內容 `/course/rebalancing` 驗證課程介紹與帶領者導言寬度、帶領者肖像上限、標題層級、course-gallery footer 移除、課綱單元標題換行、響應式版面、水平溢位及鍵盤焦點。圖文選填欄位的缺值情境，以及課綱標題從 parser 到 Vue 的換行保留由回歸測試驗證；本輪未修改或發布遠端內容。

## Chrome 結果

- 1440 × 1000、1023 × 900、390 × 844 均為單一 `h1`，且無水平溢位。
- `.course-intro .lede` 與 `.course-teacher .lede` 的 computed `max-width` 均為 `none`。
- 肖像容器維持 `rgb(118, 98, 84)` bark 底色；圖片 computed `max-width` 為 500px，實際寬度於桌機／平板為 500px、手機為 358px。
- 「帶領者」為 `h2`，桌機 38px、平板與手機 26px；姓名為 `h3`，依序為 28px、24px、22px。
- 三種 viewport 的 `.course-gallery footer` DOM 數量均為 0；桌機與手機截圖確認圖冊內容直接收尾，不再顯示版型名稱或圖冊補充列。
- 於已載入的 production 頁面合成兩行課綱單元標題，1440 × 1000 與 390 × 844 的 computed `white-space` 均為 `pre-line`，實際行數均為 2，水平溢位為 0；按鈕高度分別為 96px、104px。
- 實際 Tab 導覽可聚焦章節連結，焦點外框為 2px solid。
- 原始量測見 [`browser-validation.json`](browser-validation.json) 與 [`curriculum-title-browser-validation.json`](curriculum-title-browser-validation.json)；帶領者代表截圖為 [`desktop-teacher.png`](desktop-teacher.png)、[`mobile-teacher.png`](mobile-teacher.png) 與 [`mobile-teacher-copy.png`](mobile-teacher-copy.png)，圖冊截圖為 [`desktop-gallery.png`](desktop-gallery.png) 與 [`mobile-gallery.png`](mobile-gallery.png)，課綱標題截圖為 [`desktop-curriculum-title.png`](desktop-curriculum-title.png) 與 [`mobile-curriculum-title.png`](mobile-curriculum-title.png)。

## 最新覆寫驗收

2026-10-23 依最新回饋移除固定「帶領者」標題，姓名改為該 section 的 `h2`；影片容器上限由 600px 改為 760px。Chrome DevTools 量測 1440 × 1000 時 `clientWidth` 與 `scrollWidth` 同為 1425px，390 × 844 時兩者同為 390px；兩個尺寸的固定標籤數量皆為 0，姓名標籤皆為 `H2`。同頁實際 scoped CSS 掛載量測的影片容器寬度為桌機 760px、手機 346px。Production 公開內容目前沒有影片區塊，因此本輪未宣告真實 iframe 播放畫面已驗收；尺寸另由元件與樣式回歸測試覆蓋。最新完整頁截圖為 [`desktop-full-current.png`](desktop-full-current.png) 與 [`mobile-full-current.png`](mobile-full-current.png)，量測見 [`teacher-video-latest-validation.json`](teacher-video-latest-validation.json)。先前段落與截圖保留為歷史證據，不代表最新標題狀態。

## 未完成

新版 Studio schema 尚未部署，未執行遠端草稿／發布／匿名讀取／清除流程。Safari／Firefox、真實 iOS／Android 裝置及螢幕閱讀器未於本輪驗證。
