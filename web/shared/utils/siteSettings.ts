import type { SiteSettings } from '../types/siteSettings'
import { isEmail, isGoogleMapsEmbedUrl, isGoogleMapsExternalUrl, isHttpsUrl, isNavigation, isPhoneUri } from './siteSettingsContract'

function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}
function text(value: unknown, min: number, max: number): value is string {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max
}

export function parseSiteSettings(value: unknown): SiteSettings | null {
  const doc = object(value)
  if (!doc || !text(doc.brandName, 2, 20) || doc.brandDestination !== '/' || !isNavigation(doc.navigationItems)) return null
  const messages = object(doc.brandMessages)
  const legal = object(doc.legal)
  if (!messages || !text(messages.englishStatement, 20, 80) || !legal || !text(legal.copyrightText, 10, 100)) return null
  if (messages.closingStatement != null && !text(messages.closingStatement, 10, 28)) return null
  const content: SiteSettings = {
    brandName: doc.brandName.trim(), brandDestination: '/',
    brandMessages: { englishStatement: messages.englishStatement.trim() },
    legal: { copyrightText: legal.copyrightText.trim() },
    navigationItems: [], socialLinks: [],
  }
  if (typeof messages.closingStatement === 'string') content.brandMessages.closingStatement = messages.closingStatement.trim()
  const items = doc.navigationItems as Record<string, unknown>[]
  if (items.some(item => item.accessibleLabel != null && !text(item.accessibleLabel, 1, 30))) return null
  content.navigationItems = items.map(item => ({ label: item.label as string, href: item.destination as string, ...(typeof item.accessibleLabel === 'string' ? { accessibleLabel: item.accessibleLabel.trim() } : {}) }))
  // Logo failure is optional: keep readable brand text instead of rejecting the site.
  for (const field of ['brandLogo', 'footerLogo'] as const) {
    const logo = object(doc[field])
    if (logo && isHttpsUrl(logo.src) && typeof logo.width === 'number' && Number.isFinite(logo.width) && logo.width > 0 && typeof logo.height === 'number' && Number.isFinite(logo.height) && logo.height > 0) {
      content[field] = { src: logo.src, width: logo.width, height: logo.height }
    }
  }
  if (doc.contact != null) {
    const contact = object(doc.contact)
    if (!contact) return null
    content.contact = {}
    if (contact.address != null) {
      if (!text(contact.address, 10, 60)) return null
      content.contact.address = contact.address.trim()
    }
    if (contact.email != null) {
      if (!isEmail(contact.email)) return null
      content.contact.email = contact.email
    }
    if (contact.phone != null) {
      const phone = object(contact.phone)
      if (!phone || !text(phone.display, 8, 25) || !isPhoneUri(phone.href)) return null
      content.contact.phone = { display: phone.display.trim(), href: phone.href }
    }
    if (contact.businessHours != null) {
      if (!Array.isArray(contact.businessHours) || contact.businessHours.length < 1 || contact.businessHours.length > 3) return null
      const businessHours: { days: string; hours: string }[] = []
      for (const raw of contact.businessHours) {
        const item = object(raw)
        if (!item || !text(item.days, 2, 40) || !text(item.hours, 2, 40)) return null
        businessHours.push({ days: item.days.trim(), hours: item.hours.trim() })
      }
      content.contact.businessHours = businessHours
    }
    if (contact.businessHoursNote != null) {
      if (!text(contact.businessHoursNote, 1, 80)) return null
      content.contact.businessHoursNote = contact.businessHoursNote.trim()
    }
    if (contact.map != null) {
      const map = object(contact.map)
      if (!map || !text(map.placeName, 2, 40) || !isGoogleMapsEmbedUrl(map.embedUrl) || !isGoogleMapsExternalUrl(map.externalUrl)) return null
      content.contact.map = {
        placeName: map.placeName.trim(),
        embedUrl: map.embedUrl,
        externalUrl: map.externalUrl,
      }
    }
  }
  if (doc.socialLinks != null) {
    if (!Array.isArray(doc.socialLinks) || doc.socialLinks.length > 4) return null
    for (const raw of doc.socialLinks) {
      const social = object(raw)
      if (!social || !text(social.label, 2, 20) || !isHttpsUrl(social.href)) return null
      if (content.socialLinks.some(item => item.label === social.label)) return null
      content.socialLinks.push({ label: social.label.trim(), href: social.href })
    }
  }
  return content
}
