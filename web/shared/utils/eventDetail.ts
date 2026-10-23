import type {
  EventDetailAgendaBlock,
  EventDetailAgendaItem,
  EventDetailBodyBlock,
  EventDetailContent,
  EventDetailFacilitatorBlock,
  EventDetailListBlock,
  EventDetailMediaBlock,
  EventDetailQuoteBlock,
  EventDetailTestimonialBlock,
  EventDetailTextBlock,
} from '../types/eventDetail'
import type { SharedTestimonialItem } from '../types/content'
import type { EventImage, EventRegistrationStatus } from '../types/event'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const registrationStatuses = new Set<EventRegistrationStatus>([
  'scheduled', 'open', 'full', 'closed', 'cancelled', 'completed',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function textInRange(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text.length >= min && text.length <= max ? text : null
}

function optionalText(value: unknown, min: number, max: number): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined
  return textInRange(value, min, max)
}

function parseTextArray(value: unknown, min: number, max: number, maxLength: number): string[] | null {
  if (!Array.isArray(value) || value.length < min || value.length > max) return null
  const items = value.map(item => textInRange(item, 1, maxLength))
  return items.some(item => !item) ? null : items as string[]
}

function parseImage(value: unknown): EventImage | undefined {
  if (!isRecord(value) || typeof value.src !== 'string') return undefined
  try {
    const url = new URL(value.src)
    if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') return undefined
    const alt = value.alt === undefined || value.alt === null || value.alt === ''
      ? ''
      : textInRange(value.alt, 2, 120)
    if (alt === null) return undefined
    const image: EventImage = { src: url.toString(), alt }
    if (isRecord(value.hotspot)
      && typeof value.hotspot.x === 'number' && value.hotspot.x >= 0 && value.hotspot.x <= 1
      && typeof value.hotspot.y === 'number' && value.hotspot.y >= 0 && value.hotspot.y <= 1) {
      image.objectPosition = `${value.hotspot.x * 100}% ${value.hotspot.y * 100}%`
    }
    return image
  }
  catch {
    return undefined
  }
}

function parseHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && url.hostname ? url.toString() : undefined
  }
  catch {
    return undefined
  }
}

function parseAgendaItem(value: unknown): EventDetailAgendaItem | null {
  if (!isRecord(value)) return null
  const key = textInRange(value.key, 1, 120)
  const timeLabel = textInRange(value.timeLabel, 2, 40)
  const title = textInRange(value.title, 2, 100)
  const description = optionalText(value.description, 1, 500)
  const dateTime = optionalText(value.dateTime, 1, 60)
  if (!key || !timeLabel || !title || description === null || dateTime === null
    || (dateTime && !Number.isFinite(Date.parse(dateTime)))) return null
  return { key, timeLabel, title, description, dateTime }
}

function parseBodyBlock(value: unknown): EventDetailBodyBlock | null {
  if (!isRecord(value)) return null
  const key = textInRange(value.key, 1, 120)
  if (!key || typeof value.type !== 'string') return null

  if (value.type === 'eventDetailText') {
    const title = textInRange(value.title, 2, 100)
    const paragraphs = parseTextArray(value.paragraphs, 1, 8, 1200)
    return title && paragraphs ? { key, type: 'text', title, paragraphs } satisfies EventDetailTextBlock : null
  }
  if (value.type === 'eventDetailFacilitator') {
    const name = textInRange(value.name, 2, 60)
    const role = optionalText(value.role, 2, 80)
    const biography = textInRange(value.biography, 20, 1500)
    return name && biography && role !== null
      ? { key, type: 'facilitator', name, role, biography } satisfies EventDetailFacilitatorBlock
      : null
  }
  if (value.type === 'eventDetailAgenda') {
    const title = textInRange(value.title, 2, 100)
    const description = textInRange(value.description, 8, 300)
    const items = Array.isArray(value.items) ? value.items.map(parseAgendaItem) : []
    return title && description && items.length >= 2 && items.length <= 12 && !items.some(item => !item)
      ? { key, type: 'agenda', title, description, items: items as EventDetailAgendaItem[] } satisfies EventDetailAgendaBlock
      : null
  }
  if (value.type === 'sharedTestimonialBlock') {
    const title = textInRange(value.title, 2, 80)
    const items = Array.isArray(value.items)
      ? value.items.map((item): SharedTestimonialItem | null => {
          if (!isRecord(item)) return null
          const text = textInRange(item.text, 20, 2000)
          const sharerName = textInRange(item.sharerName, 2, 60)
          return text && sharerName ? { text, sharerName } : null
        })
      : []
    return title && items.length >= 1 && items.length <= 12 && !items.some(item => !item)
      ? { key, type: 'testimonials', title, items: items as SharedTestimonialItem[] } satisfies EventDetailTestimonialBlock
      : null
  }
  if (value.type === 'eventDetailList') {
    const title = textInRange(value.title, 2, 80)
    const items = parseTextArray(value.items, 1, 8, 180)
    const kind = value.kind
    return title && items && (kind === 'audience' || kind === 'preparation')
      ? { key, type: 'list', kind, title, items } satisfies EventDetailListBlock
      : null
  }
  if (value.type === 'eventDetailQuote') {
    const text = textInRange(value.text, 8, 500)
    const attribution = optionalText(value.attribution, 2, 120)
    return text && attribution !== null
      ? { key, type: 'quote', text, attribution } satisfies EventDetailQuoteBlock
      : null
  }
  if (value.type === 'eventDetailMedia') {
    const title = optionalText(value.title, 1, 80)
    const items = Array.isArray(value.items)
      ? value.items.map((item) => {
          if (!isRecord(item)) return null
          const itemKey = textInRange(item.key, 1, 120)
          const caption = optionalText(item.caption, 1, 160)
          const image = parseImage(item.image)
          return itemKey && image && caption !== null ? { key: itemKey, image, caption } : null
        })
      : []
    return title !== null && items.length >= 1 && items.length <= 2 && !items.some(item => !item)
      ? { key, type: 'media', title, items: items as EventDetailMediaBlock['items'] } satisfies EventDetailMediaBlock
      : null
  }
  return null
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(value))
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(value))
}

