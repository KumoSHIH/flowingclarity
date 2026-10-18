import type {
  ArticleDetailContent,
  ArticleDetailImage,
  ArticleDetailSection,
  ArticleRichContentItem,
  ArticleRichTextLine,
  ArticleRichTextSegment,
  RelatedArticleItem,
} from '../types/articleDetail'
import type { ArticleCategory, ArticleCategoryKey, ArticleTag } from '../types/articles'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const categoryContract: Record<ArticleCategoryKey, { name: string, order: number }> = {
  body: { name: '愛身體', order: 1 },
  heart: { name: '撫慰心', order: 2 },
  life: { name: '究生命', order: 3 },
  beauty: { name: '展現美', order: 4 },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
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
  try {
    const url = new URL(href)
    return url.protocol === 'https:' && url.hostname ? url.toString() : undefined
  }
  catch {
    return undefined
  }
}

function parseImage(value: unknown, altMax: number, allowEmptyAlt: boolean): ArticleDetailImage | undefined {
  if (!isRecord(value)) return undefined
  const src = text(value.src, 8, 1000)
  const width = Number(value.width)
  const height = Number(value.height)
  const alt = allowEmptyAlt && value.alt === '' ? '' : text(value.alt, 2, altMax)
  if (!src || !alt && alt !== '' || !Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return undefined
  try {
    const url = new URL(src)
    if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') return undefined
    const image: ArticleDetailImage = { src: url.toString(), alt, width, height }
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

function parseCategory(value: unknown): ArticleCategory | null {
  if (!isRecord(value) || typeof value.key !== 'string' || !(value.key in categoryContract)) return null
  const key = value.key as ArticleCategoryKey
  const expected = categoryContract[key]
  return value.name === expected.name && value.order === expected.order
    ? { key, ...expected }
    : null
}

function parseTag(value: unknown): ArticleTag | null {
  if (!isRecord(value)) return null
  const slug = text(value.slug, 1, 60)
  const name = text(value.name, 2, 20)
  return slug && slugPattern.test(slug) && name && Number.isInteger(value.order) && Number(value.order) > 0
    ? { slug, name, order: Number(value.order) }
    : null
}

function parseLine(value: unknown): ArticleRichTextLine | null {
  if (!isRecord(value) || value._type !== 'block') return null
  const key = text(value._key, 1, 120)
  if (!key || !Array.isArray(value.children) || !value.children.length) return null
  const definitions = new Map<string, string>()
  if (Array.isArray(value.markDefs)) {
    for (const definition of value.markDefs) {
      if (!isRecord(definition) || definition._type !== 'link') return null
      const definitionKey = text(definition._key, 1, 120)
      const href = safeHref(definition.href)
      if (!definitionKey || !href || definitions.has(definitionKey)) return null
      definitions.set(definitionKey, href)
    }
  }
  const segments: ArticleRichTextSegment[] = []
  for (const child of value.children) {
    if (!isRecord(child) || child._type !== 'span') return null
    const segmentKey = text(child._key, 1, 120)
    if (!segmentKey || typeof child.text !== 'string') return null
    const marks = Array.isArray(child.marks) ? child.marks : []
    if (!marks.every(mark => typeof mark === 'string' && (mark === 'strong' || mark === 'em' || definitions.has(mark)))) return null
    const linkMarks = marks.filter(mark => typeof mark === 'string' && definitions.has(mark)) as string[]
    if (linkMarks.length > 1) return null
    segments.push({
      key: segmentKey,
      text: child.text,
      strong: marks.includes('strong') || undefined,
      emphasis: marks.includes('em') || undefined,
      href: linkMarks[0] ? definitions.get(linkMarks[0]) : undefined,
    })
  }
  const plainText = segments.map(segment => segment.text).join('').trim()
  return plainText ? { key, text: plainText, segments } : null
}

function parseRichContent(value: unknown): ArticleRichContentItem[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 40) return null
  const content: ArticleRichContentItem[] = []
  let list: Extract<ArticleRichContentItem, { type: 'list' }> | undefined
  for (const block of value) {
    if (!isRecord(block)) return null
    const line = parseLine(block)
    if (!line) return null
    if (block.listItem !== undefined) {
      if ((block.listItem !== 'bullet' && block.listItem !== 'number') || (block.level !== undefined && block.level !== 1)) return null
      const style = block.listItem as 'bullet' | 'number'
      if (!list || list.style !== style) {
        list = { key: `list-${line.key}`, type: 'list', style, items: [] }
        content.push(list)
      }
      list.items.push(line)
      continue
    }
    list = undefined
    if (block.style === undefined || block.style === 'normal') content.push({ ...line, type: 'paragraph' })
    else if (block.style === 'h2' || block.style === 'h3') content.push({ ...line, type: 'heading', level: block.style === 'h2' ? 2 : 3 })
    else return null
  }
  return content
}

function parseSection(value: unknown): ArticleDetailSection | null {
  if (!isRecord(value)) return null
  const key = text(value.key, 1, 120)
  if (!key) return null
  if (value.type === 'articleRichTextSection') {
    const heading = optionalText(value.heading, 4, 60)
    const content = parseRichContent(value.content)
    return heading !== null && content ? { key, type: 'richTextSection', heading, content } : null
  }
  if (value.type === 'articleSplitMediaSection') {
    const heading = optionalText(value.heading, 4, 60)
    const image = parseImage(value.image, 160, true)
    const content = parseRichContent(value.content)
    return heading !== null && image && content && (value.mediaSide === 'start' || value.mediaSide === 'end')
      ? { key, type: 'splitMediaSection', heading, image, mediaSide: value.mediaSide, content }
      : null
  }
  if (value.type === 'articleWideImageSection') {
    const image = parseImage(value.image, 160, true)
    const caption = optionalText(value.caption, 2, 160)
    return image && caption !== null ? { key, type: 'wideImageSection', image, caption } : null
  }
  return null
}

function parseRelatedArticle(value: unknown): RelatedArticleItem | null {
  if (!isRecord(value)) return null
  const id = text(value.id, 1, 200)
  const title = text(value.title, 4, 50)
  const slug = text(value.slug, 1, 80)
  const excerpt = text(value.excerpt, 30, 140)
  const category = parseCategory(value.category)
  const coverImage = parseImage(value.coverImage, 120, false)
  return id && !id.includes('.') && title && slug && slugPattern.test(slug) && excerpt && category && coverImage
    ? { id, title, slug, excerpt, category, coverImage }
    : null
}

export function parseArticleDetail(value: unknown, expectedSlug?: string): ArticleDetailContent | null {
  if (!isRecord(value)) return null
  const id = text(value.id, 1, 200)
  const title = text(value.title, 4, 50)
  const slug = text(value.slug, 1, 80)
  const excerpt = text(value.excerpt, 30, 140)
  const publishedAt = text(value.publishedAt, 10, 40)
  const category = parseCategory(value.category)
  const tags = Array.isArray(value.tags) ? value.tags.map(parseTag) : []
  const heroStyle = value.heroStyle
  const coverImage = value.coverImage === undefined || value.coverImage === null
    ? undefined
    : parseImage(value.coverImage, 120, false)
  const body = Array.isArray(value.body) ? value.body.map(parseSection) : []
  const bodyKeys = body.flatMap(section => section ? [section.key] : [])
  const tagSlugs = tags.flatMap(tag => tag ? [tag.slug] : [])
  if (!id || id.includes('.') || !title || !slug || !slugPattern.test(slug) || expectedSlug && slug !== expectedSlug
    || !excerpt || !publishedAt || !Number.isFinite(Date.parse(publishedAt)) || !category
    || tags.length < 1 || tags.length > 8 || tags.some(tag => !tag) || new Set(tagSlugs).size !== tagSlugs.length
    || heroStyle !== 'overlay' && heroStyle !== 'split' || value.coverImage && !coverImage || heroStyle === 'overlay' && !coverImage
    || body.length < 1 || body.length > 30 || body.some(section => !section) || new Set(bodyKeys).size !== bodyKeys.length) return null

  const relatedArticles: RelatedArticleItem[] = []
  const relatedIds = new Set<string>()
  for (const candidate of Array.isArray(value.relatedArticles) ? value.relatedArticles.slice(0, 8) : []) {
    const related = parseRelatedArticle(candidate)
    if (!related || related.id === id || related.slug === slug || relatedIds.has(related.id)) continue
    relatedIds.add(related.id)
    relatedArticles.push(related)
  }
  const seoTitle = optionalText(value.seoTitle, 10, 60)
  const seoDescription = optionalText(value.seoDescription, 50, 160)
  const shareImage = value.shareImage ? parseImage(value.shareImage, 120, false) : undefined
  const seo = seoTitle || seoDescription || shareImage ? {
    title: seoTitle ?? undefined,
    description: seoDescription ?? undefined,
    shareImage,
  } : undefined
  return {
    id,
    title,
    slug,
    excerpt,
    publishedAt,
    category,
    tags: tags as ArticleTag[],
    heroStyle,
    coverImage,
    body: body as ArticleDetailSection[],
    relatedArticles,
    seo,
  }
}
