# 課程總覽頁規格

**狀態：** verified
**路由：** `/course`  
**設計依據：** [課程頁概念稿](../design/course-page-concepts.html) 的 B「雙域目錄」骨架與 [高概念四案](../design/course-content-concepts-award.html) 的 F「光片長鏡」；最終尺寸、色彩與互動以目前 `CourseOverview.vue` 為準

## 目標與受眾

協助正在評估身心課程的訪客，先按「愛身體、撫慰心、究生命、展現美」理解學習方向，再從每個分類的沉浸場景中比較課程並進入個別課程頁。頁面延續首頁的品牌語言，但不重複首頁 banner；共用 `SiteHeader` 後直接進入左側目錄與右側光片劇場。

## 範圍與非目標

第一版包含四個已確認分類、分類目錄、各分類簡介、已發布課程連結、課程代表圖，以及頁尾的回到目錄操作。桌面使用全寬雙欄：左側為貼齊視窗、固定 `400px` 的淺砂色目錄，右側暖紙底內容填滿剩餘欄寬且不設最大寬度，課程沿用 F「光片長鏡」的深色影像光片；手機轉為依文件順序堆疊的單欄。

本階段不涵蓋個別課程內容、課程搜尋或篩選、站內報名、付款、會員功能，也不新增首頁式 banner。未經確認的課程、見證、成效、師資、費用與時程不顯示為正式內容。

## 已確認內容與假設

- 已確認：分類固定為愛身體、撫慰心、究生命、展現美；正式課程及授課形式以 `PRODUCT.md` 為準。
- 已確認：使用 B「雙域目錄」的資訊結構，移除概念稿的 `b-intro`，沿用共用 `SiteHeader`，並採用經手動調整的 F「光片長鏡」作為右欄內容方向；光片不顯示箭頭。
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
| `course.category` | 所屬分類 reference | 必填且僅 1 個；選單只顯示四份正式公開 ID | 課程編輯者／Sanity |
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
| `run.registrationStatus` | 報名狀態列舉 | 必填：`scheduled`、`open`、`full`、`closed`、`cancelled` 或 `completed`；`open` 時需 HTTPS 報名網址 | 課程編輯者／Sanity |
| `run.isPublished` | 是否顯示於公開網站 | 必填；關閉時不顯示梯次與報名狀態 | 課程編輯者／Sanity |
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

- **一般：** 目錄顯示分類名稱與已發布課程數；選擇分類後以頁內錨點移動至對應內容，URL hash 可直接定位。從首頁 Banner 進入或資料由 loading 轉為 ready 時，也會套用相同 hash、捲到目標並同步作用中目錄。
- **Loading：** 保留雙域骨架與標題空間，避免版面跳動；不可顯示假課程名稱。
- **全部為空：** 顯示可辨識的頁面標題與「目前沒有可瀏覽的課程」訊息，不顯示空目錄或結尾回跳。
- **單一分類為空：** 分類仍顯示，並說明目前沒有已發布課程；目錄計數為 0。
- **Error：** 顯示簡短錯誤說明及重試操作；共用 Header 仍可使用。
- **部分內容缺少：** 選填圖片或結尾文案省略後不留下空連結；缺少課程必要欄位的項目不渲染，並由資料驗證阻止發布。
- **長內容：** 標題與摘要自然換行，不裁切；單類 4–8 門課時分成最多每列 4 門的兩列，不把光片壓成不可閱讀的窄條。
- **課程名稱字級：** 桌面預設為 `30px`；光片 hover 或 `focus-visible` 時提高為 `36px`，使用 `0.3s ease` 過渡。`<= 1023px` 的基準與互動字級皆為 `34px`，長課名必須自然換行。
- **互動回饋：** 桌面光片在 hover 與 `focus-visible` 時只擴張目前目標，課程名稱同步放大，影像恢復較完整色彩並縮回原始比例；光片不使用箭頭或額外圖示。目錄連結、重試及回到目錄操作也保留清楚回饋。目前所在分類以文字色與粗體共同標示，不只依賴顏色。

## 響應式與無障礙

