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

  it('keeps primary actions regular weight at 18px desktop and 14px mobile', () => {
    const stylesheet = read('../../app/assets/css/main.css')
    const courseDetail = read('../../app/components/CourseDetail.vue')
    const eventDetail = read('../../app/components/EventDetail.vue')
    const sessionDetail = read('../../app/components/SessionDetail.vue')

    expect(stylesheet).toContain('--button-primary-size: 18px;')
    expect(stylesheet).toMatch(/@media \(max-width: 1023px\)[\s\S]*--button-primary-size: 14px;/)
    expect(stylesheet).toMatch(/button \{\s*font-weight: 400;/)
    expect(stylesheet).toMatch(/\.button-primary \{[\s\S]*?font-weight: 400;/)
    expect(courseDetail).not.toContain('primary-action')
    expect(courseDetail.match(/class="button-primary(?:\s|")/g)).toHaveLength(4)
    expect(stylesheet).toContain('.button-primary:is(:disabled, [aria-disabled="true"])')
    expect(stylesheet).toContain('.button-primary:not(:disabled):not([aria-disabled="true"]):is(:hover, :focus-visible) .button-primary__icon')
    expect(courseDetail).toMatch(/\.curriculum-list button span \{[^}]*font-weight: 400;/)
    expect(courseDetail).toMatch(/\.curriculum-list button strong \{[^}]*font-weight: 400;/)
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
})
