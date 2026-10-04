import { defineField, defineType } from 'sanity'

export const homeBanner = defineType({
  name: 'homeBanner',
  title: '首頁 Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '大標題',
      type: 'text',
      rows: 3,
      description: '可按 Enter 換行，前台會保留換行位置。',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: '敘述',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buttonText',
      title: '按鈕文字',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buttonLink',
      title: '按鈕連結',
      type: 'url',
      description: '使用 https:// 或 http:// 網址、以 / 開頭的站內路徑，或 #courses 形式的頁面錨點。',
      validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'], allowRelative: true }).custom((value) => {
        if (!value) return true
        return /^(https?:\/\/|\/(?!\/)|#.)/i.test(value) && !/[\s\\\u0000-\u001f\u007f]/u.test(value)
          ? true
          : '請使用 HTTP(S) 網址、以 / 開頭的站內路徑或有效的 #錨點。'
      }),
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
