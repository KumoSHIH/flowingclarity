import { defineArrayMember, defineField, defineType } from 'sanity'

const galleryLayoutOptions = [
  { title: '編輯拼貼', value: 'collage' },
  { title: '分階圖譜', value: 'stages' },
  { title: '交錯章節', value: 'weave' },
  { title: '單元圖冊', value: 'folio' },
  { title: '方法檔案', value: 'dossier' },
]

const requiredAltField = defineField({
  name: 'alt',
  title: '替代文字',
  type: 'string',
  description: '描述圖片傳達的資訊，不重複相鄰標題。',
  validation: Rule => Rule.required().min(2).max(120),
})

export const courseDetailIntroduction = defineType({
  name: 'courseDetailIntroduction',
  title: '課程介紹',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(4).max(100) }),
    defineField({ name: 'lead', title: '引言', type: 'text', rows: 4, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.required().min(10).max(300) }),
    defineField({
      name: 'paragraphs',
      title: '正文段落',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 6, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.required().min(8).max(1200) })],
      validation: Rule => Rule.required().min(1).max(8),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'lead' },
    prepare: ({ title, subtitle }) => ({ title: title ?? '未命名課程介紹', subtitle: `課程介紹 · ${subtitle ?? '尚未填寫引言'}` }),
  },
})

export const courseDetailText = defineType({
  name: 'courseDetailText',
  title: '文字段落',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(2).max(100) }),
    defineField({
      name: 'text',
      title: '正文',
      type: 'text',
      rows: 10,
      description: '可按 Enter 換行，前台會保留段落。',
      validation: Rule => Rule.required().min(8).max(2000),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'text' },
    prepare: ({ title, subtitle }) => ({ title: title ?? '未命名文字段落', subtitle: `文字段落 · ${subtitle ?? '尚未填寫正文'}` }),
  },
})

