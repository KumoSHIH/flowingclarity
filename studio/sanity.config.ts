import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID

if (!projectId) {
  throw new Error('請在 studio/.env.local 設定 SANITY_STUDIO_PROJECT_ID')
}

export default defineConfig({
  name: 'default',
  title: 'Flowing Clarity Studio',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({ structure }),
  ],
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter(({ templateId }) => ![
            'homeBanner',
            'courseOverviewPage',
            'courseCategory',
          ].includes(templateId))
        : prev,
  },
  schema: {
    types: schemaTypes,
  },
})
