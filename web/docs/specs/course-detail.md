# 課程內頁規格

**規格狀態：** `ui-verified`

**設計狀態：** A「章節潮汐」響應式 HTML 整合稿已完成；桌機單元圖冊錯位調整與五款手機多圖模式已有瀏覽器模擬驗證紀錄。

**開發狀態：** 已完成型別化本機 fixture 驅動的 Nuxt 前端原型、正式動態路由、UI 行為修正及 Chrome 多尺寸驗收；尚未建立 Sanity 內頁內容模型、GROQ/API 或正式發布內容。

**路由：** `/course/[slug]`

**設計依據：** `docs/design/course-detail-concepts-award.html`、`docs/design/course-detail-tidal-desktop-concepts.html`、`docs/design/course-detail-composite-desktop.html`、`.impeccable/surfaces/course-detail-composite-desktop-html.md`

## 開發進度

以下依 2026-10-10 本機程式盤點記錄；未重新查驗遠端環境。

| 項目 | 狀態 | 實作依據／完成條件 |
| --- | --- | --- |
| 桌機與手機設計原型 | 已完成原型 | 響應式 HTML 與截圖已存在；不是正式 Vue 元件 |
| 課程總覽與基礎資料 | 已有可沿用實作 | `app/pages/course/index.vue`、`server/api/course-overview.get.ts`、`../studio/schemaTypes/course.ts` 與 `courseRun.ts`；內頁尚未串接正式 API |
| 正式內頁路由 | 前端原型完成 | `/course/[slug]` 已依 slug 解析本機 fixture，並提供載入、錯誤、重試與不存在／未公開狀態元件；正式 API 尚未串接 |
| 內頁內容模型與型別 | 前端契約完成 | `app/types/courseDetail.ts` 定義前端資料契約與五款多圖模式；Sanity schema 與欄位驗證尚未開發 |
| 內頁 API 與資料處理 | 未開發 | 以 slug 查詢已發布課程、關聯梯次與內容；排除草稿，處理缺漏資料 |
| Vue 內容元件 | 前端原型完成 | `CourseDetail.vue` 已完成 Banner、介紹、五款多圖、帶領者、引言、課綱、影片、對象、梯次與報名區塊 |
| 互動與響應式整合 | 前端原型完成 | 已完成章節定位、鍵盤可操作多圖 tabs、課綱展開、媒體／CTA 停用狀態與桌機／手機排版 |
| 自動化與瀏覽器驗收 | UI 驗證完成 | 89 項 Vitest、typecheck 與 production build 通過；Chrome 1440px／768px／390px、200% 模擬、鍵盤與 reduced motion 已驗證，跨瀏覽器與真機仍待發布前驗收 |
| 正式內容與發布 | 待處理 | 核准內容與報名連結，完成內容部署、草稿隔離與公開讀取驗證 |

### 開發順序與驗收

1. 定義內容區塊、五款多圖排版及型別，沿用既有課程與梯次資料，補齊 schema 驗證。
2. 完成 slug 查詢 API 與路由，測試未公開、不存在、資料缺漏與服務失敗情境。
3. 依整合稿完成 Vue 元件、完整響應式排版及互動；資料不足時顯示適當狀態，不以示範資料作正式內容。
4. 執行 `npm run test -w web`、`npm run typecheck -w web`、`npm run build -w web`，另執行 Studio 相關測試；驗證鍵盤、窄螢幕、橫向畫面及正式內容長度。
5. 完成核准內容與發布驗收後，才將開發狀態改為已完成。每一階段須同步本表、實際驗證結果與剩餘事項。

### 本次流程狀態

2026-10-11 已依 `$develop-feature` 從 `frontend-ready` 接續並完成 `verify-ui-behavior`。已移除選填帶領者／影片缺席時的失效章節連結，並讓 loading 轉為 ready 後正確啟動章節位置追蹤；新增選填內容、長文、圖片替代文字、完整 tabs 鍵盤操作及延遲載入完成的回歸測試。規格目前為 `ui-verified`，下一階段是 `integrate-sanity-content`。

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
| cmp-testimonial | 學員分享輪播 | 非必要；僅使用已核准內容 | 編輯者／Sanity block content |
| cmp-swiper | 圖文輪播 | 非必要；桌面最多三則、手機一則 | 編輯者／Sanity block content |
| cmp-related-articles | 相關文章輪播 | 非必要；桌面三則、平板兩則、手機一則 | Sanity references |


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

桌機「單元圖冊」的左右兩列全部採上下錯位，不再只有項目三、四錯開。手機以單一 DOM 順序重排：模式控制可橫向滑動且觸控高度至少 64px；編輯拼貼使用交替對齊與深色引言，分階圖譜保留階段分組，交錯章節維持圖文成對，單元圖冊以 88% 寬影像左右錯位，方法檔案將索引、條目與影像群依序展開。核心內容不因小螢幕隱藏。

## 內容契約

- 頁面必須只有一個 `h1`；內容模組依序使用 `h2`、`h3`。
- 報名 CTA 只連往已確認外部表單；若尚未開放，顯示明確狀態而不是失效連結。
- 課程日期、費用、名額、地點、師資資格、學員分享與成效文字均需由內容負責人核准。
- 行動版維持資料與 DOM 相同順序，觸控目標至少 44px，所有互動須支援鍵盤與 reduced motion。

## 驗證紀錄

以下歷史紀錄描述設計原型，不等同正式內頁開發驗收。本次僅查閱本機檔案與更新文件，未重跑原型瀏覽器驗證、應用程式測試、建置或遠端發布。

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

## 待處理與下一階段

- 依 `$develop-feature` 進入 `integrate-sanity-content`；正式 Sanity schema、GROQ/API、已發布內容查詢與草稿隔離仍待開發。五款多圖目前保留為前端可切換模式，CMS 串接時須決定由編輯者單選版型或保留前台比較控制。
- 正式內容尚未核准；設計稿中的日期、地點、引言與人物內容只作舊站內容結構示意。
- 發布前仍需補真實 iOS／Android 裝置，以及 Safari、Firefox 的交叉驗證；本階段只完成 Chrome headless 驗收。

#### 筆記，不需要執行，可忽略
- 使用 $develop-feature 從 web/docs/specs/course-detail.md 接續下一個流程
