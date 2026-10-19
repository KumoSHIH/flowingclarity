export const siteSettingsId = 'site-settings'
export const siteNavigationItems = [
  { label: '近期活動', href: '/events' },
  { label: '課程探索', href: '/course' },
  { label: '個案諮詢', href: '/session' },
  { label: '文章分享', href: '/articles' },
  { label: '關於我們', href: '/about' },
] as const

export function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string' || /[\s\\\u0000-\u001f\u007f]/u.test(value)) return false
  try { const url = new URL(value); return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password } catch { return false }
}

export function isPhoneUri(value: unknown): value is string {
  return typeof value === 'string' && /^tel:\+[1-9]\d{6,14}$/.test(value)
}

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n?#]/.test(value)
}

export function isGoogleMapsEmbedUrl(value: unknown): value is string {
  if (!isHttpsUrl(value)) return false
  const url = new URL(value)
  if (url.hostname !== 'www.google.com' && url.hostname !== 'google.com') return false
  return (url.pathname === '/maps/embed' && Boolean(url.searchParams.get('pb')))
    || (url.pathname === '/maps' && url.searchParams.get('output') === 'embed')
}

export function isGoogleMapsExternalUrl(value: unknown): value is string {
  if (!isHttpsUrl(value)) return false
  const url = new URL(value)
  return url.hostname === 'maps.app.goo.gl'
    || ((url.hostname === 'www.google.com' || url.hostname === 'google.com')
      && url.pathname.startsWith('/maps'))
}

export function isNavigation(value: unknown): boolean {
  return Array.isArray(value) && value.length === 5 && value.every((item, index) =>
    item && item.label === siteNavigationItems[index]?.label && item.destination === siteNavigationItems[index]?.href)
}
