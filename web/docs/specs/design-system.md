# 全站文字與按鈕候選規格

## 狀態與範圍

狀態：共用 CSS 已包含八個正式文字角色。2026-10-24 四階段程式遷移完成，首頁、總覽、詳情、About、Header 與 Footer 均已採用；全站 type detector 為 0。主要按鈕、按鈕字重與互動標題色規則維持既有實作；以下數值不代表已完成本輪瀏覽器、實體裝置或螢幕閱讀器驗收。

本文件管理文字角色、按鈕外觀與跨頁 split layout 尺寸；其他容器寬度、區塊排列及元素間距仍由各頁規格管理。[Banner 規格](home-banner.md) 是第一個文字 token 引用案例。樣式角色不取代 HTML 語意，標題層級仍依內容結構選擇。

## 文字角色

內文與介面文字沿用 `--font-sans`：`BIZ UDPGothic`、`Noto Sans TC`，再使用系統無襯線字體；標題沿用 `--font-display`。下表以桌面大於 1023px、手機不大於 1023px 為正式基準。

| 正式角色 | 用途 | 桌面字級 | 手機字級 | 字重／行高／字距 |
| --- | --- | --- | --- | --- |
| `meta` | 日期、編號、圖說與補充資訊 | `12px` | `12px` | `400`／`1.7`／`0.06em` |
| `label` | 導覽、標籤、篩選與欄位名稱 | `14px` | `14px` | `700`／`1.7`／`0.08em` |
| `body` | 一般正文與長文清單 | `16px` | `16px` | `400`／`2.1`／`0.025em` |
| `lead` | 頁首摘要與引導敘述 | `17px` | `16px` | `400`／`2`／`0.035em` |
| `title-sm` | 卡片標題、人物名稱與內文小標 | `24px` | `22px` | `400`／`1.55`／`0.03em` |
| `title-md` | 內容章節標題 | `38px` | `26px` | `400`／`1.4`／`0.02em` |
| `title-lg` | 總覽頁與一般頁面標題 | `56px` | `42px` | `400`／`1.2`／`0.04em` |
| `title-xl` | 首屏與內容詳情主標題 | `72px` | `42px` | `400`／`1.22`／`0.025em` |

主要按鈕是元件專屬角色，維持桌面 `18px`、手機 `14px`、字重 `400` 與 `0.1em` 字距，不納入通用文字角色。既有 `--detail-hero-title-size`、`--detail-summary-size`、`--detail-section-title-size`、`--detail-body-size` 保留為相容別名，實際值改由 `--type-*` token 提供；新元件不得直接新增另一組詳情字級。

目前淺色 Banner Story 欄的標題與敘述繼承 `#38342e`，背景為 `#e8dfd2`；深色表面使用 `#f7f6f4`，次要文字使用 `#d8c7b8`。一般區塊標題不直接沿用首屏字級。

## 主要按鈕

候選大型主要按鈕以現有 Banner CTA 為基準：

| 屬性 | 目前實作 |
| --- | --- |
| 外觀 | 背景 `#df5b35`、文字 `#fff7f1`，直角、無邊框 |
| 寬度 | `width: 100%`、`max-width: 360px`；窄容器內可縮小，不超過 360px |
| 最小高度 | `clamp(72px, 8.4vh, 92px)`，手機亦繼承此值 |
| 內距 | 上下 `0`；桌面左右 `clamp(28px, 3vw, 48px)`，手機 `24px` |
| 圖示 | 文字與圖示間距 `24px`；箭頭 `22 × 22px` |
| 字級／字重 | 桌面 `18px`、手機 `14px`；統一 `400` |
| Hover | 背景 `#c94f34`，`220ms ease` 過渡 |
| 鍵盤焦點 | 共用按鈕自帶 `2px solid var(--color-clay)` 外框，偏移 `6px` |
| Disabled | 背景 `#8a6153`、文字 `#dfd5ca`、`cursor: not-allowed`；不得觸發導向或操作 |
| 箭頭互動 | `.button-primary__icon` 為 `22 × 22px`、1.5px 線條；hover／focus 向右移動 4px |
| 減少動態 | 停用按鈕與箭頭過渡 |

