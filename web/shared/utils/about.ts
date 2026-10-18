import type {
  AboutContactContent,
  AboutImage,
  AboutPageContent,
  AboutRichTextParagraph,
  AboutRichTextSegment,
} from '../types/about'
import {
  isEmail,
  isGoogleMapsEmbedUrl,
  isGoogleMapsExternalUrl,
  isHttpsUrl,
  isPhoneUri,
} from './siteSettingsContract'

export const aboutPageId = 'about-page'

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null
  const candidate = value.trim()
  return candidate.length >= min && candidate.length <= max ? candidate : null
}

function optionalText(value: unknown, min: number, max: number): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined
  return text(value, min, max)
}

function safeHref(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const href = value.trim()
  if (href.startsWith('/') && !href.startsWith('//')) return href
  return isHttpsUrl(href) ? href : undefined
}

function parseImage(value: unknown, requiredAlt = true): AboutImage | undefined {
  const image = record(value)
  if (!image) return undefined
  const src = text(image.src, 8, 1000)
  const alt = requiredAlt ? text(image.alt, 2, 120) : optionalText(image.alt, 0, 120)
  const width = Number(image.width)
  const height = Number(image.height)
  if (!src || !alt || !Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return undefined
  try {
    const url = new URL(src)
    if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') return undefined
    const result: AboutImage = { src: url.toString(), alt, width, height }
    const hotspot = record(image.hotspot)
    if (hotspot && typeof hotspot.x === 'number' && hotspot.x >= 0 && hotspot.x <= 1
      && typeof hotspot.y === 'number' && hotspot.y >= 0 && hotspot.y <= 1) {
      result.objectPosition = `${hotspot.x * 100}% ${hotspot.y * 100}%`
    }
    return result
  }
  catch {
    return undefined
  }
}

function parseParagraph(value: unknown): AboutRichTextParagraph | null {
  const block = record(value)
  if (!block || block._type !== 'block' || block.style !== 'normal' || block.listItem != null) return null
  const key = text(block._key, 1, 120)
  if (!key || !Array.isArray(block.children) || !block.children.length) return null

  const links = new Map<string, string>()
  if (Array.isArray(block.markDefs)) {
    for (const rawDefinition of block.markDefs) {
      const definition = record(rawDefinition)
      const definitionKey = definition && text(definition._key, 1, 120)
      const href = definition?._type === 'link' ? safeHref(definition.href) : undefined
      if (!definitionKey || !href || links.has(definitionKey)) return null
      links.set(definitionKey, href)
    }
  }

  const segments: AboutRichTextSegment[] = []
  for (const rawChild of block.children) {
    const child = record(rawChild)
    const childKey = child && text(child._key, 1, 120)
    if (!child || child._type !== 'span' || !childKey || typeof child.text !== 'string') return null
    const marks = Array.isArray(child.marks) ? child.marks : []
    if (!marks.every(mark => typeof mark === 'string' && (mark === 'strong' || mark === 'em' || links.has(mark)))) return null
    const linkMarks = marks.filter(mark => typeof mark === 'string' && links.has(mark)) as string[]
    if (linkMarks.length > 1) return null
    segments.push({
      key: childKey,
      text: child.text,
      strong: marks.includes('strong') || undefined,
      emphasis: marks.includes('em') || undefined,
      href: linkMarks[0] ? links.get(linkMarks[0]) : undefined,
    })
  }
  const plainText = segments.map(segment => segment.text).join('').trim()
  return plainText ? { key, text: plainText, segments } : null
}

function parseBody(value: unknown, max: number): AboutRichTextParagraph[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > max) return null
  const body = value.map(parseParagraph)
  return body.every((paragraph): paragraph is AboutRichTextParagraph => paragraph !== null) ? body : null
}

