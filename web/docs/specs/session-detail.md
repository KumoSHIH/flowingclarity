# 個案諮詢內頁規格

**狀態：** verified

**路由：** `/session/[slug]`

**頁面模式：** Evaluate／Contact；協助已從執行師名錄進入的訪客理解該執行師的服務取向、經歷、服務項目與地點，並找到合適的站外聯繫入口

**設計依據：** [`session.md`](session.md)、[`events-detail.md`](events-detail.md)、[`DESIGN.md`](../../DESIGN.md)，以及使用者提供的舊站截圖；舊站只用於辨認候選欄位，不沿用版面、文案、人物資料或聯絡資訊

## 目標與受眾

主要受眾是已在 `/session` 依地區或服務項目找到候選執行師，想進一步判斷其服務是否適合自己的訪客。頁面須讓訪客依序確認「這是誰、服務取向、提供哪些服務、在哪裡、如何聯繫」，再閱讀完整介紹與經歷，決定是否前往外部管道詢問。

成功標準是訪客不需猜測即可辨認執行師、理解服務範圍與下一步；缺少選填照片或部分補充資訊時仍可完整閱讀。頁面不得暗示療效、保證結果，或把未經核准的資格、地址與私人聯絡方式公開。

## 範圍與非目標

第一版包含共用 `SiteHeader`／`SiteFooter`、可返回執行師名錄的麵包屑、姓名與選填英文名、選填人物照、服務取向摘要、完整介紹、經歷、服務地區、服務項目，以及至少一個已核准的站外聯繫入口。總覽與詳情共用同一份 `practitioner` 文件、slug、taxonomy references 與 `isPublished`；詳情必填內容不完整時不得公開。

第一版不包含站內預約、即時可約時段、付款、會員、留言表單、評分、個案紀錄、醫療診斷、療效保證、距離定位或精確地圖。聯繫後的回覆、預約確認、取消與付款流程由外部管道處理；未確認前不在頁面承諾回覆時間。

## 已確認事實、參考內容與工作假設

- 已確認：公開路由為 `/session/[slug]`，入口來自 `/session` 執行師名錄；公開介面目前統一使用「執行師」。
- 已確認：姓名、英文名、slug、地區、服務項目、摘要、排序及公開狀態已有 `practitioner` 文件；服務項目是可擴充 taxonomy，不能在詳情另存一份自由文字清單。
- 參考內容：舊站可辨認人物照、介紹、經歷、服務地區、服務項目與 LINE ID；截圖中的姓名、照片、文字、地點、電話／LINE 資訊均不是已核准正式內容。
- 已確認：服務城市可由後台新增；每個服務地區可個別選擇只公開城市、公開地點名稱，或連同完整地址公開。
- 已確認：聯繫方式支援電話、LINE ID、Facebook、LINE 官方連結及預約表單；顯示文字與實際目的地分開管理。
- 已確認：`practitioner` 不設逐筆「對外公開同意」欄位；內容負責人在資料進入 CMS 前完成授權與公開審核。
- 工作假設：人物照為選填；沒有照片時以品牌排版成立，不顯示人物剪影或空白圖片框。若原圖很小，版面不得強制放大造成明顯失真。

## 資訊架構與顯示規則

1. `SiteHeader` 從載入起顯示，「個案諮詢」維持目前導覽狀態；`main` 只有執行師姓名一個 `h1`。
2. 首區包含返回名錄、姓名、選填英文名、服務取向摘要及選填人物照。照片不可取代姓名文字。
3. 主要內容依語意包含「關於執行師」、「經歷」、「服務資訊」與「聯繫方式」；沒有內容的選填區塊整段省略，不留下空標題。
4. 側欄依序顯示服務項目、服務地區與聯繫方式。服務項目名稱直接取自既有 taxonomy；城市由可擴充 taxonomy 取得，地點名稱與地址依每筆公開層級顯示。
5. 聯繫操作以原生連結開啟站外管道；需讓訪客在點擊前辨認目的地。新分頁連結須安全設定 `noopener noreferrer`，並以可見文字或輔助說明告知會離開本站。
6. 正式頁面只讀取 published perspective。slug 不存在、文件未公開或必填契約無效時顯示一致的 not-found，不得以 fixture 或另一位執行師補位。

