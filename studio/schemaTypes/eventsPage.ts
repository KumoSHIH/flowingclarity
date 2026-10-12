import { defineField, defineType } from 'sanity'

export const eventsPageId = 'events-page'

export const eventsPage = defineType({
  name: 'eventsPage',
  title: '活動總覽頁',
  type: 'document',
  validation: Rule => Rule.custom((_value, context) => (
    context.document?._id?.replace(/^drafts\./, '') === eventsPageId
      ? true
      : '請使用「活動總覽頁」單例入口。'
  )),
  fields: [
    defineField({
      name: 'pageTitle',
      title: '頁面標題',
      type: 'string',
      validation: Rule => Rule.required().min(4).max(20),
    }),
    defineField({
      name: 'intro',
      title: '頁面引導',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().min(20).max(100),
    }),
    defineField({
      name: 'upcomingHeading',
      title: '近期活動標題',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(12),
    }),
    defineField({
      name: 'pastHeading',
      title: '過去活動標題',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(12),
    }),
    defineField({
      name: 'pastIntro',
      title: '過去活動說明',
      type: 'text',
      rows: 2,
      validation: Rule => Rule.min(10).max(80),
    }),
    defineField({
      name: 'emptyMessage',
      title: '近期活動空狀態',
      type: 'text',
      rows: 2,
      description: '不要承諾尚未確認的活動日期。',
      validation: Rule => Rule.required().min(12).max(80),
    }),
  ],
  preview: {
    select: { subtitle: 'pageTitle' },
    prepare: ({ subtitle }) => ({ title: '活動總覽頁', subtitle }),
  },
})
