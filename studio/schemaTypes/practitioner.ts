import { defineField, defineType } from 'sanity'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const latinNamePattern = /^[\p{Script=Latin} .'-]+$/u

interface PractitionerPublicationValue {
  _id?: string
  isPublished?: boolean
}

export function validatePractitionerPublication(value: unknown): true | string {
  if (!value || typeof value !== 'object') return true
  const practitioner = value as PractitionerPublicationValue
  if (practitioner.isPublished !== true) return true
  const id = practitioner._id?.replace(/^drafts\./, '')
  return id?.includes('.') ? '公開前台文件的 ID 不得包含句點。' : true
}

export const practitioner = defineType({
  name: 'practitioner',
  title: '執行師',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '公開姓名',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(20),
    }),
    defineField({
      name: 'englishName',
      title: '英文名或公開稱呼',
      type: 'string',
      validation: Rule => Rule.min(2).max(40).custom(value => (
        !value || latinNamePattern.test(value)
          ? true
          : '英文名只接受拉丁字母、空格、句點、撇號與連字號。'
      )),
    }),
    defineField({
      name: 'slug',
      title: '網址識別碼',
      type: 'slug',
      options: { source: 'name', maxLength: 60 },
      validation: Rule => Rule.required().custom(value => {
        if (!value?.current) return true
        return slugPattern.test(value.current)
          ? true
          : '請使用小寫英數與連字號，且不要在開頭或結尾放連字號。'
      }),
    }),
    defineField({
      name: 'regions',
      title: '服務地區',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'sessionRegion' }] }],
      validation: Rule => Rule.required().min(1).max(5).unique(),
    }),
    defineField({
      name: 'methods',
      title: '服務方法',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'sessionMethod' }] }],
      validation: Rule => Rule.required().min(1).unique(),
    }),
    defineField({
      name: 'summary',
      title: '服務取向摘要',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.min(20).max(100),
    }),
    defineField({
      name: 'order',
      title: '名錄優先順序',
      type: 'number',
      initialValue: 1,
      description: '可與其他執行師相同；同值時前台再依姓名與文件 ID 排序。',
      validation: Rule => Rule.required().integer().min(1),
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
      title: 'name',
      englishName: 'englishName',
      published: 'isPublished',
    },
    prepare: ({ title, englishName, published }) => ({
      title,
      subtitle: [englishName, published ? '公開' : '隱藏'].filter(Boolean).join(' · '),
    }),
  },
  validation: Rule => Rule.custom(validatePractitionerPublication),
})
