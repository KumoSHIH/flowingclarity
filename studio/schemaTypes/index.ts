import { course } from './course.ts'
import { courseCategory } from './courseCategory.ts'
import { courseDetailSchemaTypes } from './courseDetail.ts'
import { courseDateRange, courseRun, courseStage } from './courseRun.ts'
import { courseOverviewPage } from './courseOverviewPage.ts'
import { event } from './event.ts'
import { eventDetailSchemaTypes } from './eventDetail.ts'
import { eventsPage } from './eventsPage.ts'
import { homeBanner } from './homeBanner.ts'
import { homePage } from './homePage.ts'
import { practitioner } from './practitioner.ts'
import { sessionDetailSchemaTypes } from './sessionDetail.ts'
import { sessionPage } from './sessionPage.ts'
import { sessionCity, sessionMethod, sessionRegion } from './sessionTaxonomy.ts'
import { siteSettings } from './siteSettings.ts'
import { article } from './article.ts'
import { articleDetailSchemaTypes } from './articleDetail.ts'
import { articleTag } from './articleTag.ts'
import { articlesPage } from './articlesPage.ts'
import { aboutPage } from './aboutPage.ts'

export const schemaTypes = [
  siteSettings,
  homeBanner,
  homePage,
  courseOverviewPage,
  courseCategory,
  ...courseDetailSchemaTypes,
  course,
  courseDateRange,
  courseStage,
  courseRun,
  eventsPage,
  ...eventDetailSchemaTypes,
  event,
  sessionPage,
  sessionRegion,
  sessionCity,
  sessionMethod,
  ...sessionDetailSchemaTypes,
  practitioner,
  articlesPage,
  articleTag,
  ...articleDetailSchemaTypes,
  article,
  aboutPage,
]
