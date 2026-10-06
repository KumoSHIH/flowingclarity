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
  display:
    fontFamily: '"Noto Serif TC", "Songti TC", "PMingLiU", serif'
    fontSize: "clamp(50px, 5vw, 56px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.06em"
  body:
    fontFamily: '"BIZ UDPGothic", "Noto Sans TC", ui-sans-serif, system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 2
    letterSpacing: "0.05em"
  lead:
    fontFamily: '"BIZ UDPGothic", "Noto Sans TC", ui-sans-serif, system-ui, sans-serif'
    fontSize: "clamp(14px, 1.05vw, 17px)"
    fontWeight: 500
    lineHeight: 1.95
    letterSpacing: "0.06em"
  label:
    fontFamily: '"BIZ UDPGothic", "Noto Sans TC", ui-sans-serif, system-ui, sans-serif'
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.7
    letterSpacing: "0.18em"
components:
  button-primary:
    backgroundColor: "{colors.persimmon}"
    textColor: "{colors.warm-white}"
    typography: "{typography.lead}"
    rounded: "0"
    padding: "0 clamp(28px, 3vw, 48px)"
    height: "clamp(72px, 8.4vh, 92px)"
  button-primary-hover:
    backgroundColor: "#c94f34"
    textColor: "{colors.warm-white}"
---

# Design System: Flowing Clarity

## Overview

**Creative North Star: "身體感知地圖"**

介面像一張可探索的身心地圖：暖紙色與手工地形紋理提供溫度，深赭色欄位與精準細線建立秩序。整體安靜、真誠、有觸感；視覺張力來自大面積色塊、留白與排版節奏，而非裝飾堆疊。

**Key Characteristics:**

- 暖紙、藏紅花黃、深赭棕與柿橘構成高辨識度色域。
- 襯線標題配合東亞無襯線內文，字距偏寬、行距舒展。
- 矩形、細線、圓形座標點與地形圖像是主要形式語言。

## Colors

紙張白與淺砂色承載閱讀，深夜棕與光片棕建立沉浸場景，樹皮棕用於頁尾收束；藏紅花黃標示位置與狀態，柿橘只用於主要行動。色值以前置 frontmatter 為準。

**The Warm Contrast Rule.** 深色表面使用暖白文字；陶土色負責焦點與小型標示，不作大面積背景。

## Typography

標題使用具人文感的繁中襯線字體，內文、導覽與控制項使用清楚的東亞無襯線字體。展示標題只用於首屏；一般區塊標題約為 `clamp(34px, 4–4.8vw, 72px)`，正文保持寬鬆行距並控制在約 65–75 個半形字元內。

**The Quiet Rhythm Rule.** 中文標題不使用全大寫效果；以留白、換行與字距建立節奏，避免額外裝飾字型。

## Layout

頁面最大寬度為 `1920px`，主要內容左右留白使用 `clamp(28px, 6vw, 116px)`，區塊垂直間距以 `112–176px` 為主。桌面首頁首屏採 65%／35% 地圖與敘事雙欄，1024–1250px 改為 60%／40%；不大於 1023px 時改成單欄，固定導覽高度為 `87px`。內容圖片維持明確比例並允許自然裁切。

## Elevation & Depth

全站以平面色塊、圖像層次和半透明導覽建立深度，不使用卡片陰影。發光效果只屬於地圖座標與 Canvas 光點；固定導覽可使用白色半透明背景與柔和模糊。

**The Flat Surface Rule.** 一般內容容器保持平面；不要用陰影把每個區塊做成浮動卡片。

## Shapes

主要容器、圖片與按鈕採直角。圓形只用於座標 marker、狀態點等具有定位意義的元素；分隔以一像素暖灰細線完成。

## Components

### Buttons

大型主要按鈕為柿橘底、暖白字、直角矩形，最小高度為 `clamp(72px, 8.4vh, 92px)`；hover 加深為 `#c94f34`，鍵盤焦點使用 2px 陶土色外框與 6px offset。次要行動採底線文字連結，至少 48px 高。

### Cards / Containers

課程卡片不使用外框盒或陰影；圖片、標題與摘要依序排列，底部以暖灰細線收尾。桌面可錯落排列，但手機維持單欄閱讀順序。

### Navigation

導覽使用小字、粗字重與寬字距。桌面連結 hover 可輕微上移；手機以全螢幕半透明選單呈現，每個選項至少 72px 高。所有動態需尊重 `prefers-reduced-motion`。

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
