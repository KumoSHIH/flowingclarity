# 活動詳情第一輪淘汰紀錄

2026-10-12（Asia/Taipei）以 Chrome DevTools Protocol 檢查當時的 A「時間摺頁」、B「雙域摘要」、C「敘事長卷」。三案於 2026-10-13 由使用者退回，不再是實作候選；本資料夾只保留當時驗證紀錄，現行原型請見[第四輪驗收紀錄](../events-detail-concepts-round-4/)。

- 六組皆為 `scrollWidth <= innerWidth`，無水平溢位。
- 每個可見設計只有一個 `h1`，query 可正確指定初始 tab。
- 標題左右邊界均位於 viewport 內；自託管 `Noto Serif TC` 已載入。
- 可操作項目的最小高度為 44px。
- Tab 支援滑鼠與鍵盤；六組以 `ArrowRight` 測試後，選取與焦點均移到下一案。
- HTML 原型已提供 `prefers-reduced-motion`、可見焦點、停用報名按鈕與 390px 單欄重排。

Impeccable detector 已執行一次；依結果加深小字用色、把功能文字提高至至少 11px，並修正 44px 操作高度。其餘設計系統 advisory 主要來自本比較稿刻意使用的頁面專屬展示字級與半透明分隔線，未提升為全站 token。尚未驗證 Safari、Firefox、實體觸控裝置或螢幕閱讀器。
