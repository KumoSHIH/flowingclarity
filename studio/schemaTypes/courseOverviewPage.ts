import { defineField, defineType } from 'sanity'

export const courseOverviewPage = defineType({
  name: 'courseOverviewPage',
  title: '課程總覽頁',
  type: 'document',
  fields: [
    defineField({
      name: 'pageTitle',
      title: '頁面標題',
      type: 'string',
      validation: Rule => Rule.required().min(4).max(20),
    }),
    defineField({
      name: 'directoryPrompt',
      title: '分類引導短句',
      type: 'string',
      validation: Rule => Rule.required().min(4).max(24),
    }),
    defineField({
      name: 'endingMessage',
      title: '收束文案',
      type: 'string',
      validation: Rule => Rule.min(8).max(40),
    }),
  ],
  preview: {
    select: { title: 'pageTitle' },
  },
})
