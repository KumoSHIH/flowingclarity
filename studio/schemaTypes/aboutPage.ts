import { defineArrayMember, defineField, defineType } from 'sanity'
import { articleLinkIsSafe } from './articleDetail.ts'

export const aboutPageId = 'about-page'

const aboutPortableText = defineArrayMember({
  type: 'block',
  styles: [{ title: '一般段落', value: 'normal' }],
  lists: [],
  marks: {
    decorators: [
      { title: '粗體', value: 'strong' },
      { title: '斜體', value: 'em' },
    ],
    annotations: [{
      name: 'link',
      title: '連結',
      type: 'object',
      fields: [defineField({
        name: 'href',
        title: '網址',
        type: 'string',
        validation: Rule => Rule.required().custom(articleLinkIsSafe),
      })],
    }],
  },
})

function richTextField(name: string, title: string, max: number) {
  return defineField({
    name,
    title,
    type: 'array',
    of: [aboutPortableText],
    validation: Rule => Rule.required().min(1).max(max),
  })
}

function imageField(name: string, title: string, required = true) {
  const field = defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [defineField({
      name: 'alt',
      title: '替代文字',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(120),
    })],
    validation: required ? Rule => Rule.required() : undefined,
  })
  return field
}

export const aboutPage = defineType({
  name: 'aboutPage',
  title: '關於我們',
  type: 'document',
  groups: [
    { name: 'intro', title: '頁面首區', default: true },
    { name: 'story', title: '品牌理念' },
    { name: 'place', title: '空間與團隊' },
    { name: 'moments', title: '精選片段' },
    { name: 'contact', title: '聯絡引導' },
    { name: 'seo', title: 'SEO' },
  ],
  validation: Rule => Rule.custom((_value, context) => (
    context.document?._id?.replace(/^drafts\./, '') === aboutPageId
      ? true
      : '請使用「關於我們」單例入口。'
  )),
  fields: [
    defineField({ name: 'title', title: '頁面標題', type: 'string', group: 'intro', validation: Rule => Rule.required().min(2).max(20) }),
    defineField({ name: 'introduction', title: '頁面導言', type: 'text', rows: 4, group: 'intro', validation: Rule => Rule.min(30).max(160) }),
    { ...imageField('heroImage', '頁面首圖'), group: 'intro' },
    defineField({
      name: 'brandStory', title: '品牌理念', type: 'object', group: 'story', validation: Rule => Rule.required(),
      fields: [
        defineField({ name: 'heading', title: '標題', type: 'string', validation: Rule => Rule.required().min(2).max(20) }),
        richTextField('body', '內文', 5),
        imageField('image', '輔助圖片（選填）', false),
      ],
    }),
    defineField({
      name: 'placeAndTeam', title: '空間與團隊', type: 'object', group: 'place', validation: Rule => Rule.required(),
      fields: [
        defineField({ name: 'heading', title: '標題', type: 'string', validation: Rule => Rule.required().min(2).max(20) }),
        richTextField('body', '內文', 6),
        imageField('image', '空間或團隊圖片'),
      ],
    }),
    defineField({
      name: 'featuredMoments', title: '精選片段', type: 'object', group: 'moments', validation: Rule => Rule.required(),
      fields: [
        defineField({ name: 'heading', title: '標題', type: 'string', validation: Rule => Rule.required().min(2).max(20) }),
        richTextField('body', '共用敘述', 4),
        defineField({
          name: 'items', title: '片段圖片', type: 'array', validation: Rule => Rule.required().min(3).max(10),
          of: [defineArrayMember({
            type: 'object',
            name: 'aboutMoment',
            fields: [
              imageField('image', '圖片'),
              defineField({ name: 'caption', title: '圖說（選填）', type: 'string', validation: Rule => Rule.max(80) }),
            ],
            preview: { select: { title: 'caption', media: 'image' }, prepare: ({ title, media }) => ({ title: title ?? '精選片段', media }) },
          })],
        }),
      ],
    }),
    defineField({ name: 'contactHeading', title: '聯絡區標題', type: 'string', group: 'contact', validation: Rule => Rule.required().min(2).max(20) }),
    defineField({ name: 'contactIntroduction', title: '聯絡邀請文字', type: 'text', rows: 3, group: 'contact', validation: Rule => Rule.min(20).max(180) }),
    defineField({
      name: 'seo', title: 'SEO', type: 'object', group: 'seo', fields: [
        defineField({ name: 'title', title: '搜尋結果標題', type: 'string', validation: Rule => Rule.min(10).max(60) }),
        defineField({ name: 'description', title: '搜尋結果摘要', type: 'text', rows: 3, validation: Rule => Rule.min(30).max(160) }),
      ],
    }),
  ],
  preview: {
    select: { subtitle: 'title', media: 'heroImage' },
    prepare: ({ subtitle, media }) => ({ title: '關於我們', subtitle, media }),
  },
})
