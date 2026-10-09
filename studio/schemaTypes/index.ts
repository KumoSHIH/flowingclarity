import { course } from './course.ts'
import { courseCategory } from './courseCategory.ts'
import { courseDateRange, courseRun, courseStage } from './courseRun.ts'
import { courseOverviewPage } from './courseOverviewPage.ts'
import { homeBanner } from './homeBanner.ts'
import { siteSettings } from './siteSettings.ts'

export const schemaTypes = [
  siteSettings,
  homeBanner,
  courseOverviewPage,
  courseCategory,
  course,
  courseDateRange,
  courseStage,
  courseRun,
]
