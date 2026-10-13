import { defineArrayMember, defineField, defineType } from 'sanity'

const multilineDescription = '可按 Enter 換行，前台會保留段落。'

export const eventDetailText = defineType({
  name: 'eventDetailText',
  title: '文字章節',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(2).max(100) }),
    defineField({
      name: 'paragraphs',
      title: '正文段落',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 6, description: multilineDescription, validation: Rule => Rule.required().min(8).max(1200) })],
      validation: Rule => Rule.required().min(1).max(8),
    }),
  ],
  preview: { select: { title: 'title', paragraphs: 'paragraphs' }, prepare: ({ title, paragraphs }) => ({ title: title ?? '未命名文字章節', subtitle: `${Array.isArray(paragraphs) ? paragraphs.length : 0} 個段落` }) },
})

export const eventDetailFacilitator = defineType({
  name: 'eventDetailFacilitator',
  title: '帶領者',
  type: 'object',
  fields: [
    defineField({ name: 'name', title: '姓名', type: 'string', validation: Rule => Rule.required().min(2).max(60) }),
    defineField({ name: 'role', title: '角色', type: 'string', validation: Rule => Rule.min(2).max(80) }),
    defineField({ name: 'biography', title: '簡介', type: 'text', rows: 7, description: multilineDescription, validation: Rule => Rule.required().min(20).max(1500) }),
  ],
  preview: { select: { title: 'name', subtitle: 'role' } },
})

export const eventDetailAgendaItem = defineType({
  name: 'eventDetailAgendaItem',
  title: '流程項目',
  type: 'object',
  fields: [
    defineField({ name: 'timeLabel', title: '時間標示', type: 'string', validation: Rule => Rule.required().min(2).max(40) }),
    defineField({ name: 'dateTime', title: '精確時間', type: 'datetime', description: '只在公開精確時間會幫助理解時填寫。' }),
    defineField({ name: 'title', title: '項目標題', type: 'string', validation: Rule => Rule.required().min(2).max(100) }),
    defineField({ name: 'description', title: '說明', type: 'text', rows: 4, description: multilineDescription, validation: Rule => Rule.max(500) }),
  ],
  preview: { select: { title: 'title', subtitle: 'timeLabel' } },
})

export const eventDetailAgenda = defineType({
  name: 'eventDetailAgenda',
  title: '活動流程',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(2).max(100) }),
    defineField({ name: 'description', title: '說明', type: 'text', rows: 4, description: multilineDescription, validation: Rule => Rule.required().min(8).max(300) }),
    defineField({ name: 'items', title: '流程項目', type: 'array', of: [defineArrayMember({ type: 'eventDetailAgendaItem' })], validation: Rule => Rule.required().min(2).max(12) }),
  ],
  preview: { select: { title: 'title', items: 'items' }, prepare: ({ title, items }) => ({ title: title ?? '未命名活動流程', subtitle: `${Array.isArray(items) ? items.length : 0} 個項目` }) },
})

export const sharedTestimonialItem = defineType({
  name: 'sharedTestimonialItem',
  title: '心得',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: '心得內容', type: 'text', rows: 8, description: multilineDescription, validation: Rule => Rule.required().min(20).max(2000) }),
    defineField({ name: 'sharerName', title: '分享者名稱', type: 'string', validation: Rule => Rule.required().min(2).max(60) }),
  ],
  preview: { select: { title: 'sharerName', subtitle: 'text' } },
})

export const sharedTestimonialBlock = defineType({
  name: 'sharedTestimonialBlock',
  title: '學員心得分享',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', initialValue: '學員心得分享', validation: Rule => Rule.required().min(2).max(80) }),
    defineField({ name: 'items', title: '心得', type: 'array', of: [defineArrayMember({ type: 'sharedTestimonialItem' })], validation: Rule => Rule.required().min(1).max(12) }),
  ],
  preview: { select: { title: 'title', items: 'items' }, prepare: ({ title, items }) => ({ title: title ?? '學員心得分享', subtitle: `${Array.isArray(items) ? items.length : 0} 則` }) },
})

export const eventDetailList = defineType({
  name: 'eventDetailList',
  title: '清單章節',
  type: 'object',
  fields: [
    defineField({ name: 'kind', title: '清單用途', type: 'string', options: { list: [{ title: '適合對象', value: 'audience' }, { title: '準備事項', value: 'preparation' }], layout: 'radio' }, validation: Rule => Rule.required() }),
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(2).max(80) }),
    defineField({ name: 'items', title: '項目', type: 'array', of: [defineArrayMember({ type: 'string', validation: Rule => Rule.required().max(180) })], validation: Rule => Rule.required().min(1).max(8) }),
  ],
  preview: { select: { title: 'title', kind: 'kind' }, prepare: ({ title, kind }) => ({ title: title ?? '未命名清單', subtitle: kind === 'audience' ? '適合對象' : '準備事項' }) },
})

