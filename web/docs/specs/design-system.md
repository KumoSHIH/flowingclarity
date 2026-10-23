# 全站文字與按鈕候選規格

## 狀態與範圍

狀態：已抽成共用 CSS，由 Banner 與近期活動報名入口使用；其他頁面仍依需求逐步採用。2026-10-20 依 [HomeBanner.vue](../../app/components/HomeBanner.vue)、[EventOverview.vue](../../app/components/EventOverview.vue) 與 [main.css](../../app/assets/css/main.css) 更新；以下數值是目前實作基準，不代表全站已完成實體裝置或螢幕閱讀器驗收。

本文件管理文字角色、按鈕外觀與跨頁 split layout 尺寸；其他容器寬度、區塊排列及元素間距仍由各頁規格管理。[Banner 規格](home-banner.md) 是第一個文字 token 引用案例。樣式角色不取代 HTML 語意，標題層級仍依內容結構選擇。

## 文字角色

候選字體沿用 `--font-sans`：`BIZ UDPGothic`、`Noto Sans TC`，再使用系統無襯線字體。下表以桌面大於 1023px、手機不大於 1023px 為目前參考。

| 候選角色 | 用途 | 桌面字級 | 手機字級 | 字重／行高／字距 |
| --- | --- | --- | --- | --- |
| 展示標題 | 首屏主要訊息 | `clamp(50px, 5vw, 56px)` | `42px` | `400`／`1.2`／`0.06em` |
| 引導敘述 | 展示標題下的短文 | `clamp(14px, 1.05vw, 17px)` | `14px` | `500`／`1.95`／`0.06em` |
| 行動文字 | 主要按鈕標籤 | `clamp(17px, 1.4vw, 22px)` | `16px` | 字重與行高沿用所在頁面／字距 `0.1em` |

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
| Hover | 背景 `#c94f34`，`220ms ease` 過渡 |
| 鍵盤焦點 | 共用按鈕自帶 `2px solid var(--color-clay)` 外框，偏移 `6px` |
| 減少動態 | 停用過渡 |

導向目的地使用 `<a href>`；執行操作使用 `<button>`。現有 CTA 是連結，沒有 disabled 或 loading 狀態。次要按鈕、一般尺寸、pressed、disabled 與 loading 尚未定義；有使用案例時再補齊。父容器決定按鈕寬度及外距，共用按鈕只管理自身外觀與內距。

## 套用與驗收

1. 先在使用頁規格指定文字角色、按鈕變體與適用表面，再確認候選數值。確認後在本文件記錄日期與採用範圍。
2. 共用數值及 class 已集中至 `web/app/assets/css/main.css`；其他頁面以加入 class 的方式逐步採用，不修改所有 `h1`、`p` 或 `a`。目前沒有另建 Vue 按鈕元件。
3. 套用時驗證桌面、手機、斷點及長文案：不得裁切、重疊或水平溢位；鍵盤焦點可見，連結及操作行為正確。
4. 目前配色與尺寸仍需完成對比、文字放大及實際頁面檢視；未驗證前不標記為全站已驗收規範。

## 共用 CSS 用法

```html
<h1 class="display-title">展示標題</h1>
<p class="lead-text">引導敘述</p>
<a class="button-primary" href="/course">
  <span>探索課程</span>
  <svg class="button-primary__icon" aria-hidden="true"><!-- 圖示 --></svg>
</a>
```

深色背景的敘述加上 `lead-text--inverse`；淺色 Banner 使用基本 `.lead-text` 並繼承容器文字顏色。`.button-primary` 目前代表大型主要行動，也可用於 `<button type="button">`。共用 class 放在 `@layer components`，頁面可用 Tailwind utility 明確覆寫。

共用 token 分為 `--display-title-*`、`--lead-text-*`、`--text-tracking`、`--button-primary-*`、`--interactive-title-hover` 及 `--control-focus-*`，字體和主色沿用既有 `--font-sans`、`--color-persimmon` 與 `--color-clay`。手機數值在 `max-width: 1023px` 統一切換。修改全站數值時同步更新本文件。

## 互動標題顏色

可點擊內容標題在 hover 與 `focus-visible` 時統一使用 `var(--interactive-title-hover)`，目前值為 `var(--color-clay)`。此 token 已套用於活動列表標題與文章延伸閱讀標題；其他非標題文字、深色表面品牌字樣及功能導覽不受此規則限制。元件可保留底線、圖片縮放或箭頭位移等第二種回饋，避免只靠顏色表達互動狀態。

共用 class 不設定外距、容器內距或區塊定位；這些由使用頁負責。CMS 標題的分行標記仍留在 `HomeBanner.vue`，目前沒有中間斷點的標題字級特例。

## 詳情頁間距

活動與執行師詳情共用 `--detail-hero-max-width: 1500px`、`--detail-layout-max-width: 1500px`、hero 上下間距與主要內容間距。桌機 hero 為 `1500px` 置中容器，上下內距為 `84px`；活動詳情保留水平 `clamp(28px, 6vw, 116px)`，執行師詳情 banner 的水平 padding 為 `0`。主要內容為 `76px clamp(48px, 7vw, 104px)`。`<= 1023px` 的 hero 上下內距改為 `68px / 76px`，兩頁水平內距皆為 `24px`；主要內容改為 `64px 24px`。執行師詳情的雙欄外層保持全寬，只以 `calc((100% - 1500px) / 2)` 左側 gutter 對齊活動詳情，且不使用 `border-top`；內容可用 `68ch` 控制正文及清單閱讀寬度。

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

下一步：完成下列原始清單的瀏覽器驗收後，再逐項標記完成。後續若新增可點擊內容標題或主要按鈕，應直接引用上述共用 class／token，不另建近似色值。

## 待修正項目

2026-10-20 從 Git 原始版本復原清單，保留原文與順序，僅正規化 checkbox 格式。上述實作與自動驗證紀錄保留；目前尚待瀏覽器驗收，因此維持未勾選。

- [x] button-primary 限制最大寬度為360px
- [x] 深色按鈕需使用公用元件，例如：event-row__action > a ，樣式應該是 button-primary
- [ ] 檢查所有 hover效果，會讓標題變色的，顏色要統一
- [] --button-primary-size: clamp(14px, 1.4vw, 18px)