導向目的地使用 `<a href>`；執行操作使用 `<button>`。沒有有效目的地的主要行動使用原生 disabled button，不以無效連結模擬。Loading、一般尺寸與 pressed 變體尚未定義；有使用案例時再補齊。父容器決定按鈕外距，共用按鈕管理自身寬度、外觀、內距與互動狀態。

## 套用與驗收

1. 先在使用頁規格指定文字角色、按鈕變體與適用表面；需要新角色時先更新本文件，不以相近局部數值繞過既有角色。
2. 共用數值及 `.type-*` class 集中於 `web/app/assets/css/main.css`；其他頁面以加入語意 class 的方式逐步採用，不直接依標籤名稱修改所有 `h1`、`p` 或 `a`。目前沒有另建 Vue 按鈕元件。
3. 套用時驗證桌面、手機、斷點及長文案：不得裁切、重疊或水平溢位；鍵盤焦點可見，連結及操作行為正確。
4. 2026-10-23 已完成 Chrome 桌機、平板與手機檢視；配色對比、文字放大、實體裝置與螢幕閱讀器仍待後續驗收。

## 共用 CSS 用法

```html
<h1 class="display-title">展示標題</h1>
<p class="lead-text">引導敘述</p>
<a class="button-primary" href="/course">
  <span>探索課程</span>
  <svg class="button-primary__icon" aria-hidden="true"><!-- 圖示 --></svg>
</a>
```

深色背景的敘述加上 `lead-text--inverse`；淺色 Banner 使用基本 `.lead-text` 並繼承容器文字顏色。`.button-primary` 代表全站大型主要行動，可用於連結或原生按鈕；`.button-primary__icon` 統一箭頭尺寸、線條與互動。共用 class 放在 `@layer components`，頁面只保留外距與配置，不得重新定義同角色的顏色、字級、高度、最大寬度、焦點或 disabled 狀態。

共用文字 token 使用 `--type-<role>-size|weight|leading|tracking`；按鈕、互動標題色及焦點仍使用 `--button-primary-*`、`--interactive-title-hover` 與 `--control-focus-*`。字體和主色沿用既有 `--font-sans`、`--font-display`、`--color-persimmon` 與 `--color-clay`。手機數值在 `max-width: 1023px` 統一切換。文字字級使用桌面與手機兩組固定值，不使用 `clamp()`；間距、容器與非文字尺寸仍可依既有版面需求使用流體尺度。修改全站數值時同步更新本文件與 `DESIGN.md`。

## 互動標題顏色

可點擊內容標題在 hover 與 `focus-visible` 時統一使用 `var(--interactive-title-hover)`，目前值為 `var(--color-clay)`。此 token 已套用於活動列表標題與文章延伸閱讀標題；其他非標題文字、深色表面品牌字樣及功能導覽不受此規則限制。元件可保留底線、圖片縮放或箭頭位移等第二種回饋，避免只靠顏色表達互動狀態。

共用 class 不設定外距、容器內距或區塊定位；這些由使用頁負責。CMS 標題的分行標記仍留在 `HomeBanner.vue`，目前沒有中間斷點的標題字級特例。

## 詳情頁間距

活動與執行師詳情共用 `--detail-hero-max-width: 1500px`、`--detail-layout-max-width: 1500px`、hero 上下間距與主要內容間距。桌機 hero 為 `1500px` 置中容器，上下內距為 `84px`；活動詳情保留水平 `clamp(28px, 6vw, 116px)`，執行師詳情 banner 的水平 padding 為 `0`。主要內容為 `76px clamp(48px, 7vw, 104px)`。`<= 1023px` 的 hero 上下內距改為 `68px / 76px`，兩頁與主要內容的水平內距皆引用 `--page-gutter-mobile: 20px`；主要內容垂直內距為 `64px`。執行師詳情的雙欄外層保持全寬，只以 `calc((100% - 1500px) / 2)` 左側 gutter 對齊活動詳情，且不使用 `border-top`；內容可用 `68ch` 控制正文及清單閱讀寬度。

