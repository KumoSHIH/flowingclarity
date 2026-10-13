# 活動詳情第二輪淘汰紀錄

2026-10-13（Asia/Taipei）以 Chrome DevTools Protocol 檢查 A「光幕交會」、B「場域分鏡」、C「雙聲問答」。三案其後由使用者以「畫面凌亂、資訊零散」退回，不再是實作候選；本資料夾只保留當時驗證紀錄，現行原型請見[第四輪驗收紀錄](../events-detail-concepts-round-4/)。

- 18 組皆為 `scrollWidth <= innerWidth`，無水平溢位。
- 每個可見設計只有一個 `h1`，URL query 可正確指定初始 tab。
- 標題左右邊界均位於 viewport 內；自託管 `Noto Serif TC` 已載入。
- 非停用操作項目的最小高度為 44px。
- Tab 支援滑鼠與鍵盤；18 組以 `ArrowRight` 測試後，選取與焦點均移到下一案。
- HTML 原型提供 `prefers-reduced-motion`、可見焦點、停用報名按鈕與 390px 單欄重排。
- 雙色焦點環的量測為 3px 暖白 outline 加 6px ink 外環；`keyboard-focus-390.png` 保留實際畫面。
- B、C 的 390px 首屏已各自形成完整資訊單位：B 顯示活動標題、日期與時間，C 顯示活動名稱、問題與回答。

Impeccable detector 本輪已執行一次；已加深 sand 表面的次要文字、提高比較稿小字、縮減按鈕字距並補足場景容器內距。Finish review 後另修正 C 的活動標題契約、B／C 手機首屏節奏、B／C 的 `DetailFacts` 清單語意、跨表面焦點環、頁內次要行動與 sticky 錨點。剩餘 detector 項目是比較稿刻意使用的首屏展示字級、既有品牌色與半透明分隔線 advisory，不修改 `DESIGN.md`。尚未驗證 Safari、Firefox、實體觸控裝置或螢幕閱讀器。
