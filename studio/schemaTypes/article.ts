import { defineField, defineType } from 'sanity'
import { articleDocumentIdIsSafe } from './articleTag.ts'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const article = defineType({
  name: 'article',
  title: '文章',
  type: 'document',
  validation: Rule => Rule.custom(articleDocumentIdIsSafe),
  fields: [
    defineField({ name: 'title', title: '文章標題', type: 'string', validation: Rule => Rule.required().min(4).max(50) }),
    defineField({ name: 'slug', title: '網址識別碼', type: 'slug', options: { source: 'title', maxLength: 80 }, validation: Rule => Rule.required().custom(value => !value?.current || slugPattern.test(value.current) ? true : '請使用小寫英數與連字號。') }),
    defineField({ name: 'category', title: '主要分類', type: 'reference', to: [{ type: 'courseCategory' }], options: { disableNew: true }, validation: Rule => Rule.required() }),
    defineField({ name: 'tags', title: '相關標籤', type: 'array', of: [{ type: 'reference', to: [{ type: 'articleTag' }] }], validation: Rule => Rule.required().min(1).max(8).unique() }),
    defineField({ name: 'excerpt', title: '文章摘要', type: 'text', rows: 5, validation: Rule => Rule.required().min(30).max(140) }),
    defineField({ name: 'publishedAt', title: '發布時間', type: 'datetime', validation: Rule => Rule.required().max(new Date().toISOString()) }),
    defineField({
      name: 'coverImage',
      title: '代表圖',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: '替代文字', type: 'string', validation: Rule => Rule.required().min(2).max(120) })],
    }),
  ],
  orderings: [{ title: '發布時間（新到舊）', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', category: 'category.name', media: 'coverImage', publishedAt: 'publishedAt' },
    prepare: ({ title, category, media, publishedAt }) => ({ title, subtitle: [category, publishedAt?.slice(0, 10)].filter(Boolean).join(' · '), media }),
  },
})
