import { defineArrayMember, defineField, defineType } from 'sanity'

export const homeBanner = defineType({
  name: 'homeBanner',
  title: '首頁 Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '大標題',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: '摘要',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slides',
      title: '輪播內容',
      description: '拖曳項目可調整播放順序。',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'bannerSlide',
          title: '圖片與敘述',
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: '圖片',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: '圖片替代文字',
                  type: 'string',
                  description: '簡短描述圖片內容，供無法觀看圖片的訪客理解。',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              validation: (Rule) => Rule.required().assetRequired(),
            }),
            defineField({
              name: 'description',
              title: '敘述文字',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'description',
              media: 'image',
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
