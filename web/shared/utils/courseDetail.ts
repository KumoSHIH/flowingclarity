import type {
  CourseDetailAudienceBlock,
  CourseDetailBodyBlock,
  CourseDetailCarouselBlock,
  CourseDetailCarouselItem,
  CourseDetailContent,
  CourseDetailCurriculumBlock,
  CourseDetailGalleryBlock,
  CourseDetailGalleryItem,
  CourseDetailGalleryLayout,
  CourseDetailImage,
  CourseDetailIntroductionBlock,
  CourseDetailQuoteBlock,
  CourseDetailSession,
  CourseDetailTeacherBlock,
  CourseDetailTextBlock,
  CourseDetailTestimonialBlock,
  CourseDetailVideoBlock,
} from '../types/courseDetail'
import type { SharedTestimonialItem } from '../types/content'
import { parseRelatedArticle } from './articleDetail'

const courseSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/
const galleryLayouts: CourseDetailGalleryLayout[] = ['collage', 'stages', 'weave', 'folio', 'dossier']
const registrationLabels = {
  scheduled: '尚未開放',
  open: '開放報名',
  full: '已額滿',
  closed: '已截止',
} as const

type PublicRegistrationStatus = keyof typeof registrationLabels

interface ParsedRun {
  key: string
  title: string
  status: PublicRegistrationStatus
  registrationUrl?: string
  city?: string
  location?: string
  dateSummary?: string
  stages: CourseDetailSession['stages']
  details: CourseDetailSession['details']
}

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

function parseStringArray(value: unknown, minItems: number, maxItems: number, maxLength: number): string[] | null {
  if (!Array.isArray(value) || value.length < minItems || value.length > maxItems) return null
  const items = value.map(item => textInRange(item, 1, maxLength))
  return items.some(item => !item) ? null : items as string[]
}

function parseImage(value: unknown, required = true): CourseDetailImage | undefined | null {
  if (value === undefined || value === null) return required ? null : undefined
  if (!isRecord(value) || typeof value.src !== 'string') return required ? null : undefined

  let url: URL
  try {
    url = new URL(value.src)
  } catch {
    return required ? null : undefined
  }
  const alt = textInRange(value.alt, 2, 120)
  if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io' || !alt) {
    return required ? null : undefined
  }

  const image: CourseDetailImage = { src: url.toString(), alt }
  if (typeof value.width === 'number' && Number.isFinite(value.width) && value.width > 0
    && typeof value.height === 'number' && Number.isFinite(value.height) && value.height > 0) {
    image.width = value.width
    image.height = value.height
  }
  if (isRecord(value.hotspot)
    && typeof value.hotspot.x === 'number' && value.hotspot.x >= 0 && value.hotspot.x <= 1
    && typeof value.hotspot.y === 'number' && value.hotspot.y >= 0 && value.hotspot.y <= 1) {
    image.objectPosition = `${value.hotspot.x * 100}% ${value.hotspot.y * 100}%`
  }
  return image
}

function parseHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && url.hostname ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function parseYouTubeEmbedUrl(value: unknown): string | undefined {
  const url = parseHttpsUrl(value)
  if (!url) return undefined
  const parsedUrl = new URL(url)
  const hostname = parsedUrl.hostname.replace(/^www\./, '')
  let videoId: string | undefined

  if (hostname === 'youtu.be') {
    videoId = parsedUrl.pathname.split('/').filter(Boolean)[0]
  } else if (hostname === 'youtube.com') {
    videoId = parsedUrl.pathname === '/watch'
      ? parsedUrl.searchParams.get('v') ?? undefined
      : parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
  }

  return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : undefined
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !isoDatePattern.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = startDate.replaceAll('-', '/')
  if (startDate === endDate) return start
  if (startDate.slice(0, 4) === endDate.slice(0, 4)) return `${start}–${endDate.slice(5).replace('-', '/')}`
  return `${start}–${endDate.replaceAll('-', '/')}`
}

