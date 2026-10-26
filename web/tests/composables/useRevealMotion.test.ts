import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  animateRevealElement,
  prepareRevealElement,
} from '../../app/composables/useRevealMotion'

const animation = {
  cancel: vi.fn(),
  finished: Promise.resolve(),
} as unknown as Animation

afterEach(() => {
  vi.restoreAllMocks()
})

describe('reveal motion', () => {
  it('keeps registered content hidden until it enters the viewport', () => {
    const title = document.createElement('h2')

    prepareRevealElement(title)

    expect(title.style.opacity).toBe('0')
    expect(title.dataset.revealMotion).toBe('pending')
  })

  it('uses opacity-only keyframes for every content reveal', () => {
    const title = document.createElement('h2')
    const animate = vi.fn().mockReturnValue(animation)
    Object.defineProperty(title, 'animate', { value: animate })
    prepareRevealElement(title)

    animateRevealElement(title, false)

    expect(animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      expect.objectContaining({ duration: 800 }),
    )
    expect(title.style.opacity).toBe('')
    expect(title.dataset.revealMotion).toBe('visible')
  })

  it('uses a shorter opacity-only reveal when reduced motion is requested', () => {
    const group = document.createElement('div')
    group.innerHTML = '<h2>課程探索</h2><p>依照此刻的需要選擇方向。</p>'
    const title = group.querySelector<HTMLElement>('h2')!
    const animate = vi.fn().mockReturnValue(animation)
    Object.defineProperty(title, 'animate', { value: animate })

    animateRevealElement(title, true)

    expect(animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      expect.objectContaining({ duration: 300, delay: 0 }),
    )
  })
})
