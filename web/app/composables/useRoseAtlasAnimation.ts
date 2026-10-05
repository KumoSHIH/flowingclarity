import { onBeforeUnmount, onMounted, type Ref } from 'vue'

type Point = readonly [number, number]
type Petal = readonly [Point, Point, Point, Point]

// Curves traced in the 2000 × 1786 plate's normalized coordinates.
// Apply the same centered cover transform as the image when the atlas resizes.
const petals: readonly Petal[] = [
  [[0.31, 0.40], [0.39, 0.34], [0.32, 0.10], [0.56, 0.16]],
  [[0.45, 0.53], [0.39, 0.35], [0.58, 0.27], [0.70, 0.29]],
  [[0.48, 0.55], [0.37, 0.59], [0.29, 0.45], [0.28, 0.52]],
  [[0.48, 0.60], [0.57, 0.67], [0.73, 0.72], [0.74, 0.57]],
  [[0.62, 0.44], [0.76, 0.43], [0.77, 0.61], [0.67, 0.59]],
  [[0.22, 0.40], [0.13, 0.63], [0.30, 0.66], [0.40, 0.69]],
]

interface Ripple {
  x: number
  y: number
  radius: number
  age: number
}

export function useRoseAtlasAnimation(
  atlas: Ref<HTMLElement | null>,
  canvas: Ref<HTMLCanvasElement | null>,
) {
  let context: CanvasRenderingContext2D | null = null
  let width = 0
  let height = 0
  let frame: number | null = null
  let previousTime: number | null = null
  let elapsed = 0
  let visible = false
  let reduced = false
  let mobile = false
  let ripples: Ripple[] = []
  let dispose = () => {}

  const clear = () => context?.clearRect(0, 0, width, height)
  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    previousTime = null
  }
  const schedule = () => {
    if (context && visible && !document.hidden && width > 0 && height > 0
      && (!reduced || ripples.length > 0) && frame === null) {
      frame = requestAnimationFrame(draw)
    }
  }

  function draw(time: number) {
    frame = null
    if (!context || !visible || document.hidden) return
    const delta = previousTime === null ? 0 : Math.min(time - previousTime, 50)
    previousTime = time
    elapsed += delta
    clear()

    if (!reduced) {
      const scale = Math.max(width / 2000, height / 1786)
      const imageWidth = 2000 * scale
      const imageHeight = 1786 * scale
      const count = mobile ? 3 : 6
      for (let index = 0; index < count; index++) {
        const path = petals[index]!
        const phase = (elapsed / (24000 + index * 2500) + index / count) % 1
        const t = phase < 0.5 ? phase * 2 : (1 - phase) * 2
        const u = 1 - t
        const coordinate = (axis: 0 | 1) => u ** 3 * path[0][axis]
          + 3 * u ** 2 * t * path[1][axis]
          + 3 * u * t ** 2 * path[2][axis] + t ** 3 * path[3][axis]
        const x = coordinate(0) * imageWidth + (width - imageWidth) / 2
        const y = coordinate(1) * imageHeight + (height - imageHeight) / 2
        const slowPulse = Math.sin(elapsed / (720 + index * 83) + index * 1.9)
        const quickFlicker = Math.sin(elapsed / (230 + index * 29) + index * 0.73)
        const intensity = 0.5 + slowPulse * 0.34 + quickFlicker * 0.16
        const glowRadius = (mobile ? 9 : 13) + intensity * (mobile ? 4 : 7)
        const glow = context.createRadialGradient(x, y, 0, x, y, glowRadius)
        glow.addColorStop(0, 'rgb(255 255 238 / 100%)')
        glow.addColorStop(0.14, 'rgb(255 251 201 / 96%)')
        glow.addColorStop(0.45, 'rgb(255 221 104 / 48%)')
        glow.addColorStop(1, 'rgb(255 195 70 / 0%)')
        context.globalCompositeOperation = 'lighter'
        context.globalAlpha = 0.48 + intensity * 0.48
        context.fillStyle = glow
        context.beginPath()
        context.arc(x, y, glowRadius, 0, Math.PI * 2)
        context.fill()
      }
      context.globalCompositeOperation = 'source-over'
    }

    const duration = reduced ? 180 : 700
    ripples = ripples.filter((ripple) => {
      ripple.age += delta
      if (ripple.age >= duration) return false
      const progress = ripple.age / duration
      context!.globalAlpha = (1 - progress) * 0.7
      context!.strokeStyle = '#fff8e7'
      context!.lineWidth = 1.5
      context!.beginPath()
      context!.arc(ripple.x * width, ripple.y * height,
        ripple.radius + (reduced ? 0 : 30 * (1 - (1 - progress) ** 3)), 0, Math.PI * 2)
      context!.stroke()
      return true
    })
    context.globalAlpha = 1
    context.globalCompositeOperation = 'source-over'
    schedule()
  }

  function rippleFrom(event: MouseEvent) {
    if (!context || !atlas.value || !visible || document.hidden || !width || !height) return
    const button = event.currentTarget
    if (!(button instanceof HTMLElement)) return
    const marker = button.querySelector('.atlas-category__marker')
    if (!marker) return
    const bounds = atlas.value.getBoundingClientRect()
    const origin = marker.getBoundingClientRect()
    // Bound rapid input without delaying category selection or starting extra loops.
    ripples = ripples.slice(-3)
    ripples.push({
      x: (origin.left + origin.width / 2 - bounds.left) / width,
      y: (origin.top + origin.height / 2 - bounds.top) / height,
      radius: origin.width / 2,
      age: 0,
    })
    schedule()
  }

  onMounted(() => {
    if (!canvas.value || !atlas.value) return
    context = canvas.value.getContext('2d')
    if (!context) return
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobileQuery = window.matchMedia('(max-width: 1023px)')
    const resize = () => {
      const bounds = atlas.value!.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.value!.width = Math.round(width * ratio)
      canvas.value!.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      ripples = []
      schedule()
    }
    const preferences = () => {
      reduced = motionQuery.matches
      mobile = mobileQuery.matches
      stop()
      ripples = []
      clear()
      schedule()
    }
    const visibility = () => {
      if (document.hidden || !visible) {
        stop()
        ripples = []
        clear()
      } else schedule()
    }
    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      visibility()
    })
    preferences()
    resize()
    resizeObserver.observe(atlas.value)
    intersectionObserver.observe(atlas.value)
    motionQuery.addEventListener('change', preferences)
    mobileQuery.addEventListener('change', preferences)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('resize', resize)
    dispose = () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      motionQuery.removeEventListener('change', preferences)
      mobileQuery.removeEventListener('change', preferences)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('resize', resize)
      ripples = []
      context = null
    }
  })

  onBeforeUnmount(() => dispose())
  return { rippleFrom }
}
