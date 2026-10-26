import {
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  type Ref,
} from 'vue'

export const REVEAL_TARGET_SELECTOR = [
  'main article',
  'main figure',
  'main blockquote',
  'main li',
  'main dl',
  'main table',
  'main form',
  'main nav',
  'main iframe',
  'main canvas',
  'main img',
  'main h1',
  'main h2',
  'main h3',
  'main p',
  'main a',
  'main button',
  'footer p',
  'footer address',
  'footer nav',
  'footer .site-footer__brand',
].join(', ')

const revealDelay = (element: Element) => {
  let sibling = element.previousElementSibling
  let index = 0

  while (sibling && index < 3) {
    if (sibling.matches(REVEAL_TARGET_SELECTOR)) index += 1
    sibling = sibling.previousElementSibling
  }

  return index * 8
}

export function prepareRevealElement(element: HTMLElement) {
  element.dataset.revealMotion = 'pending'
  element.style.opacity = '0'
}

export function animateRevealElement(
  element: HTMLElement,
  reduceMotion: boolean,
): Animation {
  const keyframes: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }]

  element.style.removeProperty('opacity')
  element.dataset.revealMotion = 'visible'

  return element.animate(keyframes, {
    duration: reduceMotion ? 300 : 800,
    delay: reduceMotion ? 0 : revealDelay(element),
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'backwards',
  })
}

export function useRevealMotion(root: Ref<HTMLElement | undefined>) {
  const registered = new WeakSet<HTMLElement>()
  const activeAnimations = new Set<Animation>()
  let intersectionObserver: IntersectionObserver | undefined
  let mutationObserver: MutationObserver | undefined
  let reduceMotion = false

  const reveal = (element: HTMLElement) => {
    if (typeof element.animate !== 'function') {
      element.style.removeProperty('opacity')
      element.dataset.revealMotion = 'visible'
      return
    }

    const animation = animateRevealElement(element, reduceMotion)
    activeAnimations.add(animation)
    void animation.finished
      .catch(() => undefined)
      .finally(() => activeAnimations.delete(animation))
  }

  const register = (element: HTMLElement) => {
    if (registered.has(element)) return

    const revealAncestor = element.parentElement?.closest(
      REVEAL_TARGET_SELECTOR,
    )
    if (revealAncestor && root.value?.contains(revealAncestor)) {
      element.style.removeProperty('opacity')
      delete element.dataset.revealMotion
      return
    }

    registered.add(element)
    prepareRevealElement(element)
    if (intersectionObserver) intersectionObserver.observe(element)
    else reveal(element)
  }

  const scan = (scope: ParentNode) => {
    if (scope instanceof HTMLElement && scope.matches(REVEAL_TARGET_SELECTOR)) {
      register(scope)
    }

    scope
      .querySelectorAll<HTMLElement>(REVEAL_TARGET_SELECTOR)
      .forEach(register)
  }

  onBeforeMount(() => {
    document
      .querySelectorAll<HTMLElement>(REVEAL_TARGET_SELECTOR)
      .forEach(prepareRevealElement)
  })

  onMounted(async () => {
    await nextTick()
    const container = root.value
    if (!container) return

    reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            intersectionObserver?.unobserve(entry.target)
            reveal(entry.target as HTMLElement)
          })
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      )
    }

    scan(container)

    mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node)
        })
      })
    })
    mutationObserver.observe(container, { childList: true, subtree: true })
  })

  onBeforeUnmount(() => {
    intersectionObserver?.disconnect()
    mutationObserver?.disconnect()
    activeAnimations.forEach((animation) => animation.cancel())
    activeAnimations.clear()
  })
}
