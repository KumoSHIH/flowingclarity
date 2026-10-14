import { course } from './course.ts'
import { courseCategory } from './courseCategory.ts'
import { courseDetailSchemaTypes } from './courseDetail.ts'
import { courseDateRange, courseRun, courseStage } from './courseRun.ts'
import { courseOverviewPage } from './courseOverviewPage.ts'
import { event } from './event.ts'
import { eventDetailSchemaTypes } from './eventDetail.ts'
import { eventsPage } from './eventsPage.ts'
import { homeBanner } from './homeBanner.ts'
import { practitioner } from './practitioner.ts'
import { sessionPage } from './sessionPage.ts'
import { sessionMethod, sessionRegion } from './sessionTaxonomy.ts'
import { siteSettings } from './siteSettings.ts'

export const schemaTypes = [
  siteSettings,
  homeBanner,
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
  sessionMethod,
  practitioner,
]
