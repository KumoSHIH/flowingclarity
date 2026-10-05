# 課程總覽頁規格

**狀態：** frontend-ready  
**路由：** `/course`  
**設計依據：** [課程頁概念稿](../design/course-page-concepts.html) 的 B「雙域目錄」，移除 `b-intro` banner

## 目標與受眾

協助正在評估身心課程的訪客，先按「愛身體、撫慰心、究生命、展現美」理解學習方向，再比較該分類下的課程並進入個別課程頁。頁面延續首頁的品牌語言，但不重複首頁 banner；共用 `SiteHeader` 後直接進入課程目錄。

## 範圍與非目標

第一版包含四個已確認分類、分類目錄、各分類簡介、已發布課程連結、課程代表圖，以及頁尾的回到目錄操作。桌面採 B 方案的左側固定目錄與右側課程內容，手機轉為單欄。

本階段不涵蓋個別課程內容、課程搜尋或篩選、站內報名、付款、會員功能，也不新增首頁式 banner。未經確認的課程、見證、成效、師資、費用與時程不顯示為正式內容。

## 已確認內容與假設

- 已確認：分類固定為愛身體、撫慰心、究生命、展現美；正式課程及授課形式以 `PRODUCT.md` 為準。
- 已確認：使用 B「雙域目錄」的資訊結構，移除概念稿的 `b-intro`，並沿用共用 `SiteHeader`。
- 示範內容：概念稿的分類簡介、結尾文案與遠端圖片僅供排版驗證，不是正式可發布內容。
- 已確認：課程總覽為 `/course`，詳情頁為 `/course/[slug]`；站內 URL 由集中式路由 helper 產生，不存入 CMS 或散落在展示元件。

## 內容契約

| 欄位 | 語意與型別 | 必填與範圍 | 編輯責任／資料來源 |
| --- | --- | --- | --- |
| `pageTitle` | 頁面唯一主標題，純文字 | 必填，4–20 字 | 編輯者／Sanity page document |
| `directoryPrompt` | 引導選擇分類的短句，純文字 | 必填，4–24 字 | 編輯者／Sanity page document |
| `categories` | 有順序的分類集合 | 必填，固定 4 項 | 分類定義／Sanity |
| `category.key` | 不受顯示名稱影響的穩定識別碼 | 必填且唯一，固定 4 個列舉值 | 分類定義／Sanity |
| `category.name` | 分類正式名稱，純文字 | 必填，2–8 字 | 分類定義／Sanity |
| `category.slug` | 由 `key` 對應的頁內錨點 | 必填且唯一，不作為課程關聯依據 | 前端／集中式對應表 |
| `category.order` | 四個分類的顯示順序 | 必填且唯一，1–4 | 分類定義／Sanity |
| `category.summary` | 分類學習方向摘要，純文字 | 必填，20–80 字 | 編輯者／Sanity |
| `category.courses` | 依課程分類 reference 查詢出的已發布集合 | 可為空；典型 1–3 項，版面需容納單類 8 項及全頁 12 項 | 系統／Sanity query |
| `course.title` | 課程正式名稱，純文字 | 必填，2–40 字 | 課程編輯者／Sanity course document |
| `course.slug` | 詳情頁穩定識別碼 | 必填且全站唯一，1–60 個小寫英數與連字號 | 課程編輯者／Sanity |
| `course.href` | 由 slug 產生的 `/course/[slug]` 站內路徑 | 衍生值，不存入 CMS | 系統／集中式路由 helper |
| `course.category` | 所屬分類 reference | 必填且僅 1 個 | 課程編輯者／Sanity |
| `course.deliveryModes` | 授課形式列舉 | 必填，1–2 項且不重複：`inPerson`、`online` | 課程編輯者／Sanity |
| `course.summary` | 支援首頁及詳情頁的課程摘要 | 必填，30–100 字；總覽第一版不顯示 | 課程編輯者／Sanity |
| `course.image` | 代表圖、裁切焦點及替代文字 | 選填；有資訊意義時替代文字必填 | 課程編輯者／Sanity image |
| `course.order` | 分類內的顯示順序 | 必填且同分類唯一 | 課程編輯者／Sanity |
| `course.isPublished` | 是否可出現在公開頁面 | 必填；只有 `true` 才查詢 | 課程編輯者／Sanity |
| `endingMessage` | 目錄後的收束文案 | 選填，8–40 字 | 編輯者／Sanity page document |

