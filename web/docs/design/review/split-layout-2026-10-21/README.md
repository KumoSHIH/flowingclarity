# 雙欄版面角色驗證

## 範圍與結果

2026-10-21 將課程、活動與執行師總覽同步為固定 `400px` 左欄；總覽外層保持全寬，左欄貼齊視窗左側，右側內容不設最大寬度並填滿剩餘欄寬。活動與執行師詳情共用 `1500px` 置中 hero 外框及 `1500px` 置中雙欄起點；執行師詳情不設定外層最大寬度，只加入相同左側 gutter。最新驗收將執行師 banner 的桌機左右 padding 設為 `0`、手機補回 `24px`，並移除 `.session-detail__layout` 上框線。

Chrome headless 使用可讀內容檢查 390、1024、1440、1920px 共 20 組。五頁的 `scrollWidth` 均等於 `clientWidth`；1024px 以上左欄皆為 `400px`。1920px 時三個總覽左欄皆從 `x=0` 開始，右側內容寬度皆為 `1505px`，從 `x=400px` 延伸到 `clientWidth=1905px`；活動與執行師詳情的左欄皆從 `x=202.5px`、主內容皆從 `x=602.5px` 開始，執行師詳情外層仍為 `1905px` 全寬。兩個詳情 hero 共用 `1500px` 最大寬度、30% 圖片欄、`560px` 最低高度與相同 gap；執行師 hero 在 390px 的左右 padding 為 `24px`，1024／1440／1920px 皆為 `0px`，content padding 維持共用 token。`.session-detail__layout` 的 computed `border-top-width` 在四個尺寸皆為 `0px`。390px 回到既有單欄且沒有水平溢位。量測原始資料見 [`results.json`](results.json)。

自動驗證完成：Web 40 個測試檔／237 項測試、typecheck、production build 與 `git diff --check` 均通過。Impeccable detector 完成，回報 SessionDetail 既有 4 個字級與 `main.css` 既有 1 個色彩 advisory，本次沒有新增對應值。typecheck 仍輸出既有 `vue-router/volar/sfc-route-blocks` 套件匯出警告；build 仍有既有 sourcemap 與字型 runtime resolve 警告，命令皆成功結束。

## 證據與限制

- [課程總覽 1920px](course-1920.png)
- [活動總覽 1920px](events-1920.png)
- [執行師總覽 1920px](session-1920.png)
- [活動詳情 1920px](event-detail-1920.png)
- [執行師詳情 1920px](session-detail-1920.png)
- [執行師詳情 390px](session-detail-390.png)

本次未重跑 Safari、Firefox、實體觸控裝置或螢幕閱讀器；未將這些項目記為完成。後續新增總覽頁時應引用共用 rail 與內容寬度 token；詳情頁則先依 hero 的水平基準決定左欄起點，並在 1023／1024px 斷點重新確認單欄切換。
