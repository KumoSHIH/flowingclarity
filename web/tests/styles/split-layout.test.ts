import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const overviewComponentPaths = [
  '../../app/components/CourseOverview.vue',
  '../../app/components/EventOverview.vue',
  '../../app/components/SessionOverview.vue',
]

function read(relativePath: string) {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')
}

describe('shared split layout', () => {
  it('defines one fixed desktop rail without a shared overview content cap', () => {
    const stylesheet = read('../../app/assets/css/main.css')

    expect(stylesheet).toContain('--split-layout-rail-width: 400px;')
    expect(stylesheet).not.toContain('--split-layout-content-max-width')
  })

  it.each(overviewComponentPaths)('%s keeps the rail flush left and lets its content fill the remaining column', (componentPath) => {
    const component = read(componentPath)

    expect(component).toContain(
      'grid-template-columns: var(--split-layout-rail-width) minmax(0, 1fr);',
    )
    expect(component).not.toContain('max-width: var(--split-layout-content-max-width);')
    expect(component).not.toContain('width: min(100%, var(--split-layout-max-width));')
    expect(component).not.toContain('margin-inline: auto;')
  })

  it('keeps the session detail outer layout full width while matching the detail content start', () => {
    const component = read('../../app/components/SessionDetail.vue')

    expect(component).toContain('calc((100% - var(--detail-layout-max-width)) / 2)')
    expect(component).not.toContain('width: min(100%, var(--split-layout-max-width));')
  })

  it('keeps the event detail page-specific centered layout', () => {
    const component = read('../../app/components/EventDetail.vue')

    expect(component).toContain('width: min(100%, var(--detail-layout-max-width));')
  })

  it('reflows event actions before the primary button can be compressed', () => {
    const component = read('../../app/components/EventOverview.vue')

    expect(component).toMatch(
      /@media \(min-width: 1024px\) and \(max-width: 1279px\)[\s\S]*grid-template-columns: 150px minmax\(0, 1fr\);/,
    )
    expect(component).toMatch(
      /@media \(min-width: 1280px\)[\s\S]*minmax\(\s*240px,\s*0\.85fr\s*\)/,
    )
    expect(component).toMatch(
      /@media \(max-width: 1023px\)[\s\S]*minmax\(200px, 0\.7fr\)/,
    )
    expect(component).toMatch(
      /\.event-row__action \.button-primary > span \{[\s\S]*?white-space: nowrap;/,
    )
  })

  it('clamps event summaries to three visual lines', () => {
    const component = read('../../app/components/EventOverview.vue')
    const summaryRule = component.match(/\.event-row__summary \{([\s\S]*?)\}/)?.[1]

    expect(summaryRule).toBeDefined()
    expect(summaryRule).toContain('display: -webkit-box;')
    expect(summaryRule).toContain('overflow: hidden;')
    expect(summaryRule).toContain('-webkit-line-clamp: 3;')
    expect(summaryRule).toContain('line-clamp: 3;')
  })

  it('keeps the shared detail widths and vertical spacing in sync', () => {
    const stylesheet = read('../../app/assets/css/main.css')
    const eventDetail = read('../../app/components/EventDetail.vue')
    const sessionDetail = read('../../app/components/SessionDetail.vue')

    expect(stylesheet).toContain('--detail-hero-padding-block-start: 84px;')
    expect(stylesheet).toContain('--detail-hero-padding-block-end: 84px;')
    expect(stylesheet).toContain('--detail-content-padding-block: 76px;')
    expect(stylesheet).toContain('--detail-hero-max-width: 1500px;')

    for (const component of [eventDetail, sessionDetail]) {
      expect(component).toContain('var(--detail-hero-padding-block-start)')
      expect(component).toContain('var(--detail-hero-padding-block-end)')
      expect(component).toContain('var(--detail-content-padding-block)')
      expect(component).toContain('var(--detail-content-padding-inline)')
    }

    expect(sessionDetail).toContain('width: min(100%, var(--detail-hero-max-width));')
    expect(sessionDetail).toContain('grid-template-columns: minmax(0, 1fr) minmax(280px, 30%);')
    expect(sessionDetail).not.toContain('margin-inline: auto;')
  })

  it('removes desktop hero padding, restores mobile padding, and removes the layout top border', () => {
    const sessionDetail = read('../../app/components/SessionDetail.vue')
    const layoutRule = sessionDetail.match(/\.session-detail__layout \{([\s\S]*?)\}/)?.[1]
    const heroRules = [...sessionDetail.matchAll(/\.session-detail__hero \{([\s\S]*?)\}/g)]
      .map(match => match[1])

    expect(heroRules[0]).toContain('padding-inline: 0;')
    expect(heroRules[1]).toContain('padding-inline: var(--detail-hero-padding-inline);')
    expect(layoutRule).toBeDefined()
    expect(layoutRule).not.toContain('border-top')
  })
})
