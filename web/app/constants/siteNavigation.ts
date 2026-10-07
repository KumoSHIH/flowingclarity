export interface SiteNavigationItem {
  label: string
  href: string
}

export const siteNavigationItems: readonly SiteNavigationItem[] = [
  { label: '近期活動', href: '/events' },
  { label: '課程探索', href: '/course' },
  { label: '個案諮詢', href: '/session' },
  { label: '文章分享', href: '/articles' },
  { label: '關於我們', href: '/about' },
]
