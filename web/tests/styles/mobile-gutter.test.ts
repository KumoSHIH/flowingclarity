import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) => (
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')
)

const mobileSurfacePaths = [
  '../../app/components/AboutOverview.vue',
  '../../app/components/ArticleDetail.vue',
  '../../app/components/ArticleOverview.vue',
  '../../app/components/CourseDetail.vue',
  '../../app/components/CourseOverview.vue',
  '../../app/components/DetailBreadcrumb.vue',
  '../../app/components/EventDetail.vue',
  '../../app/components/EventOverview.vue',
  '../../app/components/HomeBanner.vue',
  '../../app/components/HomeContact.vue',
  '../../app/components/HomeCourses.vue',
  '../../app/components/HomeEvents.vue',
  '../../app/components/HomeIntroduction.vue',
  '../../app/components/SessionDetail.vue',
  '../../app/components/SessionOverview.vue',
  '../../app/components/SharedRelatedArticles.vue',
  '../../app/components/SharedTestimonials.vue',
  '../../app/components/SiteFooter.vue',
  '../../app/components/SiteFooterUnavailable.vue',
  '../../app/components/SiteHeader.vue',
]

describe('shared mobile page gutter', () => {
  it('defines one 20px mobile page gutter and routes shared detail spacing through it', () => {
    const stylesheet = read('../../app/assets/css/main.css')

    expect(stylesheet).toContain('--page-gutter-mobile: 20px;')
    expect(stylesheet).toContain('--detail-hero-padding-inline: var(--page-gutter-mobile);')
    expect(stylesheet).toContain('--detail-content-padding-inline: var(--page-gutter-mobile);')
    expect(stylesheet).toContain('--detail-rail-row-padding: 22px var(--page-gutter-mobile);')
  })

  it.each(mobileSurfacePaths)('%s uses the shared mobile page gutter', (componentPath) => {
    expect(read(componentPath)).toContain('var(--page-gutter-mobile)')
  })
})