export const courseDetailGalleryItem = defineType({
  name: 'courseDetailGalleryItem',
  title: '學習片段',
  type: 'object',
  fields: [
    defineField({ name: 'group', title: '階段或分組', type: 'string', validation: Rule => Rule.max(40) }),
    defineField({ name: 'title', title: '標題（選填）', type: 'string', validation: Rule => Rule.min(2).max(80) }),
    defineField({ name: 'description', title: '說明（選填）', type: 'text', rows: 5, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.min(8).max(500) }),
    defineField({
      name: 'points',
      title: '重點條列',
      type: 'array',
      of: [defineArrayMember({ type: 'string', validation: Rule => Rule.required().max(160) })],
      validation: Rule => Rule.max(8),
    }),
    defineField({
      name: 'image',
      title: '圖片',
      type: 'image',
      options: { hotspot: true },
      fields: [requiredAltField],
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'group', media: 'image' },
  },
})

export const courseDetailGallery = defineType({
  name: 'courseDetailGallery',
  title: '圖文版型區塊',
  type: 'object',
  fields: [
    defineField({
      name: 'contentRole',
      title: '內容用途',
      type: 'string',
      description: '一般圖文會使用區塊標題；選擇課程架構時，會與摺疊課綱互斥並共用「課程架構」章節導覽。',
      initialValue: 'general',
      options: {
        list: [
          { title: '一般圖文', value: 'general' },
          { title: '課程架構', value: 'curriculum' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.custom(value => value === undefined || value === 'general' || value === 'curriculum'
        ? true
        : '請選擇一般圖文或課程架構。'),
    }),
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(4).max(100) }),
    defineField({ name: 'description', title: '說明（選填）', type: 'text', rows: 4, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.min(10).max(300) }),
    defineField({
      name: 'layout',
      title: '呈現版型',
      type: 'string',
      description: '決定這個區塊的閱讀節奏；需要混搭時，回到內容編排再新增另一個圖文版型區塊。',
      options: { list: galleryLayoutOptions, layout: 'radio' },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'note', title: '圖冊補充（選填）', type: 'string', validation: Rule => Rule.min(4).max(160) }),
    defineField({ name: 'statement', title: '段落引言（選填）', type: 'text', rows: 3, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.min(8).max(300) }),
    defineField({
      name: 'items',
      title: '圖文內容',
      type: 'array',
      of: [defineArrayMember({ type: 'courseDetailGalleryItem' })],
      validation: Rule => Rule.required().min(1).max(8),
    }),
  ],
  preview: {
    select: { title: 'title', layout: 'layout', contentRole: 'contentRole', media: 'items.0.image' },
    prepare: ({ title, layout, contentRole, media }) => ({
      title: title ?? '未命名圖文版型',
      subtitle: `${contentRole === 'curriculum' ? '課程架構' : '一般圖文'}｜${galleryLayoutOptions.find(option => option.value === layout)?.title ?? '尚未選擇版型'}`,
      media,
    }),
  },
})

export const courseDetailTeacher = defineType({
  name: 'courseDetailTeacher',
  title: '帶領者',
  type: 'object',
  fields: [
    defineField({ name: 'name', title: '姓名', type: 'string', validation: Rule => Rule.required().min(2).max(60) }),
    defineField({ name: 'englishName', title: '英文姓名', type: 'string', validation: Rule => Rule.min(2).max(80) }),
    defineField({ name: 'lead', title: '簡介', type: 'text', rows: 4, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.required().min(10).max(220) }),
    defineField({ name: 'biography', title: '完整介紹', type: 'text', rows: 8, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.required().min(20).max(1500) }),
    defineField({
      name: 'image',
      title: '正式肖像',
      type: 'image',
      options: { hotspot: true },
      fields: [requiredAltField],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'lead', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({ title: title ?? '未命名帶領者', subtitle: `帶領者 · ${subtitle ?? '尚未填寫簡介'}`, media }),
  },
})

export const courseDetailQuote = defineType({
  name: 'courseDetailQuote',
  title: '課程引言',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: '引言', type: 'text', rows: 4, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.required().min(8).max(300) }),
    defineField({ name: 'attribution', title: '出處', type: 'string', validation: Rule => Rule.required().min(2).max(120) }),
  ],
  preview: {
    select: { title: 'text', subtitle: 'attribution' },
    prepare: ({ title, subtitle }) => ({ title: title ?? '未填寫引言', subtitle: `課程引言 · ${subtitle ?? '尚未填寫出處'}` }),
  },
})

export const courseDetailCurriculumUnit = defineType({
  name: 'courseDetailCurriculumUnit',
  title: '課綱單元',
  type: 'object',
  fields: [
    defineField({ name: 'stage', title: '階段', type: 'string', validation: Rule => Rule.required().max(30) }),
    defineField({
      name: 'title',
      title: '單元標題',
      type: 'text',
      rows: 2,
      description: '可按 Enter 換行，前台會保留段落。',
      validation: Rule => Rule.required().min(2).max(100),
    }),
    defineField({ name: 'description', title: '單元內容', type: 'text', rows: 7, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.required().min(8).max(1200) }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'stage' },
  },
})

export const courseDetailCurriculum = defineType({
  name: 'courseDetailCurriculum',
  title: '課程架構（摺疊列表）',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(4).max(100) }),
    defineField({ name: 'description', title: '說明（選填）', type: 'text', rows: 4, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.min(8).max(300) }),
    defineField({
      name: 'units',
      title: '課綱單元',
      type: 'array',
      of: [defineArrayMember({ type: 'courseDetailCurriculumUnit' })],
      validation: Rule => Rule.required().min(1).max(12),
    }),
  ],
  preview: {
    select: { title: 'title', units: 'units' },
    prepare: ({ title, units }) => ({ title: title ?? '未命名課程架構', subtitle: `課程架構 · ${Array.isArray(units) ? units.length : 0} 個單元` }),
  },
})

