# Session A 響應式原型驗證

**日期：** 2026-10-14  
**目標：** `/session?page=1`，1440、1023、768、390、320px  
**截圖：** [`1440px`](session-a-1440.png)・[`1023px`](session-a-1023.png)・[`768px`](session-a-768.png)・[`390px`](session-a-390.png)・[`320px`](session-a-320.png)・[`390px 完整頁`](session-a-390-full.png)

## 驗證結果

- 共用 Header 下方呈現 A「經緯名錄」的 30%／70% 雙域；左側 sand 篩選區、右側 paper 名錄與細線分隔均符合核准方向。
- 左側標題由 fixture 的 `尋找\n執行師` 驗證後台純文字換行呈現；頁面沒有使用 `v-html`。
- 首頁資料實際為 8 筆、總數 12 筆；截圖視窗可見前 5 筆，其餘內容在下方正常延續。
- 執行師總覽未渲染人物照片或圖片占位，名錄以姓名、英文名、地區、服務方法及詳情箭頭組成。
- 1440px 截圖未見水平溢位、欄位重疊或裁切。篩選、URL、分頁、焦點與資料狀態由 Vitest 覆蓋。
- 1023px 與 768px 依 DOM 順序轉為單欄；390px 的地區三欄、方法兩欄，320px 的方法改為單欄。
- Chrome 裝置模擬量測 1023、768、390、320px 的 `scrollWidth` 均與 viewport 相同；390px 完整頁確認 8 筆名錄、分頁、Footer 及無人物照片。
- 左欄 padding 已與 `/events`、`/course` 對齊：1440px 實測為 `100.8px 46.08px 48px`，1023px 為 `72px 71.61px 48px`，390／320px 為 `72px 24px 48px`。
- 篩選實頁確認初始方法為身心再平衡按摩、生物動能頭薦骨、日式臉部按摩與人類圖；資料結構仍接受新增 taxonomy 項目與執行師多選。

## 待處理

- 尚未以實體 iPhone、Android 手機或不同瀏覽器驗證；目前證據來自 macOS Chrome 裝置模擬。
- Sanity schema、正式 taxonomy、正式執行師資料與 `/session/[slug]` 詳情頁尚未串接。
