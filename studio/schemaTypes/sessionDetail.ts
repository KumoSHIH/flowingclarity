import { defineArrayMember, defineField, defineType, type Path, type ValidationError } from 'sanity'

function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  }
  catch {
    return false
  }
}

function fieldError(message: string, path: Path): ValidationError {
  return { message, path }
}

export function validateSessionServiceLocation(value: unknown): true | ValidationError {
  if (!value || typeof value !== 'object') return true
  const location = value as { publicDetail?: string, venueName?: string, address?: string }
  if ((location.publicDetail === 'venue' || location.publicDetail === 'fullAddress') && !location.venueName?.trim()) {
    return fieldError('公開場地名稱時，請填寫場地名稱。', ['venueName'])
  }
  if (location.publicDetail === 'fullAddress' && !location.address?.trim()) {
    return fieldError('公開完整地址時，請填寫地址。', ['address'])
  }
  return true
}

export const sessionServiceLocation = defineType({
  name: 'sessionServiceLocation',
  title: '服務地區',
  type: 'object',
  fields: [
    defineField({
      name: 'cities',
      title: '服務城市（可多選）',
      type: 'array',
      description: '可選擇一個或多個城市；找不到時請先至「執行師服務城市」新增。',
      of: [{ type: 'reference', to: [{ type: 'sessionCity' }], options: { disableNew: true } }],
      validation: Rule => Rule.required().min(1).max(6).unique(),
    }),
    defineField({ name: 'venueName', title: '場地名稱', type: 'string', validation: Rule => Rule.min(2).max(60) }),
    defineField({ name: 'address', title: '完整地址', type: 'string', validation: Rule => Rule.min(2).max(120) }),
    defineField({
      name: 'publicDetail',
      title: '前台公開範圍',
      type: 'string',
      initialValue: 'cityOnly',
      options: {
        layout: 'radio',
        list: [
          { title: '只公開城市', value: 'cityOnly' },
          { title: '公開城市與場地名稱', value: 'venue' },
          { title: '公開城市、場地名稱與完整地址', value: 'fullAddress' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'cities.0.label', cities: 'cities', venueName: 'venueName', publicDetail: 'publicDetail' },
    prepare: ({ title, cities, venueName, publicDetail }) => ({
      title: [title ?? '未選擇城市', Array.isArray(cities) && cities.length > 1 ? `等 ${cities.length} 個城市` : ''].filter(Boolean).join(' · '),
      subtitle: [venueName, publicDetail === 'cityOnly' ? '只公開城市' : publicDetail === 'venue' ? '公開場地' : '公開完整地址'].filter(Boolean).join(' · '),
    }),
  },
  validation: Rule => Rule.custom(validateSessionServiceLocation),
})

export const sessionContactItem = defineType({
  name: 'sessionContactItem',
  title: '聯繫方式',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: '類型',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: '電話', value: 'phone' },
          { title: 'LINE ID', value: 'lineId' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'LINE 官方連結', value: 'lineUrl' },
          { title: '預約表單連結', value: 'bookingUrl' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'label', title: '欄位名稱', type: 'string', validation: Rule => Rule.required().min(2).max(30) }),
    defineField({ name: 'displayText', title: '前台顯示文字', type: 'string', validation: Rule => Rule.required().min(2).max(80) }),
    defineField({
      name: 'value',
      title: '電話、LINE ID 或 HTTPS 網址',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(300).custom((value, context) => {
        const type = (context.parent as { type?: string } | undefined)?.type
        if (!value || !type) return true
        if (type === 'phone') return /^[+0-9() -]{5,30}$/.test(value) || '請輸入有效電話號碼。'
        if (type === 'lineId') return true
        return isHttpsUrl(value) || 'Facebook、LINE 官方連結與預約表單必須使用 HTTPS 網址。'
      }),
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'displayText' } },
})

export const sessionBookingAction = defineType({
  name: 'sessionBookingAction',
  title: '主要預約按鈕',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: '按鈕文字', type: 'string', initialValue: '前往預約表單', validation: Rule => Rule.required().min(2).max(30) }),
    defineField({ name: 'url', title: '預約表單網址', type: 'url', validation: Rule => Rule.required().custom(value => isHttpsUrl(value) || '請提供有效 HTTPS 網址。') }),
  ],
})

export const sessionDetailSeo = defineType({
  name: 'sessionDetailSeo',
  title: '搜尋引擎設定',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'SEO 標題', type: 'string', validation: Rule => Rule.min(10).max(60) }),
    defineField({ name: 'description', title: 'SEO 描述', type: 'text', rows: 3, validation: Rule => Rule.min(50).max(160) }),
  ],
})

export const sessionDetailSchemaTypes = [
  sessionServiceLocation,
  sessionContactItem,
  sessionBookingAction,
  sessionDetailSeo,
]

export const sessionBioMember = defineArrayMember({
  type: 'text',
  rows: 7,
  validation: Rule => Rule.required().min(1).max(1200),
})

export function validateSessionBio(value: unknown): true | string {
  if (!Array.isArray(value) || value.length === 0) return true
  const totalLength = value.reduce((total, paragraph) => total + (typeof paragraph === 'string' ? paragraph.trim().length : 0), 0)
  return totalLength >= 60 && totalLength <= 1200
    ? true
    : '執行師介紹全部段落合計需為 60–1,200 字。'
}
