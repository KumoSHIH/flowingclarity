# 課程內頁規格

**規格狀態：** `cms-integrated`（2026-10-23 修正已於本機完成；更新後的 production schema 與內容流程尚未驗證）

**設計狀態：** `design-approved`。A「章節潮汐」響應式整合稿已完成；2026-10-23 另確認課程梯次採 900px 最大寬度、少量內容垂直置中的極簡版型，並完成正式 Vue 桌機／手機驗證。

**開發狀態：** 既有課程內頁曾完成 production 內容流驗收。2026-10-23 已於本機完成帶領者版面與圖文選填欄位修正，並完成 schema、parser、Vue、測試與 Chrome 驗收；新版 schema 尚未部署，異動欄位尚未執行遠端草稿／發布／清除流程。

**後續決策：** 課程內頁目前以已驗證版本投入內容建置，不阻擋後續單元開發。待其他課程陸續完成後台資料後，再依跨課程的實際內容長度、區塊組合與編輯需求，集中評估是否調整前台樣式或 Studio 欄位；此項工作因需要大量內容建置與人工檢視，暫緩至資料較完整時處理。

**路由：** `/course/[slug]`

**設計依據：** `docs/design/course-detail-concepts-award.html`、`docs/design/course-detail-tidal-desktop-concepts.html`、`docs/design/course-detail-composite-desktop.html`、`.impeccable/surfaces/course-detail-composite-desktop-html.md`

## 開發進度

以下依 2026-10-11 本機程式、production 內容流與瀏覽器驗證結果記錄。

| 項目 | 狀態 | 實作依據／完成條件 |
| --- | --- | --- |
| 桌機與手機設計原型 | 已完成原型 | 響應式 HTML 與截圖已存在；不是正式 Vue 元件 |
| 課程總覽與基礎資料 | 已沿用 | 內頁延伸既有 `course` 與 `courseRun`，梯次日期、地點、形式與報名狀態不重複儲存 |
| 正式內頁路由 | 本機整合完成 | `/course/[slug]` 改由內頁 API 取得資料，提供載入、錯誤、重試與不存在／未公開狀態；不再以 fixture 作正式資料來源 |
| 內頁內容模型與型別 | 本機更新完成 | 既有 Studio 詳情 schema 與單一 `isPublished` 公開開關已部署；本機另加入最多一個共用心得區塊、1–10 張的可重複圖片輪播及 0–8 篇不重複相關文章，更新版尚未部署 |
| 內頁 API 與資料處理 | 已完成 | 依 slug 查詢已發布課程與公開梯次，固定使用 published perspective；解析器兼容 GROQ 回傳的 Sanity schema 型別名，並拒絕不完整內容、危險連結與不合法梯次 |
| Vue 內容元件 | 已完成 | `CourseDetail.vue` 依 CMS 陣列順序渲染介紹、文字段落、五款可重複圖文版型、帶領者、引言、課綱、影片與對象；Banner、梯次與報名維持固定位置，單一學員分享與單一課程花絮固定在梯次後方，延伸閱讀固定在報名後方 |
| 互動與響應式整合 | 已完成 | 章節導覽依內容編排動態產生，以實際固定列高度精準定位並在捲動時更新 active；手機作用中錨點會自動水平移入畫面。另已完成課綱展開、媒體／CTA 停用狀態、後台多行文字換行保留及桌機／手機排版；正式頁不再顯示版型比較 tabs |
| 自動化與瀏覽器驗收 | 本機已完成 | 2026-10-20 完整 Web 228 項與 Studio 31 項測試、兩端 typecheck 及 production build 通過；Chrome CDP 以 1440px 與 390px 驗證新增區塊、互動、焦點、reduced motion 與無水平溢位 |
| 正式內容與發布 | 流程已驗證／內容待提供 | production schema 與草稿隔離、首次發布、更新草稿隔離、再次發布、匿名讀取和精確清理皆通過；正式課程內容仍待內容負責人核准 |

### 開發順序與驗收

1. 定義內容區塊、五款多圖排版及型別，沿用既有課程與梯次資料，補齊 schema 驗證。
2. 完成 slug 查詢 API 與路由，測試未公開、不存在、資料缺漏與服務失敗情境。
3. 依整合稿完成 Vue 元件、完整響應式排版及互動；資料不足時顯示適當狀態，不以示範資料作正式內容。
4. 執行 `npm run test -w web`、`npm run typecheck -w web`、`npm run build -w web`，另執行 Studio 相關測試；驗證鍵盤、窄螢幕、橫向畫面及正式內容長度。
5. 以隔離內容完成草稿、發布、更新與清除驗收後，才將功能規格改為 `verified`；正式內容仍須由內容負責人另行核准。每一階段須同步本表、實際驗證結果與剩餘事項。

### 本次流程狀態

2026-10-11 已依 `$develop-feature` 從 `ui-verified` 接續並完成 `integrate-sanity-content`。本機已建立課程詳情 schema、課程與梯次發布驗證、published-only slug API、共用解析器及正式頁面資料串接。依後台人工測試回饋，詳情內文改為可拖曳排序的內容編排器；五款圖文版型皆可重複新增並穿插於其他內容區塊之間。規格維持 `cms-integrated`，下一階段是 `validate-content-flow`。

2026-10-11 已完成 `validate-content-flow`。在 Sanity project `hnypuj6l`／dataset `production` 部署 schema，使用專屬 ID 建立課程與梯次草稿；匿名查詢確認草稿不可見，首次發布後 API 可讀，再建立含五款圖文版型及所有選填模組的更新草稿，確認公開版維持不變後再次發布。全資料 schema 驗證發現並修正舊課程缺少新布林欄位的相容性問題，最終 16 份文件皆有效。驗收文件已依精確 ID 清除，production 回復 1 門公開總覽、0 門公開詳情、0 個公開梯次，規格狀態進入 `verified`。

2026-10-11 決定先結束本單元並進入下一個單元。課程內頁的樣式與欄位不在此時繼續擴充；待其他課程後台資料陸續建置完成、具備足夠的跨課程案例後，再安排整體檢視與必要調整。

2026-10-20 依待修正清單完成本機修正。桌機內容 `h2` 統一為全站詳情頁 38px token；課程 body 可加入最多一個共用心得及可重複的左圖右文圖片輪播；0–8 篇人工選取的延伸閱讀固定在報名區後。About 圖片輪播與 Article 延伸閱讀已拆成共用元件，原頁行為維持不變。新版 schema 尚未部署，狀態回到 `cms-integrated`，下一階段為遠端內容流回歸。