2026-10-24 起，所有手機與單欄頁面的外側左右 gutter 統一為 `--page-gutter-mobile: 20px`。頁面 section、hero、總覽 rail、Header、Footer 與共用內容元件必須引用此 token；按鈕、卡片、清單列及控制項的內部 padding 不在此規則內。本輪新增 21 項 gutter 回歸測試，Web 全套 44 檔／290 項、typecheck、production build、layout detector 與 `git diff --check` 均通過；390px 實際畫面仍待可用瀏覽器環境補驗。

## 共用雙欄版面

課程、活動與執行師總覽共用 `--split-layout-rail-width: 400px`。`>= 1024px` 的外層 grid 保持全寬，左欄貼齊視窗左側，右側內容不設定最大寬度並填滿剩餘欄寬；`<= 1023px` 由各頁既有規則轉為單欄。詳情頁可引用固定 rail 寬度，但不套用總覽的貼左規則：活動與執行師詳情皆以 `1500px` 置中基準決定雙欄起點，執行師詳情只套左側 gutter、不限制外層右界。

2026-10-21 已將五個使用點的百分比欄寬收斂為固定 `400px` rail，並依頁面角色修正定位：三個總覽頁左欄無外距、右側內容填滿剩餘欄寬；活動與執行師詳情共用置中 hero 與雙欄起點，但執行師詳情外層仍保持全寬。Chrome 以可讀內容驗證 390、1024、1440、1920px，完整量測與代表截圖見 [split layout 驗證記錄](../design/review/split-layout-2026-10-21/README.md)。Safari／Firefox、實體裝置與螢幕閱讀器未於本次重跑。

## 共用頁尾元件

狀態：2026-10-07 已完成 L「靜默座標」本機 CMS 串接及使用者手動樣式同步。首頁與課程頁共用 `SiteFooter.vue`，資料來自 `useSiteSettings`；Header、hero-menu、Footer 共用五項導覽，Header Logo 與 Footer Logo 在同一份設定內獨立維護。無有效資料顯示中性 unavailable 狀態，不以 fixture 補位。

Footer 採主色 bark（`#766254`）表面與 paper 文字，保留 2.4px 連結字距、0.5s 色彩過渡及底部分隔線。Hover／目前頁用 saffron 35% + paper 65% 混色及底線，焦點為 paper 外框。SVG 每輪位移對齊 dash 重複間距，週期為 4.44s／7.614s；離屏／背景頁籤暫停，reduced motion 僅保留靜態線。這些構圖／動態參數僅屬 Footer，不影響其他元件。

新版典型內容量測 320、560、900、1024、1440px，最少／最長內容量測 320、1440px，無文字或操作元素水平溢位。2026-10-08 已完成遠端 schema 與 API 層草稿／發布／還原驗證；最新證據見 [Footer 規格](footer.md) 及 [review](../design/review/footer-content-flow/README.md)。仍待 Studio hostname／編輯介面、正式內容核准、四個目的頁及完整人工驗收。

## 全站回頂元件

狀態：2026-10-15 已新增 `GoTopButton.vue` 並由 `app.vue` 全域掛載。按鈕在 `window.scrollY > 480` 時出現，使用原生 button、繁中 accessible name 與裝飾 SVG；點擊後回到頁面頂端，正常模式採 smooth scrolling，reduced motion 改為 `auto`。元件卸載時必須移除 scroll listener。

外觀沿用全站直角與平面表面：桌機 56 × 56px、手機 52 × 52px，night 背景、paper 箭頭、clay hover、saffron focus ring，不使用圓形、陰影或文字字元箭頭。右下留白以 `clamp(20px, 3vw, 48px)` 為基準，並分別納入 right／bottom safe-area inset；z-index 為 40，低於固定 Header 的 50。不加入 CMS 欄位或逐頁設定。

實際瀏覽器已於首頁驗證 1440 × 900 與 390 × 844：頂端按鈕數量為 0，捲動 700px 後各顯示一個按鈕，尺寸分別為 56px 與 52px，焦點外框為 2px，頁面無水平溢位；點擊後 `scrollY` 回到 0 且按鈕隱藏。元件測試另覆蓋 480px 顯示邊界、accessible name、smooth scrolling、reduced motion 與 listener cleanup；Web 34 個測試檔共 190 項、typecheck、production build 及 `git diff --check` 通過，Impeccable detector 為 0 項。實體觸控裝置及螢幕閱讀器尚未執行，不記為已完成。

