# Session Detail 選定方向桌機驗證

**日期：** 2026-10-14  
**範圍：** C「靜謐檔案」＋A 單欄經歷，C1／C2／C3 小尺寸圖片排法，1440px 桌機  
**原型：** [`../../session-detail-selected-desktop.html`](../../session-detail-selected-desktop.html)

## 畫面

- [C1 原尺寸裱框](c1-frame.png)：砂色媒體欄以留白承接 260px 上限的原尺寸肖像。
- [C2 姓名旁肖像](c2-companion.png)：肖像縮至 190px，降低首屏影像比重。
- [C3 章節插圖](c3-inline.png)：首屏純文字成立，肖像移入「關於執行師」。
- [C1 手機 390px](c1-mobile-390.png)：核准方向的單欄轉換，示範未設定主要預約按鈕。

## 驗證結果

以 Chrome headless 1440×1000 量測三案：`scrollWidth === clientWidth`（1429px）、單一可見 `h1`、字體載入成功、可見圖片缺少 alt 為 0、最小操作高度 48px。固定左欄 `border-right` 為 `0px`，章節標題為 38px，正文為 16px。鍵盤由 C1 按 `ArrowRight` 後，選取與焦點均同步移至 C2。

Impeccable layout scope 為 0 項；完整檢測修正聯繫清單內距與 CTA 對比後，只剩品牌規範明確指定的 `paper` 暖紙底色被一般化 palette 規則標記。type scope 的 11／12／19／20／24px 均為比較器、圖說、服務資訊或操作文字 advisory，不影響共用詳情 `h1`／摘要／`h2`／正文契約。

最終核准 C1。`<= 1023px` 依語意改為單欄，facts rail 先以雙欄排列，`<= 560px` 再改為單欄；標題 42px、摘要 16px、章節 32px、正文 16px。未設定 `bookingAction` 時按鈕數量為 0，聯繫項目仍保留。設計階段未修改 schema、API 或 production 資料。