function parseRunStages(value: unknown): CourseDetailSession['stages'] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null

  const stages = value.map((stage) => {
    if (!isRecord(stage)) return null
    const title = textInRange(stage.title, 2, 20)
    const order = stage.order
    if (!title || typeof order !== 'number' || !Number.isInteger(order) || order < 1
      || !Array.isArray(stage.dateRanges) || stage.dateRanges.length < 1 || stage.dateRanges.length > 6) return null

    const dateRanges = stage.dateRanges.map((range) => {
      if (!isRecord(range) || !isIsoDate(range.startDate) || !isIsoDate(range.endDate)
        || range.startDate > range.endDate) return null
      return formatDateRange(range.startDate, range.endDate)
    })
    if (dateRanges.some(range => !range)) return null

    return {
      key: `stage-${order}`,
      title,
      order,
      dateRanges: dateRanges as string[],
    }
  })
  if (stages.some(stage => !stage)) return null

  const completeStages = stages as Array<CourseDetailSession['stages'][number] & { order: number }>
  if (completeStages.some((stage, index) => index > 0 && stage.order <= completeStages[index - 1]!.order)) return null
  return completeStages.map(({ order: _order, ...stage }) => stage)
}

function formatRunDateSummary(stages: CourseDetailSession['stages']): string {
  if (stages.length === 1 && stages[0]!.dateRanges.length === 1) return stages[0]!.dateRanges[0]!
  return stages.map(stage => `${stage.title}｜${stage.dateRanges.join('、')}`).join('\n')
}

function parseRun(value: unknown): ParsedRun | null {
  if (!isRecord(value) || value.isPublished !== true
    || typeof value.registrationStatus !== 'string'
    || !(value.registrationStatus in registrationLabels)) return null

  const key = textInRange(value.key, 1, 120)
  const title = textInRange(value.label, 2, 40)
  if (!key || !title) return null

  const city = optionalText(value.city, 2, 30)
  const venue = optionalText(value.venue, 2, 80)
  const timeLabel = optionalText(value.timeLabel, 2, 80)
  const capacityLabel = optionalText(value.capacityLabel, 2, 40)
  const feeLabel = optionalText(value.feeLabel, 2, 60)
  if ([city, venue, timeLabel, capacityLabel, feeLabel].includes(null)) return null

  const notes = value.notes === undefined || value.notes === null
    ? []
    : parseStringArray(value.notes, 0, 8, 120)
  if (!notes) return null

  const stages = parseRunStages(value.stages)
  if (!stages) return null
  const dateSummary = formatRunDateSummary(stages)
  const location = [city, venue].filter(Boolean).join('・')
  const details = [
    timeLabel ? { label: '上課時間', value: timeLabel } : undefined,
    feeLabel ? { label: '課程費用', value: feeLabel } : undefined,
    capacityLabel ? { label: '招生名額', value: capacityLabel } : undefined,
    notes.length ? { label: '參與條件', value: notes.join('、') } : undefined,
  ].filter(
    (detail): detail is CourseDetailSession['details'][number] => Boolean(detail),
  )
  const registrationUrl = value.registrationStatus === 'open'
    ? parseHttpsUrl(value.registrationUrl)
    : undefined

  if (value.registrationStatus === 'open' && !registrationUrl) return null

  return {
    key,
    title,
    status: value.registrationStatus as PublicRegistrationStatus,
    registrationUrl,
    city: city ?? undefined,
    location: location || undefined,
    dateSummary,
    stages,
    details,
  }
}

function parseGalleryItem(value: unknown): CourseDetailGalleryItem | null {
  if (!isRecord(value)) return null
  const key = textInRange(value.key, 1, 120)
  const title = optionalText(value.title, 2, 80)
  const description = optionalText(value.description, 8, 500)
  const group = optionalText(value.group, 1, 40)
  const image = parseImage(value.image)
  const points = value.points === undefined || value.points === null
    ? undefined
    : parseStringArray(value.points, 1, 8, 160)
  if (!key || title === null || description === null || group === null || !image || points === null) return null
  return { key, title, description, group, image, points }
}

function parseIntroductionBlock(value: Record<string, unknown>, key: string): CourseDetailIntroductionBlock | null {
  const title = textInRange(value.title, 4, 100)
  const lead = textInRange(value.lead, 10, 300)
  const paragraphs = parseStringArray(value.paragraphs, 1, 8, 1200)
  return title && lead && paragraphs
    ? { key, type: 'introduction', title, lead, paragraphs }
    : null
}

