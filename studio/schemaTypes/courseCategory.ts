import { defineField, defineType } from 'sanity'

export const courseCategoryDefinitions = {
  body: { id: 'course-category-body', name: '愛身體', order: 1 },
  heart: { id: 'course-category-heart', name: '撫慰心', order: 2 },
  life: { id: 'course-category-life', name: '究生命', order: 3 },
  beauty: { id: 'course-category-beauty', name: '展現美', order: 4 },
} as const

type CourseCategoryKey = keyof typeof courseCategoryDefinitions

export function validateCourseCategoryIdentity(value: unknown): true | string {
  if (!value || typeof value !== 'object') return true
  const document = value as Record<string, unknown>
  const key = document.key as CourseCategoryKey
  const definition = courseCategoryDefinitions[key]
  if (!definition) return '分類識別碼必須是四個已確認分類之一。'
  if (document.name !== definition.name || document.order !== definition.order) {
    return `${key} 必須使用名稱「${definition.name}」與順序 ${definition.order}。`
  }
  return true
}

export const courseCategory = defineType({
  name: 'courseCategory',
  title: '課程分類',
  type: 'document',
  validation: Rule => Rule.custom(validateCourseCategoryIdentity),
  fields: [
    defineField({
      name: 'key',
      title: '固定識別碼',
      type: 'string',
      description: '作為課程關聯依據；建立後不可任意變更。',
      options: {
        list: Object.keys(courseCategoryDefinitions).map(key => ({ title: key, value: key })),
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: '分類名稱',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(8),
    }),
    defineField({
      name: 'order',
      title: '顯示順序',
      type: 'number',
      validation: Rule => Rule.required().integer().min(1).max(4),
    }),
    defineField({
      name: 'summary',
      title: '學習方向摘要',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().min(20).max(80),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'key' },
  },
})
