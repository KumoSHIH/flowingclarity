import { defineArrayMember, defineField, defineType } from 'sanity'

export const homePageId = 'home-page'

function textField(name: string, title: string, rows = 3) {
  return defineField({
    name,
    title,
    type: 'text',
    rows,
    validation: Rule => Rule.required().min(10).max(180),
  })
}

export const homePage = defineType({
  name: 'homePage',
  title: '首頁內容',
  type: 'document',
  groups: [
    { name: 'introduction', title: '品牌介紹', default: true },
    { name: 'events', title: '近期活動' },
    { name: 'courses', title: '近期課程' },
    { name: 'contact', title: '聯絡我們' },
  ],
  validation: Rule => Rule.custom((_value, context) => (
    context.document?._id?.replace(/^drafts\./, '') === homePageId
      ? true
      : '請使用「首頁內容」單例入口。'
  )),
  fields: [
    defineField({ name: 'introductionLabel', title: '段落標籤', type: 'string', group: 'introduction', validation: Rule => Rule.required().min(2).max(20) }),
    defineField({ name: 'introductionHeading', title: '品牌介紹標題', type: 'string', group: 'introduction', validation: Rule => Rule.required().min(2).max(60) }),
    defineField({
      name: 'introductionParagraphs',
      title: '品牌介紹段落',
      type: 'array',
      group: 'introduction',
      of: [defineArrayMember({ type: 'text', rows: 4, validation: Rule => Rule.required().min(20).max(240) })],
      validation: Rule => Rule.required().min(1).max(3),
    }),
    defineField({
      name: 'introductionImage',
      title: '品牌介紹圖片',
      type: 'image',
      group: 'introduction',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: '替代文字', type: 'string', validation: Rule => Rule.required().min(2).max(120) })],
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'introductionCaption', title: '圖片短句（選填）', type: 'string', group: 'introduction', validation: Rule => Rule.max(50) }),
    defineField({ name: 'eventsHeading', title: '活動區標題', type: 'string', group: 'events', validation: Rule => Rule.required().min(2).max(20) }),
    { ...textField('eventsIntroduction', '活動區介紹'), group: 'events' },
    { ...textField('eventsEmptyMessage', '沒有近期活動時的說明', 2), group: 'events' },
    defineField({ name: 'coursesHeading', title: '課程區標題', type: 'string', group: 'courses', validation: Rule => Rule.required().min(2).max(20) }),
    { ...textField('coursesIntroduction', '課程區介紹'), group: 'courses' },
    { ...textField('coursesEmptyMessage', '沒有近期課程時的說明', 2), group: 'courses' },
    defineField({ name: 'contactHeading', title: '聯絡區標題', type: 'string', group: 'contact', validation: Rule => Rule.required().min(2).max(40) }),
    { ...textField('contactIntroduction', '聯絡邀請文字'), group: 'contact' },
    defineField({ name: 'contactButtonLabel', title: '聯絡按鈕文字', type: 'string', group: 'contact', validation: Rule => Rule.required().min(2).max(20) }),
  ],
  preview: {
    select: { subtitle: 'introductionHeading', media: 'introductionImage' },
    prepare: ({ subtitle, media }) => ({ title: '首頁內容', subtitle, media }),
  },
})
