import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export function useFooterMotion(element: Ref<HTMLElement | null>) {
  const inView = ref(false)
  const visible = ref(false)
  const reduced = ref(false)
  let observer: IntersectionObserver | undefined
  let media: MediaQueryList | undefined
  const updateVisibility = () => { visible.value = !document.hidden }
  const updateMotion = () => { reduced.value = media?.matches ?? true }

  onMounted(() => {
    updateVisibility()
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
    updateMotion()
    media.addEventListener('change', updateMotion)
    document.addEventListener('visibilitychange', updateVisibility)
    if (element.value && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => { inView.value = Boolean(entry?.isIntersecting) })
      observer.observe(element.value)
    }
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    media?.removeEventListener('change', updateMotion)
    document.removeEventListener('visibilitychange', updateVisibility)
  })
  return { flowing: computed(() => inView.value && visible.value && !reduced.value), reduced }
}
