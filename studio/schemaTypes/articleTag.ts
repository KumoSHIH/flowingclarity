import { defineField, defineType } from 'sanity'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function articleDocumentIdIsSafe(value: unknown): true | string {
  if (!value || typeof value !== 'object' || !('_id' in value)) return true
  const id = String(value._id).replace(/^drafts\./, '')
  return id.includes('.') ? '公開前台文件的 ID 不得包含句點。' : true
}

export const articleTag = defineType({
  name: 'articleTag',
  title: '文章相關標籤',
  type: 'document',
  validation: Rule => Rule.custom(articleDocumentIdIsSafe),
  fields: [
    defineField({
      name: 'name',
      title: '標籤名稱',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(20).custom(async (value, context) => {
        if (!value) return true
        const id = context.document?._id?.replace(/^drafts\./, '')
        const count = await context.getClient({ apiVersion: '2026-03-01' }).fetch<number>(
          'count(*[_type == "articleTag" && !(_id in [$id, "drafts." + $id]) && name == $value])',
          { id, value },
        )
        return count === 0 ? true : '標籤名稱不得重複。'
      }),
    }),
    defineField({
      name: 'slug',
      title: '網址識別碼',
      type: 'slug',
      options: { source: 'name', maxLength: 60 },
      validation: Rule => Rule.required().custom(value => !value?.current || slugPattern.test(value.current) ? true : '請使用小寫英數與連字號。'),
    }),
    defineField({ name: 'order', title: '顯示順序', type: 'number', initialValue: 1, validation: Rule => Rule.required().integer().min(1) }),
    defineField({ name: 'description', title: '編輯說明', type: 'text', rows: 3, validation: Rule => Rule.min(10).max(100) }),
  ],
  preview: {
    select: { title: 'name', slug: 'slug.current', order: 'order' },
    prepare: ({ title, slug, order }) => ({ title, subtitle: [`順序 ${order ?? '—'}`, slug].filter(Boolean).join(' · ') }),
  },
})
