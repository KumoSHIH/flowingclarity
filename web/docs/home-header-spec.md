# 首頁 Header 規格

## 目的與範圍

`home-sticky-header` 是首頁共用導覽，固定於視窗頂端，提供品牌入口與「近期課程、課程探索、文章分享、個案諮詢」四項錨點導覽。本規格涵蓋桌面、平板與手機版；實作位於 `app/pages/index.vue`，共用樣式位於 `app/assets/css/main.css`。

## 響應式規則

| 視窗寬度 | Header 行為 | 導覽呈現 |
| --- | --- | --- |
| `>= 1024px` | Banner 可見時隱藏；Banner 完全離開畫面後由上方滑入 | 品牌與四項導覽水平排列 |
| `<= 1023px` | 進入首頁即固定顯示 | 品牌搭配 44 × 44px 漢堡按鈕；Banner 內 Logo 與 `hero-menu` 隱藏 |

Header 寬度上限為 `1920px`、最小高度為 `76px`、`z-index` 為 `50`。水平內距使用 `clamp(24px, 4vw, 72px)`。

## 視覺樣式

- 文字使用 `--color-oxblood`。
- 背景為 `72%` 半透明白色，套用 `blur(20px) saturate(125%)`；Safari 使用對應的 `-webkit-backdrop-filter`。
- 底線為 `68%` 半透明白色，維持霧面層與內容的分界。
- 品牌中文字級 `18px`、字重 `700`；英文副標字級 `8px`。平板以下隱藏英文副標。

## 漢堡選單互動

平板以下點擊漢堡按鈕後，圖示由三條線轉為關閉符號，並在 Header 下方展開高度為 `calc(100dvh - 76px)` 的全寬選單。選單背景為 `92%` 半透明白色，使用 `blur(24px) saturate(120%)`；每個選項最小高度為 `72px`。

選單開啟時，`html` 加入 `home-menu-open`，鎖定頁面捲動並隱藏 scrollbar。下列情況必須關閉選單：點擊任一導覽項目、點擊品牌、按下 `Escape`、或視窗切換至 `1024px` 以上。

## 無障礙與動態

- 漢堡按鈕使用 `aria-controls="home-primary-nav"`，並依狀態更新 `aria-expanded` 與「開啟／關閉主要選單」名稱。
- 收合時導覽設為 `inert`，避免鍵盤焦點進入不可見內容。
- 所有互動元件沿用全站 `:focus-visible` 樣式。
- `prefers-reduced-motion: reduce` 時停用 Header、選單與圖示轉場。

## 驗收條件

1. `1023px` 以下僅顯示品牌與漢堡按鈕，選單預設收合。
2. 展開後四個導覽項目皆可見、可用鍵盤操作，背景頁面不可捲動。
3. 收合後恢復頁面捲動，且不可聚焦隱藏項目。
4. `1024px` 以上不顯示漢堡按鈕，並依 Banner 交集狀態控制 Header。
5. 執行 `npm run test -w web -- tests/pages/index.test.ts` 與 `npm run typecheck -w web` 均應通過。
