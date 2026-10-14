import { defineArrayMember, defineField, defineType, type Path, type ValidationError } from 'sanity'
import { sessionBioMember, validateSessionBio } from './sessionDetail.ts'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const latinNamePattern = /^[\p{Script=Latin} .'-]+$/u

interface PractitionerPublicationValue {
  _id?: string
  isPublished?: boolean
  summary?: string
  bio?: unknown[]
  contactItems?: unknown[]
}

function fieldError(message: string, path: Path): ValidationError {
  return { message, path }
}

export function validatePractitionerPublication(value: unknown): true | string | ValidationError {
  if (!value || typeof value !== 'object') return true
  const practitioner = value as PractitionerPublicationValue
  if (practitioner.isPublished !== true) return true
  const id = practitioner._id?.replace(/^drafts\./, '')
  if (id?.includes('.')) return '公開前台文件的 ID 不得包含句點。'
  if (!practitioner.summary?.trim()) return fieldError('公開執行師前，請完成服務取向摘要。', ['summary'])
  if (!Array.isArray(practitioner.bio) || practitioner.bio.length < 1) return fieldError('公開執行師前，請至少填寫一段介紹。', ['bio'])
  if (!Array.isArray(practitioner.contactItems) || practitioner.contactItems.length < 1) return fieldError('公開執行師前，請至少填寫一種聯繫方式。', ['contactItems'])
  return true
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
      title: '服務項目',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'sessionMethod' }] }],
      validation: Rule => Rule.required().min(1).max(20).unique(),
    }),
    defineField({
      name: 'summary',
      title: '服務取向摘要',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.min(20).max(100),
    }),
    defineField({
      name: 'portrait',
      title: '個人照片',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: '替代文字', type: 'string', validation: Rule => Rule.required().min(2).max(100) }),
        defineField({
          name: 'displayMode',
          title: '圖片呈現方式',
          description: '小張圖片建議選擇限制寬度，避免放大失真；滿版圖片會裁切以填滿圖片區。',
          type: 'string',
          initialValue: 'contained',
          options: {
            layout: 'radio',
            list: [
              { title: '限制寬度（適合小圖）', value: 'contained' },
              { title: '滿版裁切', value: 'cover' },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'bio',
      title: '執行師介紹',
      type: 'array',
      of: [sessionBioMember],
      validation: Rule => Rule.min(1).max(6).custom(validateSessionBio),
    }),
    defineField({
      name: 'experienceItems',
      title: '經歷',
      type: 'array',
      of: [defineArrayMember({ type: 'string', validation: Rule => Rule.required().min(4).max(100) })],
      validation: Rule => Rule.max(12),
    }),
    defineField({
      name: 'serviceLocations',
      title: '服務地區',
      type: 'array',
      of: [defineArrayMember({ type: 'sessionServiceLocation' })],
      validation: Rule => Rule.max(6),
    }),
    defineField({ name: 'contactIntro', title: '聯繫方式說明', type: 'text', rows: 3, validation: Rule => Rule.max(240) }),
    defineField({
      name: 'contactItems',
      title: '聯繫方式',
      type: 'array',
      of: [defineArrayMember({ type: 'sessionContactItem' })],
      validation: Rule => Rule.min(1).max(6),
    }),
    defineField({
      name: 'bookingAction',
      title: '主要預約按鈕（選填）',
      description: '留空時前台不顯示「前往預約表單」按鈕。',
      type: 'sessionBookingAction',
    }),
    defineField({ name: 'seo', title: '搜尋引擎設定', type: 'sessionDetailSeo' }),
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
