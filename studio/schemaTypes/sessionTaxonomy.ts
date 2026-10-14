import { defineField, defineType } from 'sanity'

const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function taxonomyFields(type: 'sessionRegion' | 'sessionMethod' | 'sessionCity') {
  return [
    defineField({
      name: 'key',
      title: '穩定識別碼',
      type: 'string',
      description: '發布後不要因改名而變更；只使用小寫英數與連字號。',
      validation: Rule => Rule.required().custom(async (value, context) => {
        if (!value) return true
        if (!keyPattern.test(value)) return '請使用小寫英數與連字號。'
        const documentId = context.document?._id?.replace(/^drafts\./, '')
        if (!documentId) return true
        const duplicateCount = await context.getClient({ apiVersion: '2026-03-01' }).fetch<number>(
          `count(*[
            _type == $type &&
            !(_id in [$documentId, "drafts." + $documentId]) &&
            key == $value
          ])`,
          { type, documentId, value },
        )
        return duplicateCount === 0 ? true : '同一類別的識別碼不得重複。'
      }),
    }),
    defineField({
      name: 'label',
      title: '公開名稱',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(24),
    }),
    defineField({
      name: 'order',
      title: '顯示順序',
      type: 'number',
      initialValue: 1,
      validation: Rule => Rule.required().integer().min(1).custom(async (value, context) => {
        if (!value) return true
        const documentId = context.document?._id?.replace(/^drafts\./, '')
        if (!documentId) return true
        const duplicateCount = await context.getClient({ apiVersion: '2026-03-01' }).fetch<number>(
          `count(*[
            _type == $type &&
            !(_id in [$documentId, "drafts." + $documentId]) &&
            order == $value
          ])`,
          { type, documentId, value },
        )
        return duplicateCount === 0 ? true : '同一類別的顯示順序不得重複。'
      }),
    }),
  ]
}

function publicDocumentIdIsSafe(value: unknown): true | string {
  if (!value || typeof value !== 'object' || !('_id' in value)) return true
  const id = String(value._id).replace(/^drafts\./, '')
  return id.includes('.') ? '公開前台文件的 ID 不得包含句點。' : true
}

export const sessionRegion = defineType({
  name: 'sessionRegion',
  title: '執行師服務地區',
  type: 'document',
  validation: Rule => Rule.custom(publicDocumentIdIsSafe),
  fields: taxonomyFields('sessionRegion'),
  preview: {
    select: { title: 'label', key: 'key', order: 'order' },
    prepare: ({ title, key, order }) => ({
      title,
      subtitle: [`順序 ${order ?? '—'}`, key].filter(Boolean).join(' · '),
    }),
  },
})

export const sessionMethod = defineType({
  name: 'sessionMethod',
  title: '執行師服務項目',
  type: 'document',
  validation: Rule => Rule.custom(publicDocumentIdIsSafe),
  fields: taxonomyFields('sessionMethod'),
  preview: {
    select: { title: 'label', key: 'key', order: 'order' },
    prepare: ({ title, key, order }) => ({
      title,
      subtitle: [`順序 ${order ?? '—'}`, key].filter(Boolean).join(' · '),
    }),
  },
})

export const sessionCity = defineType({
  name: 'sessionCity',
  title: '執行師服務城市',
  type: 'document',
  validation: Rule => Rule.custom(publicDocumentIdIsSafe),
  fields: taxonomyFields('sessionCity'),
  preview: {
    select: { title: 'label', key: 'key', order: 'order' },
    prepare: ({ title, key, order }) => ({
      title,
      subtitle: [`順序 ${order ?? '—'}`, key].filter(Boolean).join(' · '),
    }),
  },
})
