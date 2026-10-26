import { readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const appRoot = resolve(process.cwd(), 'app')

const vueFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      return vueFiles(path)
    }

    return extname(entry.name) === '.vue' ? [path] : []
  })

const imageTags = vueFiles(appRoot).flatMap((path) => {
  const source = readFileSync(path, 'utf8')

  return [...source.matchAll(/<(?:img|NuxtImg)\b[\s\S]*?(?:\/>|>)/g)].map(
    ([tag]) => ({ path: relative(process.cwd(), path), tag }),
  )
})

describe('image loading performance', () => {
  it('gives every rendered image an explicit loading and async decoding strategy', () => {
    expect(imageTags.length).toBeGreaterThan(0)

    for (const image of imageTags) {
      expect.soft(image.tag, image.path).toMatch(/loading="(?:lazy|eager)"/)
      expect.soft(image.tag, image.path).toContain('decoding="async"')
    }
  })

  it('keeps high-priority image fetches eager', () => {
    const highPriorityImages = imageTags.filter(({ tag }) =>
      tag.includes('fetchpriority="high"'),
    )

    expect(highPriorityImages.length).toBeGreaterThan(0)

    for (const image of highPriorityImages) {
      expect.soft(image.tag, image.path).toContain('loading="eager"')
    }
  })
})
