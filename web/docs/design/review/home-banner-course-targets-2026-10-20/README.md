# 首頁 Banner 課程分類連結驗收

2026-10-20 以本機 Nuxt 搭配 production 公開課程資料，使用 Chrome CDP 驗證首頁 Atlas 到課程總覽的四個分類深連結。桌機視窗為 1440×1000，手機視窗為 390×844。

## 結果

- 四個分類均為語意 `<a>`，href 依序為 `/course#body`、`/course#heart`、`/course#life`、`/course#beauty`。
- 實際點擊桌機「撫慰心」後，路徑為 `/course`、hash 為 `#heart`，左欄同步標記 `aria-current="location"`。
- 桌機與手機皆無水平溢位；桌機最小連結區約 69.7px，手機四個連結皆至少 44×44px。
- 鍵盤焦點框為 2px solid；「撫慰心」hover 文字由 `rgb(57, 38, 24)` 變為白色。
- 1440px 下四個分類 target 頂端均為 107px，固定 Header 底部為 99px；hash 與左欄 `aria-current="location"` 一致。
- 390px 下 `#beauty` target 頂端為 93px，固定 Header 底部為 87px；定位內容未被遮住。
- 瀏覽器執行期間沒有未捕捉的 JavaScript exception。
- Web 39 檔／229 項測試、typecheck、production build 與 `git diff --check` 通過；Impeccable detector 為 0 個 anti-pattern。

## 截圖

- `home-banner-targets-desktop.png`：桌機 Atlas 四分類入口。
- `course-target-beauty-desktop.png`：桌機 `#beauty` 定位結果。
- `home-banner-targets-mobile.png`：手機 Atlas 四分類入口。
- `course-target-beauty-mobile.png`：手機 `#beauty` 定位結果。

本輪未執行 Safari、Firefox、實體觸控裝置或螢幕閱讀器人工驗收；不涉及 CMS schema、部署或遠端內容寫入。
