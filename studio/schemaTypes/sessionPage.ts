import { defineField, defineType } from 'sanity'

export const sessionPageId = 'session-page'

export function validateSessionPageTitle(value: unknown): true | string {
  if (typeof value !== 'string') return true
  if (/<[^>]*>/.test(value)) return '請輸入純文字，不要加入 HTML 標籤。'
  const lines = value.replace(/\r\n?/g, '\n').trim().split('\n')
  const visibleLength = lines.join('').length
  if (lines.length > 2) return '頁面標題最多只能有一個換行。'
  if (lines.some(line => !line.trim())) return '換行前後都必須有文字。'
  if (visibleLength < 4 || visibleLength > 20) return '頁面標題需為 4–20 個可見字元。'
  return true
}

export const sessionPage = defineType({
  name: 'sessionPage',
  title: '個案諮詢總覽頁',
  type: 'document',
  validation: Rule => Rule.custom((_value, context) => (
    context.document?._id?.replace(/^drafts\./, '') === sessionPageId
      ? true
      : '請使用「個案諮詢總覽頁」單例入口。'
  )),
  fields: [
    defineField({
      name: 'pageTitle',
      title: '頁面標題',
      type: 'text',
      rows: 2,
      description: '可按 Enter 換行一次；前台會依輸入呈現換行。',
      validation: Rule => Rule.required().custom(validateSessionPageTitle),
    }),
    defineField({
      name: 'intro',
      title: '頁面引導',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().min(20).max(100),
    }),
    defineField({
      name: 'resultsHeading',
      title: '名錄標題',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(20),
    }),
    defineField({
      name: 'emptyMessage',
      title: '沒有已發布執行師時的訊息',
      type: 'text',
      rows: 2,
      description: '不要承諾尚未確認的服務或上線時間。',
      validation: Rule => Rule.required().min(3).max(80),
    }),
    defineField({
      name: 'noMatchesMessage',
      title: '篩選無符合結果時的訊息',
      type: 'text',
      rows: 2,
      validation: Rule => Rule.required().min(3).max(80),
    }),
  ],
  preview: {
    select: { subtitle: 'pageTitle' },
    prepare: ({ subtitle }) => ({ title: '個案諮詢總覽頁', subtitle }),
  },
})