## 內容契約

### 共用與人物內容

| 欄位 | 語意與型別 | 必填與合理範圍 | 編輯責任／預定來源 |
| --- | --- | --- | --- |
| `name` | 執行師公開姓名；頁面唯一 `h1` | 必填，2–20 字 | 執行師內容編輯者／既有 Sanity `practitioner` |
| `englishName` | 英文名或公開稱呼 | 選填，2–40 個拉丁字元 | 執行師內容編輯者／既有欄位 |
| `slug` | 詳情頁穩定識別碼 | 必填且唯一，1–60 個小寫英數與連字號 | 執行師內容編輯者／既有欄位 |
| `summary` | 服務取向摘要，供首區快速判斷 | 詳情公開時必填，20–100 字 | 執行師內容編輯者／既有欄位 |
| `portrait` | 選填人物照與媒體資訊 | 0–1 張；建議直幅、來源及公開權利已確認 | 內容編輯者／Sanity image asset |
| `portrait.alt` | 描述照片中可辨識的人物與必要情境 | 有圖必填，2–100 字；不得只寫「圖片」或重複姓名 | 內容編輯者／Sanity |
| `portrait.displayMode` | 人物照呈現方式 | 選填 enum：`contained`（限制寬度）或 `cover`（滿版裁切）；未設定沿用 `contained` | 內容編輯者／Sanity |
| `bio` | 完整介紹、工作方式與服務觀點；純文字保留換行 | 詳情公開時必填，60–1,200 字；1–6 段 | 執行師內容編輯者／Sanity |
| `experienceItems` | 公開經歷、訓練或現職的可排序純文字清單 | 選填 0–12 筆；每筆 4–100 字 | 執行師內容編輯者／Sanity |
| `isPublished` | 同時控制總覽及詳情是否公開 | 必填，boolean；設為 true 時須通過完整詳情驗證 | 執行師內容編輯者／既有欄位 |

`experienceItems` 只記載可核實且同意公開的內容；不以頁面自行推論證照、醫療資格或年資。`bio` 與經歷不得以 `v-html` 輸出；編輯者換行以安全純文字呈現。

### 服務與聯繫內容

| 欄位 | 語意與型別 | 必填與合理範圍 | 編輯責任／預定來源 |
| --- | --- | --- | --- |
| `regions` | 總覽篩選與詳情共用的服務地區 references | 必填，1–5 項且不重複 | 內容編輯者／既有 `sessionRegion` taxonomy |
| `serviceLocations` | 可排序服務地區物件 | 選填 0–6 筆；每筆含 `cities` references、選填 `venueName` 2–60 字、選填 `address` 2–120 字與 `publicDetail` | 執行師內容編輯者／Sanity |
| `serviceLocations[].cities` | 公開服務城市 references | 每筆必填，可多選 1–6 個且不重複；指向可新增的 `sessionCity` taxonomy | 內容編輯者／Sanity |
| `serviceLocations[].publicDetail` | 地點公開層級 | 必填 enum：`cityOnly`、`venue`、`fullAddress`；前台不得輸出高於設定層級的資料 | 內容編輯者／Sanity |
| `methods` | 可提供的服務項目 references | 必填，至少 1 項且不重複 | 內容編輯者／既有 `sessionMethod` taxonomy |
| `contactIntro` | 聯繫前提醒，例如預約方式或適合詢問的內容 | 選填，0–240 字；不得承諾未確認的回覆或名額 | 執行師內容編輯者／Sanity |
| `contactItems` | 可排序的公開聯繫入口 | 詳情公開時至少 1、最多 6 筆 | 執行師內容編輯者／Sanity |
| `contactItems[].type` | 聯繫形式 | 必填 enum：`phone`、`lineId`、`facebook`、`lineUrl`、`bookingUrl` | 執行師內容編輯者／Sanity |
| `contactItems[].label` | 訪客可辨認的操作名稱，如「透過 LINE 聯繫」 | 必填，2–30 字 | 執行師內容編輯者／Sanity |
| `contactItems[].displayText` | 公開號碼、LINE ID 或補充文字 | 必填，2–80 字；內容負責人須在輸入前完成公開審核 | 執行師內容編輯者／Sanity |
| `contactItems[].value` | 電話號碼、LINE ID 或站外網址 | 依 type 必填；電話轉為 `tel:`，Facebook／LINE 官方／預約表單只接受有效 HTTPS URL，LINE ID 以文字顯示 | 執行師內容編輯者／Sanity |
| `bookingAction` | 獨立主要預約按鈕 | 選填；含 `label` 2–30 字與有效 HTTPS `url`，未填或無效時整個按鈕省略 | 執行師內容編輯者／Sanity |

