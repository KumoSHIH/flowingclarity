export interface SiteNavigationItem {
  label: string
  href: string
  accessibleLabel?: string
}

export interface SiteSettings {
  brandName: string
  brandDestination?: string
  brandLogo?: { src: string; width: number; height: number }
  footerLogo?: { src: string; width: number; height: number }
  brandMessages: { englishStatement: string; closingStatement?: string }
  contact?: {
    address?: string
    phone?: { display: string; href: string }
    email?: string
    businessHours?: { days: string; hours: string }[]
    businessHoursNote?: string
    map?: { placeName: string; embedUrl: string; externalUrl: string }
  }
  socialLinks: { label: string; href: string }[]
  navigationItems: readonly SiteNavigationItem[]
  legal: { copyrightText: string }
}

export interface SiteSettingsResponse {
  state: 'ready' | 'empty' | 'invalid' | 'error' | 'unconfigured'
  content: SiteSettings | null
}
