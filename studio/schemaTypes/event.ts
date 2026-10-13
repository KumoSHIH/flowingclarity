import { defineField, defineType, type Path, type ValidationError } from 'sanity'

const eventSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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

interface EventPublicationValue {
  _id?: string
  startAt?: string
  endAt?: string
  deliveryMode?: string
  city?: string
  registrationUrl?: string
  isPublished?: boolean
  detail?: unknown
}

function fieldError(message: string, path: Path): ValidationError {
  return { message, path }
}

export function validateEventPublication(value: unknown): true | string | ValidationError | ValidationError[] {
  if (!value || typeof value !== 'object') return true
  const event = value as EventPublicationValue
  if (event.startAt && event.endAt) {
    const startAt = Date.parse(event.startAt)
    const endAt = Date.parse(event.endAt)
    if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt <= startAt) {
      return fieldError('結束時間必須晚於開始時間；請檢查活動的起訖時間。', ['endAt'])
    }
  }
  if (event.isPublished !== true) return true
  const documentId = event._id?.replace(/^drafts\./, '')
  if (documentId?.includes('.')) return '公開前台文件的 ID 不得包含句點。'
  if ((event.deliveryMode === 'inPerson' || event.deliveryMode === 'hybrid') && !event.city?.trim()) {
    return fieldError('實體或混合活動公開前，請填寫城市或線上標示。', ['city'])
  }
  if (event.registrationUrl && !isHttpsUrl(event.registrationUrl)) {
    return fieldError('公開活動的報名網址必須是有效的 HTTPS 網址。', ['registrationUrl'])
  }
  if (!event.detail) {
    return fieldError('公開活動前，請完成「活動詳情內容」。', ['detail'])
  }
  return true
}

export const event = defineType({
  name: 'event',
  title: '活動',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '活動名稱',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(40),
    }),
    defineField({
      name: 'slug',
      title: '網址識別碼',
      type: 'slug',
      description: '只輸入小寫英數與連字號；此識別碼將供活動詳情頁使用。',
      options: { source: 'title', maxLength: 60 },
      validation: Rule => Rule.required().custom(value => {
        if (!value?.current) return true
        return eventSlugPattern.test(value.current)
          ? true
          : '請使用小寫英數與連字號，且不要在開頭或結尾放連字號。'
      }),
    }),
    defineField({
      name: 'eventType',
      title: '活動形式名稱',
      type: 'string',
      description: '例如一日工作坊、兩日工作坊或課程說明會。',
      validation: Rule => Rule.required().min(2).max(12),
    }),
    defineField({
      name: 'summary',
      title: '活動摘要',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().min(20).max(100),
    }),
    defineField({
      name: 'startAt',
      title: '開始時間',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'endAt',
      title: '結束時間',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'scheduleNote',
      title: '時段補充',
      type: 'string',
      description: '只填無法由起訖時間表達的資訊，例如兩日各自的時段。',
      validation: Rule => Rule.min(2).max(80),
    }),
    defineField({
      name: 'deliveryMode',
      title: '參與方式',
      type: 'string',
      options: {
        list: [
          { title: '實體', value: 'inPerson' },
          { title: '線上', value: 'online' },
          { title: '實體與線上', value: 'hybrid' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required().custom(value => (
        value === 'inPerson' || value === 'online' || value === 'hybrid'
          ? true
          : '參與方式只能是實體、線上或混合。'
      )),
    }),
    defineField({
      name: 'city',
      title: '城市或線上標示',
      type: 'string',
      validation: Rule => Rule.min(2).max(30),
    }),
    defineField({
      name: 'venue',
      title: '公開場地資訊',
      type: 'string',
      validation: Rule => Rule.min(2).max(80),
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
          description: '圖片有資訊意義時填寫；純裝飾圖片可留空。',
          validation: Rule => Rule.min(2).max(120),
        }),
      ],
    }),
    defineField({ name: 'detail', title: '活動詳情內容', type: 'eventDetailContent' }),
    defineField({
      name: 'registrationStatus',
      title: '報名狀態',
      type: 'string',
      options: {
        list: [
          { title: '尚未開放', value: 'scheduled' },
          { title: '開放報名', value: 'open' },
          { title: '名額已滿', value: 'full' },
          { title: '報名截止', value: 'closed' },
          { title: '已取消', value: 'cancelled' },
          { title: '已完成', value: 'completed' },
        ],
      },
      validation: Rule => Rule.required().custom(value => (
        value === 'scheduled' || value === 'open' || value === 'full'
        || value === 'closed' || value === 'cancelled' || value === 'completed'
          ? true
          : '請選擇有效的報名狀態。'
      )),
    }),
    defineField({
      name: 'registrationUrl',
      title: '外部報名網址',
      type: 'url',
      description: '只接受已核准的 HTTPS 網址；沒有入口時留空。',
      validation: Rule => Rule.custom(value => (
        value === undefined || isHttpsUrl(value) || '請提供有效 HTTPS 網址。'
      )),
    }),
    defineField({
      name: 'relatedCourse',
      title: '關聯課程',
      type: 'reference',
      to: [{ type: 'course' }],
      options: {
        disableNew: true,
        filter: 'isPublished == true',
      },
    }),
    defineField({
      name: 'archiveVisible',
      title: '結束後顯示於過去活動',
      type: 'boolean',
      initialValue: true,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: '同一開始時間的順序',
      type: 'number',
      initialValue: 1,
      validation: Rule => Rule.required().integer().min(1).custom(async (value, context) => {
        if (!value || !context.document?.startAt) return true
        const documentId = context.document._id?.replace(/^drafts\./, '')
        if (!documentId) return true
        const duplicateCount = await context.getClient({ apiVersion: '2026-03-01' }).fetch<number>(
          `count(*[
            _type == "event" &&
            !(_id in [$documentId, "drafts." + $documentId]) &&
            startAt == $startAt &&
            order == $order
          ])`,
          { documentId, startAt: context.document.startAt, order: value },
        )
        return duplicateCount === 0 ? true : '同一開始時間的活動順序不得重複。'
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
      startAt: 'startAt',
      status: 'registrationStatus',
      published: 'isPublished',
      media: 'image',
    },
    prepare: ({ title, startAt, status, published, media }) => ({
      title,
      subtitle: [startAt, status, published ? '公開' : '隱藏'].filter(Boolean).join(' · '),
      media,
    }),
  },
  validation: Rule => Rule.custom(validateEventPublication),
})
