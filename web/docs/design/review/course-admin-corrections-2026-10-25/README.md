# 課程後台影片與文字段落修正驗收

## 驗收範圍

- 影片封面留空且沒有 YouTube 網址時，前台仍顯示影片標題與「課程影片待上架」，不輸出空白媒體容器。
- 「文字段落」顯示編輯者設定的標題與正文，並保留正文換行。
- 桌機 1440×1400 與手機 390×844 均未出現水平溢位或文字裁切。

## 證據與限制

- 桌機：[無封面影片與文字段落](desktop-video-no-cover.png)
- 手機：[無封面影片與文字段落](mobile-text-and-video.png)

驗證使用本機 Nuxt 開發頁與 Chrome headless；驗證完成後已移除暫用路由。Safari、Firefox、真實 iOS／Android、Studio 遠端 schema 與 production 內容流程未執行。
