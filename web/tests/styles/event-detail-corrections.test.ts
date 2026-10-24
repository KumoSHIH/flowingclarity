import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) => (
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')
)

const ruleBody = (source: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? ''
}

describe('event detail correction styles', () => {
  const eventDetail = read('../../app/components/EventDetail.vue')
  const testimonials = read('../../app/components/SharedTestimonials.vue')
  const eventOverview = read('../../app/components/EventOverview.vue')

  it('uses uninterrupted rules for testimonials and the agenda', () => {
    expect(ruleBody(testimonials, '.shared-testimonials > h2')).not.toContain('border-bottom')
    expect(ruleBody(testimonials, 'blockquote:last-child')).toContain('border-bottom: 0')
    expect(ruleBody(eventDetail, '.event-detail__agenda')).not.toContain('border-top')
  })

  it('lets the hero image use its intrinsic height and reduces mobile fact values', () => {
    expect(ruleBody(eventDetail, '.event-detail__hero-media')).not.toContain('min-height')
    expect(eventDetail).not.toMatch(/\.event-detail__hero-media\s*\{[^}]*min-height/)
    expect(ruleBody(eventDetail, '.event-detail__hero-media img')).toContain('height: auto')
    expect(eventDetail).toMatch(/@media \(max-width: 560px\)[\s\S]*?\.event-detail__fact dd\s*\{\s*font-size: var\(--type-body-size\);/)
  })

  it('keeps hover feedback without underlining event titles', () => {
    expect(ruleBody(eventOverview, '.event-row__copy h4')).not.toContain('text-decoration')
    expect(ruleBody(eventOverview, '.event-row__copy:is(:hover, :focus-visible) h4')).not.toContain('text-decoration')
  })

  it('gives the registration arrow a visible interaction and reduced-motion fallback', () => {
    const stylesheet = read('../../app/assets/css/main.css')

    expect(eventDetail).toContain('class="event-detail__action button-primary"')
    expect(eventDetail).toContain('class="button-primary__icon"')
    expect(stylesheet).toContain('transform: translateX(4px)')
    expect(stylesheet).toMatch(/prefers-reduced-motion[\s\S]*?button-primary__icon[^}]*transition: none/)
  })
})