聯繫資訊不混在自由文字正文中。電話使用可點擊的 `tel:`，LINE ID 可複製或純文字顯示，Facebook、LINE 官方及預約表單以通過 HTTPS 驗證的外部連結呈現。CMS 不設逐筆同意欄位；編輯責任與發布驗證不可被描述成系統已代替完成授權。

### SEO 與系統資料

| 欄位 | 語意與型別 | 必填與合理範圍 | 編輯責任／預定來源 |
| --- | --- | --- | --- |
| `seoTitle` | 瀏覽器與分享標題 | 選填 10–60 字；缺少時由姓名與站名安全組合 | 內容編輯者／Sanity |
| `seoDescription` | 搜尋摘要 | 選填 50–160 字；缺少時使用 `summary` | 內容編輯者／Sanity |

SEO 不得加入頁面未呈現或未核准的資格、療效、價格與服務地區。人物照是否作為社群分享圖須於設計／CMS 階段另行確認。

## 狀態與行為

- **Ready：** 依內容契約顯示已發布執行師，至少具姓名、摘要、完整介紹、服務地區、服務項目及一個有效聯繫入口。
- **Loading：** 保留 Header、首區與主要章節節奏，使用不含虛構人物資訊的低對比骨架；主要內容設 `aria-busy="true"`。
- **Error：** 顯示暫時無法載入與重新載入操作；保留返回名錄入口，不回退到 fixture。
- **Not found：** slug 不存在、未公開或核心內容無效時顯示一致訊息、返回名錄及共用 Footer；回應狀態應為 404。
- **缺少選填內容：** 無英文名、照片、經歷、精確地點、聯繫說明或 SEO 欄位時直接省略或使用已定義 fallback，不產生空容器。
- **無有效聯繫入口：** 視為不可公開的核心契約錯誤；不得只顯示裸露帳號、無效按鈕或自行改連到全站聯絡方式。
- **長內容：** 20 字姓名、1,200 字介紹、12 筆經歷、6 筆地點、20 個服務項目及 6 個聯繫入口均須自然換行，不裁切或造成水平捲動。
- **互動回饋：** 外部聯繫、返回名錄及重試須具 hover、active、`focus-visible` 與清楚名稱；loading 或無效連結不可表現為可點擊。

## 響應式、語意與無障礙