### 既有抽取驗證

2026-10-04：前端 30 項測試、typecheck 與正式 build 通過。以原始 CSS 和抽取後 CSS 建立本機 Banner 文字區測試頁，在 Chrome 比對 390、1023、1024、1180、1440px 的字級、行高、顏色、內距及元素位置／尺寸，結果一致；減少動態模式確認為零秒過渡，並檢視手機與桌面截圖。此紀錄早於 2026-10-05 的標題尺寸與 Banner 版面調整，不代表目前版本已完成視覺驗收。


## 2026-10-20 共用互動樣式修正

- 已將 `.button-primary` 設為容器內 `width: 100%`、最大寬度 `360px`。
- 活動列表的「前往報名」改用 `.button-primary` 與 `.button-primary__icon`，移除重複的按鈕色彩、尺寸及 hover 樣式。
- 盤點目前會使內容標題變色的互動；活動列表與文章延伸閱讀統一引用 `--interactive-title-hover`，並讓 hover／鍵盤焦點使用同一語意色。
- `npm run test -w web` 通過 39 個測試檔、226 項測試；`npm run typecheck -w web`、`npm run build -w web` 與 `git diff --check` 通過。Impeccable detector 為 0 個反模式；28 個 advisory 皆為既有的頁面角色字級或既有色值未列入 `DESIGN.md` ramp。typecheck 保留既有 `vue-router/volar/sfc-route-blocks` 套件匯出警告；build 保留既有 sourcemap 與字型執行期解析警告。瀏覽器實際版面、實體觸控裝置及螢幕閱讀器仍待人工驗收。

後續若新增可點擊內容標題或主要按鈕，應直接引用上述共用 class／token，不另建近似色值。

## 2026-10-23 主要行動統一

- 移除課程詳情獨立 `.primary-action` CSS；Hero 與報名區四種 link／disabled button 狀態全部改用 `.button-primary` 與 SVG `.button-primary__icon`，報名區不再覆寫 520px 上限。
- 執行師詳情的選填預約入口加入相同共用 class 與箭頭，只保留側欄中的 `margin-top`。
- 箭頭線條、4px 位移、disabled 顏色與 reduced-motion 集中到 `main.css`；活動詳情與活動列表移除重複箭頭 CSS。
- 課程梯次的「查看報名方式」是頁內導引，維持次要／情境操作，不納入大型主要行動規格。
- Chrome production build 於首頁、課程詳情及活動列表驗證 1440px／390px：按鈕無水平溢位，桌機／手機字級為 18px／14px、字重 400；hover、focus、disabled 與箭頭狀態均符合本文件。完整量測與截圖見 [主要行動按鈕統一驗證](../design/review/primary-action-unification-2026-10-23/README.md)。Production 執行師內容目前沒有預約網址，該入口只完成元件層回歸驗證。

## 2026-10-23 全站字級與按鈕修正

- 移除 `web/app` 內所有 `font-size: clamp(...)`、含流體字級的 `font` shorthand 與 Tailwind arbitrary clamp 字級；各元件改用桌面固定值，並在既有 `max-width: 1023px` 或元件窄版斷點切換手機固定值。
- `.button-primary` 桌面／手機字級固定為 `18px`／`14px`，全域原生 `button`、主要 CTA 與既有按鈕內文字皆採 `font-weight: 400`。
- 活動列表與文章延伸閱讀的可點擊標題統一使用 `--interactive-title-hover`，hover 與 `focus-visible` 保持相同語意角色。
- Chrome 實測 `/`、`/course`、`/events`、`/session`、`/articles` 於 1440、1023、390px，共 15 組頁面／斷點皆無水平溢位；CTA 字級與按鈕字重符合規格，活動標題 hover／focus 色彩與可見焦點通過。代表截圖與量測見 [瀏覽器驗證記錄](../design/review/design-system-corrections-2026-10-23/README.md)。
- `typography-corrections.test.ts` 通過 3 項回歸測試；`npm run test -w web` 通過 42 個測試檔、245 項測試。`npm run typecheck -w web`、`npm run build -w web` 與 `git diff --check` 通過。typecheck 保留既有 `vue-router/volar/sfc-route-blocks` 套件匯出警告；build 保留既有 sourcemap 與字型執行期解析警告。
- 實體觸控裝置、Safari／Firefox、文字放大與螢幕閱讀器未於本輪執行；不得視為已完成。