## 目標與受眾
協助正在評估身心課程的訪客清楚取得課程資訊，在理解方法、帶領者、學習路徑與參與條件後，感受到安定與信任，並找到明確報名入口。

## 需求確定度
- 規劃多種元件，供後台使用者選擇以加入課程內容頁面
- 元件選擇：
| 元件名稱 | 元件類型 | 必填與範圍 | 編輯責任／資料來源 |
| --- | --- | --- | --- |
| cmp-banner | 主圖、標題、英文標題、摘要、形式與主要行動 | 必要；單一主要 CTA | 編輯者／Sanity course document |
| cmp-description | 標題、引言與一至數段敘述 | 非必要；正文建議 65–75ch | 編輯者／Sanity block content |
| cmp-text | 標題與單一文字段落 | 非必要；正文 8–2,000 字並保留換行 | 編輯者／Sanity block content |
| cmp-article | 圖上文下 | 非必要；圖片須有替代文字 | 編輯者／Sanity block content |
| cmp-article-left | 左圖右文 | 非必要；手機先圖後文 | 編輯者／Sanity block content |
| cmp-article-right | 右圖左文 | 非必要；手機先圖後文 | 編輯者／Sanity block content |
| cmp-article-bg | 有底色的引言、原則或引用 | 非必要；深底須用暖白文字 | 編輯者／Sanity block content |
| cmp-curriculum | 階段、單元、標題與內容，可展開 | 非必要；加入時支援 1–12 單元 | 編輯者／Sanity block content |
| cmp-schedule | 城市、日期、時間、地點、名額與狀態 | 報名時必要；不得顯示未確認資料 | 編輯者／Sanity course document |
| cmp-video | YouTube 內嵌播放器與選填封面 | 非必要；需標題，狀態文字與封面選填；有封面時必須提供替代文字 | 編輯者／Sanity block content |
| cmp-audience | 適合對象標題、說明與條件 | 非必要；加入時需至少一項條件 | 編輯者／Sanity block content |
| cmp-testimonial | 純文字學員心得與分享者名稱 | 非必要；每頁最多一個區塊、每區 1–12 筆，僅使用已核准公開的內容 | 編輯者／Sanity shared block content |
| cmp-swiper | 左側圖片輪播與右側固定文字 | 非必要；可重複新增，每區 1–10 張 | 編輯者／Sanity block content |
| cmp-related-articles | 相關文章輪播 | 非必要；0–8 篇不重複文章，固定在報名後方；桌面三則、平板兩則、手機一則 | Sanity references |

### 後台區塊順序與章節導覽調整（2026-10-25 本機已整合）

已確認頁面順序調整為「內容編排的自由區塊 → 課程梯次 → 學員分享 → 課程花絮 → 報名區塊」，其中課程梯次與報名區塊為固定必要區塊，學員分享及課程花絮為選填；兩個選填區塊不存在時不輸出空容器或章節連結。內容編排只保留課程介紹、文字段落、圖文版型、帶領者、引言、課程架構、影片及適合對象等主要內容，不再容許學員分享與課程花絮穿插其中。`course-chapters` 必須依實際渲染順序產生，並略過未設定的選填區塊。

限制 `course-chapters` 長度可採以下方案：

1. **限制內容編排總數：** 以 Sanity array `max()` 設定總上限；實作最簡單，但不同類型會共同競爭額度。
2. **限制各類型數量：** 以自訂 validation 限制每種區塊的數量，例如介紹、帶領者、課綱與影片各最多一個，圖文版型可保留少量多個；可維持彈性並直接控制導覽長度。
3. **導覽只收主要章節：** 內容仍可自由新增，但引言等輔助區塊不各自產生章節連結；需先定義哪些類型屬於主要章節。
4. **人工章節群組：** 讓多個內容區塊共用一個章節名稱與錨點；最有彈性，但增加編輯操作、資料模型及前台定位複雜度。

採用「固定選填區塊＋導覽只收主要章節」作為本階段方案：學員分享與課程花絮已改為陣列外的單一選填欄位，各自最多一個，並由資料結構保證固定位置；引言等輔助區塊不加入章節導覽。內容編排目前仍維持既有 20 個區塊總上限；更嚴格的各類型上限，以及一般圖文是否需要獨立的「加入章節導覽」開關，留待實際編輯量增加後再決定。

### 課程架構的兩種呈現方式（2026-10-25 已選定）

**本次調整狀態：** `cms-integrated`。課程架構可使用既有「圖文版型區塊」或「課程架構（摺疊列表）」其中一種，不新增第三套前台元件。每門課最多一個課程架構，兩種方式不可同時作為課程架構使用。

- 圖文方式沿用 `courseDetailGallery` 的五種既有版型及 1–8 筆圖文內容，新增必填的內容用途 `contentRole`：`general`（一般圖文）或 `curriculum`（課程架構）。選為 `curriculum` 時，Studio 預覽顯示「課程架構｜圖文版型」，但前台仍使用編輯者填寫的區塊標題。
- 摺疊方式沿用 `courseDetailCurriculum`，Studio 名稱與預覽明確顯示「課程架構｜摺疊列表」；支援 1–12 個單元，既有鍵盤操作與 `aria-expanded`／`aria-controls` 契約不變。
- `course-chapters`：`contentRole: curriculum` 的圖文區塊或摺疊列表都只產生一個課程架構章節；一般圖文仍依主要章節規則決定是否列入。前台不顯示「圖文」或「摺疊」等後台編輯術語。
- Studio validation 必須阻止同一門課同時存在 `contentRole: curriculum` 的圖文區塊與摺疊課程架構，也阻止兩個圖文區塊同時標記為課程架構。舊資料缺少 `contentRole` 時視為 `general`，避免既有內容被誤判。
- 本方向沿用現有圖文與摺疊版型的桌機、手機及無障礙行為，不新增視覺樣式；因此不另做手機設計稿。後續實作須以兩種資料各完成章節導覽、互斥驗證及舊資料相容測試。