- 桌面使用主視覺、sticky 資訊側欄與閱讀內容；DOM 順序維持姓名與摘要、服務項目、服務地區、聯繫方式、完整介紹、經歷。`<= 1023px` 回到同順序的單欄，320–390px 不得水平捲動。
- 延續 `DESIGN.md` 的 paper、sand、ink、clay、saffron、persimmon、night、字體與直角控制項；不直接複製舊站的大型英文標籤，也不使用圓角卡片牆、陰影或柔焦療癒圖像。
- 與 `/events/[slug]` 及後續相似內容頁共用詳情字級：桌機 `h1` 為 `clamp(44px, 4.8vw, 72px)`、摘要 `17px / 2`、`h2` 為 `38px / 1.4`、正文 `16px / 2.1`；`<= 1023px` 分別為 `42px`、`16px`、`26px`、`16px`。正文閱讀寬度約 `68ch`，不得在單頁另創相近尺寸。
- 桌機 fixed／sticky 左側資訊欄不使用 `border-right`，只以 surface 色、留白及欄內分隔建立層級；`<= 1023px` 單欄可保留底線與項目分隔。
- fixed／sticky 資訊欄沿用活動詳情共用 padding：桌機資料列 `26px clamp(28px, 3.2vw, 50px)`，`<= 1023px` 為 `22px 24px`；服務地區、服務項目與聯繫方式皆使用此資料列 padding。「聯繫方式」標題須與「服務項目」等資訊小標題相同；聯繫內容、輔助標籤與預約按鈕文字統一為 `14px`，聯繫清單不使用 `border-top` 或 `border-bottom`。相似元件不得另訂近似值。
- 右側連續 `.profile-section` 不使用 `border-top` 或額外 `padding-top`；章節間只以桌機 `76px`、窄版 `64px` 的 margin 維持節奏。
- `main` 只有一個 `h1`；主要章節使用 `section` 與 `h2`，經歷、地點及服務項目使用語意清單。聯繫入口使用 `<a>`，不用非連結元素模擬。
- 人物照有意義時必須提供適當 alt；純裝飾圖形使用空 alt 或從輔助技術隱藏。不可把姓名、服務或聯絡文字烘焙進圖片。
- 操作目標至少 44 × 44px，鍵盤焦點在所有表面清楚可見。200% 文字放大後章節及聯繫操作不得重疊或被 sticky 區域遮住。
- 尊重 `prefers-reduced-motion`；移除平滑捲動與位移後，閱讀、返回、重試及聯繫仍完整可用。

## 驗收條件

1. `/session/[slug]` 只顯示 slug 相符、`isPublished === true` 且詳情契約有效的執行師；未公開、無效及不存在資料回傳一致 404，且不使用 fixture 補位。
2. 頁面使用共用 Header／Footer，導覽正確標示「個案諮詢」，`main` 只有姓名一個 `h1`，並提供返回 `/session` 的連結。
3. 姓名、英文名、摘要、服務地區及服務項目與 `/session` 共用同一份執行師資料；服務項目名稱來自 taxonomy，不另存重複文字。
4. Ready 狀態至少顯示姓名、摘要、完整介紹、服務地區、服務項目與一個有效聯繫入口；人物照、經歷與更精確地點缺少時版面仍成立。
5. 有人物照時顯示核准圖片及有效替代文字；無圖時不出現空框、錯誤圖示或虛構替代人物。
6. 經歷依後台排序完整顯示，且頁面沒有自行推論的證照、年資、醫療資格或療效宣稱。
7. 聯繫入口在點擊前可辨認目的地；電話、LINE ID、Facebook、LINE 官方連結與預約表單均依型別正確呈現，只輸出通過協定驗證的連結，外部新分頁連結具安全屬性。主要「前往預約表單」為選填，未設定時不渲染按鈕；仍須至少有一個有效聯繫項目才能公開。
8. Loading、Error、Not found、缺少各選填欄位與最長內容都有清楚呈現；Error 可重試，Not found 可返回名錄。
9. 320、390、768、1023、1024 與 1440px 均無水平溢位或內容遮擋；200% 文字放大時姓名、清單與聯繫操作仍完整可讀。
10. 返回、重試及所有聯繫入口可由鍵盤操作，焦點可見，操作目標至少 44 × 44px；reduced-motion 不影響功能。
11. 舊站截圖中的人物、照片、介紹、地點及 LINE ID 不會出現在正式頁面，除非內容負責人另行核准並輸入 CMS。

## 依賴、待決事項與下一階段

