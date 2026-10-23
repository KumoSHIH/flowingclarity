# 課程內頁規格

**規格狀態：** `cms-integrated`（2026-10-20 修正已於本機完成；更新後的 production schema 與內容流程尚未驗證）

**設計狀態：** A「章節潮汐」響應式 HTML 整合稿已完成；桌機單元圖冊錯位調整與五款手機多圖模式已有瀏覽器模擬驗證紀錄。

**開發狀態：** 既有課程內頁曾完成 production 內容流驗收。2026-10-20 已於本機新增單一學員心得、可重複圖片輪播與固定頁尾延伸閱讀，並完成 schema、published-only GROQ、parser、Vue、測試與 Chrome 驗收；新版 schema 尚未部署，新增欄位尚未執行遠端草稿／發布／清除流程。

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
| Vue 內容元件 | 已完成 | `CourseDetail.vue` 依 CMS 陣列順序渲染介紹、五款可重複圖文版型、帶領者、引言、課綱、影片、對象、單一學員心得及可重複圖片輪播；Banner、梯次與報名維持固定位置，延伸閱讀固定在報名後方 |
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
| cmp-article | 圖上文下 | 非必要；圖片須有替代文字 | 編輯者／Sanity block content |
| cmp-article-left | 左圖右文 | 非必要；手機先圖後文 | 編輯者／Sanity block content |
| cmp-article-right | 右圖左文 | 非必要；手機先圖後文 | 編輯者／Sanity block content |
| cmp-article-bg | 有底色的引言、原則或引用 | 非必要；深底須用暖白文字 | 編輯者／Sanity block content |
| cmp-curriculum | 階段、單元、標題與內容，可展開 | 建議；支援 1–12 單元 | 編輯者／Sanity block content |
| cmp-schedule | 城市、日期、時間、地點、名額與狀態 | 報名時必要；不得顯示未確認資料 | 編輯者／Sanity course document |
| cmp-video | YouTube 播放器與封面 | 非必要；需標題與封面替代文字 | 編輯者／Sanity block content |
| cmp-testimonial | 純文字學員心得與分享者名稱 | 非必要；每頁最多一個區塊、每區 1–12 筆，僅使用已核准公開的內容 | 編輯者／Sanity shared block content |
| cmp-swiper | 左側圖片輪播與右側固定文字 | 非必要；可重複新增，每區 1–10 張 | 編輯者／Sanity block content |
| cmp-related-articles | 相關文章輪播 | 非必要；0–8 篇不重複文章，固定在報名後方；桌面三則、平板兩則、手機一則 | Sanity references |


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

2026-10-11 後台人工測試改變正式內容策略：上述 tabs 僅屬歷史比較稿。正式 CMS 將介紹、圖文版型、帶領者、引言、課綱、影片與適合對象放入同一可排序陣列；編輯者可新增多個圖文版型區塊，每個區塊選擇一款版型並拖曳到需要的位置。Banner、梯次與報名仍固定，避免關鍵決策資訊失去一致位置。

桌機「單元圖冊」的左右兩列全部採上下錯位，不再只有項目三、四錯開。手機以單一 DOM 順序重排：模式控制可橫向滑動且觸控高度至少 64px；編輯拼貼使用交替對齊與深色引言，分階圖譜保留階段分組，交錯章節維持圖文成對，單元圖冊以 88% 寬影像左右錯位，方法檔案將索引、條目與影像群依序展開。核心內容不因小螢幕隱藏。

## 內容契約

- 頁面必須只有一個 `h1`；內容模組依序使用 `h2`、`h3`。
- 報名 CTA 只連往已確認外部表單；若尚未開放，顯示明確狀態而不是失效連結。
- 課程日期、費用、名額、地點、師資資格、學員分享與成效文字均需由內容負責人核准。

### 學員心得分享規劃

學員心得使用活動詳情與課程詳情共用的 `sharedTestimonialBlock`，加入 `courseDetailContent.body` 可排序陣列；每頁最多一個區塊，每區 1–12 筆並可拖曳排序。前台每筆只顯示心得文字與分享者名稱；內容負責人在輸入 CMS 前完成公開授權與文案核准，不另設逐筆同意開關。欄位、驗證與設計見 [學員心得分享共用元件規格](shared-testimonials.md)。共用 schema、GROQ、parser 與 renderer 已於本機接入；production 尚未部署與驗證。現有 `courseDetailQuote` 仍是課程引言，不得拿來儲存學員心得。
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
- []
