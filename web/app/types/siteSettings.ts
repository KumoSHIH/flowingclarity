import type { SiteNavigationItem } from '../constants/siteNavigation'

export interface SiteSettings {
  brandName: string
  brandLogo?: { src: string; width: number; height: number }
  brandMessages: { englishStatement: string; closingStatement?: string }
  contact?: { address?: string; phone?: { display: string; href: string }; email?: string }
  socialLinks: { label: string; href: string }[]
  navigationItems: readonly SiteNavigationItem[]
  legal: { copyrightText: string }
}
