# 全站文字與按鈕候選規格

## 狀態與範圍

狀態：已抽成共用 CSS，先由 Banner 使用；全站推廣仍為候選。2026-10-04 依 [HomeBanner.vue](../../web/app/components/HomeBanner.vue) 與 [main.css](../../web/app/assets/css/main.css) 整理；以下數值是目前實作基準，不代表全站已核准或已完成視覺驗收。

本文件管理文字角色與按鈕外觀；容器寬度、區塊排列及元素間距由各頁規格管理。[Banner 規格](home-banner.md) 是第一個引用案例。樣式角色不取代 HTML 語意，標題層級仍依內容結構選擇。

## 文字角色

候選字體沿用 `--font-sans`：`BIZ UDPGothic`、`Noto Sans TC`，再使用系統無襯線字體。下表以桌面大於 1180px、手機不大於 1023px 為目前參考；中間寬度的 Banner 特例見頁面規格。

| 候選角色 | 用途 | 桌面字級 | 手機字級 | 字重／行高／字距 |
| --- | --- | --- | --- | --- |
| 展示標題 | 首屏主要訊息 | `clamp(52px, 5vw, 60px)` | `42px` | `400`／`1.2`／`0.06em` |
| 引導敘述 | 展示標題下的短文 | `clamp(14px, 1.05vw, 17px)` | `14px` | `500`／`1.95`／`0.06em` |
| 行動文字 | 主要按鈕標籤 | `clamp(17px, 1.4vw, 22px)` | `16px` | 字重與行高沿用所在頁面／字距 `0.1em` |

目前深色 Banner 的標題為 `#f7f6f4`，敘述為 `#e9ded7`，背景為 `#392618`。這組配色限深色表面；淺色版本、一般內文及區塊標題的數值尚待定義，不直接沿用首屏字級。

## 主要按鈕

候選大型主要按鈕以現有 Banner CTA 為基準：

| 屬性 | 目前實作 |
| --- | --- |
| 外觀 | 背景 `#df5b35`、文字 `#fff7f1`，直角、無邊框 |
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
<a class="button-primary" href="/courses">
  <span>探索課程</span>
  <svg class="button-primary__icon" aria-hidden="true"><!-- 圖示 --></svg>
</a>
```

深色背景的敘述加上 `lead-text--inverse`；`.display-title` 與基本 `.lead-text` 繼承容器文字顏色。`.button-primary` 目前代表大型主要行動，也可用於 `<button type="button">`。共用 class 放在 `@layer components`，頁面可用 Tailwind utility 明確覆寫。

共用 token 分為 `--display-title-*`、`--lead-text-*`、`--text-tracking`、`--button-primary-*` 及 `--control-focus-*`，字體和主色沿用既有 `--font-sans`、`--color-persimmon` 與 `--color-clay`。手機數值在 `max-width: 1023px` 統一切換。修改全站數值時同步更新本文件。

共用 class 不設定外距、容器內距或區塊定位；這些由使用頁負責。CMS 標題的分行標記與 Banner 的 1024–1180px 字級特例仍留在 `HomeBanner.vue`。

### 本次抽取驗證

2026-10-04：前端 30 項測試、typecheck 與正式 build 通過。以原始 CSS 和抽取後 CSS 建立本機 Banner 文字區測試頁，在 Chrome 比對 390、1023、1024、1180、1440px 的字級、行高、顏色、內距及元素位置／尺寸，結果一致；減少動態模式確認為零秒過渡，並檢視手機與桌面截圖。此為樣式隔離驗證，未重新驗證整頁 CMS 流程或宣告全站可及性驗收完成。
