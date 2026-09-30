import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .id('content')
    .title('內容')
    .items([
      S.listItem()
        .id('home-banner')
        .title('首頁 Banner')
        .child(
          S.document()
            .id('homeBanner')
            .schemaType('homeBanner')
            .documentId('homeBanner'),
        ),
    ])
