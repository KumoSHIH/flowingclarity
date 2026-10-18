import { defineArrayMember, defineField, defineType, type Path, type ValidationError } from 'sanity'
import { articleDocumentIdIsSafe } from './articleTag.ts'
import { courseCategoryDefinitions } from './courseCategory.ts'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const articleCategoryIds: string[] = Object.values(courseCategoryDefinitions).map(({ id }) => id)

export function articleCategoryReferenceIsCanonical(value: unknown): true | string {
  if (!value || typeof value !== 'object') return true
  const reference = value as { _ref?: string }
  return reference._ref && articleCategoryIds.includes(reference._ref)
    ? true
    : '請選擇四個正式主要分類之一。'
}

interface ArticleDocumentValue {
  _id?: string
  heroStyle?: string
  coverImage?: unknown
  body?: unknown[]
  relatedArticles?: Array<{ _ref?: string }>
}

function addDocumentPairIds(ids: Set<string>, id: string | undefined) {
  if (!id) return
  const publishedId = id.replace(/^drafts\./, '')
  ids.add(publishedId)
  ids.add(`drafts.${publishedId}`)
}

export function relatedArticleReferenceFilter({ document }: { document: ArticleDocumentValue }) {
  const excludedIds = new Set<string>()
  addDocumentPairIds(excludedIds, document._id)
  document.relatedArticles?.forEach(reference => addDocumentPairIds(excludedIds, reference?._ref))

  return {
    filter: '!(_id in $excludedIds)',
    params: { excludedIds: [...excludedIds] },
    maxFieldDepth: 3,
  }
}

function fieldError(message: string, path: Path): ValidationError {
  return { message, path }
}

export function validateArticleDetail(value: unknown): true | string | ValidationError | ValidationError[] {
  if (!value || typeof value !== 'object') return true
  const document = value as ArticleDocumentValue
  const documentId = document._id?.replace(/^drafts\./, '')
  const errors: ValidationError[] = []
  if (document.heroStyle === 'overlay' && !document.coverImage) {
    errors.push(fieldError('遮罩圖片首區必須設定代表圖。', ['coverImage']))
  }
  if (!Array.isArray(document.body) || document.body.length < 1) {
    errors.push(fieldError('文章必須包含至少一個正文區塊。', ['body']))
  }
  if (documentId && document.relatedArticles?.some(reference => reference?._ref?.replace(/^drafts\./, '') === documentId)) {
    errors.push(fieldError('延伸閱讀不可選擇目前文章。', ['relatedArticles']))
  }
  return errors.length ? errors : true
}

export const article = defineType({
  name: 'article',
  title: '文章',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '文章標題', type: 'string', validation: Rule => Rule.required().min(4).max(50) }),
    defineField({ name: 'slug', title: '網址識別碼', type: 'slug', options: { source: 'title', maxLength: 80 }, validation: Rule => Rule.required().custom(value => !value?.current || slugPattern.test(value.current) ? true : '請使用小寫英數與連字號。') }),
    defineField({
      name: 'category',
      title: '主要分類',
      type: 'reference',
      to: [{ type: 'courseCategory' }],
      options: {
        disableNew: true,
        filter: '_id in $categoryIds',
        filterParams: { categoryIds: articleCategoryIds },
      },
      validation: Rule => Rule.required().custom(articleCategoryReferenceIsCanonical),
    }),
    defineField({ name: 'tags', title: '相關標籤', type: 'array', of: [{ type: 'reference', to: [{ type: 'articleTag' }] }], validation: Rule => Rule.required().min(1).max(8).unique() }),
    defineField({ name: 'excerpt', title: '文章摘要', type: 'text', rows: 5, validation: Rule => Rule.required().min(30).max(140) }),
    defineField({ name: 'publishedAt', title: '發布時間', type: 'datetime', validation: Rule => Rule.required().max(new Date().toISOString()) }),
    defineField({
      name: 'coverImage',
      title: '代表圖',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: '替代文字', type: 'string', validation: Rule => Rule.required().min(2).max(120) })],
    }),
    defineField({
      name: 'heroStyle',
      title: '首區樣式',
      type: 'string',
      initialValue: 'split',
      options: { list: [{ title: '文字與圖片分欄', value: 'split' }, { title: '圖片遮罩承載標題', value: 'overlay' }], layout: 'radio' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: '文章正文',
      type: 'array',
      description: '可拖曳調整章節順序；純文字文章不需要插圖。',
      of: [
        defineArrayMember({ type: 'articleRichTextSection' }),
        defineArrayMember({ type: 'articleSplitMediaSection' }),
        defineArrayMember({ type: 'articleWideImageSection' }),
      ],
      validation: Rule => Rule.required().min(1).max(30),
    }),
    defineField({
      name: 'relatedArticles',
      title: '延伸閱讀',
      type: 'array',
      description: '最多 8 篇。可輸入文章標題、分類或網址識別碼搜尋；目前文章與已選文章不會重複出現。可拖曳調整前台順序，未發布或資料不完整的文章會由前台略過。',
      of: [defineArrayMember({
        name: 'relatedArticle',
        title: '推薦文章',
        type: 'reference',
        to: [{ type: 'article' }],
        options: {
          disableNew: true,
          filter: relatedArticleReferenceFilter,
        },
      })],
      validation: Rule => Rule.max(8).unique(),
    }),
    defineField({ name: 'seoTitle', title: 'SEO 標題', type: 'string', validation: Rule => Rule.min(10).max(60) }),
    defineField({ name: 'seoDescription', title: 'SEO 描述', type: 'text', rows: 3, validation: Rule => Rule.min(50).max(160) }),
    defineField({
      name: 'shareImage',
      title: '社群分享圖',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: '替代文字', type: 'string', validation: Rule => Rule.required().min(2).max(120) })],
    }),
  ],
  orderings: [{ title: '發布時間（新到舊）', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'category.name', media: 'coverImage', publishedAt: 'publishedAt', slug: 'slug.current' },
    prepare: ({ title, subtitle, media, publishedAt, slug }) => ({
      title,
      subtitle: [subtitle, publishedAt?.slice(0, 10), slug ? `/articles/${slug}` : undefined].filter(Boolean).join(' · '),
      media,
    }),
  },
  validation: Rule => Rule.custom(value => {
    const idCheck = articleDocumentIdIsSafe(value)
    if (idCheck !== true) return idCheck
    return validateArticleDetail(value)
  }),
})
