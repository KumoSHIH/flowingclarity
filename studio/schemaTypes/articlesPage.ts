import { defineField, defineType } from 'sanity'

export const articlesPageId = 'articles-page'

export const articlesPage = defineType({
  name: 'articlesPage',
  title: '文章分享總覽頁',
  type: 'document',
  validation: Rule => Rule.custom((_value, context) => (
    context.document?._id?.replace(/^drafts\./, '') === articlesPageId
      ? true
      : '請使用「文章分享總覽頁」單例入口。'
  )),
  fields: [
    defineField({ name: 'pageTitle', title: '頁面標題', type: 'string', validation: Rule => Rule.required().min(4).max(20) }),
    defineField({ name: 'intro', title: '頁面導讀', type: 'text', rows: 4, validation: Rule => Rule.required().min(20).max(120) }),
    defineField({ name: 'allLabel', title: '全部文章標籤', type: 'string', initialValue: '全部文章', validation: Rule => Rule.required().min(2).max(8) }),
    defineField({ name: 'tagFilterLabel', title: '相關標籤區標題', type: 'string', initialValue: '相關標籤', validation: Rule => Rule.required().min(2).max(12) }),
    defineField({ name: 'resultsHeading', title: '結果區標題', type: 'string', initialValue: '最新文章', validation: Rule => Rule.required().min(2).max(20) }),
    defineField({ name: 'emptyMessage', title: '沒有已發布文章時的訊息', type: 'text', rows: 2, validation: Rule => Rule.required().min(4).max(80) }),
    defineField({ name: 'noMatchesMessage', title: '篩選無符合結果時的訊息', type: 'text', rows: 2, validation: Rule => Rule.required().min(4).max(80) }),
  ],
  preview: {
    select: { subtitle: 'pageTitle' },
    prepare: ({ subtitle }) => ({ title: '文章分享總覽頁', subtitle }),
  },
})