- 內容負責人需提供並核准正式執行師介紹、可核實經歷、人物照與使用權、服務地區及聯繫管道；目前沒有任何舊站人物內容可直接發布。後台不另設對外公開同意欄位。
- `shape-ui-direction` 已選定 C「靜謐檔案」，經歷區改採 A 的單欄長列；固定左欄無右框線，字級套用共用詳情契約。
- 人物照可由後台選擇 C1「限制寬度」或「滿版裁切」：前者在砂色媒體欄置中、不強制放大，適合小圖；後者填滿媒體欄並依 hotspot 裁切。未設定的舊資料使用限制寬度。手機／平板依語意改成單欄，facts rail 在平板為雙欄、手機為單欄。
- Sanity schema、published-only API、資料轉換與前台串接皆已完成，並已在 production dataset 通過隔離的草稿／發布／更新／取消發布／匿名讀取與清理流程。正式執行師內容仍由內容負責人提供與審核。

## 已選桌機設計方向

2026-10-14 完成三款桌機互動比較稿，位於 [`session-detail-concepts.html`](../design/session-detail-concepts.html)，並選定 C「靜謐檔案」的欄位化檔案與 sticky 服務摘要；經歷區採 A 的單欄長列。選定稿另提供三種不強制放大小圖的排法，位於 [`session-detail-selected-desktop.html`](../design/session-detail-selected-desktop.html)：C1 保留砂色媒體欄並以原尺寸裱框，C2 將肖像縮至姓名旁，C3 讓首屏純文字成立並把圖片移入「關於執行師」。

原三案 1440px 首屏、完整頁與量測證據位於 [`review/session-detail-concepts-desktop/`](../design/review/session-detail-concepts-desktop/README.md)。選定方向與三種小圖排法的證據位於 [`review/session-detail-selected-desktop/`](../design/review/session-detail-selected-desktop/README.md)。最終採 C1，響應式 Vue 原型已完成並通過 UI 驗收。

## 階段紀錄

2026-10-14 完成 `define-feature-spec` 初稿：依舊站截圖盤點候選欄位，並與已驗證的 `/session` 資料契約對齊；補齊範圍、內容契約、狀態、響應式、無障礙與可測試驗收條件。聯繫協定與服務地區精細度仍待確認，確認後即可進入 UI 方向階段。

2026-10-14 依 `$develop-feature` 從 `draft` 接續 `shape-ui-direction`，完成三款桌機候選、互動比較器、1440px 首屏與完整頁證據、DOM 量測及 detector 修正。等待使用者選定方向後進行該案手機／平板設計；未進入 `build-ui-prototype`。

2026-10-14 選定 C「靜謐檔案」，經歷採 A 單欄長列；同步將詳情頁標題／摘要／章節／正文尺寸及固定左欄無右框線寫入全站設計契約。聯繫型別、城市擴充與地址公開層級已確認，後台不設對外公開同意欄位。另完成三種小圖桌機排法，待選定後進入手機／平板設計。

2026-10-14 完成 C1／C2／C3 的 1440px 畫面與 DOM 驗證：三案皆無水平溢位、單一可見 `h1`、圖片 alt 完整、自託管字體載入，最小操作高度 48px；固定左欄右框線為 0px，章節標題 38px、正文 16px，方向鍵切換的選取與焦點同步。Impeccable layout 為 0 項；完整檢測只保留品牌既定暖紙底色提示。證據見 [`review/session-detail-selected-desktop/`](../design/review/session-detail-selected-desktop/README.md)。

2026-10-14 完成最後設計修正並核准 C1：側欄資料列與操作區 padding 對齊活動詳情，主要預約按鈕改為選填，連續 `.profile-section` 移除上框線與額外上內距。桌機、平板與手機的字級、單欄轉換、無圖及無主要預約按鈕規則已明確，狀態更新為 `design-approved`；下一階段為 `build-ui-prototype`。