const actionLabels: Record<EventRegistrationStatus, string> = {
  scheduled: '尚未開放報名',
  open: '前往報名',
  full: '名額已滿',
  closed: '報名已截止',
  cancelled: '活動已取消',
  completed: '活動已結束',
}

export function parseEventDetail(value: unknown, expectedSlug?: string, nowValue: Date | string | number = Date.now()): EventDetailContent | null {
  if (!isRecord(value) || value.isPublished !== true || !isRecord(value.detail)) return null
  const title = textInRange(value.title, 2, 40)
  const slug = textInRange(value.slug, 1, 60)
  const summary = textInRange(value.summary, 20, 100)
  const startAt = typeof value.startAt === 'string' ? value.startAt : ''
  const endAt = typeof value.endAt === 'string' ? value.endAt : ''
  const startTime = Date.parse(startAt)
  const endTime = Date.parse(endAt)
  const scheduleNote = optionalText(value.scheduleNote, 2, 80)
  const city = optionalText(value.city, 2, 30)
  const venue = optionalText(value.venue, 2, 80)
  if (!title || !slug || !slugPattern.test(slug) || (expectedSlug && slug !== expectedSlug) || !summary
    || !Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime
    || scheduleNote === null || city === null || venue === null
    || !registrationStatuses.has(value.registrationStatus as EventRegistrationStatus)
    || !['inPerson', 'online', 'hybrid'].includes(String(value.deliveryMode))) return null
  if ((value.deliveryMode === 'inPerson' || value.deliveryMode === 'hybrid') && !city) return null

  const detail = value.detail
  const intro = textInRange(detail.intro, 40, 240)
  const feeLabel = optionalText(detail.feeLabel, 2, 40)
  const registrationNote = optionalText(detail.registrationNote, 1, 240)
  const seoTitle = optionalText(detail.seoTitle, 1, 70)
  const seoDescription = optionalText(detail.seoDescription, 1, 160)
  const body = Array.isArray(detail.body) ? detail.body.map(parseBodyBlock) : []
  const keys = body.map(block => block?.key).filter((key): key is string => Boolean(key))
  const facilitatorCount = body.filter(block => block?.type === 'facilitator').length
  const agendaCount = body.filter(block => block?.type === 'agenda').length
  if (!intro || feeLabel === null || registrationNote === null || seoTitle === null || seoDescription === null
    || body.length < 1 || body.some(block => !block) || new Set(keys).size !== keys.length
    || facilitatorCount < 1 || facilitatorCount > 6 || agendaCount !== 1) return null

  const now = new Date(nowValue).getTime()
  let status = value.registrationStatus as EventRegistrationStatus
  if (Number.isFinite(now) && now >= endTime) status = 'completed'
  else if (Number.isFinite(now) && now >= startTime) status = 'closed'
  const registrationUrl = status === 'open' ? parseHttpsUrl(value.registrationUrl) : undefined
  const actionLabel = status === 'open' && !registrationUrl ? '報名資訊待確認' : actionLabels[status]
  const location = value.deliveryMode === 'online'
    ? city ?? '線上'
    : [city, venue].filter(Boolean).join('・')
  const facts = [
    { label: '日期', value: formatDate(startAt), dateTime: startAt },
    { label: '時間', value: scheduleNote ?? `${formatTime(startAt)}–${formatTime(endAt)}` },
    { label: '地點', value: location || '地點待確認' },
    feeLabel ? { label: '費用', value: feeLabel } : undefined,
  ].filter((fact): fact is { label: string, value: string, dateTime?: string } => Boolean(fact))

  return {
    slug,
    hero: { title, summary, image: parseImage(value.image) },
    facts,
    intro,
    body: body as EventDetailBodyBlock[],
    registration: { status, actionLabel, actionUrl: registrationUrl, note: registrationNote },
    seo: seoTitle || seoDescription ? { title: seoTitle, description: seoDescription } : undefined,
  }
}