export const eventDetailQuote = defineType({
  name: 'eventDetailQuote',
  title: '引言',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: '引言內容', type: 'text', rows: 5, description: multilineDescription, validation: Rule => Rule.required().min(8).max(500) }),
    defineField({ name: 'attribution', title: '出處', type: 'string', validation: Rule => Rule.min(2).max(120) }),
  ],
  preview: { select: { title: 'text', subtitle: 'attribution' } },
})

export const eventDetailMediaItem = defineType({
  name: 'eventDetailMediaItem',
  title: '圖片',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: '圖片',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: '替代文字', type: 'string', validation: Rule => Rule.required().min(2).max(120) })],
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'caption', title: '圖說', type: 'string', validation: Rule => Rule.max(160) }),
  ],
  preview: { select: { title: 'caption', media: 'image' } },
})

export const eventDetailMedia = defineType({
  name: 'eventDetailMedia',
  title: '圖片區塊',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '區塊標題', type: 'string', validation: Rule => Rule.max(80) }),
    defineField({ name: 'items', title: '圖片', type: 'array', of: [defineArrayMember({ type: 'eventDetailMediaItem' })], validation: Rule => Rule.required().min(1).max(2) }),
  ],
  preview: { select: { title: 'title', items: 'items', media: 'items.0.image' }, prepare: ({ title, items, media }) => ({ title: title ?? '圖片區塊', subtitle: `${Array.isArray(items) ? items.length : 0} 張`, media }) },
})

export function validateEventDetailBody(value: unknown): true | string {
  if (!Array.isArray(value)) return true
  const types = value.flatMap(item => item && typeof item === 'object' && '_type' in item
    ? [String((item as { _type?: unknown })._type)]
    : [])
  const facilitatorCount = types.filter(type => type === 'eventDetailFacilitator').length
  if (facilitatorCount < 1 || facilitatorCount > 6) return '內容編排必須包含 1–6 位帶領者。'
  if (types.filter(type => type === 'eventDetailAgenda').length !== 1) return '內容編排必須包含 1 個活動流程。'
  return true
}

export const eventDetailContent = defineType({
  name: 'eventDetailContent',
  title: '活動詳情',
  type: 'object',
  fields: [
    defineField({ name: 'intro', title: '活動緣起與核心內容', type: 'text', rows: 5, description: multilineDescription, validation: Rule => Rule.required().min(40).max(240) }),
    defineField({
      name: 'body',
      title: '內容編排',
      type: 'array',
      description: '可拖曳調整章節順序。',
      of: [
        defineArrayMember({ type: 'eventDetailText' }),
        defineArrayMember({ type: 'eventDetailFacilitator' }),
        defineArrayMember({ type: 'eventDetailAgenda' }),
        defineArrayMember({ type: 'sharedTestimonialBlock' }),
        defineArrayMember({ type: 'eventDetailList' }),
        defineArrayMember({ type: 'eventDetailQuote' }),
        defineArrayMember({ type: 'eventDetailMedia' }),
      ],
      validation: Rule => Rule.required().min(1).max(20).custom(validateEventDetailBody),
    }),
    defineField({ name: 'feeLabel', title: '費用標示', type: 'string', description: '未確認時留空，前台會省略費用。', validation: Rule => Rule.min(2).max(40) }),
    defineField({ name: 'registrationNote', title: '報名補充', type: 'text', rows: 4, description: multilineDescription, validation: Rule => Rule.max(240) }),
    defineField({ name: 'seoTitle', title: 'SEO 標題', type: 'string', validation: Rule => Rule.max(70) }),
    defineField({ name: 'seoDescription', title: 'SEO 描述', type: 'text', rows: 3, validation: Rule => Rule.max(160) }),
  ],
})

export const eventDetailSchemaTypes = [
  eventDetailText,
  eventDetailFacilitator,
  eventDetailAgendaItem,
  eventDetailAgenda,
  sharedTestimonialItem,
  sharedTestimonialBlock,
  eventDetailList,
  eventDetailQuote,
  eventDetailMediaItem,
  eventDetailMedia,
  eventDetailContent,
]
