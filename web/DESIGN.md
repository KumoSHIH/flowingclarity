---
name: Flowing Clarity
description: 以溫暖紙感、地形線與沉靜排版，引導人辨認身心需求的課程網站。
colors:
  paper: "#f8f5ef"
  sand: "#e8dfd2"
  ink: "#38342e"
  muted: "#81776a"
  clay: "#a46b54"
  saffron: "#f8bf4c"
  oxblood: "#392618"
  night: "#241710"
  film: "#352319"
  bark: "#766254"
  warm-muted: "#d8c7b8"
  persimmon: "#df5b35"
  warm-white: "#f7f6f4"
typography:
  meta:
    fontFamily: '"BIZ UDPGothic", "Noto Sans TC", ui-sans-serif, system-ui, sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.06em"
  label:
    fontFamily: '"BIZ UDPGothic", "Noto Sans TC", ui-sans-serif, system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.7
    letterSpacing: "0.08em"
  body:
    fontFamily: '"BIZ UDPGothic", "Noto Sans TC", ui-sans-serif, system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 2.1
    letterSpacing: "0.025em"
  lead:
    fontFamily: '"BIZ UDPGothic", "Noto Sans TC", ui-sans-serif, system-ui, sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 2
    letterSpacing: "0.035em"
  titleSm:
    fontFamily: '"Noto Serif TC", "Songti TC", "PMingLiU", serif'
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0.03em"
  titleMd:
    fontFamily: '"Noto Serif TC", "Songti TC", "PMingLiU", serif'
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.02em"
  titleLg:
    fontFamily: '"Noto Serif TC", "Songti TC", "PMingLiU", serif'
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.04em"
  titleXl:
    fontFamily: '"Noto Serif TC", "Songti TC", "PMingLiU", serif'
    fontSize: "72px"
    fontWeight: 400
    lineHeight: 1.22
    letterSpacing: "0.025em"
components:
  button-primary:
    backgroundColor: "{colors.persimmon}"
    textColor: "{colors.warm-white}"
    typography: "{typography.lead}"
    rounded: "0"
    padding: "0 clamp(28px, 3vw, 48px)"
    height: "clamp(72px, 8.4vh, 92px)"
    maxWidth: "360px"
    fontSize: "18px"
    fontWeight: 400
  button-primary-small:
    extends: "{components.button-primary}"
    width: "170px"
    height: "56px"
    fontSize: "16px"
    mobileFontSize: "14px"
  button-primary-hover:
    backgroundColor: "#c94f34"
    textColor: "{colors.warm-white}"
  button-primary-disabled:
    backgroundColor: "#8a6153"
    textColor: "#dfd5ca"
  interactive-title-hover:
    textColor: "{colors.clay}"
---

# Design System: Flowing Clarity

## Overview

**Creative North Star: "身體感知地圖"**

介面像一張可探索的身心地圖：暖紙色與手工地形紋理提供溫度，深赭色欄位與精準細線建立秩序。整體安靜、真誠、有觸感；視覺張力來自大面積色塊、留白與排版節奏，而非裝飾堆疊。

**Key Characteristics:**

- 暖紙、樹皮棕、藏紅花黃、深赭棕與柿橘構成高辨識度主色域。
- 襯線標題配合東亞無襯線內文，字距偏寬、行距舒展。
- 矩形、細線、圓形座標點與地形圖像是主要形式語言。

## Colors

紙張白與淺砂色承載閱讀，深夜棕與光片棕建立沉浸場景。樹皮棕 `bark`（`#766254`）為主要品牌表面色之一，用於頁尾收束；元件引用 `var(--color-bark)`，不重複硬編色值。藏紅花黃標示位置與狀態，柿橘只用於主要行動。色值以前置 frontmatter 為準。

2026-10-07 Footer 手動樣式同步：樹皮棕底搭配 `paper` 暖白文字；小字互動採 35% `saffron` 與 65% `paper` 混色，保留黃色意象並改善對比。Footer 的偏軸構圖、2.4px 連結字距與光點週期屬元件規格，不提升為全站排版 token。