2026-10-25 已完成型別化本機原型：`CourseDetailContent` 新增固定位置的選填 `testimonials` 與 `highlights`，並保留舊 body 資料的前端相容讀取；內容編排先渲染，課程梯次後依序顯示學員分享、課程花絮與報名。章節導覽略過引言等輔助區塊，圖文課程架構統一顯示「課程架構」。新增圖文課程架構 fixture 與順序、選填、章節標籤回歸測試；課程相關 4 檔／44 項、typecheck 與 production build 通過。既有 Vue Router／Volar、sourcemap 與字型 runtime resolve 警告仍存在；尚未修改 Sanity schema、GROQ 或遠端資料，瀏覽器行為驗收屬下一階段。

2026-10-25 已完成 UI 行為驗收。Chrome headless 以 1440×1000、1023×900、390×844 及 720px CSS viewport 的 200% 縮放等效寬度檢查圖文架構、摺疊架構與缺少選填區塊三種內容；順序、單一課程架構章節、輔助引言略過、錨點 active、圖片替代文字及水平寬度皆正確。第一輪發現 1023px Hero 標題超出 21px，修正為左右各保留 50px 後複驗通過，並加入樣式回歸測試。證據見 [課程詳情區塊順序與章節導覽驗證](../design/review/course-detail-structure-2026-10-25/README.md)。Safari、Firefox、真實 iOS／Android 與螢幕閱讀器未執行；Sanity schema、GROQ 與遠端資料仍未修改。

2026-10-25 已完成本機 CMS 串接。Sanity 新增固定的「學員分享（選填）」與「課程花絮（選填）」欄位；圖文版型新增一般圖文／課程架構用途，並驗證同一課程不得同時使用兩種課程架構。GROQ、共用型別與 parser 已支援新資料，同時把舊 body 內的學員分享及花絮正規化到固定位置；缺少 `contentRole` 的舊圖文資料視為一般圖文。Web 全套 48 檔／317 項、Studio 全套 41 項測試及兩端 production build 均通過。新版 schema 尚未部署，production 資料未遷移或修改；下一階段須先取得遠端操作授權，再執行 `validate-content-flow`。

課程梯次的 `stages` 是公開日程的唯一日期來源。單一階段且只有一段日期時可維持精簡日期；多階段或同階段含不連續日期時，首屏「時間」必須依階段分行列出，梯次區則逐階段呈現每一個日期區間。不得以最早開始日與最晚結束日合併成連續區間，以免讓訪客誤以為中間日期皆需上課。

圖文版型區塊的區塊標題、說明、版型與至少一筆圖文內容仍為必要資料；「圖冊補充」、「段落引言」及每筆圖文內容的標題為選填。「圖冊補充」保留為相容既有內容的資料欄位，但 course-gallery 不再渲染 footer、版型名稱或補充文字；其他選填值留空時，前台不輸出空標籤，圖文說明與圖片仍正常呈現，非空值仍受原長度限制。

課程架構為選填內容區塊；加入時，課綱單元標題仍為必填的 2–100 字短篇文字。後台使用兩行文字框並提示可按 Enter 換行，前台以 `white-space: pre-line` 保留編輯者指定的斷行；階段與單元內容的既有契約不變。

課程影片的狀態文字留空時，前台依有無有效 YouTube 網址顯示「觀看課程影片」或「課程影片待上架」。有效網址會轉為 `youtube-nocookie.com` 的 16:9 iframe，在頁內直接播放，不產生導向 YouTube 的連結；播放器於桌機最大寬度 760px 並置中，窄螢幕縮至容器寬度。封面圖片為選填；沒有有效網址但有封面時顯示 16:9 封面，網址與封面皆未設定時不輸出空媒體容器，但仍保留影片標題與狀態文字。影片為選填內容；標題或非空狀態文字無效時只略過該區塊，不讓整門課落入錯誤狀態。課程介紹與圖文版型仍是內容編排的必要核心區塊；課程架構與適合對象皆不再列為必要區塊。


## 三種設計方向

- A「章節潮汐」：以大幅影像、章節節奏與長文建立情緒及信任，適合理念與故事較重的課程。
- B「雙域剖面」：左側固定關鍵決策資訊，右側承載完整內容，適合單元、日期與先修條件複雜的培訓。
- C「感知圖譜」：以座標、模組與路徑組成彈性內容系統，最適合作為 Sanity page builder 的長期基礎。

三案均延續暖紙、深赭、藏紅花黃、柿橘 CTA、襯線大標與直角容器；不得加入通用療癒網站常見的柔焦人物、圓角卡片或無證據的成效宣稱。

「章節潮汐」、「雙域剖面」與「感知圖譜」及其閱讀位置互動只屬本課程內頁決策稿，不提升為全站設計 token 或共用版型規則。

## 章節潮汐桌機深化

2026-10-10 使用者選定 A「章節潮汐」，並要求加入 B 案的影片播放區塊與「這門課適合誰」。三款桌機稿共用相同內容、首屏、章節定位、課綱、影片停用狀態、適合對象、排程與報名狀態，只比較多圖編排：

- A1「電影分鏡」：用錯落的大景、特寫與深色引言形成敘事段落。
- A2「編輯拼貼」：用重疊與尺度反差建立較強視覺張力。
- A3「接觸片」：用連續直幅特寫呈現觀察與方法練習感。

桌機決策稿位於 `docs/design/course-detail-tidal-desktop-concepts.html`。舊站人物與課程影像僅作排版示意，不得當作已核准教師、學員或成效素材；此為歷史桌機比較稿，後續手機設計已納入響應式整合稿。

## 區塊整合響應式稿

2026-10-10 使用者指定最終區塊來源：Banner、介紹文字、深色引言與課程架構取自 `course-detail-concepts-award.html` A；錨點、多圖元件、帶領者、影片與適合對象取自 `course-detail-tidal-desktop-concepts.html` A2；日期報名取自同檔 A1。整合稿位於 `docs/design/course-detail-composite-desktop.html`。

多圖區預設保留 A2「編輯拼貼」與「分階圖譜」。2026-10-10 使用者移除「技法長卷」與「雙聯觀察」，並依長文課綱與圖冊參考新增「交錯章節」、「單元圖冊」、「方法檔案」三款多圖長文模式。五款共用同一內容契約與鍵盤操作，不將選項做成不同頁面。

2026-10-11 後台人工測試改變正式內容策略：上述 tabs 僅屬歷史比較稿。正式 CMS 將介紹、文字段落、圖文版型、帶領者、引言、課綱、影片與適合對象放入同一可排序陣列；編輯者可新增多個圖文版型區塊，每個區塊選擇一款版型並拖曳到需要的位置。學員分享改用梯次後方的固定選填欄位，不再是內容編排的新建選項。Banner、梯次與報名仍固定，避免關鍵決策資訊失去一致位置。