- 桌面雙欄保持全寬，左側淺砂色目錄固定 `400px` 並貼齊視窗左側，在不遮住共用 Header 的前提下於視窗內固定；右側內容填滿剩餘欄寬且不設最大寬度。右側暖紙底內容區保留 30px 頂部間距，每個分類接近一個視窗高，典型 1–3 片深色影像光片並列。
- 不大於 1023px 時改為單欄：共用 Header 固定在頂部，目錄回到正常文件流；分類場景及課程光片依資料順序垂直排列，不使用桌面的寬度擴張。
- `main` 內只有一個 `h1`；分類使用 `section` 與 `h2`，課程名稱使用後續層級。移除 banner 後，原目錄提問區承擔頁面主標題與導覽說明。
- 分類目錄使用具名稱的 `nav` 與清單；錨點目標需有與固定 Header 相容的 `scroll-margin-top`。DOM、螢幕閱讀器與鍵盤順序一致。
- 每片課程光片為單一連結，觸控目標至少 44 × 44px。裝飾圖片使用空 `alt`；具內容意義的圖片使用編輯者提供的替代文字。
- 尊重 `prefers-reduced-motion`；關閉平滑捲動、光片尺寸、課程名稱字級過渡與影像縮放後，資訊和定位功能仍完整。

## 驗收條件

1. `/course` 在共用 `SiteHeader` 下直接顯示全寬雙域骨架；固定 `400px` 的淺砂色目錄貼齊視窗左側，暖紙底光片內容區填滿剩餘欄寬且不設最大寬度，不包含 `b-intro` 或其他首頁式 banner。
2. 頁面依固定順序呈現四個已確認分類；目錄數量等於各分類實際已發布課程數。
3. 目錄連結可用滑鼠與鍵盤移至正確分類，直接載入分類 hash 時內容不被固定 Header 遮住。
4. 每個有效課程只有一個不含箭頭的光片連結；桌面 hover 與鍵盤焦點只擴張目前目標，課程圖缺少時使用品牌表面且不出現破圖或無意義替代文字。
5. 桌面為固定目錄加光片場景雙欄；1023px、768px、390px、320px 及 200% 文字縮放下改為正確單欄順序，無頁面水平捲動、文字裁切或重疊。
6. 全空、分類空、讀取中、讀取失敗、缺少選填圖片及最長合理內容都有明確且可操作的呈現。
7. 不顯示 `PRODUCT.md` 未確認的生命數字學、直覺式塔羅或概念稿舊站文案為正式內容。
8. 課程詳情 URL 一律由 slug 產生為 `/course/[slug]`；CMS 與展示元件不保存或拼接完整站內路徑。
9. 多階段梯次可保存依序排列的 date range；單日、跨月及跨年日期皆不需自由文字。
10. `run.firstStartDate` 與 `run.lastEndDate` 可由巢狀日期一致推導；日期倒置、重疊或順序重複時不得發布。

## UI 驗證記錄

2026-10-06 以 Chrome headless 驗證 1440、1023、768、390、320px，以及 720 CSS px／2× device scale 的 200% 等效版面。驗收條件 1–8 均通過：雙欄與單欄斷點正確、無水平溢位；鍵盤焦點只擴張目標光片，hash 目標位於固定 Header 下方；標題階層、圖片替代文字、44px 觸控目標與 reduced-motion 成立。loading、error、全空、分類空、無圖片、40 字課名、80 字摘要及單類 8 門課皆完成瀏覽器檢查。

- 當時的自動檢查：`npm run test -w web`（43 項通過）、`npm run typecheck -w web`、`npm run build -w web`。
- 截圖：[1440px 完整頁](../design/review/verification-course/course-1440-full.webp)、[390px 完整頁](../design/review/verification-course/course-390-full.webp)、[200% 等效版面](../design/review/verification-course/course-200-percent.webp)、[長內容](../design/review/verification-course/course-long-content-390-full.webp)；其餘狀態位於同一目錄。
- 當時未驗證：驗收條件 9–10 尚未建立 CMS 梯次 schema；本輪未使用實體觸控裝置或螢幕閱讀器。

## CMS 串接記錄

