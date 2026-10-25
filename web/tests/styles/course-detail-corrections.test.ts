import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), 'app/components/CourseDetail.vue'),
  'utf8',
)
const sharedCarouselSource = readFileSync(
  resolve(process.cwd(), 'app/components/SharedImageTextCarousel.vue'),
  'utf8',
)

describe('course detail correction styles', () => {
  it('lets introduction and teacher leads use their available content width', () => {
    expect(source).not.toMatch(/\.course-intro \.lede\s*\{[^}]*max-width:/)
    expect(source).not.toMatch(/\.course-teacher \.lede\s*\{[^}]*max-width:/)
  })

  it('keeps the teacher surface full-width while limiting the portrait image', () => {
    expect(source).toMatch(/\.course-teacher__portrait\s*\{[^}]*background: var\(--color-bark\);/)
    expect(source).toMatch(/\.course-teacher__portrait img\s*\{\s*max-width: 500px;/)
  })

  it('does not render or position a course gallery footer', () => {
    expect(source).not.toMatch(/<footer>[\s\S]*?galleryLayoutLabels/)
    expect(source).not.toMatch(/\.gallery-panel(?:--[\w-]+)? footer/)
  })

  it('centers the course video in a responsive 760px container', () => {
    expect(source).toMatch(/\.course-video__inner\s*\{[^}]*width: min\(100%, 760px\);[^}]*margin-inline: auto;/)
    expect(source).toMatch(/\.course-video__media\s*\{[^}]*aspect-ratio: 16 \/ 9;/)
  })

  it('centers the schedule in a constrained reading width without a first-stage top rule', () => {
    expect(source).toMatch(/\.course-schedule\s*\{[^}]*min-height: 100svh;[^}]*align-items: center;/)
    expect(source).toMatch(/\.course-schedule__inner\s*\{[^}]*width: min\(100%, 900px\);[^}]*margin-inline: auto;/)
    expect(source).toMatch(/\.course-detail \.course-schedule \.course-schedule__intro h2\s*\{[^}]*font-size: var\(--type-title-lg-size\);/)
    expect(source).toMatch(/class="schedule-session__location"/)
    expect(source).toMatch(/class="schedule-session__footer"/)
    expect(source).not.toMatch(/\.schedule-stage-list\s*\{[^}]*border-top:/)
    expect(source).toMatch(/\.schedule-stage-list > div\s*\{[^}]*border-bottom: 1px solid var\(--line\);/)
  })

  it('uses the schedule reading width for the introduction and course testimonials', () => {
    expect(source).toMatch(/\.course-intro\s*\{[^}]*min-height: clamp\(720px, 82svh, 900px\);[^}]*align-items: center;/)
    expect(source).toMatch(/\.course-intro__inner\s*\{[^}]*width: min\(100%, 900px\);[^}]*margin-inline: auto;/)
    expect(source).toMatch(/\.course-intro__inner > h2,\s*\.course-intro__body\s*\{[^}]*margin-inline: auto;/)
    expect(source).not.toMatch(/\.course-intro__inner > h2,\s*\.course-intro__body\s*\{[^}]*width:/)
    expect(source).toMatch(/\.course-testimonials :deep\(\.shared-testimonials\)\s*\{[^}]*width: min\(100%, 900px\);[^}]*margin-inline: auto;/)
    expect(source).not.toMatch(/\.course-testimonials :deep\(\.shared-testimonials__list\)/)
  })

  it('keeps the shared course carousel timing in sync', () => {
    expect(sharedCarouselSource).toContain('const AUTOPLAY_DELAY_MS = 2_500')
    expect(sharedCarouselSource).toContain('const SLIDE_TRANSITION_MS = 2_000')
    expect(sharedCarouselSource).toMatch(/transition: transform 2000ms /)
  })

  it('uses semantic typography roles without local numeric font sizes', () => {
    expect(source).not.toMatch(/font-size:\s*(?:\d+(?:\.\d+)?(?:px|rem|em)|clamp\()/)
    expect(source).not.toMatch(/font-size:\s*var\(--detail-(?:hero-title|summary|section-title|body)-size\)/)
    expect(source).toContain('font-size: var(--type-title-xl-size);')
    expect(source).toContain('font-size: var(--type-title-lg-size);')
    expect(source).toContain('font-size: var(--type-title-md-size);')
    expect(source).toContain('font-size: var(--type-title-sm-size);')
    expect(source).toContain('font-size: var(--type-body-size);')
    expect(source).toContain('font-size: var(--type-meta-size);')
  })

  it('uses one responsive spacing rhythm across course content sections', () => {
    expect(source).toMatch(/--course-section-block: 96px;/)
    expect(source).toMatch(/--course-section-inline: clamp\(42px, 7vw, 112px\);/)
    expect(source).toMatch(/@media \(max-width: 767px\)[\s\S]*--course-section-block: 40px;[\s\S]*--course-section-inline: var\(--page-gutter-mobile\);/)
    expect(source.match(/padding-block: var\(--course-section-block\);/g)).toHaveLength(10)
    expect(source.match(/padding-inline: var\(--course-section-inline\);/g)).toHaveLength(10)
    expect(source).toMatch(/--carousel-section-block: var\(--course-section-block\);/)
    expect(source).toMatch(/--related-section-block: var\(--course-section-block\);/)
  })

  it('keeps the tablet hero title inside equal horizontal gutters', () => {
    expect(source).toMatch(/@media \(max-width: 1099px\)[\s\S]*\.course-hero h1\s*\{[^}]*left: 50px;[^}]*width: calc\(100vw - 100px\);/)
  })
})