桌機「單元圖冊」的左右兩列全部採上下錯位，不再只有項目三、四錯開。手機以單一 DOM 順序重排：模式控制可橫向滑動且觸控高度至少 64px；編輯拼貼使用交替對齊與深色引言，分階圖譜保留階段分組，交錯章節維持圖文成對，單元圖冊以 88% 寬影像左右錯位，方法檔案將索引、條目與影像群依序展開。核心內容不因小螢幕隱藏。

## 內容契約

- 頁面必須只有一個 `h1`；內容模組依序使用 `h2`、`h3`。
- 報名 CTA 只連往已確認外部表單；若尚未開放，顯示明確狀態而不是失效連結。
- 課程日期、費用、名額、地點、師資資格、學員分享與成效文字均需由內容負責人核准。

### 學員心得分享規劃

學員心得使用活動詳情與課程詳情共用的 `sharedTestimonialBlock`；課程詳情改用 `courseDetailContent.testimonials` 固定選填欄位，每頁最多一個區塊，每區 1–12 筆並可拖曳排序。舊資料若仍位於 `body`，parser 會相容讀取並正規化到固定位置；完成 production 資料遷移後，再移除 Studio 對舊 body member 的新增入口。前台每筆只顯示心得文字與分享者名稱；內容負責人在輸入 CMS 前完成公開授權與文案核准，不另設逐筆同意開關。欄位、驗證與設計見 [學員心得分享共用元件規格](shared-testimonials.md)。新版 schema 尚未部署與驗證；現有 `courseDetailQuote` 仍是課程引言，不得拿來儲存學員心得。
- 行動版維持資料與 DOM 相同順序，觸控目標至少 44px，所有互動須支援鍵盤與 reduced motion。

## 驗證紀錄

以下保留設計與開發歷程；正式課程內容仍需另行核准，隔離驗收文件不代表正式內容已發布。