export const courseDetailVideo = defineType({
  name: 'courseDetailVideo',
  title: '課程影片',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(4).max(120) }),
    defineField({
      name: 'statusLabel',
      title: '狀態文字（選填）',
      type: 'string',
      description: '留空時，有網址顯示「觀看課程影片」，沒有網址顯示「課程影片待上架」。',
      validation: Rule => Rule.min(2).max(40),
    }),
    defineField({
      name: 'url',
      title: 'YouTube 網址',
      type: 'url',
      validation: Rule => Rule.uri({ scheme: ['https'] }).custom((value) => {
        if (!value) return true
        try {
          const hostname = new URL(value).hostname.replace(/^www\./, '')
          return hostname === 'youtube.com' || hostname === 'youtu.be'
            ? true
            : '請使用 YouTube 或 youtu.be 的 HTTPS 網址。'
        } catch {
          return '請輸入有效的 HTTPS 網址。'
        }
      }),
    }),
    defineField({
      name: 'image',
      title: '影片封面（選填）',
      type: 'image',
      description: '沒有 YouTube 網址時可作為預告封面；留空時前台仍會顯示標題與狀態文字。',
      options: { hotspot: true },
      fields: [requiredAltField],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'statusLabel', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({ title: title ?? '未命名課程影片', subtitle: `課程影片 · ${subtitle ?? '尚未填寫狀態'}`, media }),
  },
})

export const courseDetailAudience = defineType({
  name: 'courseDetailAudience',
  title: '適合對象',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(4).max(80) }),
    defineField({ name: 'description', title: '說明（選填）', type: 'text', rows: 4, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.min(8).max(300) }),
    defineField({
      name: 'items',
      title: '對象條件',
      type: 'array',
      of: [defineArrayMember({ type: 'string', validation: Rule => Rule.required().max(180) })],
      validation: Rule => Rule.required().min(1).max(12),
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare: ({ title, items }) => ({ title: title ?? '未命名適合對象', subtitle: `適合對象 · ${Array.isArray(items) ? items.length : 0} 項` }),
  },
})

export const courseDetailCarouselItem = defineType({
  name: 'courseDetailCarouselItem',
  title: '輪播圖片',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: '圖片',
      type: 'image',
      options: { hotspot: true },
      fields: [requiredAltField],
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'caption', title: '圖說（選填）', type: 'string', validation: Rule => Rule.max(120) }),
  ],
  preview: { select: { title: 'caption', media: 'image' }, prepare: ({ title, media }) => ({ title: title ?? '輪播圖片', media }) },
})

export const courseDetailCarousel = defineType({
  name: 'courseDetailCarousel',
  title: '圖片輪播',
  type: 'object',
  description: '左側圖片輪播、右側固定文字；可在內容編排中重複新增。',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(4).max(100) }),
    defineField({ name: 'text', title: '固定文字', type: 'text', rows: 6, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.required().min(10).max(800) }),
    defineField({
      name: 'items',
      title: '輪播圖片',
      type: 'array',
      of: [defineArrayMember({ type: 'courseDetailCarouselItem' })],
      validation: Rule => Rule.required().min(1).max(10),
    }),
  ],
  preview: { select: { title: 'title', items: 'items', media: 'items.0.image' }, prepare: ({ title, items, media }) => ({ title: title ?? '未命名圖片輪播', subtitle: `${Array.isArray(items) ? items.length : 0} 張`, media }) },
})

export const courseDetailSchedule = defineType({
  name: 'courseDetailSchedule',
  title: '課程梯次區塊',
  type: 'object',
  description: '日期、地點與報名狀態由已公開的課程梯次自動帶入。',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(4).max(100) }),
    defineField({ name: 'description', title: '說明（選填）', type: 'text', rows: 4, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.min(8).max(300) }),
  ],
})

export const courseDetailRegistration = defineType({
  name: 'courseDetailRegistration',
  title: '報名區塊',
  type: 'object',
  description: '報名網址只會從狀態為「開放報名」的已公開梯次帶入。',
  fields: [
    defineField({ name: 'title', title: '標題', type: 'string', validation: Rule => Rule.required().min(4).max(100) }),
    defineField({ name: 'description', title: '說明（選填）', type: 'text', rows: 5, description: '可按 Enter 換行，前台會保留段落。', validation: Rule => Rule.min(8).max(400) }),
    defineField({ name: 'openActionLabel', title: '開放報名按鈕文字', type: 'string', initialValue: '前往報名', validation: Rule => Rule.required().min(2).max(30) }),
    defineField({ name: 'closedActionLabel', title: '未開放按鈕文字', type: 'string', initialValue: '報名資訊待確認', validation: Rule => Rule.required().min(2).max(40) }),
    defineField({
      name: 'image',
      title: '收尾圖片',
      type: 'image',
      options: { hotspot: true },
      fields: [requiredAltField],
    }),
  ],
})

