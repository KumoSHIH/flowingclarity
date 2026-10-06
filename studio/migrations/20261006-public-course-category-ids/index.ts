import { at, createIfNotExists, defineMigration, patch, set } from 'sanity/migrate'

const publicCategoryIds: Record<string, string> = {
  'courseCategory.body': 'course-category-body',
  'courseCategory.heart': 'course-category-heart',
  'courseCategory.life': 'course-category-life',
  'courseCategory.beauty': 'course-category-beauty',
}

export default defineMigration({
  title: 'Move course categories to public document IDs',
  documentTypes: ['courseCategory', 'course'],
  migrate: {
    document(document) {
      if (document._type === 'courseCategory') {
        const publicId = publicCategoryIds[document._id]
        if (!publicId) return
        const { _createdAt, _rev, _system, _updatedAt, ...content } = document
        return createIfNotExists({ ...content, _id: publicId })
      }

      const category = document.category as { _ref?: string } | undefined
      const publicId = category?._ref ? publicCategoryIds[category._ref] : undefined
      if (!publicId) return
      return patch(document._id, at('category._ref', set(publicId)))
    },
  },
})
