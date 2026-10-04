export interface HomeBannerContent {
  title: string
  summary: string
  buttonText: string
  buttonLink: string
}

export const fallbackHomeBanner: HomeBannerContent = {
  title: '讓身心，\n慢慢回到\n自己的節奏。',
  summary: '普那生活空間是一個結合身體、心理、生命與美感的學習場域。我們相信，覺察從身體開始，走向更清晰、自在的生活。',
  buttonText: '探索適合我的課程',
  buttonLink: '#courses',
}

export function isBannerLink(value: string): boolean {
  if (/[\s\\\u0000-\u001f\u007f]/u.test(value)) return false
  if (value.startsWith('#')) return value.length > 1
  if (value.startsWith('/')) return !value.startsWith('//')
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.hostname
  } catch {
    return false
  }
}

export function parseHomeBanner(value: unknown): HomeBannerContent | null {
  if (!value || typeof value !== 'object') return null
  const { title, summary, buttonText, buttonLink } = value as Record<string, unknown>
  if (typeof title !== 'string' || !title.trim()
    || typeof summary !== 'string' || !summary.trim()
    || typeof buttonText !== 'string' || !buttonText.trim()
    || typeof buttonLink !== 'string' || !isBannerLink(buttonLink.trim())) return null
  return {
    title: title.trim(),
    summary: summary.trim(),
    buttonText: buttonText.trim(),
    buttonLink: buttonLink.trim(),
  }
}