function parseGalleryBlock(value: Record<string, unknown>, key: string): CourseDetailGalleryBlock | null {
  const title = textInRange(value.title, 4, 100)
  const description = optionalText(value.description, 10, 300)
  const layout = value.layout
  const note = optionalText(value.note, 4, 160)
  const statement = optionalText(value.statement, 8, 300)
  const items = Array.isArray(value.items) ? value.items.map(parseGalleryItem) : []
  const contentRole = value.contentRole === 'curriculum' ? 'curriculum' : 'general'
  if (!title || description === null || typeof layout !== 'string'
    || !galleryLayouts.includes(layout as CourseDetailGalleryLayout)
    || note === null || statement === null || items.length < 1 || items.some(item => !item)) return null
  return {
    key,
    type: 'gallery',
    title,
    description,
    layout: layout as CourseDetailGalleryLayout,
    contentRole,
    note,
    statement,
    items: items as CourseDetailGalleryItem[],
  }
}

function parseTeacherBlock(value: Record<string, unknown>, key: string): CourseDetailTeacherBlock | null {
  const name = textInRange(value.name, 2, 60)
  const englishName = optionalText(value.englishName, 2, 80)
  const lead = textInRange(value.lead, 10, 220)
  const biography = textInRange(value.biography, 20, 1500)
  const image = parseImage(value.image, false)
  if (!name || englishName === null || !lead || !biography || image === null) return null
  return { key, type: 'teacher', name, englishName, lead, biography, image }
}

function parseTextBlock(value: Record<string, unknown>, key: string): CourseDetailTextBlock | null {
  const title = textInRange(value.title, 2, 100)
  const text = textInRange(value.text, 8, 2000)
  return title && text ? { key, type: 'text', title, text } : null
}

function parseQuoteBlock(value: Record<string, unknown>, key: string): CourseDetailQuoteBlock | null {
  const text = textInRange(value.text, 8, 300)
  const attribution = textInRange(value.attribution, 2, 120)
  return text && attribution ? { key, type: 'quote', text, attribution } : null
}

function parseCurriculumBlock(value: Record<string, unknown>, key: string): CourseDetailCurriculumBlock | null {
  const title = textInRange(value.title, 4, 100)
  const description = optionalText(value.description, 8, 300)
  const units = Array.isArray(value.units)
    ? value.units.map((unit) => {
        if (!isRecord(unit)) return null
        const unitKey = textInRange(unit.key, 1, 120)
        const stage = textInRange(unit.stage, 1, 30)
        const unitTitle = textInRange(unit.title, 2, 100)
        const unitDescription = textInRange(unit.description, 8, 1200)
        return unitKey && stage && unitTitle && unitDescription
          ? { key: unitKey, stage, title: unitTitle, description: unitDescription }
          : null
      })
    : []
  return title && description !== null && units.length > 0 && !units.some(unit => !unit)
    ? { key, type: 'curriculum', title, description, units: units as CourseDetailCurriculumBlock['units'] }
    : null
}

function parseVideoBlock(value: Record<string, unknown>, key: string): CourseDetailVideoBlock | null {
  const title = textInRange(value.title, 4, 120)
  const embedUrl = parseYouTubeEmbedUrl(value.url)
  const authoredStatusLabel = optionalText(value.statusLabel, 2, 40)
  const statusLabel = authoredStatusLabel ?? (embedUrl ? '觀看課程影片' : '課程影片待上架')
  const image = parseImage(value.image, false) ?? undefined
  if (!title || authoredStatusLabel === null) return null
  return { key, type: 'video', title, statusLabel, image, embedUrl }
}

function parseAudienceBlock(value: Record<string, unknown>, key: string): CourseDetailAudienceBlock | null {
  const title = textInRange(value.title, 4, 80)
  const description = optionalText(value.description, 8, 300)
  const items = parseStringArray(value.items, 1, 12, 180)
  return title && description !== null && items
    ? { key, type: 'audience', title, description, items }
    : null
}

function parseTestimonialBlock(value: Record<string, unknown>, key: string): CourseDetailTestimonialBlock | null {
  const title = textInRange(value.title, 2, 80)
  const items = Array.isArray(value.items)
    ? value.items.map((item): SharedTestimonialItem | null => {
        if (!isRecord(item)) return null
        const itemText = textInRange(item.text, 20, 2000)
        const sharerName = textInRange(item.sharerName, 2, 60)
        return itemText && sharerName ? { text: itemText, sharerName } : null
      })
    : []
  return title && items.length >= 1 && items.length <= 12 && !items.some(item => !item)
    ? { key, type: 'testimonials', title, items: items as SharedTestimonialItem[] }
    : null
}