2026-10-06 完成本機 Sanity 整合。Studio 已加入 `courseOverviewPage`、四個固定 `courseCategory`、`course`、`courseRun`、`courseStage` 與 `courseDateRange`；課程梯次驗證涵蓋日期倒置、日期重疊、階段順序重複或倒退，首末日期由巢狀區間推導。驗收條件 9–10 已由 Studio schema 單元測試覆蓋，但尚未在遠端 Studio 進行實際發布驗證。

`/course` 已改由 `/api/course-overview` 查詢 published perspective。查詢只取固定分類與 `isPublished == true` 的已發布課程，詳情 URL 由集中式 slug helper 產生；解析層會拒絕不完整的頁面或分類契約，略過無效、未公開、順序或 slug 重複的課程，並將有效 image hotspot 轉為前端裁切位置。正常、全空、無效資料及查詢錯誤均有自動測試，fixture 只留作測試資料。

本階段未部署 schema、未修改遠端 dataset，也未建立或發布正式課程內容。網站與 Studio 必須分別由環境變數提供 Sanity Project ID 與 dataset；儲存庫不記錄實際專案識別碼或憑證。

- 自動檢查：`npm run test -w web`（52 項通過）、`npm run typecheck -w web`、`npm run build -w web`。
- Studio 檢查：`npm run test -w studio`（8 項通過）、`npm run typecheck -w studio`，以及使用非正式測試 Project ID 執行的 `npm run build -w studio`。
- 已知警告：Web 型別檢查仍輸出既有的 `vue-router/volar/sfc-route-blocks` 套件匯出警告，但型別檢查成功完成。

## 內容流驗證記錄

2026-10-06 對 `studio/.env.local` 所設定的 `production` dataset 執行唯讀驗證。`courseOverviewPage`、1 門公開課程與 1 個梯次存在；Studio 也確認四個分類已發布，但既有分類 ID 使用 `courseCategory.body` 等含句點格式。Sanity 公開 Data API 對四個分類皆回傳 `omitted: permission`，因未驗證請求只能讀取 ID 不含句點的 published 文件，導致網站查詢得到 0 個分類。

本機 Web 原先缺少環境設定，已建立受 Git 忽略的 `web/.env` 並指向與 Studio 相同的 project／production dataset。分類固定 ID 已改為 `course-category-body`、`course-category-heart`、`course-category-life`、`course-category-beauty`，Studio 結構、GROQ 與回歸測試同步更新；四個新分類現已發布並可由匿名 Data API 讀取。

四個新分類文件發布後，production 課程仍引用舊 `courseCategory.body`。查詢已加入限縮於固定 key 的遷移期相容條件：優先接受新公開 ID 的 reference，也將 `courseCategory.<key>` 映射到同 key 的新分類，使既有課程可先在前台顯示。此相容層不取代 reference 遷移，舊 ID 清理前仍須執行 migration。

以 production 啟動本機 Nuxt 實測後，`/api/course-overview` 已回傳 `state: ready`、四個分類及「身心再平衡按摩」的文字、授課形式與圖片，確認前台資料鏈路恢復。若既有開發伺服器仍顯示舊結果，需重新啟動以載入更新後的 server query。

- 自動檢查：Web 52 項與 Studio 8 項測試、兩邊 typecheck、兩邊 build 均通過；`npx sanity schemas validate --level warning` 為 0 errors、0 warnings。
- 遠端狀態：Sanity CLI 尚未登入；本輪只執行匿名唯讀查詢，未修改 production。新分類已由編輯者建立，仍需以已驗證身分更新所有課程 reference，驗證前台後才可保留或清理舊文件。
- 遷移準備：已新增 `20261006-public-course-category-ids` Sanity migration；預設 dry run，正式執行時建立新分類並更新 course reference，不刪除舊分類。
- 尚未驗證：草稿保留舊 published 版本、發布後文字／圖片／排序／連結、最少／典型／最大內容量、遠端欄位錯誤提示、手機與桌面實際發布內容。因沒有可驗收的四分類與課程內容，本輪未產生新的內容流截圖，狀態保留 `cms-integrated`。
- 完成條件：取得 production 寫入與 schema 部署的明確授權並完成 CLI 登入，使用可辨識且可清理的測試內容走完草稿、發布及復原流程；不得覆寫既有 `courseOverviewPage` 正式內容。

## Production 部署與發布驗證記錄

