# 課程詳情區塊順序與章節導覽驗證

## 範圍

2026-10-25 驗證課程詳情的內容順序、主要章節導覽、圖文／摺疊課程架構與選填區塊。測試使用型別化 fixture；圖片、姓名及課程文案皆為既有版面示意，不代表正式發布內容。臨時驗證路由及擷取腳本已於完成後移除。

## 結果

- Chrome headless 檢查 1440×1000、1023×900、390×844，以及以 720px CSS viewport 模擬桌機 200% 縮放後的重排；圖文與摺疊課程架構都只產生一個「課程架構」導覽項目。
- 引言保留在正文但不進入 `course-chapters`。固定順序為內容編排、課程梯次、學員分享、課程花絮、報名，缺少兩個選填區塊時會直接銜接報名。
- 所有尺寸皆為單一 `h1`、圖片替代文字缺漏 0，點擊課程梯次後 active 錨點與焦點目標正確。390px 的 `innerWidth`、`clientWidth`、`scrollWidth` 均為 390px。
- 第一輪發現 1023px Hero 標題超出內容寬度 21px；標題寬度改為扣除左右各 50px 後，複驗 `clientWidth` 與 `scrollWidth` 同為 1008px。

完整量測見 [`metrics.json`](metrics.json)。代表畫面為 [`visual-desktop-1440.png`](visual-desktop-1440.png)、[`visual-tablet-1023.png`](visual-tablet-1023.png)、[`visual-mobile-390.png`](visual-mobile-390.png) 與 [`minimal-mobile-390.png`](minimal-mobile-390.png)。Safari、Firefox、真實 iOS／Android 與螢幕閱讀器未執行。
