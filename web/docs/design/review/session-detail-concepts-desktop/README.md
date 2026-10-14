# 個案諮詢詳情桌機三案驗證

2026-10-14 以 Chrome headless 在 1440 × 1000 檢查 [`session-detail-concepts.html`](../../session-detail-concepts.html) 的 A「感知剖面」、B「人物長卷」與 C「靜謐檔案」。三案的 `scrollWidth` 均等於 `clientWidth`（1429px），各只有一個可見 `h1` 與一個可見 `tabpanel`；自託管 `Noto Serif TC` 載入成功，可見圖片替代文字缺漏為 0，最小操作高度為 48px。方向鍵測試確認從 A 按 `ArrowRight` 後，選取與焦點皆同步移至 B。

首屏證據為 `a-1440.png`、`b-1440.png`、`c-1440.png`；完整內容證據為對應的 `*-1440-full.png`。Impeccable detector 初次回報 9 項 padding／11px 字級問題，已集中修正；第二次以 `--no-advisory` 檢查為 0 項 anti-pattern。瀏覽器控制程序因本機 `sandbox-exec` 的 `TIOCSTI` 錯誤無法啟動，故改用相同 Chrome 執行檔的 headless 模式完成量測與截圖。

本輪只驗證桌機候選，不代表方向已核准，也未執行手機、平板、Safari、Firefox、實體裝置或螢幕閱讀器驗收。示意姓名、影像、文案、地點與聯繫方式都不是正式內容。