2026-10-06 取得 production 寫入授權後，先完整匯出 12 份文件與 3 個 assets 至本機暫存備份，再正式執行 `20261006-public-course-category-ids` migration。四個公開分類文件原已存在；migration 將「身心再平衡按摩」的分類 reference 更新為 `course-category-body`，保留舊 `courseCategory.*` 文件供後續確認與清理。Studio schema `_.schemas.default` 已部署至 project `hnypuj6l` 的 `production` dataset。

以 `drafts.course-validation-20261006` 驗證草稿隔離：已驗證請求可讀取草稿，匿名 published 查詢無結果。接著短暫發布同 ID 的測試課程，匿名 GROQ 與本機 `/api/course-overview` 均正確回傳四分類順序、slug、兩種授課形式、圖片替代文字及由 hotspot 產生的 `20% 70%` 裁切位置；清除 draft 與 published 文件後再次查詢為空，前台恢復為 1 門正式資料與 3 個空分類，未覆寫 `courseOverviewPage`。

- 實際驗證：Web 52 項、Studio 8 項測試、兩邊 typecheck 與 build 均通過；production 文件驗證為 0 errors、1 個既有 `homeBanner.slides` 警告。
- 欄位防呆：未寫入 dataset 的無效課程 fixture 產生 9 個 errors 與 1 個 warning，涵蓋課名、slug、摘要、授課形式、圖片 alt 與分類內重複排序。
- 瀏覽器驗證：Chrome headless 以 production 發布內容檢查 1440px 與 390px；雙欄／單欄、空分類、圖片裁切及文字均無溢位或重疊。截圖：[桌面首屏](../design/review/verification-course/course-production-flow-1440.webp)、[手機首屏](../design/review/verification-course/course-production-flow-390.webp)、[手機完整頁](../design/review/verification-course/course-production-flow-full-390.webp)。
- 未執行：實體觸控裝置與螢幕閱讀器人工操作；舊 `courseCategory.*` 文件尚未刪除。

## 正式內容審核記錄

2026-10-06 以已驗證的 raw perspective 盤點 production。六門已確認課程中，目前只有「身心再平衡按摩」文件存在並公開；名稱、愛身體分類與實體授課形式符合 `PRODUCT.md`，但其摘要與圖片仍屬待內容負責人核准的初步內容。頭薦骨、日式臉部按摩、童年依附創傷療癒、人類圖及曼陀羅靜心彩繪均尚無文件，也沒有可供正式發布的核准摘要與 slug，因此本輪未自行補寫或發布。

`courseOverviewPage.endingMessage` 原為明顯測試字串 `test word`，已在完整匯出 production 備份後以 revision 鎖定方式移除；匿名 published 查詢不再回傳該欄位。整個 dataset 對 `courseCategory.body`、`courseCategory.heart`、`courseCategory.life`、`courseCategory.beauty` 的 raw reference 查詢皆為 0，但依階段範圍保留四個舊文件，未在本輪刪除。

- 已完成：正式內容矩陣盤點、測試文案清除、舊分類 reference 歸零確認與變更前備份。
- 尚待內容負責人提供：每門課程 30–100 字正式摘要與核准 slug；若使用代表圖則一併提供圖片及替代文字，否則明確確認無圖發布。另需確認現有「身心再平衡按摩」摘要與圖片可正式使用。
- 下一階段：取得上述核准內容後，先建立 draft 供逐門審閱，再發布並以匿名 API 與桌面／手機前台驗收；舊分類文件清理由獨立變更處理。

## 依賴、待決事項與下一階段