function parseContact(settings: unknown): AboutContactContent | undefined {
  const document = record(settings)
  const contact = record(document?.contact)
  if (!contact) return undefined
  const address = optionalText(contact.address, 10, 60)
  const email = contact.email === undefined ? undefined : isEmail(contact.email) ? contact.email : null
  const phone = contact.phone === undefined ? undefined : record(contact.phone)
  if (address === null || email === null || phone === null) return undefined
  const parsedPhone = phone
    ? text(phone.display, 8, 25) && isPhoneUri(phone.href)
      ? { display: (phone.display as string).trim(), href: phone.href }
      : null
    : undefined
  if (parsedPhone === null || !Array.isArray(contact.businessHours) || contact.businessHours.length < 1 || contact.businessHours.length > 3) return undefined
  const businessHours = contact.businessHours.map(item => {
    const entry = record(item)
    const days = text(entry?.days, 2, 40)
    const hours = text(entry?.hours, 2, 40)
    return days && hours ? { days, hours } : null
  })
  if (businessHours.some(item => item === null)) return undefined
  const note = optionalText(contact.businessHoursNote, 1, 80)
  if (note === null) return undefined
  const map = record(contact.map)
  const placeName = map && text(map.placeName, 2, 40)
  if (!map || !placeName || !isGoogleMapsEmbedUrl(map.embedUrl) || !isGoogleMapsExternalUrl(map.externalUrl)) return undefined
  const socialLinks: { label: string; href: string }[] = []
  if (document?.socialLinks !== undefined) {
    if (!Array.isArray(document.socialLinks) || document.socialLinks.length > 4) return undefined
    for (const rawLink of document.socialLinks) {
      const link = record(rawLink)
      const label = text(link?.label, 2, 20)
      if (!label || !isHttpsUrl(link?.href) || socialLinks.some(item => item.label === label)) return undefined
      socialLinks.push({ label, href: link.href })
    }
  }
  return {
    address,
    phone: parsedPhone,
    email,
    businessHours: businessHours as { days: string; hours: string }[],
    businessHoursNote: note,
    socialLinks,
    map: { placeName, embedUrl: map.embedUrl, externalUrl: map.externalUrl },
  }
}

export function parseAboutPage(value: unknown): AboutPageContent | null {
  const root = record(value)
  if (!root) return null
  const page = record(root.page)
  if (!page) return null
  const title = text(page.title, 2, 20)
  const introduction = optionalText(page.introduction, 30, 160)
  const heroImage = parseImage(page.heroImage)
  const brand = record(page.brandStory)
  const place = record(page.placeAndTeam)
  const moments = record(page.featuredMoments)
  const brandHeading = text(brand?.heading, 2, 20)
  const brandBody = parseBody(brand?.body, 5)
  const brandImage = brand?.image == null ? undefined : parseImage(brand.image)
  const placeHeading = text(place?.heading, 2, 20)
  const placeBody = parseBody(place?.body, 6)
  const placeImage = parseImage(place?.image)
  const momentsHeading = text(moments?.heading, 2, 20)
  const momentsBody = parseBody(moments?.body, 4)
  const contactHeading = text(page.contactHeading, 2, 20)
  const contactIntroduction = optionalText(page.contactIntroduction, 20, 180)
  if (!title || introduction === null || !heroImage || !brand || !brandHeading || !brandBody
    || brand?.image != null && !brandImage || !place || !placeHeading || !placeBody || !placeImage
    || !moments || !momentsHeading || !momentsBody || !contactHeading || contactIntroduction === null
    || !Array.isArray(moments.items) || moments.items.length < 3 || moments.items.length > 10) return null

  const seenKeys = new Set<string>()
  const items = moments.items.map(rawItem => {
    const item = record(rawItem)
    const id = text(item?.key, 1, 120)
    const image = parseImage(item?.image)
    const caption = optionalText(item?.caption, 1, 80)
    if (!id || seenKeys.has(id) || !image || caption === null) return null
    seenKeys.add(id)
    return { id, image, caption }
  })
  if (items.some(item => item === null)) return null

  const seo = record(page.seo)
  const seoTitle = seo ? optionalText(seo.title, 10, 60) : undefined
  const seoDescription = seo ? optionalText(seo.description, 30, 160) : undefined
  if (seoTitle === null || seoDescription === null) return null
  return {
    title,
    introduction,
    heroImage,
    brandStory: { heading: brandHeading, body: brandBody, image: brandImage },
    placeAndTeam: { heading: placeHeading, body: placeBody, image: placeImage },
    featuredMoments: { heading: momentsHeading, body: momentsBody, items: items as NonNullable<(typeof items)[number]>[] },
    contactHeading,
    contactIntroduction,
    contact: parseContact(root.settings),
    seo: seoTitle || seoDescription ? { title: seoTitle, description: seoDescription } : undefined,
  }
}

function paragraph(key: string): AboutRichTextParagraph {
  return { key, text: '', segments: [] }
}

export const emptyAboutPageContent: AboutPageContent = {
  title: '',
  heroImage: { src: 'about-empty', alt: '', width: 1, height: 1 },
  brandStory: { heading: '', body: [paragraph('brand-empty')] },
  placeAndTeam: { heading: '', body: [paragraph('place-empty')], image: { src: 'about-empty', alt: '', width: 1, height: 1 } },
  featuredMoments: { heading: '', body: [paragraph('moments-empty')], items: [] },
  contactHeading: '',
}
