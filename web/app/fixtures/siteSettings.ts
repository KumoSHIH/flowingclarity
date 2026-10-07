import { siteNavigationItems } from '../constants/siteNavigation'
import type { SiteSettings } from '../types/siteSettings'

// Design fixtures only. These values have not been approved for publication.
export const siteSettingsFixture: SiteSettings = {
  brandName: '普那生活空間',
  brandLogo: { src: '/assets/logo-main.png', width: 896, height: 496 },
  brandMessages: {
    englishStatement: 'Pathways to creative arts and well-being',
    closingStatement: '留一點空白，讓感受抵達。',
  },
  contact: {
    address: '高雄市民生一路201號A棟2樓',
    phone: { display: '+886 934 031 389', href: 'tel:+886934031389' },
    email: 'nancypune@hotmail.com',
  },
  socialLinks: [],
  navigationItems: siteNavigationItems,
  legal: { copyrightText: 'Copyright © Flowing with Clarity. All Rights Reserved.' },
}

export const minimalSiteSettingsFixture: SiteSettings = {
  brandName: siteSettingsFixture.brandName,
  brandMessages: { englishStatement: siteSettingsFixture.brandMessages.englishStatement },
  socialLinks: [],
  navigationItems: siteNavigationItems,
  legal: siteSettingsFixture.legal,
}

export const longSiteSettingsFixture: SiteSettings = {
  ...siteSettingsFixture,
  brandName: '品牌名稱長文字排版測試用示範生活空間',
  brandMessages: {
    englishStatement: 'Exploring creative arts and well-being through everyday learning and connection',
    closingStatement: '留一點空白，讓身體與感受在每一天的生活裡慢慢抵達。',
  },
  contact: {
    address: '地址排版示範'.repeat(10),
    email: `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(58)}.com`,
  },
  socialLinks: ['Facebook', 'LINE', 'Instagram', 'YouTube'].map(label => ({ label, href: 'https://example.com/' })),
}
