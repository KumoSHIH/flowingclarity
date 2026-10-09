import { computed } from 'vue'
import type { SiteSettingsResponse } from '../../shared/types/siteSettings'

export function useSiteSettings() {
  const response = useFetch<SiteSettingsResponse>('/api/site-settings', { key: 'site-settings' })
  return { ...response, settings: computed(() => response.data.value?.state === 'ready' ? response.data.value.content : null) }
}
