import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appRoot = resolve(process.cwd(), 'app')

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return ['.css', '.vue'].includes(extname(path)) ? [path] : []
  })
}

const read = (relativePath: string) => (
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')
)

describe('shared typography corrections', () => {
  it('uses fixed desktop and mobile font sizes instead of font-size clamps', () => {
    for (const path of sourceFiles(appRoot)) {
      const source = readFileSync(path, 'utf8')
      expect(source, path).not.toMatch(/font-size:\s*clamp\(/)
      expect(source, path).not.toMatch(/font:\s*[^;]*clamp\(/)
      expect(source, path).not.toMatch(/text-\[clamp\(/)
    }
  })

  it('keeps component font sizes on semantic role tokens', () => {
    for (const path of sourceFiles(appRoot).filter((path) => path.endsWith('.vue'))) {
      const source = readFileSync(path, 'utf8')
      expect(source, path).not.toMatch(/font-size:\s*\d+(?:\.\d+)?(?:px|rem|em)/)
      expect(source, path).not.toMatch(/font:\s*[^;]*\d+(?:\.\d+)?px/)
    }
  })

  it('keeps primary actions regular weight at 18px desktop and 14px mobile', () => {
    const stylesheet = read('../../app/assets/css/main.css')
    const courseDetail = read('../../app/components/CourseDetail.vue')
    const eventDetail = read('../../app/components/EventDetail.vue')
    const sessionDetail = read('../../app/components/SessionDetail.vue')

    expect(stylesheet).toContain('--button-primary-size: 18px;')
    expect(stylesheet).toMatch(/@media \(max-width: 1023px\)[\s\S]*--button-primary-size: 14px;/)
    expect(stylesheet).toContain('--button-small-size: 16px;')
    expect(stylesheet).toContain('--button-small-width: 170px;')
    expect(stylesheet).toContain('--button-small-height: 56px;')
    expect(stylesheet).toMatch(/@media \(max-width: 1023px\)[\s\S]*--button-small-size: 14px;/)
    expect(stylesheet).toMatch(/\.button-primary\.button-primary--small \{[\s\S]*?font-size: var\(--button-small-size\);/)
    expect(stylesheet).toMatch(/button \{\s*font-weight: 400;/)
    expect(stylesheet).toMatch(/\.button-primary \{[\s\S]*?font-weight: 400;/)
    expect(courseDetail).not.toContain('primary-action')
    expect(courseDetail.match(/class="button-primary(?:\s|")/g)).toHaveLength(4)
    expect(stylesheet).toContain('.button-primary:is(:disabled, [aria-disabled="true"])')
    expect(stylesheet).toContain('.button-primary:not(:disabled):not([aria-disabled="true"]):is(:hover, :focus-visible) .button-primary__icon')
    expect(courseDetail).toMatch(/\.curriculum-list button span \{[^}]*font-weight: var\(--type-body-weight\);/)
    expect(courseDetail).toMatch(/\.curriculum-list button strong \{[^}]*font-weight: var\(--type-body-weight\);/)
    expect(eventDetail).not.toMatch(/\.event-detail__action \{[^}]*font-weight:/)
    expect(sessionDetail).toContain('class="session-detail__booking button-primary"')
  })

  it('uses one semantic color token for content-title hover and focus states', () => {
    const stylesheet = read('../../app/assets/css/main.css')
    const eventOverview = read('../../app/components/EventOverview.vue')
    const relatedArticles = read('../../app/components/SharedRelatedArticles.vue')

    expect(stylesheet).toContain('--interactive-title-hover: var(--color-clay);')
    expect(eventOverview).toMatch(/\.event-row__copy:is\(:hover, :focus-visible\) h4 \{\s*color: var\(--interactive-title-hover\);/)
    expect(relatedArticles.match(/color: var\(--interactive-title-hover\);/g)).toHaveLength(2)
  })

  it('centralizes detail typography in semantic role tokens', () => {
    const stylesheet = read('../../app/assets/css/main.css')
    const migratedComponents = [
      read('../../app/components/ArticleDetail.vue'),
      read('../../app/components/ArticleRichTextContent.vue'),
      read('../../app/components/EventDetail.vue'),
      read('../../app/components/SessionDetail.vue'),
      read('../../app/components/CourseDetail.vue'),
      read('../../app/components/SharedRelatedArticles.vue'),
      read('../../app/components/SharedTestimonials.vue'),
    ]

    for (const role of ['meta', 'label', 'body', 'lead', 'title-sm', 'title-md', 'title-lg', 'title-xl']) {
      expect(stylesheet).toContain(`--type-${role}-size:`)
      expect(stylesheet).toContain(`.type-${role}`)
    }

    expect(stylesheet).toMatch(/@media \(max-width: 1023px\)[\s\S]*--type-title-xl-size: 42px;/)
    expect(stylesheet).toContain('--detail-hero-title-size: var(--type-title-xl-size);')
    expect(stylesheet).toContain('--detail-section-title-size: var(--type-title-md-size);')
    expect(stylesheet).toContain('--detail-body-size: var(--type-body-size);')

    for (const component of migratedComponents) {
      expect(component).not.toMatch(/font-size:\s*var\(--detail-(?:hero-title|summary|section-title|body)-size\)/)
    }

    expect(migratedComponents.join('\n')).toContain('type-title-xl')
    expect(migratedComponents.join('\n')).toContain('type-title-md')
    expect(migratedComponents.join('\n')).toContain('type-body')
  })

  it('centralizes home and overview typography in the same role tokens', () => {
    const stylesheet = read('../../app/assets/css/main.css')
    const migratedComponents = [
      'HomeBanner.vue',
      'HomeContact.vue',
      'HomeCourses.vue',
      'HomeEvents.vue',
      'HomeIntroduction.vue',
      'DirectoryIntro.vue',
      'ArticleOverview.vue',
      'CourseOverview.vue',
      'EventOverview.vue',
      'SessionOverview.vue',
    ].map((file) => read(`../../app/components/${file}`))

    expect(stylesheet).toContain('--display-title-size: var(--type-title-lg-size);')
    expect(stylesheet).toContain('--lead-text-size: var(--type-lead-size);')

    for (const component of migratedComponents) {
      expect(component).not.toMatch(/font-size:\s*(?:\d+(?:\.\d+)?(?:px|rem|em)|clamp\()/)
      expect(component).not.toMatch(/\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/)
      expect(component).not.toMatch(/text-\[(?:\d|clamp\()/)
    }

    expect(migratedComponents.join('\n')).toContain('var(--type-title-xl-size)')
    expect(migratedComponents.join('\n')).toContain('var(--type-title-lg-size)')
    expect(migratedComponents.join('\n')).toContain('var(--type-title-sm-size)')
    expect(migratedComponents.join('\n')).toContain('var(--type-body-size)')
    expect(migratedComponents.join('\n')).toContain('var(--type-meta-size)')
  })

  it('removes the final local type sizes from About, Header, and Footer', () => {
    const migratedComponents = [
      read('../../app/components/AboutOverview.vue'),
      read('../../app/components/SiteHeader.vue'),
      read('../../app/components/SiteFooter.vue'),
    ]

    for (const component of migratedComponents) {
      expect(component).not.toMatch(/font-size:\s*(?:\d+(?:\.\d+)?(?:px|rem|em)|clamp\()/)
      expect(component).not.toMatch(/font:\s*[^;]*\d+(?:\.\d+)?px/)
      expect(component).not.toMatch(/font-size:\s*var\(--detail-/)
    }

    const typography = migratedComponents.join('\n')
    expect(typography).toContain('var(--type-meta-size)')
    expect(typography).toContain('var(--type-label-size)')
    expect(typography).toContain('var(--type-body-size)')
    expect(typography).toContain('var(--type-lead-size)')
    expect(typography).toContain('var(--type-title-lg-size)')
    expect(typography).toContain('var(--type-title-xl-size)')
  })
})