**The Warm Contrast Rule.** 深色表面使用暖白文字；陶土色負責焦點與小型標示，不作大面積背景。

## Typography

標題使用具人文感的繁中襯線字體，內文、導覽與控制項使用清楚的東亞無襯線字體。展示標題只用於首屏；文字字級採桌面與 `<= 1023px` 兩組固定值，不使用 `clamp()`，正文保持寬鬆行距並控制在約 65–75 個半形字元內。

全站字級以八個語意角色管理：`meta`、`label`、`body`、`lead`、`title-sm`、`title-md`、`title-lg`、`title-xl`。元件應引用 `--type-<role>-*` 或對應 `.type-<role>` class，不得因單一頁面另建相近尺寸。桌機角色依 frontmatter；`<= 1023px` 的 `lead` 為 `16px`、`title-sm` 為 `22px`、`title-md` 為 `26px`、`title-lg` 與 `title-xl` 皆為 `42px`。主要按鈕維持元件專屬的 `18px`／`14px`，不新增通用文字角色。

截至 2026-10-24 第四階段，全站頁面與共用 Header／Footer 的程式字體設定皆已遷移至上述角色；type detector 為 0。瀏覽器、實體裝置與螢幕閱讀器驗收屬獨立發布檢查，不因程式遷移完成而自動視為通過。

**The Quiet Rhythm Rule.** 中文標題不使用全大寫效果；以留白、換行與字距建立節奏，避免額外裝飾字型。

**The Detail Continuity Rule.** 活動、執行師與文章等內容詳情頁沿用固定閱讀字級：桌機 `h1` 為 `72px`、摘要 `17px / 2`、章節 `h2` 為 `38px / 1.4`、正文 `16px / 2.1`；`<= 1023px` 的 `h1` 為 `42px`、摘要與正文為 `16px`、內容章節 `h2` 為 `26px`，正文最寬約 `68ch`。活動與執行師詳情的 hero 共用桌機 `84px / 84px`、手機 `68px / 76px` 的上下內距；活動詳情桌機保留水平 `clamp(28px, 6vw, 116px)`，執行師詳情桌機 banner 不設左右 padding，兩頁手機皆使用全站 `--page-gutter-mobile: 20px`。主要內容共用桌機 `76px clamp(48px, 7vw, 104px)`、手機 `64px 20px`，不得再用內層置中容器改變內容左緣。課程桌機保留已核准的章節展示尺寸，不套用 38px，但手機同樣收斂為 26px。新內容詳情頁不得另創相近手機尺寸；頁面首區展示標題與引言式 blockquote 不視為內容章節 `h2`。

## Layout

全幅敘事頁面最大寬度可到 `1920px`，主要內容左右留白使用 `clamp(28px, 6vw, 116px)`，區塊垂直間距以 `112–176px` 為主。採左側目錄／篩選 rail 與右側主內容的總覽頁，桌機左欄固定 `400px` 並貼齊視窗左側，右側內容填滿剩餘欄寬且不設定最大寬度；不大於 `1023px` 回到單欄。詳情頁依上方 hero 的構圖決定內容起點，不以總覽頁規則限制最外層寬度。桌面首頁首屏仍採 65%／35% 地圖與敘事雙欄，1024–1250px 改為 60%／40%；固定導覽高度為 `87px`。內容圖片維持明確比例並允許自然裁切。

手機與單欄版面的頁面外側左右留白統一引用 `--page-gutter-mobile: 20px`。此 token 只控制頁面、section、hero、rail 與共用導覽／頁尾的外側 gutter；按鈕、卡片、清單列與控制項的內部 padding 依其元件規格維持。

內容詳情頁的桌機固定左側欄以底色、留白與內部分隔建立層級，不使用 `border-right`；不大於 `1023px` 回到單欄後，可保留區塊底線與項目內部分隔。此規則適用於所有採 fixed／sticky facts rail 的相似頁面。

