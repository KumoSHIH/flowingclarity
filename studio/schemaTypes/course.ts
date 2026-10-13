import { defineField, defineType, type Path, type ValidationError } from 'sanity'

const courseSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

interface CoursePublicationValue {
  _id?: string
  isPublished?: boolean
  detail?: unknown
  image?: { asset?: { _ref?: string } }
}

function fieldError(message: string, path: Path): ValidationError {
  return { message, path }
}

export function validateCourseDetailPublication(value: unknown): true | string | ValidationError {
  if (!value || typeof value !== 'object') return true
  const course = value as CoursePublicationValue
  if (course.isPublished !== true) return true
  const documentId = course._id?.replace(/^drafts\./, '')
  if (documentId?.includes('.')) return '公開前台文件的 ID 不得包含句點。'
  if (!course.image?.asset?._ref) return fieldError('公開課程前，請設定「代表圖」。', ['image'])
  if (!course.detail) return fieldError('公開課程前，請完成「課程詳情」。', ['detail'])
  return true
}

export const course = defineType({
  name: 'course',
  title: '課程',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '課程名稱',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(40),
    }),
    defineField({
      name: 'slug',
      title: '網址識別碼',
      type: 'slug',
      description: '只輸入小寫英數與連字號；前端會由此產生課程詳情網址。',
      options: { source: 'title', maxLength: 60 },
      validation: Rule => Rule.required().custom(value => {
        if (!value?.current) return true
        return courseSlugPattern.test(value.current)
          ? true
          : '請使用小寫英數與連字號，且不要在開頭或結尾放連字號。'
      }),
    }),
    defineField({
      name: 'category',
      title: '課程分類',
      type: 'reference',
      to: [{ type: 'courseCategory' }],
      options: { disableNew: true },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'deliveryModes',
      title: '授課形式',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '實體', value: 'inPerson' },
          { title: '線上', value: 'online' },
        ],
      },
      validation: Rule => Rule.required().min(1).max(2).unique().custom(value => {
        if (!value) return true
        return value.every(mode => mode === 'inPerson' || mode === 'online')
          ? true
          : '授課形式只能是實體或線上。'
      }),
    }),
    defineField({
      name: 'summary',
      title: '課程摘要',
      type: 'text',
      rows: 5,
      validation: Rule => Rule.required().min(30).max(100),
    }),
    defineField({
      name: 'image',
      title: '代表圖',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: '替代文字',
          type: 'string',
          description: '簡短描述圖片傳達的資訊，不重複課程名稱。',
          validation: Rule => Rule.required().min(2).max(120),
        }),
      ],
    }),
    defineField({
      name: 'detail',
      title: '課程詳情',
      type: 'courseDetailContent',
    }),
    defineField({
      name: 'order',
      title: '分類內順序',
      type: 'number',
      validation: Rule => Rule.required().integer().min(1).custom(async (value, context) => {
        if (!value) return true
        const category = context.document?.category as { _ref?: string } | undefined
        const documentId = context.document?._id?.replace(/^drafts\./, '')
        if (!category?._ref || !documentId) return true
        const duplicateCount = await context.getClient({ apiVersion: '2026-03-01' }).fetch<number>(
          `count(*[
            _type == "course" &&
            !(_id in [$documentId, "drafts." + $documentId]) &&
            category._ref == $categoryId &&
            order == $order
          ])`,
          { documentId, categoryId: category._ref, order: value },
        )
        return duplicateCount === 0 ? true : '同一分類內的課程順序不得重複。'
      }),
    }),
    defineField({
      name: 'isPublished',
      title: '顯示於公開網站',
      type: 'boolean',
      initialValue: false,
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.name',
      media: 'image',
      published: 'isPublished',
    },
    prepare: ({ title, category, media, published }) => ({
      title,
      subtitle: `${category ?? '未設定分類'} · ${published ? '公開' : '隱藏'}`,
      media,
    }),
  },
  validation: Rule => Rule.custom(validateCourseDetailPublication),
})