2026-10-14 完成 `build-ui-prototype`：新增 `/session/[slug]` fixture 路由、型別化人物詳情資料、C1 響應式元件，以及 ready／loading／error／not-found、無照片、無英文名、無經歷、無主要預約按鈕與城市級公開狀態。詳情共用字級與 rail padding 已提升為 `main.css` token，活動與執行師詳情共同引用。全站 28 個測試檔、164 項測試通過，typecheck 與 production build 完成；實際頁面以 Chrome 檢查 1440px、390px 及缺少選填欄位畫面。狀態更新為 `frontend-ready`，下一階段為 `verify-ui-behavior`；尚未建立 Sanity schema、API 或 production 內容。

2026-10-14 完成 `verify-ui-behavior`：以 DevTools device metrics 精確檢查 320、390、768、1023、1024、1440px，另以 720px 作 1440px／200% 頁面縮放代理；典型、缺少選填內容及極端 fixture 均為 `scrollWidth === clientWidth`、單一 `h1`、詳情操作最小高度 48px。極端 fixture 完整呈現 6 地點、20 方法、12 經歷、6 聯繫與 6 段介紹；缺少圖片、經歷與主要預約按鈕時數量皆為 0。返回連結鍵盤聚焦後為 2px solid outline、6px offset。Impeccable detector layout 與非 advisory 檢查皆為 0；Chrome 1440px、390px 與無選填內容截圖位於 `.impeccable/review/session-detail-frontend-prototype/`。全站 28 個測試檔、164 項測試、typecheck、production build 皆通過；typecheck 仍輸出既有 `vue-router/volar/sfc-route-blocks` 套件警告。狀態更新為 `ui-verified`；未執行 Safari／Firefox、實體觸控裝置或螢幕閱讀器驗收。

2026-10-14 完成 `integrate-sanity-content`：擴充 `practitioner` 的人物照、介紹、經歷、服務地區、聯繫入口、選填主要預約按鈕與 SEO，新增可維護的 `sessionCity` taxonomy；每筆地點依 `cityOnly`／`venue`／`fullAddress` 在 GROQ 投影時即移除未核准欄位。前台改讀 published perspective 的 `/api/session-detail/[slug]`，經共享 parser 驗證後輸出；不存在或非法 slug 回傳 HTTP 404，無效已發布資料與讀取失敗進入 error，皆不回退 fixture。Studio 22 項測試、Web 30 個測試檔共 171 項測試、兩端 typecheck 與 production build 通過；Web typecheck 仍只有既有 `vue-router/volar/sfc-route-blocks` 套件警告。狀態更新為 `cms-integrated`；遠端 schema、production 內容、draft／publish／unpublish 與跨裝置人工驗收尚未執行。

2026-10-14 17:08–17:22（Asia/Taipei）完成 `validate-content-flow`：在 Sanity project `hnypuj6l`、dataset `production` 部署 schema（1/1），使用 `session-detail-validation-20261014-*` 隔離 ID 建立 3 筆 taxonomy、1 筆執行師草稿與 1 筆缺漏驗證草稿。已確認草稿不會由匿名 published query 讀取；首次發布正確省略人物照與主要預約按鈕；更新草稿未洩漏；再次發布後匿名 Data API 與正式 Nuxt API 正確顯示人物照、3 種地點公開層級、5 種聯繫方式及 HTTPS 預約按鈕，`cityOnly` 與 `venue` 均未輸出超出設定的私人欄位。登入 Studio 實際確認新增欄位與說明可見，缺漏草稿具有 required／公開摘要 validation 且 Publish disabled；全 dataset schema validation 為 24 份有效、0 errors。

取消發布後，匿名查詢與 API 皆為空；真實流程同時發現詳情頁雖呈現 not-found，SSR 起初仍回傳 200，已改為等待內容請求後設定頁面狀態，重建實測為 HTTP 404、not-found、`noindex` 且無 fixture 洩漏。6 個可能 validation ID 已精準清除，最終 authenticated inspect 與 anonymous query 均為 0。桌機 1440px 與手機 390px 發布畫面見 [`session-detail-content-flow`](../design/review/session-detail-content-flow/README.md)。狀態更新為 `verified`；Safari／Firefox、實體觸控裝置與螢幕閱讀器仍屬既有人工驗收限制。