**The Detail Rail Rule.** 相似詳情頁的 facts rail 必須共用 `/events/[slug]` 的節奏：桌機資料列為 `26px clamp(28px, 3.2vw, 50px)`，獨立主要操作區為 `34px clamp(28px, 3.2vw, 50px)`；`<= 1023px` 資料列為 `22px 20px`、獨立主要操作區為 `24px 20px`。聯繫資料須與上方服務項目、服務地區使用相同 padding；側欄資訊小標題統一為 14px、粗體與 `.08em` 字距，聯繫內容與按鈕文字皆為 14px，聯繫清單不使用 `border-top` 或 `border-bottom`。桌機側欄本身無右框線。閱讀內容的連續 `profile-section` 不以 `border-top` 或額外 `padding-top` 切段，只使用章節間距維持節奏。

**The Split Layout Rule.** 課程、活動、執行師總覽只共用 `--split-layout-rail-width: 400px`。桌機 grid 使用固定左欄與 `minmax(0, 1fr)` 主欄；外層保持全寬、左欄無外距，右側內容不設最大寬度並填滿剩餘欄寬。活動與執行師詳情的 hero 共用 `1500px` 置中外框，雙欄起點也以 `1500px` 置中基準對齊；活動詳情限制整個雙欄寬度，執行師詳情維持全寬，只加入同等左側 gutter，且雙欄銜接處不加上框線。不得把詳情頁規則套到總覽頁。

## Elevation & Depth

全站以平面色塊、圖像層次和半透明導覽建立深度，不使用卡片陰影。發光效果只屬於地圖座標與 Canvas 光點；固定導覽可使用白色半透明背景與柔和模糊。

**The Flat Surface Rule.** 一般內容容器保持平面；不要用陰影把每個區塊做成浮動卡片。

## Shapes

主要容器、圖片與按鈕採直角。圓形只用於座標 marker、狀態點等具有定位意義的元素；分隔以一像素暖灰細線完成。

## Components

### Buttons

大型主要按鈕統一使用 `.button-primary`：柿橘底、暖白字、直角矩形，文字為桌機 `18px / 400`、`<= 1023px` 為 `14px / 400`，最小高度為 `clamp(72px, 8.4vh, 92px)`；hover 加深為 `#c94f34`，鍵盤焦點使用 2px 陶土色外框與 6px offset。不可用狀態為 `#8a6153` 背景、`#dfd5ca` 文字及 `not-allowed` cursor。箭頭統一使用 `.button-primary__icon`，hover／focus 向右位移 4px，reduced motion 停用過渡。所有按鈕標籤使用一般字重，不以粗體建立層級；次要行動採底線文字連結，至少 48px 高。

大型主要按鈕寬度可依容器縮小，但不得超過 `360px`。可點擊內容標題在 hover 與 `focus-visible` 時統一改為 `clay`；可同時使用底線、影像縮放或箭頭位移補強回饋，但不得另用相近棕色建立同角色變體。

小型主要按鈕使用 `.button-primary.button-primary--small`，沿用大型按鈕的顏色、直角、箭頭、hover、focus、disabled 與 reduced-motion 行為，固定寬度 `170px`、最小高度 `56px`；文字桌機為 `16px`，`<= 1023px` 為 `14px`。小型按鈕用於內容清單內的詳情操作，不取代 hero 或詳情頁的主要轉換 CTA。

### Go Top Button

全站回頂按鈕是固定於右下角的直角座標控制：桌機為 56px、手機為 52px，深夜棕底搭配暖紙色線性箭頭，hover 轉為陶土色。位置使用 `clamp(20px, 3vw, 48px)` 並納入裝置 safe area；層級低於固定 Header。頁面捲動超過 480px 後才顯示，進出只使用短距離垂直位移與透明度；`prefers-reduced-motion` 下停用過渡並立即回頂。元件保持平面、直角、無陰影，不延伸成圓形浮動操作按鈕。

### Cards / Containers

