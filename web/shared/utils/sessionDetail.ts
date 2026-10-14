import type { SessionContactItem, SessionContactType, SessionDetailContent, SessionDetailImage, SessionLocationVisibility, SessionPortraitDisplayMode } from '../types/sessionDetail'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const contactTypes = new Set<SessionContactType>(['phone', 'lineId', 'facebook', 'lineUrl', 'bookingUrl'])
const visibility = new Set<SessionLocationVisibility>(['cityOnly', 'venue', 'fullAddress'])
const portraitDisplayModes = new Set<SessionPortraitDisplayMode>(['contained', 'cover'])
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
function text(value: unknown, min: number, max: number): string | null { if (typeof value !== 'string') return null; const result = value.trim(); return result.length >= min && result.length <= max ? result : null }
function optional(value: unknown, min: number, max: number): string | undefined | null { return value === undefined || value === null || value === '' ? undefined : text(value, min, max) }
function texts(value: unknown, min: number, max: number, itemMax: number): string[] | null { if (!Array.isArray(value) || value.length < min || value.length > max) return null; const parsed = value.map(item => text(item, 1, itemMax)); return parsed.some(item => !item) ? null : parsed as string[] }
function https(value: unknown): string | undefined { if (typeof value !== 'string') return; try { const url = new URL(value.trim()); return url.protocol === 'https:' && url.hostname ? url.toString() : undefined } catch { return } }
function image(value: unknown): SessionDetailImage | undefined {
  if (!record(value) || typeof value.src !== 'string') return
  const src = https(value.src)
  const alt = text(value.alt, 2, 100)
  if (!src || !alt || !src.startsWith('https://cdn.sanity.io/')) return
  const displayMode = value.displayMode === undefined ? 'contained' : value.displayMode as SessionPortraitDisplayMode
  if (!portraitDisplayModes.has(displayMode)) return
  const result: SessionDetailImage = { src, alt, displayMode }
  if (record(value.hotspot)
    && typeof value.hotspot.x === 'number' && value.hotspot.x >= 0 && value.hotspot.x <= 1
    && typeof value.hotspot.y === 'number' && value.hotspot.y >= 0 && value.hotspot.y <= 1) {
    result.objectPosition = `${value.hotspot.x * 100}% ${value.hotspot.y * 100}%`
  }
  return result
}

function contact(value: unknown): SessionContactItem | null {
  if (!record(value)) return null
  const key = text(value.key, 1, 120)
  const type = value.type as SessionContactType
  const label = text(value.label, 2, 30)
  const displayText = text(value.displayText, 2, 80)
  const raw = text(value.value, 2, 300)
  if (!key || !contactTypes.has(type) || !label || !displayText || !raw) return null
  if (type === 'lineId') return { key, type, label, displayText }
  if (type === 'phone') {
    return /^[+0-9() -]{5,30}$/.test(raw)
      ? { key, type, label, displayText, href: `tel:${raw.replace(/[() -]/g, '')}` }
      : null
  }
  const href = https(raw)
  return href ? { key, type, label, displayText, href } : null
}

export function parseSessionDetail(value: unknown, expectedSlug?: string): SessionDetailContent | null {
  if (!record(value) || value.isPublished !== true) return null
  const id = text(value.id, 1, 200); const slug = text(value.slug, 1, 60); const name = text(value.name, 2, 20); const englishName = optional(value.englishName, 2, 40); const summary = text(value.summary, 20, 100)
  const regions = texts(value.regions, 1, 5, 24); const methods = texts(value.methods, 1, 20, 80); const bio = texts(value.bio, 1, 6, 1200); const experienceItems = Array.isArray(value.experienceItems) ? texts(value.experienceItems, 0, 12, 100) : []
  if (!id || id.includes('.') || !slug || !slugPattern.test(slug) || (expectedSlug && slug !== expectedSlug) || !name || englishName === null || !summary || !regions || !methods || !bio || bio.join('').length < 60 || bio.join('').length > 1200 || !experienceItems || experienceItems.some(item => item.length < 4)) return null
  const serviceLocations = Array.isArray(value.serviceLocations)
    ? value.serviceLocations.map((item) => {
        if (!record(item)) return null
        const key = text(item.key, 1, 120)
        const cities = texts(item.cities, 1, 6, 40)
        const publicDetail = item.publicDetail as SessionLocationVisibility
        const venueName = optional(item.venueName, 2, 60)
        const address = optional(item.address, 2, 120)
        if (!key || !cities || new Set(cities).size !== cities.length || !visibility.has(publicDetail) || venueName === null || address === null) return null
        if ((publicDetail === 'venue' || publicDetail === 'fullAddress') && !venueName) return null
        if (publicDetail === 'fullAddress' && !address) return null
        return { key, cities, publicDetail, venueName, address }
      })
    : []
  if (serviceLocations.length > 6 || serviceLocations.some(item => !item)) return null
  const contactItems = Array.isArray(value.contactItems) ? value.contactItems.map(contact) : []
  if (contactItems.length < 1 || contactItems.length > 6 || contactItems.some(item => !item)) return null
  const contactIntro = optional(value.contactIntro, 1, 240); const seoTitle = optional(value.seoTitle, 10, 60); const seoDescription = optional(value.seoDescription, 50, 160)
  if (contactIntro === null || seoTitle === null || seoDescription === null) return null
  let bookingAction
  if (value.bookingAction !== undefined && value.bookingAction !== null) { if (!record(value.bookingAction)) return null; const label = text(value.bookingAction.label, 2, 30); const url = https(value.bookingAction.url); if (!label || !url) return null; bookingAction = { label, url } }
  const portrait = image(value.portrait)
  if (value.portrait !== undefined && value.portrait !== null && !portrait) return null
  return { id, slug, name, englishName, summary, regions, portrait, bio, experienceItems, serviceLocations: serviceLocations as SessionDetailContent['serviceLocations'], methods, contactIntro, contactItems: contactItems as SessionContactItem[], bookingAction, seo: seoTitle || seoDescription ? { title: seoTitle, description: seoDescription } : undefined }
}
