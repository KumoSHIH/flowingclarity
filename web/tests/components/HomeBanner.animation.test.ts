import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeBanner from '../../app/components/HomeBanner.vue'

const glow = { addColorStop: vi.fn() }
const context = {
  clearRect: vi.fn(), setTransform: vi.fn(), beginPath: vi.fn(),
  arc: vi.fn(), fill: vi.fn(), stroke: vi.fn(),
  createRadialGradient: vi.fn(() => glow),
  globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1,
  globalCompositeOperation: 'source-over',
}
let wrapper: VueWrapper | undefined
let frames: Map<number, FrameRequestCallback>
let intersect: (entries: { isIntersecting: boolean }[]) => void
let resize: () => void
let motion: MediaQueryList
let mobile: MediaQueryList
let hidden: boolean
const disconnect = vi.fn()

function step(time: number) {
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((callback) => callback(time))
}
function show() {
  intersect([{ isIntersecting: true }])
}
function media() {
  const target = new EventTarget()
  return Object.assign(target, { matches: false }) as MediaQueryList
}

beforeEach(() => {
  frames = new Map()
  let id = 0
  hidden = false
  motion = media()
  mobile = media()
  vi.stubGlobal('matchMedia', (query: string) => query.includes('reduced') ? motion : mobile)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (key: number) => frames.delete(key))
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof intersect) { intersect = callback }
    observe = vi.fn()
    disconnect = disconnect
  })
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback }
    observe = vi.fn()
    disconnect = disconnect
  })
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(3)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return (this.classList.contains('atlas-category__marker')
      ? { left: 150, top: 100, width: 40, height: 40 }
      : { left: 50, top: 20, width: 800, height: 600 }) as DOMRect
  })
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('rose atlas canvas', () => {
  it('preserves the image and semantics, caps DPR, and resizes with the atlas', () => {
    wrapper = mount(HomeBanner)
    const canvas = wrapper.get('canvas')
    expect(canvas.attributes('aria-hidden')).toBe('true')
    expect(canvas.attributes('tabindex')).toBeUndefined()
    expect(wrapper.get('.home-banner__plate').attributes('alt')).toContain('玫瑰')
    expect((canvas.element as HTMLCanvasElement).width).toBe(1600)
    expect((canvas.element as HTMLCanvasElement).height).toBe(1200)
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0)
    vi.spyOn(wrapper.get('.home-banner__atlas').element, 'getBoundingClientRect')
      .mockReturnValue({ left: 0, top: 0, width: 390, height: 500 } as DOMRect)
    resize()
    expect((canvas.element as HTMLCanvasElement).width).toBe(780)
    expect((canvas.element as HTMLCanvasElement).height).toBe(1000)
  })

  it('pauses offscreen and in hidden documents, resumes, and cleans up', () => {
    wrapper = mount(HomeBanner)
    expect(frames.size).toBe(0)
    show()
    step(0)
    expect(context.fill).toHaveBeenCalledTimes(6)
    expect(context.createRadialGradient).toHaveBeenCalledTimes(6)
    expect(glow.addColorStop).toHaveBeenCalledTimes(24)
    expect(context.globalCompositeOperation).toBe('source-over')
    expect(frames.size).toBe(1)
    intersect([{ isIntersecting: false }])
    expect(frames.size).toBe(0)
    show()
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    expect(frames.size).toBe(0)
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    expect(frames.size).toBe(1)
    wrapper.unmount()
    wrapper = undefined
    expect(frames.size).toBe(0)
    expect(disconnect).toHaveBeenCalledTimes(2)
    motion.dispatchEvent(new Event('change'))
    document.dispatchEvent(new Event('visibilitychange'))
    expect(frames.size).toBe(0)
  })

  it('uses fewer lights on mobile and reacts to preference changes', () => {
    Object.assign(mobile, { matches: true })
    wrapper = mount(HomeBanner)
    show()
    step(0)
    expect(context.fill).toHaveBeenCalledTimes(3)
    Object.assign(motion, { matches: true })
    motion.dispatchEvent(new Event('change'))
    expect(frames.size).toBe(0)
    Object.assign(motion, { matches: false })
    motion.dispatchEvent(new Event('change'))
    expect(frames.size).toBe(1)
  })

  it('uses marker coordinates for keyboard-generated clicks and bounds rapid feedback', async () => {
    wrapper = mount(HomeBanner)
    show()
    const buttons = wrapper.findAll('.atlas-category')
    for (let index = 0; index < 20; index++) {
      await buttons[index % 4]!.trigger('click', { detail: 0 })
    }
    expect(buttons[3]!.classes()).toContain('is-active')
    expect(buttons[0]!.classes()).not.toContain('is-active')
    expect(frames.size).toBe(1)
    step(0)
    expect(context.stroke).toHaveBeenCalledTimes(4)
    expect(context.arc).toHaveBeenCalledWith(120, 100, 20, 0, Math.PI * 2)
    context.stroke.mockClear()
    for (let time = 50; time <= 750; time += 50) step(time)
    context.stroke.mockClear()
    step(800)
    expect(context.stroke).not.toHaveBeenCalled()
  })

  it('only briefly fades a stationary ring with reduced motion, then stops rendering', async () => {
    Object.assign(motion, { matches: true })
    wrapper = mount(HomeBanner)
    show()
    expect(frames.size).toBe(0)
    await wrapper.get('.atlas-category').trigger('click')
    step(0)
    step(50)
    expect(context.fill).not.toHaveBeenCalled()
    expect(context.arc.mock.calls.every((call) => call[2] === 20)).toBe(true)
    step(100)
    step(150)
    step(200)
    expect(frames.size).toBe(0)
    expect(context.clearRect).toHaveBeenCalled()
  })

  it('keeps category selection working when canvas is unavailable', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    wrapper = mount(HomeBanner)
    await wrapper.get('.atlas-category--heart').trigger('click')
    expect(wrapper.get('.atlas-category--heart').classes()).toContain('is-active')
    expect(frames.size).toBe(0)
  })
})
