import type { HomeCourseItem, HomeEventItem, HomeSectionImage, HomeSectionsContent } from '../types/homeSections'
import { isEmail } from './siteSettingsContract'

export const homePageId = 'home-page'

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null
  const candidate = value.trim()
  return candidate.length >= min && candidate.length <= max ? candidate : null
}

function slug(value: unknown): string | null {
  const candidate = text(value, 1, 96)
  return candidate && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate) ? candidate : null
}

function isoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const candidate = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(candidate.valueOf()) && candidate.toISOString().slice(0, 10) === value
}

function image(value: unknown): HomeSectionImage | null {
  const source = record(value)
  const src = text(source?.src, 8, 1000)
  const alt = text(source?.alt, 2, 120)
  const width = Number(source?.width)
  const height = Number(source?.height)
  if (!src || !alt || !Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return null
  try {
    const url = new URL(src)
    if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') return null
    const parsed: HomeSectionImage = { src: url.toString(), alt, width, height }
    const hotspot = record(source?.hotspot)
    if (typeof hotspot?.x === 'number' && hotspot.x >= 0 && hotspot.x <= 1
      && typeof hotspot?.y === 'number' && hotspot.y >= 0 && hotspot.y <= 1) {
      parsed.objectPosition = `${hotspot.x * 100}% ${hotspot.y * 100}%`
    }
    return parsed
  }
  catch { return null }
}

function taipeiDate(value: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function addCalendarMonths(value: string, months: number): string | null {
  if (!isoDate(value)) return null
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  const target = new Date(Date.UTC(year, month - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  return new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay))).toISOString().slice(0, 10)
}

function firstStartDate(value: unknown): string | null {
  if (!Array.isArray(value)) return null
  const dates = value.flatMap(rawStage => {
    const stage = record(rawStage)
    return Array.isArray(stage?.dateRanges)
      ? stage.dateRanges.map(rawRange => record(rawRange)?.startDate).filter(isoDate)
      : []
  })
  return dates.sort()[0] ?? null
}

function eventDateParts(value: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? ''
  return { year: get('year'), month: get('month'), day: get('day') }
}

function eventDisplay(startAt: Date, endAt: Date, scheduleNote: unknown) {
  const startDate = eventDateParts(startAt)
  const inclusiveEndAt = new Date(Math.max(startAt.valueOf(), endAt.valueOf() - 1))
  const inclusiveEndDate = eventDateParts(inclusiveEndAt)
  const date = `${startDate.year}-${startDate.month}-${startDate.day}`
  const sameYear = startDate.year === inclusiveEndDate.year
  const sameMonth = sameYear && startDate.month === inclusiveEndDate.month
  const period = sameMonth
    ? `${startDate.year}/${startDate.month}`
    : sameYear
      ? `${startDate.year}/${startDate.month}–${inclusiveEndDate.month}`
      : `${startDate.year}/${startDate.month}–${inclusiveEndDate.year}/${inclusiveEndDate.month}`
  const day = startDate.day === inclusiveEndDate.day && sameMonth
    ? startDate.day
    : `${startDate.day}-${inclusiveEndDate.day}`
  const weekdayFormatter = new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', weekday: 'short' })
  const startWeekday = weekdayFormatter.format(startAt)
  const endWeekday = weekdayFormatter.format(inclusiveEndAt)
  const weekday = startWeekday === endWeekday ? startWeekday : `${startWeekday}、${endWeekday}`
  const timeFormatter = new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  const time = text(scheduleNote, 2, 80) ?? `${timeFormatter.format(startAt)}—${timeFormatter.format(endAt)}`
  return { date, period, day, weekday, time }
}

function parseEvents(value: unknown, now: Date): HomeEventItem[] {
  if (!Array.isArray(value)) return []
  const visibleStatuses = new Set(['scheduled', 'open', 'full', 'closed'])
  return value.flatMap(raw => {
    const item = record(raw)
    const id = text(item?._id, 1, 200)
    const itemSlug = slug(item?.slug)
    const title = text(item?.title, 2, 40)
    const category = text(item?.eventType, 2, 12)
    const startAt = typeof item?.startAt === 'string' ? new Date(item.startAt) : new Date(Number.NaN)
    const endAt = typeof item?.endAt === 'string' ? new Date(item.endAt) : new Date(Number.NaN)
    if (!id || !itemSlug || !title || !category || !Number.isFinite(startAt.valueOf()) || !Number.isFinite(endAt.valueOf())
      || endAt <= now || endAt <= startAt || item?.isPublished !== true
      || !visibleStatuses.has(String(item?.registrationStatus))) return []
    return [{ id, href: `/events/${itemSlug}`, title, category, ...eventDisplay(startAt, endAt, item.scheduleNote), sortAt: startAt.valueOf(), order: Number(item.order) || 0 }]
  }).sort((a, b) => a.sortAt - b.sortAt || a.order - b.order || a.id.localeCompare(b.id))
    .slice(0, 3).map(({ sortAt: _sortAt, order: _order, ...item }) => item)
}

function parseCourses(value: unknown, now: Date): HomeCourseItem[] {
  if (!Array.isArray(value)) return []
  const visibleStatuses = new Set(['scheduled', 'open', 'full', 'closed'])
  const today = taipeiDate(now)
  const cutoff = addCalendarMonths(today, 6) ?? today
  return value.flatMap(raw => {
    const course = record(raw)
    const id = text(course?._id, 1, 200)
    const courseSlug = slug(course?.slug)
    const title = text(course?.title, 2, 40)
    const description = text(course?.summary, 20, 100)
    const category = text(course?.categoryName, 2, 30)
    const parsedImage = image(course?.image)
    if (!id || !courseSlug || !title || !description || !category || !parsedImage || course?.isPublished !== true || !Array.isArray(course.runs)) return []
    const dates = course.runs.flatMap(rawRun => {
      const run = record(rawRun)
      if (run?.isPublished !== true || !visibleStatuses.has(String(run.registrationStatus))) return []
      const date = firstStartDate(run.stages)
      return date && date >= today ? [date] : []
    }).sort()
    const date = dates[0]
    if (!date) return []
    return [{ id, href: `/course/${courseSlug}`, title, description, category, image: parsedImage, date, withinSixMonths: date <= cutoff }]
  }).sort((a, b) => Number(b.withinSixMonths) - Number(a.withinSixMonths) || a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
    .slice(0, 3)
    .map(({ date, withinSixMonths: _withinSixMonths, category, ...course }) => ({ ...course, meta: `${category} · ${date.replaceAll('-', '/')} 開課` }))
}

export function parseHomeSections(value: unknown, now = new Date()): HomeSectionsContent | null {
  const root = record(value)
  const page = record(root?.page)
  if (!page) return null
  const introductionLabel = text(page.introductionLabel, 2, 20)
  const introductionHeading = text(page.introductionHeading, 2, 60)
  const introductionImage = image(page.introductionImage)
  const caption = page.introductionCaption == null || page.introductionCaption === '' ? undefined : text(page.introductionCaption, 1, 50)
  const paragraphs = Array.isArray(page.introductionParagraphs) ? page.introductionParagraphs.map(item => text(item, 20, 240)) : []
  const eventsHeading = text(page.eventsHeading, 2, 20)
  const eventsIntroduction = text(page.eventsIntroduction, 10, 180)
  const eventsEmptyMessage = text(page.eventsEmptyMessage, 10, 180)
  const coursesHeading = text(page.coursesHeading, 2, 20)
  const coursesIntroduction = text(page.coursesIntroduction, 10, 180)
  const coursesEmptyMessage = text(page.coursesEmptyMessage, 10, 180)
  const contactHeading = text(page.contactHeading, 2, 40)
  const contactIntroduction = text(page.contactIntroduction, 10, 180)
  const contactButtonLabel = text(page.contactButtonLabel, 2, 20)
  if (!introductionLabel || !introductionHeading || !introductionImage || caption === null
    || paragraphs.length < 1 || paragraphs.length > 3 || paragraphs.some(item => item === null)
    || !eventsHeading || !eventsIntroduction || !eventsEmptyMessage
    || !coursesHeading || !coursesIntroduction || !coursesEmptyMessage
    || !contactHeading || !contactIntroduction || !contactButtonLabel) return null
  const settings = record(root?.settings)
  const contact = record(settings?.contact)
  const email = isEmail(contact?.email) ? contact.email : undefined
  return {
    introduction: { label: introductionLabel, heading: introductionHeading, paragraphs: paragraphs as string[], image: introductionImage, caption },
    events: { heading: eventsHeading, introduction: eventsIntroduction, emptyMessage: eventsEmptyMessage, items: parseEvents(root?.events, now) },
    courses: { heading: coursesHeading, introduction: coursesIntroduction, emptyMessage: coursesEmptyMessage, items: parseCourses(root?.courses, now) },
    contact: email ? { heading: contactHeading, introduction: contactIntroduction, buttonLabel: contactButtonLabel, email } : undefined,
  }
}