## 2026-10-24 Typography 語意角色第一階段

- 在 `main.css` 建立 `meta`、`label`、`body`、`lead`、`title-sm`、`title-md`、`title-lg`、`title-xl` 八個角色的 size、weight、leading 與 tracking token，以及對應 `.type-*` class；桌面／`<= 1023px` 使用固定字級。
- 舊 `--detail-*` 字級保留為相容別名並指向新角色。文章、活動、執行師詳情，以及 `ArticleRichTextContent`、`SharedRelatedArticles`、`SharedTestimonials` 已完成遷移；首頁、總覽頁、課程詳情、Header 與 Footer 尚待後續階段。
- 新增語意角色回歸測試。`npm run test -w web` 通過 43 個測試檔、264 項測試；`npm run typecheck -w web` 與 `npm run build -w web` 成功。typecheck 保留既有 Volar package export 警告；build 保留既有 sourcemap 與字型 runtime resolve 警告。
- Impeccable type detector 由遷移前 160 項 advisory 降至 84 項；本階段六個已遷移元件為 0 項，剩餘項目皆位於後續範圍。
- 嘗試啟動 Chrome、內建瀏覽器與原生 Computer Use 服務，但環境回報無可用瀏覽器；因此桌機／手機 computed style、溢位、200% 文字放大與代表截圖仍待人工驗收，不以自動測試替代。
- 下一階段：遷移首頁與四個總覽頁，再處理變體最多的課程詳情；完成後統一驗證 1440、1023、390px 與 200% 文字放大。

## 2026-10-24 Typography 語意角色第二階段

- 首頁五個區塊、共用 `DirectoryIntro`，以及文章、課程、活動、執行師四個總覽元件已全部改由八個 `--type-*` 角色控制字級、字重、行高與字距；遷移範圍不再保留數字字級或 Tailwind `text-*` 尺寸。
- `display-title` 與 `lead-text` 保留為首頁相容 class，但其數值改為 `title-lg` 與 `lead` 的別名。課程光片標題不再於 hover／focus 另創 `36px` 尺寸，互動仍由光片寬度、影像與焦點樣式表達。
- Impeccable type detector 對本階段 10 個元件回報 0 項，全站 advisory 由第一階段後的 84 項降至 29 項；剩餘只在課程詳情 24 項、About 2 項、Header 2 項與 Footer 1 項。`npm run test -w web` 通過 43 個測試檔、265 項測試，typecheck 與 production build 成功，`git diff --check` 通過。既有 Volar package export、sourcemap 與字型 runtime resolve 警告仍存在。
- 目前執行環境沒有可用瀏覽器，因此 1440、1023、390px、200% 文字放大、長文換行與代表截圖仍待人工驗收。下一階段處理課程詳情，再盤點 About、Header、Footer 等共用殘餘。

## 2026-10-24 Typography 語意角色第三階段

- 課程詳情的 Hero、內容章節、圖冊、帶領者、引言、課綱、影片、適合對象、梯次、報名與空狀態已全部改用八個正式角色；一般段落與清單也明確套用 `body`，不再依賴頁面根層的局部行高與字距。
- CourseDetail 的 24 項 type advisory 已清為 0；全站剩餘 5 項只在 About 2 項、Header 2 項及 Footer 1 項，留待最後一階段處理。
- 課程相關 4 檔／32 項與 Web 全套 43 檔／266 項測試、typecheck 及 production build 通過。既有 Volar package export、sourcemap 與字型 runtime resolve 警告仍存在。
- 本階段未修改 CMS 或遠端內容。環境仍無可用瀏覽器，因此 1440、1023、390px、200% 文字放大及長文換行的人工視覺驗收尚未完成。

## 2026-10-24 Typography 語意角色第四階段