分類數量由已確認產品架構固定為四項；課程數量顯示實際已發布筆數，不呈現「待確認」的假課程或灌水數字。圖片缺少時使用品牌化的非文字占位表面，不以失效圖片或虛構照片替代。

### 共用課程梯次與日期模型

課程總覽第一版不顯示完整梯次日期，但首頁選取與後續詳情頁共用下列模型；CMS 不另存首頁專用課程資料。

| 欄位 | 語意與型別 | 必填與範圍 | 編輯責任／資料來源 |
| --- | --- | --- | --- |
| `run.course` | 此梯次所屬課程，reference | 必填且僅 1 個 | 課程編輯者／Sanity |
| `run.label` | 區分梯次的編輯用名稱 | 必填，2–40 字；不作為課程名稱 | 課程編輯者／Sanity |
| `run.registrationStatus` | 報名狀態列舉 | 必填：`scheduled`、`open`、`full`、`closed`、`cancelled` 或 `completed` | 課程編輯者／Sanity |
| `run.isPublished` | 是否可供公開頁面查詢 | 必填 | 課程編輯者／Sanity |
| `run.stages` | 同一梯次內依序完成的階段 | 必填，最少 1、典型 1–3、最多 10 階 | 課程編輯者／Sanity |
| `stage.title` | 階段名稱 | 必填，2–20 字 | 課程編輯者／`run.stages[]` |
| `stage.order` | 梯次內階段順序 | 必填且同梯次唯一 | 課程編輯者／`run.stages[]` |
| `stage.dateRanges` | 同一階段的一或多段連續上課日期 | 必填，最少 1、典型 1–2、最多 6 段 | 課程編輯者／`run.stages[]` |
| `dateRange.startDate` | 該段首日，ISO `date` | 必填，格式 `YYYY-MM-DD` | 課程編輯者／Sanity |
| `dateRange.endDate` | 該段末日，ISO `date`，含首尾日 | 必填且不得早於 `startDate` | 課程編輯者／Sanity |

`course` 保存不隨開班改變的介紹，`run` 代表一次可報名的完整梯次，`stage` 代表該梯次的學習階段，`dateRange` 代表一段連續上課日。同一階段跨兩週時建立兩個 date range，不把日期存成不可運算的自由文字。顯示格式由前端依 `zh-TW` 產生，CMS 只儲存 ISO 日期。

以下僅示範資料結構，不代表正式課程或日期：

```yaml
stages:
  - title: 第一階
    order: 1
    dateRanges:
      - { startDate: 2026-01-21, endDate: 2026-01-25 }
      - { startDate: 2026-01-28, endDate: 2026-02-01 }
  - title: 第二階
    order: 2
    dateRanges:
      - { startDate: 2026-06-19, endDate: 2026-06-23 }
```

系統以所有 `dateRange.startDate` 的最早值推導 `run.firstStartDate`，以所有 `dateRange.endDate` 的最晚值推導 `run.lastEndDate`；兩者不由編輯者重複輸入。日期區間不得倒置或重疊，階段及日期必須依時間遞增。如果一次報名涵蓋多階，使用一個 run；如果每階可獨立報名，則建立不同 run，不把它們當成同一 run 的 stage。

## 狀態與行為

