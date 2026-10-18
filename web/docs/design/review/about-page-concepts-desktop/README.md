# About Page Concepts Desktop Review

## 範圍

本次先建立 `/about` 的三款桌面候選，使用者已選定 A「顯影室」。A 保留左文右圖與逐段顯影的構圖，依回饋將內容區深色表面改為暖紙／淺砂色，字級對齊既有詳情頁尺度，聯絡區新增營業時間；B、C 僅保留為比較紀錄。桌面修訂完成後已開始製作手機版。

## 驗證結果

- 使用 Chrome Headless 以 1440 × 900 實際渲染三案首屏；Logo、字體與四張本機圖片均載入，未見首屏水平溢位或裁切錯誤。
- A 修訂稿重新以 Chrome Headless 於 1440 × 900 渲染並人工檢視，首屏未見文字重疊、水平溢位或圖片裁切異常。稿件使用 `44–72px` 頁面標題、`38px` 章節標題、`17px` 引言及 `16px / 2.1` 正文，對應 `DESIGN.md` 既有內容字級；頁面內容區不再使用深色底，既有共用 Footer 維持樹皮棕。
- A 聯絡區已加入「營業時間」示意列；時段與預約制文字仍待內容負責人核准，不得視為正式資訊。
- A 第二輪修訂將 Banner 標題改為單行；第三輪將品牌理念改成標題在上、正文在下的置中單欄，第四輪依回饋移除中間分隔線。
- B 案改以 query 選案後重新擷取，排除 hash 定位造成的畫面偏移；最終三張首屏證據均從文件左上角開始。
- 執行一次 Impeccable detector；已修正主要正文／標籤對比、功能文字尺寸與黃色聯絡區的灰字問題。剩餘 cream palette、分割構圖 padding、局部展示字級及必要裁切屬既有品牌或本概念的刻意構圖，不提升為全站規則。
- 生成圖片皆為設計示意，不代表真實團隊、活動或場地；PNG 已嵌入生成 prompt，並保留同名 `.prompt.txt`。

## 證據

- `about-a-first-viewport.png`
- `about-a-selected-first-viewport.png`
- `about-a-selected-brand-story.png`
- `about-b-first-viewport.png`
- `about-c-first-viewport.png`

## 尚未驗證

尚未進行完整頁逐段截圖、Swiper 人工點擊／鍵盤操作、Google Maps 真實地址、正式營業時間、正式內容長度、照片授權與輔助技術驗收。手機版證據另記於相鄰的 `about-page-a-mobile/README.md`。