- About 的 Hero、章節、導言、正文、標籤、metadata、聯絡資訊、地圖行動與狀態文字已移除舊 `--detail-*` 別名及局部數值；Header 導覽統一使用 `label`；Footer 品牌文字、雙語主張、聯絡／導覽與版權分別對應標題、`label`、`meta` 角色。
- 額外移除 detector 未涵蓋的 `font` shorthand、Footer 手機展示字級，以及文章小標、執行師側欄、共用麵包屑／輪播與目錄篩選別名的合法階梯數字。`web/app` 元件已無數字 `font-size` 或數字字級 shorthand；全站 type detector 從最初 160 項降至 0。
- 相關 7 檔／62 項與 Web 全套 43 檔／268 項測試、typecheck 及 production build 通過；既有 Volar package export、sourcemap 與字型 runtime resolve 警告仍存在。
- 程式遷移已完成，不再有待遷移元件。Computer Use 服務仍無可用瀏覽器，因此 1440、1023、390px、200% 文字放大、長文字換行與操作區尺寸仍待人工驗收。

## 2026-10-24 總覽頁手動校準

- `DirectoryIntro` 保持 `title-lg`／`lead` 角色，但導讀不再限制為 `12em`，並以 `25px` 與頁名分隔；課程結尾／狀態及活動狀態標題同樣取消 `12em` 上限。上述文字依各自內容區自然換行，不新增寬度 token。
- 活動總覽的目前集合標題使用 `title-md`；活動類型及地點／形式資訊使用 `label`，日期與狀態保留 `meta`。這是既有正式角色的語意重映射，沒有新增 token 或局部字級。
- 相關 5 檔／30 項測試、typecheck、production build 與 `git diff --check` 通過；只保留既有的 Volar、sourcemap 與字型 runtime resolve 警告。本次尚未完成瀏覽器、200% 文字放大、實體裝置或螢幕閱讀器驗收；下一階段應以 1440px、1023px、390px 補驗長導讀、狀態標題與活動列換行。
- 活動列表的主要行動不得使用低於按鈕內容需求的固定窄欄。1024–1279px 以兩欄活動列承載，狀態與按鈕移至內容下方；1280px 以上的三欄行動區最低為 `240px`，521–1023px 的按鈕子欄最低為 `200px`，520px 以下改成單欄。短版主要行動標籤保持單行，若容器不足應先重排版面，不以逐字換行壓縮按鈕。本次 3 檔／26 項測試、typecheck、production build、layout detector 與 `git diff --check` 通過；Computer Use 無可用瀏覽器，實際斷點畫面仍待人工驗收。

## 待修正項目

2026-10-20 從 Git 原始版本復原清單，保留原文與順序。2026-10-23 完成剩餘項目，僅正規化 checkbox 格式並於原項目後補上完成證據。

- [x] button-primary 限制最大寬度為360px
- [x] 深色按鈕需使用公用元件，例如：event-row__action > a ，樣式應該是 button-primary
- [x] 檢查所有 hover效果，會讓標題變色的，顏色要統一（2026-10-23：活動列表與文章延伸閱讀統一引用 `--interactive-title-hover`，Chrome hover／focus 驗證通過。）
- [x] --button-primary-size: clamp(14px, 1.4vw, 18px)（2026-10-23：依下項固定字級要求改為桌面 `18px`、手機 `14px`。）
- [x] 檢查全站所有按鈕，不需要粗體字（2026-10-23：原生按鈕、主要 CTA 與按鈕內文字統一為 `400`；回歸測試及瀏覽器 computed style 通過。）
- [x] font-size 有設定 clamp 屬性的 希望可以拿掉，改用電腦版一個尺寸，手機裝置一個尺寸，這樣比較好懂好修改-（2026-10-23：`web/app` 已無 `font-size` clamp 或等價 Tailwind arbitrary clamp 字級，桌面／手機固定值與 15 組瀏覽器量測通過。）
- [x] `primary-action` 按鈕樣式統一全站規格（2026-10-23：課程詳情與執行師預約入口改用 `.button-primary`；disabled、箭頭互動及 reduced-motion 已集中至共用 CSS。）
