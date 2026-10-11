import { defineArrayMember, defineField, defineType } from 'sanity'

interface CourseDateRangeValue {
  startDate?: string
  endDate?: string
}

interface CourseStageValue {
  title?: string
  order?: number
  dateRanges?: CourseDateRangeValue[]
}

interface CourseRunPublicationValue {
  _id?: string
  isPublished?: boolean
  registrationStatus?: string
  registrationUrl?: string
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

export function validateCourseRunPublication(value: unknown): true | string {
  if (!value || typeof value !== 'object') return true
  const run = value as CourseRunPublicationValue
  if (run.isPublished !== true) return true
  const documentId = run._id?.replace(/^drafts\./, '')
  if (documentId?.includes('.')) return '公開前台文件的 ID 不得包含句點。'
  if (run.registrationStatus === 'open') {
    try {
      const url = new URL(run.registrationUrl ?? '')
      if (url.protocol !== 'https:' || !url.hostname) throw new Error('invalid URL')
    } catch {
      return '開放報名的公開梯次必須設定 HTTPS 報名網址。'
    }
  }
  return true
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !isoDatePattern.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function validateCourseRunStages(value: unknown): true | string {
  if (!Array.isArray(value) || value.length === 0) return true
  const stages = value as CourseStageValue[]
  const orders = stages.map(stage => stage.order).filter((order): order is number => Number.isInteger(order))
  if (new Set(orders).size !== orders.length) return '階段順序不得重複。'

  let previousStageOrder = 0
  let previousEndDate = ''
  for (const stage of stages) {
    if (typeof stage.order === 'number' && stage.order <= previousStageOrder) {
      return '階段必須依順序由小到大排列。'
    }
    if (typeof stage.order === 'number') previousStageOrder = stage.order

    for (const range of stage.dateRanges ?? []) {
      if (!isIsoDate(range.startDate) || !isIsoDate(range.endDate)) continue
      if (range.endDate < range.startDate) return '結束日期不得早於開始日期。'
      if (previousEndDate && range.startDate <= previousEndDate) {
        return '日期區間必須依時間遞增，且不得重疊。'
      }
      previousEndDate = range.endDate
    }
  }
  return true
}

export function deriveCourseRunDateBounds(value: unknown): {
  firstStartDate: string
  lastEndDate: string
} | null {
  if (validateCourseRunStages(value) !== true || !Array.isArray(value)) return null
  const ranges = (value as CourseStageValue[]).flatMap(stage => stage.dateRanges ?? [])
  const startDates = ranges.map(range => range.startDate).filter(isIsoDate)
  const endDates = ranges.map(range => range.endDate).filter(isIsoDate)
  if (startDates.length === 0 || endDates.length === 0) return null
  return {
    firstStartDate: [...startDates].sort()[0]!,
    lastEndDate: [...endDates].sort().at(-1)!,
  }
}

export const courseDateRange = defineType({
  name: 'courseDateRange',
  title: '上課日期區間',
  type: 'object',
  fields: [
    defineField({
      name: 'startDate',
      title: '開始日期',
      type: 'date',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: '結束日期',
      type: 'date',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: { startDate: 'startDate', endDate: 'endDate' },
    prepare: ({ startDate, endDate }) => ({ title: `${startDate ?? '未設定'} ～ ${endDate ?? '未設定'}` }),
  },
})

export const courseStage = defineType({
  name: 'courseStage',
  title: '課程階段',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: '階段名稱',
      type: 'string',
      validation: Rule => Rule.required().min(2).max(20),
    }),
    defineField({
      name: 'order',
      title: '階段順序',
      type: 'number',
      validation: Rule => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'dateRanges',
      title: '上課日期',
      type: 'array',
      of: [defineArrayMember({ type: 'courseDateRange' })],
      validation: Rule => Rule.required().min(1).max(6),
    }),
  ],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare: ({ title, order }) => ({ title, subtitle: `第 ${order ?? '—'} 階` }),
  },
})

export const courseRun = defineType({
  name: 'courseRun',
  title: '課程梯次',
  type: 'document',
  fields: [
    defineField({
      name: 'course',
      title: '所屬課程',
      type: 'reference',
      to: [{ type: 'course' }],
      options: { disableNew: true },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'label',
      title: '梯次名稱',
      type: 'string',
      description: '供編輯者區分梯次，不會取代課程名稱。',
      validation: Rule => Rule.required().min(2).max(40),
    }),
    defineField({
      name: 'registrationStatus',
      title: '報名狀態',
      type: 'string',
      options: {
        list: [
          { title: '尚未開放', value: 'scheduled' },
          { title: '開放報名', value: 'open' },
          { title: '已額滿', value: 'full' },
          { title: '已截止', value: 'closed' },
          { title: '已取消', value: 'cancelled' },
          { title: '已完成', value: 'completed' },
        ],
      },
      validation: Rule => Rule.required().custom(value => {
        if (!value) return true
        return ['scheduled', 'open', 'full', 'closed', 'cancelled', 'completed'].includes(value)
          ? true
          : '請選擇有效的報名狀態。'
      }),
    }),
    defineField({
      name: 'isPublished',
      title: '可供公開網站查詢',
      type: 'boolean',
      initialValue: false,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: '城市或上課方式',
      type: 'string',
      description: '例如「高雄」或「線上」；未確認時請留空。',
      validation: Rule => Rule.min(2).max(30),
    }),
    defineField({
      name: 'venue',
      title: '地點',
      type: 'string',
      description: '只填寫已確認且可公開的地點。',
      validation: Rule => Rule.min(2).max(80),
    }),
    defineField({
      name: 'timeLabel',
      title: '上課時間說明',
      type: 'string',
      description: '例如「每日 09:30–18:30」。',
      validation: Rule => Rule.min(2).max(80),
    }),
    defineField({
      name: 'capacityLabel',
      title: '名額說明',
      type: 'string',
      validation: Rule => Rule.min(2).max(40),
    }),
    defineField({
      name: 'feeLabel',
      title: '費用說明',
      type: 'string',
      description: '只填寫已核准的公開費用。',
      validation: Rule => Rule.min(2).max(60),
    }),
    defineField({
      name: 'registrationUrl',
      title: '報名網址',
      type: 'url',
      description: '只有狀態為「開放報名」時，前台才會顯示這個連結。',
      validation: Rule => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'notes',
      title: '參與條件與補充',
      type: 'array',
      of: [defineArrayMember({ type: 'string', validation: Rule => Rule.required().max(120) })],
      validation: Rule => Rule.max(8),
    }),
    defineField({
      name: 'stages',
      title: '課程階段',
      type: 'array',
      of: [defineArrayMember({ type: 'courseStage' })],
      validation: Rule => Rule.required().min(1).max(10).custom(validateCourseRunStages),
    }),
  ],
  preview: {
    select: { title: 'label', course: 'course.title', status: 'registrationStatus' },
    prepare: ({ title, course, status }) => ({
      title,
      subtitle: `${course ?? '未設定課程'} · ${status ?? '未設定狀態'}`,
    }),
  },
  validation: Rule => Rule.custom(validateCourseRunPublication),
})
