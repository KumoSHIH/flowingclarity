import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { CharacterCountInput } from './components/CharacterCountInput'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'
import { hiddenGlobalTemplateIds, protectedSingletonSchemaTypes } from './lib/singletonSchemaTypes'

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
  form: {
    components: {
      input: CharacterCountInput,
    },
  },
  document: {
    actions: (prev, context) => protectedSingletonSchemaTypes.includes(context.schemaType as typeof protectedSingletonSchemaTypes[number])
      ? prev.filter(action => !['duplicate', 'delete', 'unpublish'].includes(action.action ?? ''))
      : prev,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter(({ templateId }) => !hiddenGlobalTemplateIds.includes(templateId as typeof hiddenGlobalTemplateIds[number]))
        : prev,
  },
  schema: {
    types: schemaTypes,
  },
})
