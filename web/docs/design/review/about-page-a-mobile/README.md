# About A Mobile Review

## 範圍

將已選定的 A「顯影室」由桌面延伸至手機與平板。390px 採單欄閱讀，Header 使用 44px 選單按鈕；Banner 先呈現標題與導言，再接直式照片。品牌理念維持上下置中且不使用分隔線，空間／團隊改為先文後圖，精選片段依標題、圖片／圖說、控制、正文排列，聯絡資訊與地圖上下堆疊。

## 驗證結果

- 使用 Chrome Headless 以 390 × 844 與 768 × 1024 實際渲染；檢查 Header、首屏、單欄換行與圖片裁切，未見水平溢位或文字重疊。
- 章節標題在 `<= 1023px` 使用既有 `26px` 規則，正文維持 `16px / 2.1`；互動按鈕至少 44 × 44px。
- 390px 精選片段與聯絡區另行擷取，確認 carousel 控制、營業時間與地圖仍可找到。

## 證據

- `about-a-mobile-390-hero.png`
- `about-a-mobile-390-moments.png`
- `about-a-mobile-390-contact.png`
- `about-a-tablet-768-hero.png`

## 尚未驗證

尚未在真實 iPhone／Android／平板測試，也未執行 Safari／Firefox、橫向模式、200% 縮放、完整鍵盤／輔助技術或慢速網路驗收。Google Maps、營業時間、照片與文案仍是設計示意；手機方向需經使用者確認後才可標記 `design-approved`。