課程卡片不使用外框盒或陰影；圖片、標題與摘要依序排列，底部以暖灰細線收尾。桌面可錯落排列，但手機維持單欄閱讀順序。

首頁近期課程沿用雙欄錯落卡片：桌機固定保留兩欄軌道，即使只有一筆也只占單欄，不橫向撐滿；手機改為單欄。圖片比例維持 `5:4`，下方依序為分類日期、`title-sm` 課名、摘要與靠左小型主要按鈕，每筆以暖灰細線收尾。

### Navigation

導覽使用小字、粗字重與寬字距。桌面連結 hover 可輕微上移；目前所在單元以 1px 下底線標示，總覽與詳情頁維持相同單元狀態。手機以全螢幕半透明選單呈現，每個選項至少 72px 高，並保留相同目前單元標示。所有動態需尊重 `prefers-reduced-motion`。

### Atlas Markers

地圖分類以圓形座標點搭配文字，選取、hover 與鍵盤焦點只增強暖白光暈。語意文字與操作元件必須由 HTML 呈現，不可烘焙進背景圖。

## Do's and Don'ts

### Do:

- **Do** 以大面積色塊、留白、紙張質感與清楚閱讀順序建立品牌感。
- **Do** 使用真實內容長度檢查換行、溢位及手機排列。
- **Do** 保持鍵盤焦點可見，並為裝飾動畫提供減少動態版本。

### Don't:

- **Don't** 使用通用療癒網站常見的柔焦人物照、漂浮漸層或大量膠囊卡片。
- **Don't** 在一般容器加入圓角與陰影，或把柿橘色擴張成大面積背景。
- **Don't** 把頁面專屬構圖、CMS 內容或示範文案誤當成全站設計 token。

## 2026-10-24 Typography 語意角色第二階段

- 首頁與課程、活動、執行師、文章總覽已統一引用八個正式文字角色；`DirectoryIntro` 同步成為總覽頁 `title-lg`／`lead` 的共用入口。
- 首頁舊 `display-title`／`lead-text` token 改為正式角色別名，不再維護第二套數值。課程卡 hover 不再改變字級，避免互動狀態產生未登錄的尺寸。
- 本階段 10 個元件的 type detector 為 0 項，全站 advisory 由 84 項降至 29 項；Web 43 檔／265 項測試、typecheck、production build 與 `git diff --check` 通過。瀏覽器視覺驗收因環境無可用瀏覽器而待補。
- 尚待遷移：課程詳情、About、Header 與 Footer；下一階段先處理課程詳情，再做全站殘餘掃描。

## 2026-10-24 Typography 語意角色第三階段

- 課程詳情已將 Hero、內容章節、引言、圖冊、帶領者、課綱、梯次、報名與狀態文字映射至八個正式角色；一般段落與清單同樣明確使用 `body` 的 size、weight、leading 與 tracking。
- CourseDetail 的 type detector 由 24 項降至 0 項，全站剩餘 5 項僅在 About、Header 與 Footer。課程相關 4 檔／32 項及 Web 全套 43 檔／266 項測試、typecheck 與 production build 通過。
- 瀏覽器視覺驗收因環境無可用瀏覽器而待補；最後階段應清理 About、Header、Footer，並統一驗證 1440、1023、390px、200% 文字放大與長文換行。

## 2026-10-24 Typography 語意角色第四階段

- About、Header 與 Footer 已完成最後遷移；全站殘餘掃描也收斂文章小標、執行師側欄、共用麵包屑／輪播及目錄篩選別名。`web/app` 元件不再使用數字 `font-size`、數字字級 shorthand 或舊詳情字級別名。
- 全站 type detector 由最初 160 項降至 0。新增全元件回歸測試，Web 全套 43 檔／268 項測試、typecheck 與 production build 通過。
- 程式端字體角色統一完成；環境無可用瀏覽器，仍須補做 1440、1023、390px、200% 文字放大、長文字換行與 Footer 操作區尺寸的人工驗收。
