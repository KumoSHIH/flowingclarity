import { defineArrayMember, defineField, defineType } from 'sanity'

export function articleLinkIsSafe(value: unknown): true | string {
  if (typeof value !== 'string' || !value.trim()) return '請輸入連結網址。'
  const href = value.trim()
  if (href.startsWith('/') && !href.startsWith('//')) return true
  try {
    const url = new URL(href)
    return url.protocol === 'https:' && Boolean(url.hostname)
      ? true
      : '只接受站內相對路徑或 HTTPS 網址。'
  }
  catch {
    return '只接受站內相對路徑或 HTTPS 網址。'
  }
}

const portableText = defineArrayMember({
  type: 'block',
  styles: [
    { title: '一般段落', value: 'normal' },
    { title: '二級標題', value: 'h2' },
    { title: '三級標題', value: 'h3' },
  ],
  lists: [
    { title: '項目清單', value: 'bullet' },
    { title: '編號清單', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: '粗體', value: 'strong' },
      { title: '斜體', value: 'em' },
    ],
    annotations: [
      {
        name: 'link',
        title: '連結',
        type: 'object',
        fields: [
          defineField({
            name: 'href',
            title: '網址',
            type: 'string',
            validation: Rule => Rule.required().custom(articleLinkIsSafe),
          }),
        ],
      },
    ],
  },
})

const richContentField = () => defineField({
  name: 'content',
  title: '正文',
  type: 'array',
  of: [portableText],
  validation: Rule => Rule.required().min(1).max(40),
})

export const articleContentImage = defineType({
  name: 'articleContentImage',
  title: '文章內容圖片',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: '替代文字',
      type: 'string',
      description: '描述圖片傳達的內容；純裝飾圖片請明確留空字串。',
      validation: Rule => Rule.custom(value => (
        value === '' || (typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 160)
          ? true
          : '請輸入 2–160 字替代文字；純裝飾圖片可留空。'
      )),
    }),
  ],
  validation: Rule => Rule.required(),
})

export const articleRichTextSection = defineType({
  name: 'articleRichTextSection',
  title: '文字章節',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: '章節標題', type: 'string', validation: Rule => Rule.min(4).max(60) }),
    richContentField(),
  ],
  preview: {
    select: { title: 'heading', content: 'content' },
    prepare: ({ title, content }) => ({ title: title ?? '文字章節', subtitle: `${Array.isArray(content) ? content.length : 0} 個內容區塊` }),
  },
})

export const articleSplitMediaSection = defineType({
  name: 'articleSplitMediaSection',
  title: '圖文章節',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: '章節標題', type: 'string', validation: Rule => Rule.min(4).max(60) }),
    defineField({ name: 'image', title: '圖片', type: 'articleContentImage', validation: Rule => Rule.required() }),
    defineField({
      name: 'mediaSide',
      title: '桌機圖片位置',
      type: 'string',
      options: { list: [{ title: '起始側（左）', value: 'start' }, { title: '結束側（右）', value: 'end' }], layout: 'radio' },
      validation: Rule => Rule.required(),
    }),
    richContentField(),
  ],
  preview: {
    select: { title: 'heading', side: 'mediaSide', media: 'image' },
    prepare: ({ title, side, media }) => ({ title: title ?? '圖文章節', subtitle: side === 'end' ? '圖片在結束側' : '圖片在起始側', media }),
  },
})

export const articleWideImageSection = defineType({
  name: 'articleWideImageSection',
  title: '滿寬圖片',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: '圖片', type: 'articleContentImage', validation: Rule => Rule.required() }),
    defineField({ name: 'caption', title: '圖說', type: 'string', validation: Rule => Rule.min(2).max(160) }),
  ],
  preview: { select: { title: 'caption', media: 'image' }, prepare: ({ title, media }) => ({ title: title ?? '滿寬圖片', media }) },
})

export const articleDetailSchemaTypes = [
  articleContentImage,
  articleRichTextSection,
  articleSplitMediaSection,
  articleWideImageSection,
]
