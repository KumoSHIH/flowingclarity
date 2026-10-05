import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  watch,
  type Ref,
} from 'vue'

interface UseSiteHeaderOptions {
  alwaysVisible: Ref<boolean>
  revealAfter: Ref<HTMLElement | null>
  menuButton: Ref<HTMLButtonElement | null>
  navigation: Ref<HTMLElement | null>
}

export function useSiteHeader({
  alwaysVisible,
  revealAfter,
  menuButton,
  navigation,
}: UseSiteHeaderOptions) {
  const isPastRevealTarget = ref(false)
  const usesCompactHeader = ref(false)
  const mobileMenuIsOpen = ref(false)
  const isVisible = computed(
    () => alwaysVisible.value || usesCompactHeader.value || isPastRevealTarget.value,
  )

  let revealObserver: IntersectionObserver | null = null
  let compactHeaderMedia: MediaQueryList | null = null
  let stopWatchingRevealTarget: (() => void) | null = null

  const setMobileMenuOpen = (isOpen: boolean) => {
    mobileMenuIsOpen.value = isOpen
    document.documentElement.classList.toggle('home-menu-open', isOpen)
  }

  const openMobileMenu = () => {
    setMobileMenuOpen(true)
    void nextTick(() => navigation.value?.querySelector<HTMLElement>('a')?.focus())
  }

  const closeMobileMenu = (restoreFocus = false) => {
    if (!mobileMenuIsOpen.value) return

    setMobileMenuOpen(false)
    if (restoreFocus) void nextTick(() => menuButton.value?.focus())
  }

  const toggleMobileMenu = () => {
    if (mobileMenuIsOpen.value) {
      closeMobileMenu()
      return
    }

    openMobileMenu()
  }

  const syncCompactHeader = (event: MediaQueryListEvent | MediaQueryList) => {
    usesCompactHeader.value = event.matches
    if (!event.matches) closeMobileMenu()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') closeMobileMenu(true)
  }

  const observeRevealTarget = (target: HTMLElement | null) => {
    revealObserver?.disconnect()
    revealObserver = null
    isPastRevealTarget.value = false

    if (!target) return

    revealObserver = new IntersectionObserver(
      ([entry]) => {
        isPastRevealTarget.value = !entry?.isIntersecting
      },
      { threshold: 0 },
    )
    revealObserver.observe(target)
  }

  onMounted(() => {
    compactHeaderMedia = window.matchMedia('(max-width: 1023px)')
    syncCompactHeader(compactHeaderMedia)
    compactHeaderMedia.addEventListener('change', syncCompactHeader)
    window.addEventListener('keydown', handleKeydown)

    stopWatchingRevealTarget = watch(revealAfter, observeRevealTarget, {
      immediate: true,
      flush: 'post',
    })
  })

  onBeforeUnmount(() => {
    revealObserver?.disconnect()
    compactHeaderMedia?.removeEventListener('change', syncCompactHeader)
    window.removeEventListener('keydown', handleKeydown)
    stopWatchingRevealTarget?.()
    document.documentElement.classList.remove('home-menu-open')
  })

  return {
    closeMobileMenu,
    isVisible,
    mobileMenuIsOpen: readonly(mobileMenuIsOpen),
    toggleMobileMenu,
    usesCompactHeader: readonly(usesCompactHeader),
  }
}