const requiredBodyBlockTypes = [
  'courseDetailIntroduction',
  'courseDetailGallery',
]

export function validateCourseDetailBody(value: unknown): true | string {
  if (!Array.isArray(value)) return true
  const types = value
    .filter(item => item && typeof item === 'object' && '_type' in item)
    .map(item => (item as { _type?: string })._type)
  const missing = requiredBodyBlockTypes.filter(type => !types.includes(type))
  const curriculumCount = value.filter(item => item && typeof item === 'object' && (
    (item as { _type?: string })._type === 'courseDetailCurriculum'
    || ((item as { _type?: string, contentRole?: string })._type === 'courseDetailGallery'
      && (item as { contentRole?: string }).contentRole === 'curriculum')
  )).length
  if (curriculumCount > 1) return '課程架構只能選擇一種：圖文版型或摺疊列表。'
  if (missing.length === 0) return true
  const labels: Record<string, string> = {
    courseDetailIntroduction: '課程介紹',
    courseDetailGallery: '圖文版型區塊',
  }
  return `內容編排缺少：${missing.map(type => labels[type]).join('、')}。`
}

export const courseDetailContent = defineType({
  name: 'courseDetailContent',
  title: '課程詳情內容',
  type: 'object',
  fields: [
    defineField({ name: 'notice', title: '頁面公告', type: 'string', description: '僅在需要對所有訪客顯示重要狀態時填寫。', validation: Rule => Rule.min(4).max(180) }),
    defineField({ name: 'englishTitle', title: '英文名稱', type: 'string', validation: Rule => Rule.min(2).max(100) }),
    defineField({
      name: 'body',
      title: '內容編排',
      type: 'array',
      description: '拖曳即可調整前台順序。課程架構可用圖文版型或摺疊列表，兩者合計最多一個。學員分享請使用下方固定欄位。',
      of: [
        defineArrayMember({ type: 'courseDetailIntroduction' }),
        defineArrayMember({ type: 'courseDetailText' }),
        defineArrayMember({ type: 'courseDetailGallery' }),
        defineArrayMember({ type: 'courseDetailTeacher' }),
        defineArrayMember({ type: 'courseDetailQuote' }),
        defineArrayMember({ type: 'courseDetailCurriculum' }),
        defineArrayMember({ type: 'courseDetailVideo' }),
        defineArrayMember({ type: 'courseDetailAudience' }),
        defineArrayMember({ type: 'courseDetailCarousel' }),
      ],
      validation: Rule => Rule.required().min(2).max(20).custom(validateCourseDetailBody),
    }),
    defineField({ name: 'schedule', title: '課程梯次', type: 'courseDetailSchedule', validation: Rule => Rule.required() }),
    defineField({
      name: 'testimonials',
      title: '學員分享（選填）',
      type: 'sharedTestimonialBlock',
      description: '有內容時固定顯示在課程梯次後方，每門課最多一個。',
    }),
    defineField({
      name: 'highlights',
      title: '課程花絮（選填）',
      type: 'courseDetailCarousel',
      description: '有內容時固定顯示在學員分享後方，每門課最多一個。',
    }),
    defineField({ name: 'registration', title: '報名區塊', type: 'courseDetailRegistration', validation: Rule => Rule.required() }),
    defineField({
      name: 'relatedArticles',
      title: '延伸閱讀',
      type: 'array',
      description: '選填 0–8 篇文章；可拖曳調整順序。未發布或資料不完整的文章會由前台略過，區塊固定顯示在頁面最下方。',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'article' }], options: { disableNew: true } })],
      validation: Rule => Rule.max(8).unique(),
    }),
  ],
})

export const courseDetailSchemaTypes = [
  courseDetailIntroduction,
  courseDetailText,
  courseDetailGalleryItem,
  courseDetailGallery,
  courseDetailTeacher,
  courseDetailQuote,
  courseDetailCurriculumUnit,
  courseDetailCurriculum,
  courseDetailVideo,
  courseDetailAudience,
  courseDetailCarouselItem,
  courseDetailCarousel,
  courseDetailSchedule,
  courseDetailRegistration,
  courseDetailContent,
]