2026-10-14 依後台人工測試調整服務城市：`sessionServiceLocation.city` 改為可多選的 `cities` reference array，每筆可選 1–6 個不重複城市；前台服務摘要會去重合併，單筆服務地區以頓號顯示多個城市。GROQ 暫時保留舊 `city` 欄位 fallback，避免既有單選資料在遷移前消失。相關 schema、parser、fixture 與測試已同步，production schema 重新部署 1/1 成功；部署後檢查 23 份文件皆有效、0 errors。狀態維持 `verified`；後台需重新整理後人工確認多選操作。

2026-10-14 依後台圖片需求新增 `portrait.displayMode`：編輯者可選擇「限制寬度（適合小圖）」或「滿版裁切」，滿版模式沿用 hotspot 控制焦點；既有未設定資料由查詢與 parser 安全回退至 `contained`。schema、query、型別、fixture、元件與回歸測試已同步，production schema 重新部署 1/1 成功。Studio 22 項及 Web 30 個測試檔共 173 項測試、兩端 typecheck 與 production build 通過；production 驗證 23 份文件為 0 errors，另有 `eventsPage.pastIntro` 與 `homeBanner.slides` 兩項既有欄位警告。後台仍需重新整理後人工確認選項與兩種響應式呈現。

2026-10-14 統一詳情側欄聯繫樣式：`.session-detail__contact` 與上方資料列共用 padding；「聯繫方式」改用與「服務項目」相同的 14px 小標題樣式，區塊內容與預約按鈕文字統一為 14px，並移除聯繫清單的上下框線。Session detail 9 項元件／頁面測試、Web typecheck 與 production build 通過，Impeccable layout detector 為 0 findings；typecheck 仍只有既有 `vue-router/volar/sfc-route-blocks` 套件警告。

2026-10-14 依人工調整後實作回查文件：詳情首區標籤採「服務地區」，側欄順序固定為「服務項目 → 服務地區 → 聯繫方式」，窄版維持同一 DOM 閱讀順序，完整介紹與經歷接續其後。同步將公開介面的「服務方法／療法」統一記為「服務項目」；資料欄位 `methods` 與既有 URL query `method` 保持不變。回查後 Web 30 個測試檔共 173 項、Studio 22 項測試、兩端 typecheck 與 production build 均通過；Web typecheck 仍只有既有 `vue-router/volar/sfc-route-blocks` 套件警告。

2026-10-16 共用手機內容章節標題由 32px 統一為 26px。以 390px fixture 頁確認「關於執行師」與「經歷」皆為 `26px / 36.4px`、寬 342px、右界 366px，與後續內容保留 22px 間距，頁面無水平溢位或遮擋；最新截圖與量測位於 [`review/detail-heading-token-mobile/`](../design/review/detail-heading-token-mobile/README.md)。Web 34 個測試檔／190 項測試、typecheck 與 production build 通過。

2026-10-18 詳情頁頂端加入共用 `DetailBreadcrumb`，呈現「首頁／個案諮詢／目前執行師」；目前頁為帶有 `aria-current="page"` 的純文字，並移除首區重複的「返回執行師名錄」入口。Chrome 以 production 內容 `/session/amoda` 檢查 1440 × 900 與 390 × 844，麵包屑、首區及肖像版面無溢位或錯位；最終截圖位於 `/private/tmp/session-*-final.png`。相關四組詳情測試 37 項、Web 全套 37 檔共 211 項及最終 Session detail 9 項回歸測試通過，typecheck 與 production build 亦通過；typecheck 僅保留既有 Volar 套件警告。

#### 筆記，不需要執行，可忽略

- 使用 `$develop-feature` 從 `docs/specs/session-detail.md` 接續下一個流程

#### 待修正項目
- [x] 最上方補上麵包屑導覽列；2026-10-18 已使用共用 `DetailBreadcrumb` 完成