- 2026-10-10：完成六個舊課程頁內容盤點，確認共通結構為介紹、師資、架構、對象、日期報名、媒體、分享與相關文章。
- 2026-10-10：完成三案可互動 HTML 原型，以及 1440px、390px 的瀏覽器完整頁面截圖驗收；已修正手機橫向溢位與跨欄標題裁切。390px 實測 `innerWidth`、`scrollWidth`、`bodyWidth` 均為 390px。
- 2026-10-10：鍵盤可操作三案 tabs、課綱手風琴與輪播控制，並已實作 reduced-motion；正式 Vue 元件階段仍需加入行為測試。
- 2026-10-10：依獨立完成審查補齊排程狀態、學員分享輪播、相關文章、C 案帶領者模組、禁用報名／影片狀態，以及三案各自的閱讀位置回饋；完成審查結論為 `ship`，未完成事項已保留於下一階段。
- 2026-10-10：最後品質批次補上獨立圖文輪播、桌面三則／平板兩則／手機一則的相關文章軌道、CSS authored 箭頭，以及 A／C 手機首屏的形式與報名狀態摘要。
- 2026-10-10：完成 A「章節潮汐」三款桌機深化稿，加入影片與適合對象，並以 1440px Chrome 完整頁面、首屏及多圖段落截圖驗證；三案 `scrollWidth` 均為 1440px，Impeccable detector 回傳零項。
- 2026-10-10：桌機深化稿首次獨立完成審查結論為 `fix`。同批修正 A1 第四張影像定位、目前影像圖說顯影、單一 `h1`、影像示意標記、首屏時間待確認標示、自託管繁中字體與手風琴 `aria-controls`；修正後三案實測 `accordionMissing: 0`、`serifLoaded: true`。
- 2026-10-10：完成 1440px 桌機最終完成審查，兩項剩餘問題均已解決，結論為 `ship`。三張捲動後有效圖說截圖位於 `docs/design/review/course-detail-tidal-desktop/*-desktop-gallery-active.png`；CDP 實測 A1／A2／A3 的有效圖說數依序為 4／2／4，透明度皆為 1。三案切換後皆為 `h1Count: 1`、`activeHeadingTag: H1`、`hiddenH1Count: 0`。
- 2026-10-10：上一輪完成區塊整合桌機稿與四款多圖模式，並在修正文字對比與鍵盤圖說後取得 `ship`；該四款組合已由後續五款長文模式取代，不代表目前交付狀態。
- 2026-10-10：依使用者回饋移除「技法長卷」與「雙聯觀察」，保留「編輯拼貼」、「分階圖譜」，新增「交錯章節」、「單元圖冊」、「方法檔案」。五款於 1440px 實測 `scrollWidth: 1430`、`h1Count: 1`、單一可見面板、自託管字體載入與課綱關聯完整。首次完成審查只要求同步文件與重擷取最後對比修正後的「方法檔案」證據；兩項完成後再次審查，未發現視覺、階層、可讀性、鍵盤操作或證據退步，最終結論為 `ship`。
- 2026-10-10：依使用者確認進入手機版。桌機「單元圖冊」改為每組圖片皆上下錯位；響應式稿移除桌機寬度阻擋，完成首屏、水平狀態／導覽／錨點、五款多圖、帶領者、引言、課綱、影片、適合對象、梯次及報名區的手機重排。
- 2026-10-10：Chrome 模擬 390px 五款模式與 320px 單元圖冊均為 `scrollWidth === innerWidth`、`h1Count: 1`、單一可見面板、`fontLoaded: true`、`accordionMissing: 0`，模式控制高度 64px。390px 完整頁截圖位於 `docs/design/review/course-detail-composite-mobile/`；尚未執行真實 iOS／Android 裝置與 Safari／Firefox 驗證。
- 2026-10-10：完成 Nuxt 前端原型與 `/course/[slug]` 路由。新增典型、長文、缺少選填欄位及空集合 fixtures；行為測試涵蓋五模式鍵盤切換、課綱展開、停用行動、空集合、錯誤重試及不存在課程。`npm run test -w web` 為 15 檔、86 項通過；`npm run typecheck -w web` 與 `npm run build -w web` 均成功。typecheck 仍輸出既有 `vue-router/volar/sfc-route-blocks` 匯出警告，build 仍輸出既有 sourcemap 與 runtime 字型路徑提示。
- 2026-10-10：Chrome headless 以 1440px 與 390px 實際載入 `/course/japanese-facial-massage`，先捲動全頁載入 lazy images，再擷取精確到頁尾的完整頁證據至 `.impeccable/review/desktop.png`、`.impeccable/review/mobile.png`。已修正章節導覽黏附位置，使其避開 87px 固定 Header；Safari、Firefox 與真實 iOS／Android 尚未驗證。
- 2026-10-10：最終完成審查要求的三項修正——桌機完整頁證據載入至頁尾、手機完整頁證據載入至頁尾、黏性章節導覽避開固定 Header——均已解決；再次審查結論為 `ship`。
- 2026-10-11：`verify-ui-behavior` 完成。Chrome CDP 實測 1440×1000、768×1024、390×844 與 720×900／device scale 2 的 200% 模擬；各尺寸皆無水平溢位、維持單一 `h1` 與可見 tabpanel、章節錨點完整、課程內容圖片替代文字完整、課程頁操作目標不小於 44px，並確認 `prefers-reduced-motion: reduce` 生效。Home／End 可同步移動 tab 選取與鍵盤焦點；minimal fixture 不再顯示缺席的帶領者／影片連結，empty fixture 三項空狀態皆存在。完整頁證據位於 `.impeccable/review/course-detail-ui-verified/`。
- 2026-10-11：Impeccable detector 為 0 項 anti-pattern；41 項 advisory 來自已核准頁面專屬字級與半透明色值，未視為阻擋問題。`npm run test -w web` 為 15 檔、89 項通過；`npm run typecheck -w web` 與 `npm run build -w web` 成功。typecheck 仍有既有 `vue-router/volar/sfc-route-blocks` 警告，build 仍有既有 sourcemap 與 runtime 字型路徑提示。
- 2026-10-11：`integrate-sanity-content` 完成。新增 12 個詳情物件 schema，延伸 `course` 與 `courseRun`；API 依 slug 查詢 published 課程與公開梯次。伺服器解析器驗證圖片替代文字、內容長度、YouTube／HTTPS 連結及梯次資料，選填區塊不完整時不輸出。原始版本曾分開控制總覽與內頁公開，已由 2026-10-13 的單一開關決策取代。
- 2026-10-11：`npm run test -w web` 為 17 檔、100 項通過；`npm run test -w studio` 為 13 項通過；`npm run typecheck -w web`、`npm run typecheck -w studio`、`npm run build -w web` 與以測試用環境值執行的 `npm run build -w studio` 均成功。Web typecheck 仍輸出既有 `vue-router/volar/sfc-route-blocks` 警告，Web build 仍輸出既有 sourcemap 與 runtime 字型路徑提示。本階段未部署 schema、未寫入 dataset，也未建立或發布遠端內容。
- 2026-10-11：依人工測試回饋將單一圖文版型改為可排序內容編排器。Studio 可重複新增五款圖文版型，與介紹、帶領者、引言、課綱、影片及適合對象自由排序；前台、GROQ 與解析器保留此順序。回歸測試確認五款版型可同頁混用、內容順序一致、核心區塊缺漏會被阻擋。`npm run test -w web` 為 17 檔、101 項通過，`npm run test -w studio` 為 14 項通過，兩端 typecheck 與 production build 成功；Impeccable detector 為 0 項 anti-pattern，41 項 advisory 皆為既有頁面專屬字級與色值。畫面檢查工具本次無法啟動，混排頁面的人工瀏覽器驗收尚未執行。
- 2026-10-11：`validate-content-flow` 唯讀盤點完成。`npx sanity debug` 確認登入憑證存在，工作區為 project `hnypuj6l`／dataset `production`；匿名 `published` Data API 請求成功，公開資料計數為課程總覽 1、課程詳情 0、課程梯次 0。未部署 schema、未修改 dataset，也未建立或發布測試內容。
- 2026-10-11：`validate-content-flow` 完成。production schema 部署成功；隔離課程與梯次依序完成草稿不可見、首次發布可見、更新草稿不影響公開版、再次發布同步新標題與 11 個區塊順序，五款圖文版型可同頁混排，HTTPS 報名連結可用。真實 GROQ 投影揭露 schema 型別名差異，解析器已正規化並加入回歸測試。全 dataset schema 驗證最終為 16 份有效、0 錯誤。
- 2026-10-11：Chrome CDP 以 1440×1000 與 390×844 載入 production 測試內容；兩者皆為單一 `h1`、11 個內容區塊與五種 gallery layout，圖片替代文字缺漏為 0，最小操作高度分別為 68px／58px。390px 實測 `innerWidth`、`scrollWidth`、`bodyWidth` 均為 390px，標題右界 368px。完整頁證據位於 `.impeccable/review/course-detail-content-flow/`。
- 2026-10-11：最終回歸為 Web 17 檔、102 項與 Studio 14 項測試通過，兩端 typecheck 與 production build 成功。四個隔離驗收 ID 已清除；登入查詢為空陣列，匿名計數回復公開總覽 1、公開詳情 0、公開梯次 0、驗收文件 0。
- 2026-10-13：依使用者決策移除第二個詳情公開開關。課程只保留 `isPublished`；公開前 Studio 必須驗證代表圖與完整詳情，總覽、詳情 API 及活動的關聯課程皆共用相同公開狀態。新版 production schema 已部署，published 與 draft 文件中的舊欄位均已清除。
- 2026-10-11：依後台人工測試回饋，所有課程詳情 `text` 欄位加入「可按 Enter 換行，前台會保留段落」提示，前台以 `white-space: pre-line` 保留簡介、完整介紹、圖文說明、引言、課綱、適合對象、梯次及報名說明的換行。已部署更新 schema；`rebalancing` 真實內容於 1440px／390px 各有 15 個換行保留元素，其中 5 個含編輯者換行，兩尺寸皆無水平溢位。Web 17 檔、103 項與 Studio 14 項測試、兩端 typecheck 及 production build 通過；證據位於 `.impeccable/review/course-detail-line-breaks/`。
- 2026-10-11：修正章節錨點偏移與 active 誤判。點擊改以固定 Header、章節列實際高度及 16px 間距計算目標，平滑捲動期間維持使用者選取；一般捲動以固定列下方的章節邊界判定，手機作用中項目會自動水平置入可視範圍。Chrome CDP 實測 1440px／390px 點擊定位誤差分別約 0.22px／0.44px，後續垂直捲動皆切換至正確章節，手機錨點列水平移動 354px 且 active 完整可見。Web 17 檔、104 項測試、typecheck 與 production build 通過；Impeccable detector 為 0 項 anti-pattern，證據位於 `.impeccable/review/course-detail-anchor-tracking/`。
- 2026-10-13：新增學員心得共用元件規劃與三款桌機候選稿。Chrome 於 1280px、1440px 檢查六組畫面，皆無水平溢位；C 案方向鍵切換可同步選取、焦點與內容。此階段未修改 production schema、查詢、Vue 元件或測試，手機版待選案後設計。
- 2026-10-16：手機內容章節標題改用全站共用 `--detail-section-title-size: 26px`，涵蓋介紹、適合對象、圖冊、梯次、課綱、帶領者、影片與報名；Hero 與引言維持原展示字級。390px fixture 頁的 12 個內容 `h2` 均為 `26px / 32.5px`、最右界 368px，長標題可自然換兩行且無水平溢位；完整長頁及淺色長文／深色報名區近照位於 [`review/detail-heading-token-mobile/`](../design/review/detail-heading-token-mobile/README.md)。Web 34 檔／190 項測試、typecheck 與 production build 通過。
- 2026-10-18：詳情頁頂端加入共用 `DetailBreadcrumb`，呈現「首頁／課程探索／目前課程」；目前頁為帶有 `aria-current="page"` 的純文字。Chrome 以 production 內容 `/course/rebalancing` 檢查 1440 × 900 與 390 × 844，麵包屑、首區及長標題無溢位或錯位；截圖位於 `/private/tmp/course-*-breadcrumb.png`。相關四組詳情測試 37 項、Web 全套 37 檔共 211 項、typecheck 與 production build 均通過；typecheck 僅保留既有 Volar 套件警告。
- 2026-10-20：完成待修正清單。新增單一共用心得、可重複圖片輪播與頁尾延伸閱讀；About 輪播及 Article 延伸閱讀分別抽成 `SharedImageTextCarousel`、`SharedRelatedArticles`。Chrome CDP 於 1440×1000／390×844 確認無水平溢位、單一 `h1`、內容標題 38px／26px、桌機左圖右文、手機自然堆疊、48px 控制、可見鍵盤焦點、卡片 hover 色彩及 reduced-motion 0s；證據見 [課程內頁修正驗收](../design/review/course-detail-corrections-2026-10-20/README.md)。Web 39 檔／228 項與 Studio 31 項測試、兩端 typecheck 及 production build 均通過；Impeccable detector 為 0 個 anti-pattern，55 項 advisory 均為既有且已核准的頁面角色字級與色值。新版 schema 尚未部署或寫入遠端資料。
- 2026-10-23：完成本輪待修正清單。課程介紹與帶領者導言取消局部閱讀寬度限制；帶領者色塊維持全寬，內部圖片最大寬度為 500px；新增獨立「帶領者」`h2`，姓名改為 `h3`。圖冊補充、段落引言及圖文內容標題改為端到端選填，course-gallery 的 footer 與相關版型標籤則已移除。Chrome CDP 於 1440×1000、1023×900、390×844 確認無水平溢位、單一 `h1`、兩處導言 `max-width: none`、肖像上限、標題層級、圖冊無 footer 與 2px 鍵盤焦點；證據見 [2026-10-23 課程內頁修正驗收](../design/review/course-detail-corrections-2026-10-23/README.md)。相關 Web 4 檔／31 項與 Studio 35 項測試、兩端 typecheck 通過；完整測試與 build 結果記錄於下方清單。本機未部署 schema 或寫入遠端資料。
- 2026-10-23：追加課綱單元標題換行支援。Studio 欄位由單行 `string` 改為兩行 `text`，保留原必填及 2–100 字限制；parser 保留換行字元，Vue 標題套用既有 `preserve-lines`。Chrome 以合成兩行標題於 1440×1000／390×844 驗證皆實際渲染兩行、無水平溢位，按鈕高度分別為 96px／104px；證據同上。相關 Web 2 檔／25 項與 Studio 35 項測試、兩端 typecheck 及 production build 均通過；schema 尚未部署，未修改遠端資料。
- 2026-10-23：依課程後台修正清單，將適合對象改為選填，並修正影片區塊可拖垮整頁的解析耦合。影片狀態文字改為選填並提供安全預設；其他影片必要資料不完整時只略過影片。Web 43 檔／254 項、Studio 37 項、兩端 typecheck／build 及 schema validation 通過；production 未部署，Studio 瀏覽器驗收待後續完成。完整紀錄見 [課程後台修正紀錄](../corrections/course-admin-corrections-2026-10-23.md)。
- 2026-10-23：追加將課程架構改為選填。Studio 內容編排最少區塊數降為 2，必要核心只保留課程介紹與圖文版型；前台 parser 同步接受沒有課程架構的已發布內容。回歸測試與最終驗證結果記錄於 [課程後台修正紀錄](../corrections/course-admin-corrections-2026-10-23.md)。
- 2026-10-23：課程影片改為頁內嵌入。前台將有效 YouTube 網址正規化為隱私強化 iframe，播放器以 600px 上限置中並維持 16:9；不再渲染外連播放按鈕，無網址時保留封面與待上架狀態。
- 2026-10-23：修正分階段課程日期被合併為連續區間的誤導。GROQ 補回階段名稱與順序，parser 保留每階段的全部日期區間；首屏時間分行摘要，梯次區逐階段列出。
- 2026-10-23：因既有課程梯次區與整頁視覺節奏不協調，新增 A「階序長卷」、B「夜色課程帶」、C「編輯式行程簿」三款桌機候選稿；三案皆以三階段、每階兩段日期測試完整資訊層級。方向尚待選定，未更新為 `design-approved`，也未開始手機版或正式 Vue 實作。比較與下一步見 [課程梯次三款桌機設計方向](../design/review/course-schedule-concepts-desktop/README.md)。
- 2026-10-23：A、B、C 三案經人工檢視後均未採用；依回饋改為單一極簡方向。使用者後續手動將內容上限調整為 900px，正式梯次區改用完整視窗高度垂直置中，第一階上方不設分隔線；設計稿與測試已同步。正式頁另補齊梯次地點、資訊標籤與報名提醒，使內容層級和核准稿一致。Chrome 1440×1000、CDP 390×1100 實際渲染皆正常；390px 的 `innerWidth`、`clientWidth`、`scrollWidth` 均為 390px。截圖見 [課程梯次設計紀錄](../design/review/course-schedule-concepts-desktop/README.md)。
- 2026-10-23：課程介紹與學員心得分享改用梯次區的 900px 閱讀寬度，段落使用完整可用寬度並置中；課程介紹改成標題在上、內容在下，桌機於 720–900px 高度中垂直置中，手機則維持自然高度。課程頁只覆寫共用心得元件的容器寬度與 padding，不影響活動頁等其他使用處。Chrome 1440×1000 與精確 390×1100 驗收無水平溢位，證據見 [課程梯次與閱讀寬度設計紀錄](../design/review/course-schedule-concepts-desktop/README.md)。
- 2026-10-23：完成課程梯次與極簡稿的第二次對齊。正式頁補上梯次地點、具標籤的上課資訊及報名提醒，標題固定 58px，並保留手機 26px；既有影片容器同步修回 600px，帶領者補回獨立 `h2`。課程詳情元件 16 項、parser 14 項、修正樣式 6 項測試與 typecheck、production build 均通過。Web 全套為 43 檔中 42 檔通過、260 項中 259 項通過；唯一失敗為既有 About 輪播自動播放計時測試，非本輪修改範圍。
- 2026-10-24：完成 Typography 語意角色第三階段。課程 Hero、章節標題、引言、圖冊、帶領者、課綱、梯次、報名與狀態文字已改用 `title-xl` 至 `meta` 八個共用角色；原本 58px 的梯次標題改由 `title-lg` 控制，一般段落與清單不再繼承頁面局部行高或字距。CourseDetail 的 type detector 由 24 項降至 0 項，全站只剩 About 2 項、Header 2 項與 Footer 1 項。課程相關 4 檔／32 項與 Web 全套 43 檔／266 項測試、typecheck、production build 均通過；既有 Volar package export、sourcemap 與字型 runtime resolve 警告仍存在。執行環境無可用瀏覽器，1440、1023、390px、200% 文字放大與長文換行仍待人工驗收；本階段未修改 CMS schema 或遠端內容。
- 2026-10-24：統一課程詳情內文區塊間距。桌機所有正文區塊上下皆為 `96px`，未受閱讀最大寬度約束的文字區左右統一為 `clamp(42px, 7vw, 112px)`；課程介紹、影片、學員心得與梯次等限寬閱讀區仍維持既有置中寬度。手機所有正文區塊統一為上下 `80px`、左右 `22px`；帶領者與報名的圖片維持滿版，文字側套用共用間距。輪播與延伸閱讀透過區域變數同步，其他頁面的共用元件預設值不變。Web 全套 43 檔／269 項測試、typecheck、production build、layout detector 與 `git diff --check` 均通過；既有 Vue Router／Volar、sourcemap 與字型 runtime resolve 警告仍存在。因執行環境沒有可用瀏覽器，1440px／390px 實際畫面與水平溢位仍待人工驗收。
- 2026-10-24：依後續回饋將課程詳情手機內文間距調整為上下 `40px`、左右 `20px`；前一筆 `80px / 22px` 已由本規則取代。左右值引用全站 `--page-gutter-mobile`，同步涵蓋 Hero、公告、狀態、輪播、心得與延伸閱讀；桌機 `96px` 垂直節奏及限寬閱讀區不變。Web 全套 44 檔／290 項測試、typecheck、production build、layout detector 與 `git diff --check` 均通過；既有 Vue Router／Volar、sourcemap 與字型 runtime resolve 警告仍存在。執行環境沒有可用瀏覽器，390px 實際畫面與水平溢位仍待人工驗收。
- 2026-10-23：同步人工共用元件調整。課程圖片輪播沿用 `SharedImageTextCarousel` 的 2,500ms 自動播放與 2,000ms 位移轉場；學員心得的標題、清單與正文不再由共用元件重複限寬，改由課程頁既有 900px 置中外層統一控制。About 計時回歸測試已同步至新節奏；Web 全套 43 檔／261 項測試、typecheck 與 production build 均通過，上一筆 259／260 的暫時失敗已解除。
- 2026-10-23：依最新回饋將課程影片最大寬度由 600px 調整為 760px，繼續維持 16:9、置中與窄螢幕自適應；帶領者區移除重複的固定「帶領者」標題，姓名由 `h3` 升為該 section 的 `h2`，保留原姓名字級與內容順序。Chrome 於 1440 × 1000／390 × 844 確認無水平溢位、固定標籤數為 0，影片 scoped CSS 實測寬度為 760px／346px；Web 全套 43 檔／261 項、typecheck、production build 與 layout detector 均通過。Production 公開內容目前沒有影片區塊，真實 iframe 畫面仍待發布後驗收。前述新增獨立標題與 600px 容器的紀錄屬先前階段，已由本條取代。
- 2026-10-23：課程 Hero 與頁尾報名行動移除獨立 `.primary-action`，統一改用全站 `.button-primary` 與 `.button-primary__icon`；有效網址維持連結，未核准行動維持原生 disabled button。頁面只保留 Hero 外距與報名區上距，不再覆寫顏色、字級、高度、箭頭、最大寬度、focus 或 disabled 樣式。
- 2026-10-23：Chrome production build 於 1440 × 1000／390 × 844 驗證課程 Hero 按鈕為 360 × 84px／346 × 72px，字級 18px／14px、字重 400，且頁面無水平溢位；disabled 視覺與不觸發箭頭位移另由共用樣式瀏覽器量測及元件測試覆蓋。證據見 [主要行動按鈕統一驗證](../design/review/primary-action-unification-2026-10-23/README.md)。
- 2026-10-23：圖片輪播的章節導覽不再使用固定「圖片輪播」，改為與內容區 `h2` 共用後台設定的區塊標題。Production `/course/rebalancing` 實測兩處皆為「課程花絮」，點擊後 active／錨點正確，1440px／390px 均無水平溢位；證據見 [課程輪播章節標題驗證](../design/review/course-carousel-title-2026-10-23/README.md)。
- 2026-10-23：課程後台所有明確命名為「說明」的欄位改為選填，範圍為學習片段、圖文版型、課程架構、適合對象、課程梯次與報名區塊。Studio 保留原字數上下限但移除 required；Web 型別與 parser 接受缺值，Vue 不渲染空段落。「單元內容」「固定文字」等不同語意欄位維持原契約。Web 43 檔／263 項與 Studio 38 項測試、兩端 typecheck 及 production build 通過；schema 尚未部署，實際 Studio 留空發布待驗證。
- 2026-10-25：同步使用者手動調整。課程介紹與共用相同版面的文字段落取消 `720–900px` 固定最小高度，改由內容長度及既有區塊 padding 決定自然高度；900px 閱讀寬度維持不變。帶領者英文姓名取消額外頂部間距並改用 `body` 的 size、weight、leading 與 tracking。此紀錄取代 2026-10-23「課程介紹桌機固定高度」規則；既有截圖保留為歷史證據，本次只同步文件，未宣告新的跨瀏覽器畫面驗收。

