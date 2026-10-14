# Session detail content-flow evidence

- 時間：2026-10-14 17:08–17:22（Asia/Taipei）
- 環境：Sanity project `hnypuj6l`、dataset `production`；本機 production Nuxt build
- 測試識別：`session-detail-validation-20261014-*`

Schema 已成功部署 1/1。隔離資料依序完成：只存草稿且匿名不可見、首次發布、建立更新草稿且公開版不變、再次發布、取消發布保留草稿、匿名查詢消失、精確清理。匿名 Data API 與正式 Nuxt API 驗證 3 種地點公開層級、5 種聯繫方式、選填人物照及預約按鈕；`cityOnly` 未洩漏場地或地址，`venue` 未洩漏地址。完整 dataset 驗證為 24 份有效文件、0 errors。

登入 Studio 實際開啟執行師文件，確認新增欄位名稱、說明與選填提示可見；另建立隔離缺漏草稿，確認必填與公開摘要 validation 存在且 Publish disabled。該草稿與全部測試 taxonomy／執行師文件皆已刪除，登入與匿名查詢最終均為 0。

實際發布畫面：

- [`published-desktop-1440.png`](published-desktop-1440.png)
- [`published-mobile-390.png`](published-mobile-390.png)

真實取消發布流程發現詳情頁雖顯示 not-found，SSR 原先仍回傳 200；已修正為等待內容請求後設定頁面 response，重建實測為 HTTP 404、not-found 與 `noindex`。
