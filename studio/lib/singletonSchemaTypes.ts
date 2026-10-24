export const protectedSingletonSchemaTypes = [
  'siteSettings',
  'eventsPage',
  'sessionPage',
  'articlesPage',
  'aboutPage',
  'homePage',
] as const

export const hiddenGlobalTemplateIds = [
  'homeBanner',
  'courseOverviewPage',
  'courseCategory',
  ...protectedSingletonSchemaTypes,
] as const
