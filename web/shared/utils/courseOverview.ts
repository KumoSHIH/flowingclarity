import type {
  CourseDeliveryMode,
  CourseImage,
  CourseOverviewCategory,
  CourseOverviewContent,
  CourseOverviewItem,
} from '../types/course'

const categoryDefinitions = {
  body: { name: '愛身體', slug: 'body', order: 1 },
  heart: { name: '撫慰心', slug: 'heart', order: 2 },
  life: { name: '究生命', slug: 'life', order: 3 },
  beauty: { name: '展現美', slug: 'beauty', order: 4 },
} as const

const deliveryModes = new Set<CourseDeliveryMode>(['inPerson', 'online'])
const courseSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const emptyCourseOverviewContent: CourseOverviewContent = {
  pageTitle: '課程探索',
  directoryPrompt: '想從哪裡開始？',
  categories: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function textInRange(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text.length >= min && text.length <= max ? text : null
}

function parseImage(value: unknown): CourseImage | undefined {
  if (!isRecord(value) || typeof value.src !== 'string' || typeof value.alt !== 'string') return undefined
  let url: URL
  try {
    url = new URL(value.src)
  } catch {
    return undefined
  }
  const alt = textInRange(value.alt, 2, 120)
  if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io' || !alt) return undefined

  const image: CourseImage = { src: url.toString(), alt }
  if (isRecord(value.hotspot)
    && typeof value.hotspot.x === 'number' && value.hotspot.x >= 0 && value.hotspot.x <= 1
    && typeof value.hotspot.y === 'number' && value.hotspot.y >= 0 && value.hotspot.y <= 1) {
    image.objectPosition = `${value.hotspot.x * 100}% ${value.hotspot.y * 100}%`
  }
  return image
}

function parseCourse(value: unknown): CourseOverviewItem | null {
  if (!isRecord(value) || value.isPublished !== true) return null
  const title = textInRange(value.title, 2, 40)
  const slug = textInRange(value.slug, 1, 60)
  const summary = textInRange(value.summary, 30, 100)
  const order = value.order
  if (!title || !slug || !courseSlugPattern.test(slug) || !summary
    || !Number.isInteger(order) || (order as number) < 1
    || !Array.isArray(value.deliveryModes)) return null

  const modes = value.deliveryModes.filter(
    (mode): mode is CourseDeliveryMode => typeof mode === 'string' && deliveryModes.has(mode as CourseDeliveryMode),
  )
  if (modes.length < 1 || modes.length > 2 || new Set(modes).size !== modes.length) return null

  return {
    title,
    slug,
    deliveryModes: modes,
    summary,
    image: parseImage(value.image),
    order: order as number,
    isPublished: true,
  }
}

function parseCategory(value: unknown): CourseOverviewCategory | null {
  if (!isRecord(value) || typeof value.key !== 'string') return null
  const key = value.key as keyof typeof categoryDefinitions
  const definition = categoryDefinitions[key]
  const summary = textInRange(value.summary, 20, 80)
  if (!definition || value.name !== definition.name || value.order !== definition.order
    || !summary || !Array.isArray(value.courses)) return null

  const seenSlugs = new Set<string>()
  const seenOrders = new Set<number>()
  const courses = value.courses
    .map(parseCourse)
    .filter((course): course is CourseOverviewItem => {
      if (!course || seenSlugs.has(course.slug) || seenOrders.has(course.order)) return false
      seenSlugs.add(course.slug)
      seenOrders.add(course.order)
      return true
    })
    .toSorted((first, second) => first.order - second.order)

  return {
    key,
    name: definition.name,
    slug: definition.slug,
    order: definition.order,
    summary,
    courses,
  }
}

export function parseCourseOverview(value: unknown): CourseOverviewContent | null {
  if (!isRecord(value) || !isRecord(value.page) || !Array.isArray(value.categories)) return null
  const pageTitle = textInRange(value.page.pageTitle, 4, 20)
  const directoryPrompt = textInRange(value.page.directoryPrompt, 4, 24)
  const endingMessage = value.page.endingMessage === undefined || value.page.endingMessage === null
    ? undefined
    : textInRange(value.page.endingMessage, 8, 40)
  if (!pageTitle || !directoryPrompt || endingMessage === null) return null

  const categories = value.categories.map(parseCategory)
  if (categories.some(category => !category)) return null
  const validCategories = categories as CourseOverviewCategory[]
  if (validCategories.length !== 4 || new Set(validCategories.map(category => category.key)).size !== 4) return null

  const seenCourseSlugs = new Set<string>()
  for (const category of validCategories) {
    category.courses = category.courses.filter((course) => {
      if (seenCourseSlugs.has(course.slug)) return false
      seenCourseSlugs.add(course.slug)
      return true
    })
  }

  return {
    pageTitle,
    directoryPrompt,
    categories: validCategories.toSorted((first, second) => first.order - second.order),
    endingMessage,
  }
}
