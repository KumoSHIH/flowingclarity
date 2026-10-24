# 主要行動按鈕統一驗證

## 範圍與結果

2026-10-23 將課程詳情原有 `.primary-action` 與執行師詳情預約入口統一改用 `.button-primary`／`.button-primary__icon`。共用 CSS 管理最大寬度、最小高度、字級、色彩、focus、disabled、箭頭互動與 reduced motion；使用頁只保留版面外距。課程梯次的頁內「查看報名方式」仍是次要導引，不套用大型主要行動樣式。

Chrome production build 實測首頁、課程詳情與活動列表，桌機 `1440 × 1000`、手機 `390 × 844` 均無水平溢位。首頁與課程桌機按鈕為 `360 × 84px`，手機高度為 `72px`、寬度依容器為 `334–346px`；活動手機為 `342 × 72px`。桌機／手機字級分別為 `18px`／`14px`，字重皆為 `400`。Hover 背景為 `rgb(201, 79, 52)`、箭頭位移 `4px`；focus 外框為 `2px`、offset `6px`；disabled 背景、文字與 cursor 分別為 `rgb(138, 97, 83)`、`rgb(223, 213, 202)`、`not-allowed`，箭頭不位移。

## 證據與限制

- `home-desktop-1440.png`：首頁大型主要行動。
- `course-desktop-1440.png`：課程 Hero 報名行動。
- `home-mobile-390-tall.png`：手機首頁主要行動。
- `events-mobile-390-tall.png`：手機活動列表報名行動。
- Web 全套 43 個測試檔、261 項測試、typecheck、production build 與 `git diff --check` 通過。

Production 執行師內容目前沒有預約網址，因此本輪以元件測試與原始碼確認該入口使用共用 class，未宣告真實內容的視覺驗收完成。Safari／Firefox、實體裝置、文字放大與螢幕閱讀器仍待後續驗收。