- 依賴共用 `SiteHeader` 支援「無 banner、載入即顯示」的頁面模式；本規格不在此階段修改元件。
- 課程總覽已不再匯入 fixture 作為主要資料；production 正式內容目前僅覆蓋 1／6 門課程，且現有摘要與圖片仍待內容負責人核准。其餘五門的正式摘要與 slug 尚待提供；代表圖可選填，有圖時必須提供替代文字。
- 各階段是否可獨立報名須在建立正式梯次前確認；此決定影響 stage 與 run 的切分，但不阻擋總覽 CMS 串接。
- `validate-content-flow` 已完成 production schema 部署、公開 ID migration、草稿／published 隔離、匿名公開讀取、瀏覽器呈現及測試資料清除；狀態維持 `verified`。舊 `courseCategory.*` reference 已確認為 0，文件本身留待獨立清理變更。
- 已核准的原始方向記錄於 [`web/.impeccable/surfaces/app-pages-course-vue.md`](../../.impeccable/surfaces/app-pages-course-vue.md)；目前 Vue 實作及本規格記錄其後續手動調整。
- 課程與活動總覽左欄的頁面標題及導讀共用 `DirectoryIntro.vue`；導讀使用左欄完整可用寬度，不另設桌機最大寬度，標題與導讀間距為 `25px`。分類導覽仍由課程頁自行管理。

## 共用左欄導讀調整記錄

2026-10-12 將課程與活動總覽重複的頁面標題、導讀標記及響應式樣式抽成 `DirectoryIntro.vue`。課程分類與活動檢視切換仍由各自頁面維護。Chromium 於 1440px 確認兩頁導讀維持約 12em（242px），390px 時 `max-width` 為 `none` 並完整使用 327px 可用寬度，兩頁皆無水平溢位。`npm run test -w web` 通過 20 個測試檔、117 項測試；typecheck、build 與 Impeccable layout detector 均通過。

## 首頁分類深連結回歸

2026-10-20 配合首頁 Banner 四個分類入口，課程總覽在初次 ready 或 loading 後轉為 ready 時讀取 `#body`、`#heart`、`#life`、`#beauty`，一次性捲至對應 section 並設定左欄 `aria-current="location"`；後續 IntersectionObserver 仍接手一般捲動狀態。Chrome 1440×1000 實測四個 target 頂端皆為 107px、固定 Header 底部為 99px；390×844 的 `#beauty` 頂端為 93px、Header 底部為 87px，兩尺寸皆無水平溢位。Web 39 檔／229 項測試、typecheck 與 production build 通過。證據見 [首頁 Banner 課程分類連結驗收](../design/review/home-banner-course-targets-2026-10-20/README.md)。

## 課程後台修正記錄

2026-10-23 唯讀盤點 production，確認分類重複來自四份 `course-category-*` 正式文件及四份 `courseCategory.*` 舊版相容文件；現有課程 reference 已限縮為四份正式 ID，未刪除遠端舊文件。梯次報名原已採 `registrationStatus`、`registrationUrl` 與 `isPublished` 三欄協作；現有唯一梯次為 `open`，但未公開且缺網址，因此前台不顯示報名入口。Studio 導覽改名為「課程梯次／報名設定」，欄位說明與順序明確化，並在選擇 `open` 時立即要求 HTTPS 網址。完整狀態見 [課程後台修正紀錄](../corrections/course-admin-corrections-2026-10-23.md)。

#### 筆記，不需要執行，可忽略
- 使用 `web/.agents/skills/develop-feature/SKILL.md` 從 `docs/specs/course` 接續下一個流程

#### 待修正項目
[] 有任何問題需要協助嗎？ 這個區塊的連結按鈕 改成連去：/about#聯絡我們

## 2026-10-24 總覽字體角色遷移

課程總覽與 `DirectoryIntro` 已改用正式角色 token：頁面／分類標題採 `title-lg`、光片課名採 `title-sm`、摘要採 `body`、形式與補充資訊採 `label/meta`。光片 hover／focus 保留欄寬與影像變化，不再把課名字級放大為獨立尺寸。type detector 為 0，完整 Web 測試、typecheck 與 build 通過；響應式視覺驗收待補。

## 2026-10-24 共用導讀手動微調

`DirectoryIntro` 的導讀已移除桌機 `12em` 最大寬度，改為使用 rail 內完整可用寬度；標題與導讀的上距由 `28px` 微調為 `25px`。課程結尾與狀態標題也移除 `12em` 上限，依所在內容區自然換行。這些變更不改變既有 `title-lg`／`lead`／`title-xl` 角色或 `1023px` 單欄斷點。相關 5 檔／30 項測試、typecheck、production build 與 `git diff --check` 通過；桌機、手機及長文換行仍待瀏覽器視覺驗收，舊有 12em 截圖不作為本版證據。
