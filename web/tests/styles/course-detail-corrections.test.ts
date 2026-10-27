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
    expect(source).toMatch(/\.course-teacher__portrait img\.course-teacher__portrait-image--non-portrait\s*\{[^}]*width: 100%;[^}]*max-width: none;[^}]*height: auto;[^}]*object-fit: contain;/)
    expect(source).toMatch(/block\.image\.width >= block\.image\.height/)
  })

  it('constrains portrait banner images at each responsive height without distortion', () => {
    expect(source).toMatch(/\.course-hero__visual--portrait\s*\{[^}]*height: 720px;[^}]*min-height: 0;[^}]*overflow: visible;/)
    expect(source).toMatch(/\.course-hero h1\s*\{[^}]*right: -100px;/)
    expect(source).toMatch(/@media \(max-width: 1099px\)[\s\S]*\.course-hero__visual--portrait\s*\{[^}]*height: 610px;[^}]*min-height: 0;/)
    expect(source).toMatch(/@media \(max-width: 767px\)[\s\S]*\.course-hero__visual--portrait\s*\{[^}]*height: 430px;[^}]*min-height: 0;/)
    expect(source).toMatch(/\.course-detail img\s*\{[^}]*width: 100%;[^}]*height: 100%;[^}]*object-fit: cover;/)
  })

  it('does not render or position a course gallery footer', () => {
    expect(source).not.toMatch(/<footer>[\s\S]*?galleryLayoutLabels/)
    expect(source).not.toMatch(/\.gallery-panel(?:--[\w-]+)? footer/)
  })

  it('separates the stages and folio headers from their image grids', () => {
    expect(source).toMatch(/:class="\['course-gallery', `course-gallery--\$\{block\.layout\}`\]"/)
    expect(source).toMatch(/\.course-gallery--stages > header,\s*\.course-gallery--folio > header\s*\{[^}]*padding-bottom: 28px;[^}]*border-bottom: 1px solid var\(--line\);/)
  })

  it('uses the approved folio group and item title hierarchy', () => {
    expect(source).toMatch(/\.gallery-panel--folio \.gallery-item__copy > span\s*\{[^}]*font-size: var\(--type-title-sm-size\);/)
    expect(source).toMatch(/\.gallery-panel--folio \.gallery-item__copy h3\s*\{[^}]*font-size: var\(--type-body-size\);/)
    expect(source).toMatch(/\.gallery-panel--folio \.gallery-item__copy\s*\{[^}]*padding: 18px 20px 0;/)
    expect(source).toMatch(/@media \(max-width: 1099px\)[\s\S]*\.gallery-panel--folio \.gallery-item__copy\s*\{[^}]*padding: 18px 0px 0;/)
  })

  it('uses full-width gallery images on mobile for the manually approved layouts', () => {
    expect(source).toMatch(/@media \(max-width: 767px\)[\s\S]*\.gallery-panel--stages \.gallery-item:nth-child\(even\),\s*\.gallery-panel--folio \.gallery-item:nth-child\(even\)\s*\{[^}]*width: 100%;/)
    expect(source).toMatch(/@media \(max-width: 767px\)[\s\S]*\.gallery-panel--weave figure\s*\{[^}]*width: 100%;/)
    expect(source).toMatch(/@media \(max-width: 767px\)[\s\S]*\.gallery-panel--dossier \.gallery-item figure\s*\{[^}]*width: 100%;/)
  })

  it('caps registration image height and preserves its ratio at each breakpoint', () => {
    expect(source).toMatch(/\.course-registration figure\s*\{[^}]*align-self: center;[^}]*height: 600px;[^}]*max-height: 600px;[^}]*min-height: 0;[^}]*overflow: hidden;/)
    expect(source).toMatch(/\.course-registration figure img\s*\{[^}]*object-fit: cover;/)
    expect(source).toMatch(/@media \(max-width: 1099px\)[\s\S]*\.course-registration figure\s*\{[^}]*height: 520px;[^}]*max-height: 520px;/)
    expect(source).toMatch(/@media \(max-width: 767px\)[\s\S]*\.course-registration figure\s*\{[^}]*height: 430px;[^}]*max-height: 430px;/)
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

  it('uses the schedule reading width without forcing introduction height', () => {
    expect(source).toMatch(/\.course-intro\s*\{[^}]*align-items: center;/)
    expect(source).not.toMatch(/\.course-intro\s*\{[^}]*min-height: clamp\(720px, 82svh, 900px\);/)
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