function parseCarouselBlock(value: Record<string, unknown>, key: string): CourseDetailCarouselBlock | null {
  const title = textInRange(value.title, 4, 100)
  const blockText = textInRange(value.text, 10, 800)
  const items = Array.isArray(value.items)
    ? value.items.map((item): CourseDetailCarouselItem | null => {
        if (!isRecord(item)) return null
        const id = textInRange(item.key, 1, 120)
        const image = parseImage(item.image)
        const caption = optionalText(item.caption, 1, 120)
        return id && image && caption !== null ? { id, image, caption } : null
      })
    : []
  const itemIds = items.flatMap(item => item ? [item.id] : [])
  return title && blockText && items.length >= 1 && items.length <= 10 && !items.some(item => !item)
    && new Set(itemIds).size === itemIds.length
    ? { key, type: 'carousel', title, text: blockText, items: items as CourseDetailCarouselItem[] }
    : null
}

function parseBodyBlock(value: unknown): CourseDetailBodyBlock | null {
  if (!isRecord(value)) return null
  const key = textInRange(value.key, 1, 120)
  if (!key || typeof value.type !== 'string') return null
  const type = value.type.replace(/^courseDetail/, '').toLowerCase()
  if (type === 'introduction') return parseIntroductionBlock(value, key)
  if (type === 'text') return parseTextBlock(value, key)
  if (type === 'gallery') return parseGalleryBlock(value, key)
  if (type === 'teacher') return parseTeacherBlock(value, key)
  if (type === 'quote') return parseQuoteBlock(value, key)
  if (type === 'curriculum') return parseCurriculumBlock(value, key)
  if (type === 'video') return parseVideoBlock(value, key)
  if (type === 'audience') return parseAudienceBlock(value, key)
  if (type === 'sharedtestimonialblock' || type === 'testimonials') return parseTestimonialBlock(value, key)
  if (type === 'carousel') return parseCarouselBlock(value, key)
  return null
}