- **一般：** 目錄顯示分類名稱與已發布課程數；選擇分類後以頁內錨點移動至對應內容，URL hash 可直接定位。
- **Loading：** 保留雙域骨架與標題空間，避免版面跳動；不可顯示假課程名稱。
- **全部為空：** 顯示可辨識的頁面標題與「目前沒有可瀏覽的課程」訊息，不顯示空目錄或結尾回跳。
- **單一分類為空：** 分類仍顯示，並說明目前沒有已發布課程；目錄計數為 0。
- **Error：** 顯示簡短錯誤說明及重試操作；共用 Header 仍可使用。
- **部分內容缺少：** 選填圖片或結尾文案省略後不留下空連結；缺少課程必要欄位的項目不渲染，並由資料驗證阻止發布。
- **長內容：** 標題與摘要自然換行，不裁切；最多 8 門課時仍維持可掃讀的分隔與錨點定位。
- **互動回饋：** 課程列、目錄連結、重試及回到目錄操作都有 hover 與 `focus-visible`；目前所在分類可視情況提供非唯一的視覺提示，但不能只靠顏色傳達。

## 響應式與無障礙

- 桌面延續 B 方案約 35%／65% 雙欄；左側目錄在不遮住共用 Header 的前提下於視窗內固定，右側依分類垂直閱讀。
- 不大於 1023px 時改為單欄：共用 Header 固定在頂部，目錄回到正常文件流，課程內容依分類與資料順序排列。
- `main` 內只有一個 `h1`；分類使用 `section` 與 `h2`，課程名稱使用後續層級。移除 banner 後，原目錄提問區承擔頁面主標題與導覽說明。
- 分類目錄使用具名稱的 `nav` 與清單；錨點目標需有與固定 Header 相容的 `scroll-margin-top`。DOM、螢幕閱讀器與鍵盤順序一致。
- 課程整列為單一連結，觸控目標至少 44 × 44px。裝飾圖片使用空 `alt`；具內容意義的圖片使用編輯者提供的替代文字。
- 尊重 `prefers-reduced-motion`；關閉平滑捲動與圖片縮放後，資訊和定位功能仍完整。

## 驗收條件

1. `/course` 在共用 `SiteHeader` 下直接顯示 B 方案雙域目錄，不包含 `b-intro` 或其他首頁式 banner。
2. 頁面依固定順序呈現四個已確認分類；目錄數量等於各分類實際已發布課程數。
3. 目錄連結可用滑鼠與鍵盤移至正確分類，直接載入分類 hash 時內容不被固定 Header 遮住。
4. 每個有效課程只有一個清楚的站內連結；課程圖缺少時不出現破圖或無意義替代文字。
5. 桌面為固定目錄加內容雙欄；1023px、768px、390px、320px 及 200% 文字縮放下為正確閱讀順序，無水平捲動、文字裁切或重疊。
6. 全空、分類空、讀取中、讀取失敗、缺少選填圖片及最長合理內容都有明確且可操作的呈現。
7. 不顯示 `PRODUCT.md` 未確認的生命數字學、直覺式塔羅或概念稿舊站文案為正式內容。
8. 課程詳情 URL 一律由 slug 產生為 `/course/[slug]`；CMS 與展示元件不保存或拼接完整站內路徑。
9. 多階段梯次可保存依序排列的 date range；單日、跨月及跨年日期皆不需自由文字。
10. `run.firstStartDate` 與 `run.lastEndDate` 可由巢狀日期一致推導；日期倒置、重疊或順序重複時不得發布。

## 依賴、待決事項與下一階段

- 依賴共用 `SiteHeader` 支援「無 banner、載入即顯示」的頁面模式；本規格不在此階段修改元件。
- Sanity 的課程、分類與課程總覽 page schema 尚待 CMS 階段確認；目前內容契約先作為前端與 schema 的共同邊界。
- 前端 prototype 已完成；分類簡介、代表圖、結尾文案及課程 slug 仍是 `app/fixtures/courseOverview.ts` 中明確標示的 fixtures，尚非正式發布內容。
- 各階段是否可獨立報名須在建立正式梯次前確認；此決定影響 stage 與 run 的切分，但不阻擋總覽 prototype。
- 已核准的設計方向記錄於 [`web/.impeccable/surfaces/app-pages-course-vue.md`](../../.impeccable/surfaces/app-pages-course-vue.md)；下一階段使用 `verify-ui-behavior` 進行規格矩陣與互動驗證。
