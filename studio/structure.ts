import type { StructureResolver } from 'sanity/structure'
import { courseCategoryDefinitions } from './schemaTypes/courseCategory.ts'
import { siteSettingsId } from './schemaTypes/siteSettings.ts'
import { eventsPageId } from './schemaTypes/eventsPage.ts'
import { sessionPageId } from './schemaTypes/sessionPage.ts'
import { articlesPageId } from './schemaTypes/articlesPage.ts'
import { aboutPageId } from './schemaTypes/aboutPage.ts'

const courseCategories = Object.values(courseCategoryDefinitions)

export const structure: StructureResolver = (S) =>
  S.list()
    .id('content')
    .title('內容')
    .items([
      S.listItem().id('site-settings').title('全站共用設定').child(
        S.document().id(siteSettingsId).schemaType('siteSettings').documentId(siteSettingsId),
      ),
      S.listItem()
        .id('home-banner')
        .title('首頁 Banner')
        .child(
          S.document()
            .id('homeBanner')
            .schemaType('homeBanner')
            .documentId('homeBanner'),
        ),
      S.divider(),
      S.listItem()
        .id('course-overview-page')
        .title('課程總覽頁')
        .child(
          S.document()
            .id('courseOverviewPage')
            .schemaType('courseOverviewPage')
            .documentId('courseOverviewPage'),
        ),
      S.listItem()
        .id('course-categories')
        .title('課程分類')
        .child(
          S.list()
            .id('course-category-list')
            .title('課程分類')
            .items(courseCategories.map(category =>
              S.listItem()
                .id(category.id)
                .title(category.name)
                .child(
                  S.document()
                    .id(category.id)
                    .schemaType('courseCategory')
                    .documentId(category.id),
                ),
            )),
        ),
      S.listItem()
        .id('courses')
        .title('課程')
        .child(
          S.documentList()
            .id('courses')
            .title('課程')
            .apiVersion('2026-03-01')
            .filter('_type == "course"'),
        ),
      S.listItem()
        .id('course-runs')
        .title('課程梯次')
        .child(
          S.documentList()
            .id('course-runs')
            .title('課程梯次')
            .apiVersion('2026-03-01')
            .filter('_type == "courseRun"'),
        ),
      S.divider(),
      S.listItem()
        .id('events-page')
        .title('活動總覽頁')
        .child(
          S.document()
            .id(eventsPageId)
            .schemaType('eventsPage')
            .documentId(eventsPageId),
        ),
      S.listItem()
        .id('events')
        .title('活動')
        .child(
          S.documentList()
            .id('events')
            .title('活動')
            .apiVersion('2026-03-01')
            .filter('_type == "event"'),
        ),
      S.divider(),
      S.listItem()
        .id('session-page')
        .title('個案諮詢總覽頁')
        .child(
          S.document()
            .id(sessionPageId)
            .schemaType('sessionPage')
            .documentId(sessionPageId),
        ),
      S.listItem()
        .id('session-regions')
        .title('執行師服務地區')
        .child(
          S.documentList()
            .id('session-regions')
            .title('執行師服務地區')
            .apiVersion('2026-03-01')
            .filter('_type == "sessionRegion"'),
        ),
      S.listItem()
        .id('session-methods')
        .title('執行師服務項目')
        .child(
          S.documentList()
            .id('session-methods')
            .title('執行師服務項目')
            .apiVersion('2026-03-01')
            .filter('_type == "sessionMethod"'),
        ),
      S.listItem()
        .id('session-cities')
        .title('執行師服務城市')
        .child(
          S.documentList()
            .id('session-cities')
            .title('執行師服務城市')
            .apiVersion('2026-03-01')
            .filter('_type == "sessionCity"'),
        ),
      S.listItem()
        .id('practitioners')
        .title('執行師')
        .child(
          S.documentList()
            .id('practitioners')
            .title('執行師')
            .apiVersion('2026-03-01')
            .filter('_type == "practitioner"'),
        ),
      S.divider(),
      S.listItem().id('articles-page').title('文章分享總覽頁').child(
        S.document().id(articlesPageId).schemaType('articlesPage').documentId(articlesPageId),
      ),
      S.listItem().id('article-tags').title('文章相關標籤').child(
        S.documentList().id('article-tags').title('文章相關標籤').apiVersion('2026-03-01').filter('_type == "articleTag"'),
      ),
      S.listItem().id('articles').title('文章').child(
        S.documentList().id('articles').title('文章').apiVersion('2026-03-01').filter('_type == "article"'),
      ),
      S.divider(),
      S.listItem().id('about-page').title('關於我們').child(
        S.document().id(aboutPageId).schemaType('aboutPage').documentId(aboutPageId),
      ),
    ])