## 待處理與下一階段

- 已加入與文章詳情一致的三層麵包屑，提供「首頁／課程探索／目前課程」導覽。
- 延後項目：待多門課程完成後台資料建置後，集中檢查長短內容、不同區塊組合與缺省資料的呈現，再決定是否調整前台樣式或新增、拆分 Studio 欄位；目前不阻擋下一個單元。
- 本機新增的學員心得、圖片輪播與延伸閱讀仍須部署 Studio schema，並以隔離內容完成草稿不可見、發布、更新、匿名讀取、前台呈現與精確清除後，才可恢復 `verified`。
- 發布前仍需補真實 iOS／Android 裝置，以及 Safari、Firefox 的交叉驗證；本階段只完成 Chrome headless 驗收。

#### 筆記，不需要執行，可忽略
- 使用 `$develop-feature` 從 web/docs/specs/course-detail.md 接續下一個流程

#### 待修正項目
- [x] 最上方補上麵包屑導覽列；2026-10-18 已使用共用 `DetailBreadcrumb` 完成
- [x] 內文標題字級太大，需與其他內頁的大標題字級相同；2026-10-16 手機內容章節 `h2` 已統一引用共用 `--detail-section-title-size: 26px`，桌機與 Hero 展示標題維持既有核准構圖
- [x] 桌機的內文區域大標題需要對齊其他頁面；2026-10-20 已統一引用共用 `--detail-section-title-size: 38px`，Chrome 實測所有內容 `h2` 為 38px
- [x] 缺少學員分享的區塊（此區後檯可自由新增，只能有一個），近期活動內頁有相同的元件，用這個就可以；2026-10-20 已接入共用 schema、型別、parser 與 `SharedTestimonials`，Studio 驗證每頁最多一個
- [x] 新增圖片輪播，左：swiper 右：固定文字（功能樣式同關於我們：精選片段 的輪播，請把這個論播拆成共用元件），此區塊為自由新增；2026-10-20 已抽出 `SharedImageTextCarousel`，About 與課程共用，課程可在內容編排中重複新增
- [x] 新增元件：延伸閱讀（同 articles-detail），此區塊為自由新增，固定在最下方，可選取想放的文章或是關聯文章；2026-10-20 已抽出 `SharedRelatedArticles`，支援人工排序 0–8 篇並固定在報名區後方
- 剛才有手動調整的css，若有需要請幫我補回設計稿或開發文件
- [x] .course-intro .lede 有相似這個區塊的 都拿掉 max-width（2026-10-23：課程介紹與帶領者導言皆無局部 `max-width`；三個斷點 computed style 均為 `none`。）
- [x] course-teacher__portrait 背景底色區域維持原樣，希望裡面的圖片max-width:500px，看需要再多包一層還是怎樣（2026-10-23：保留 bark 色全寬容器，圖片直接限制 `max-width: 500px`；桌機／平板實測 500px，手機依可用寬度縮為 358px。）
- [x] "帶領者" 希望也有這個標題，目前沒有（2026-10-23：新增獨立 `h2`，姓名使用 `h3`；桌機、平板與手機均完成視覺及語意驗證。）
- [x] 影片容器調整為 760px（2026-10-23：最大寬度改為 760px，維持 16:9、置中與窄螢幕 `100%` 自適應。）
- [x] 移除「帶領者」章節標題（2026-10-23：移除固定標籤，帶領者姓名改為 section 的 `h2`，避免標題階層中斷。）
- [x] 後台相關設定： 圖冊補充、段落引言 改成非必填，圖文內容的標題 改成非必填（2026-10-23：Studio validation、共用型別、parser 與 Vue fallback 已同步；缺值回歸測試通過。schema 尚未部署，遠端內容流程仍待後續驗證。）
- [x] course-gallery 不需要 footer（2026-10-23：已移除前台 footer markup、版型名稱與補充文字輸出，以及所有相關桌機／手機定位樣式；圖冊補充欄位保留供舊內容相容。）
- [x] 後台設定：內容編排 > 課程架構 > 課綱單元 > 單元標題希望可以斷行（2026-10-23：Studio 改為兩行 `text` 並加入換行提示；parser 與前台保留換行，桌機／手機兩行標題驗證通過。schema 尚未部署。）
- [x] 影片區塊若沒有上封面圖片前台不會顯示，封面圖片應為選填（2026-10-25：Studio 移除封面必填；parser 接受沒有封面與網址的影片，前台保留標題及狀態並略過空媒體容器。桌機／手機 Chrome 驗收通過。）
- [x] 內容編排區塊的選項，學員心得分享改成文字段落（2026-10-25：新增可排序的「文字段落」標題與正文，移除內容編排的新建心得選項；固定「學員分享（選填）」欄位不變，parser 繼續相容舊 body 心得資料。）

2026-10-25 本輪兩項追加修正已完成本機實作及必要驗證。Web 48 個測試檔／319 項與 Studio 41 項測試、兩端 typecheck、兩端 production build 及 `git diff --check` 均通過；Chrome headless 以 1440×1400、390×844 驗證文字段落及無封面影片，證據見 [課程後台影片與文字段落修正驗收](../design/review/course-admin-corrections-2026-10-25/README.md)。Web typecheck 保留既有 `vue-router/volar/sfc-route-blocks` 警告，Web build 保留既有 sourcemap 與 runtime 字型路徑提示。新版 schema 尚未部署；下一步須先遷移舊 body 心得，再部署並進行遠端內容流程回歸。Safari／Firefox、真實 iOS／Android 與螢幕閱讀器仍未執行。