export function parseCourseDetail(value: unknown, expectedSlug?: string): CourseDetailContent | null {
  if (!isRecord(value) || !isRecord(value.course) || !Array.isArray(value.runs)) return null
  const course = value.course
  if (course.isPublished !== true || !isRecord(course.detail)) return null

  const title = textInRange(course.title, 2, 40)
  const slug = textInRange(course.slug, 1, 60)
  const summary = textInRange(course.summary, 30, 100)
  const heroImage = parseImage(course.image)
  if (!title || !slug || !courseSlugPattern.test(slug) || (expectedSlug && slug !== expectedSlug)
    || !summary || !heroImage || !Array.isArray(course.deliveryModes)) return null

  const deliveryModes = course.deliveryModes.filter(mode => mode === 'inPerson' || mode === 'online')
  if (deliveryModes.length < 1 || deliveryModes.length > 2 || new Set(deliveryModes).size !== deliveryModes.length) return null

  const detail = course.detail
  const notice = optionalText(detail.notice, 4, 180)
  const englishTitle = optionalText(detail.englishTitle, 2, 100)
  if (notice === null || englishTitle === null || !Array.isArray(detail.body)
    || !isRecord(detail.schedule) || !isRecord(detail.registration)) return null

  const body = detail.body.flatMap((value) => {
    const block = parseBodyBlock(value)
    if (block) return [block]
    const type = isRecord(value) && typeof value.type === 'string'
      ? value.type.replace(/^courseDetail/, '').toLowerCase()
      : ''
    return type === 'video' ? [] : [null]
  })
  const bodyKeys = body.map(block => block?.key).filter((key): key is string => Boolean(key))
  const legacyTestimonials = body.filter((block): block is CourseDetailTestimonialBlock => block?.type === 'testimonials')
  const legacyHighlights = body.filter((block): block is CourseDetailCarouselBlock => block?.type === 'carousel')
  const topLevelTestimonials = isRecord(detail.testimonials)
    ? parseTestimonialBlock(detail.testimonials, 'testimonials')
    : undefined
  const topLevelHighlights = isRecord(detail.highlights)
    ? parseCarouselBlock(detail.highlights, 'highlights')
    : undefined
  const contentBody = body.filter((block): block is Exclude<CourseDetailBodyBlock, CourseDetailTestimonialBlock | CourseDetailCarouselBlock> =>
    Boolean(block) && block?.type !== 'testimonials' && block?.type !== 'carousel')
  const requiredBodyTypes = ['introduction', 'gallery']
  if (body.length < 1 || body.some(block => !block) || new Set(bodyKeys).size !== bodyKeys.length
    || legacyTestimonials.length > 1 || legacyHighlights.length > 1
    || (detail.testimonials !== undefined && detail.testimonials !== null && !topLevelTestimonials)
    || (detail.highlights !== undefined && detail.highlights !== null && !topLevelHighlights)
    || (topLevelTestimonials && legacyTestimonials.length > 0)
    || (topLevelHighlights && legacyHighlights.length > 0)
    || contentBody.filter(block => block.type === 'curriculum'
      || (block.type === 'gallery' && block.contentRole === 'curriculum')).length > 1
    || requiredBodyTypes.some(type => !contentBody.some(block => block.type === type))) return null

  const scheduleTitle = textInRange(detail.schedule.title, 4, 100)
  const scheduleDescription = optionalText(detail.schedule.description, 8, 300)
  const registrationTitle = textInRange(detail.registration.title, 4, 100)
  const registrationDescription = optionalText(detail.registration.description, 8, 400)
  const openActionLabel = textInRange(detail.registration.openActionLabel, 2, 30)
  const closedActionLabel = textInRange(detail.registration.closedActionLabel, 2, 40)
  const registrationImage = parseImage(detail.registration.image, false)
  const relatedArticles = Array.isArray(detail.relatedArticles)
    ? detail.relatedArticles.slice(0, 8).map(parseRelatedArticle).filter(article => article !== null)
    : []
  const relatedIds = relatedArticles.map(article => article.id)

  if (!scheduleTitle || scheduleDescription === null
    || !registrationTitle || registrationDescription === null || !openActionLabel || !closedActionLabel
    || registrationImage === null) return null

  const runs = value.runs.map(parseRun).filter((run): run is ParsedRun => Boolean(run))
  const firstOpenRun = runs.find(run => run.status === 'open' && run.registrationUrl)
  const firstRun = runs[0]
  const locations = [...new Set(runs.map(run => run.city).filter((city): city is string => Boolean(city)))]
  const deliveryLabel = deliveryModes.map(mode => mode === 'inPerson' ? '實體課程' : '線上課程').join('、')
  const heroMeta = [
    { label: '形式', value: deliveryLabel },
    locations.length ? { label: '地點', value: locations.join('、') } : undefined,
    firstRun?.dateSummary ? { label: '時間', value: firstRun.dateSummary } : undefined,
    { label: '狀態', value: firstRun ? registrationLabels[firstRun.status] : '目前沒有已確認梯次' },
  ].filter((item): item is { label: string, value: string } => Boolean(item))
  const sessions: CourseDetailSession[] = runs.map(run => ({
    key: run.key,
    title: run.title,
    status: registrationLabels[run.status],
    location: run.location,
    stages: run.stages,
    details: run.details,
  }))
  const actionLabel = firstOpenRun ? openActionLabel : closedActionLabel

  return {
    slug,
    notice,
    hero: {
      title,
      englishTitle,
      summary,
      image: heroImage,
      meta: heroMeta,
      actionLabel,
      actionUrl: firstOpenRun?.registrationUrl,
    },
    body: contentBody,
    schedule: {
      title: scheduleTitle,
      description: scheduleDescription,
      sessions,
    },
    testimonials: topLevelTestimonials ?? legacyTestimonials[0],
    highlights: topLevelHighlights ?? legacyHighlights[0],
    registration: {
      title: registrationTitle,
      description: registrationDescription,
      actionLabel,
      actionUrl: firstOpenRun?.registrationUrl,
      image: registrationImage,
    },
    relatedArticles: relatedArticles.filter((article, index) => relatedIds.indexOf(article.id) === index),
  }
}
