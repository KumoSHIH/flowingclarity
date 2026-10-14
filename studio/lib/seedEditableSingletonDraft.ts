import type { SanityClient } from '@sanity/client'

type SingletonDraftClient = Pick<SanityClient, 'create' | 'getDocuments'>

interface SingletonIdentity {
  publishedId: string
  schemaType: string
}

export async function seedEditableSingletonDraft(
  client: SingletonDraftClient,
  { publishedId, schemaType }: SingletonIdentity,
): Promise<string> {
  if (!publishedId || publishedId.startsWith('drafts.') || publishedId.includes('.')) {
    throw new Error('Singleton published ID must be public-safe and must not include the drafts prefix.')
  }

  const draftId = `drafts.${publishedId}`
  const [published, draft] = await client.getDocuments([publishedId, draftId])
  if (published || draft) {
    throw new Error(`Singleton ${publishedId} already exists; refusing to overwrite it.`)
  }

  await client.create({
    _id: draftId,
    _type: schemaType,
  })

  return draftId
}
