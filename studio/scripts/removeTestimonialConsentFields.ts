import { getCliClient } from 'sanity/cli'

interface TestimonialItemValue {
  _key?: string
  consentConfirmed?: boolean
}

interface TestimonialBlockValue {
  _key?: string
  _type?: string
  items?: TestimonialItemValue[]
}

interface ContentDocumentValue {
  _id: string
  detail?: { body?: TestimonialBlockValue[] }
}

const client = getCliClient({ apiVersion: '2026-03-01' }).withConfig({ perspective: 'raw' })
const phase = process.argv.at(-1)
const query = `*[
  _type in ["course", "event"] &&
  count(detail.body[_type == "sharedTestimonialBlock"].items[defined(consentConfirmed)]) > 0
]{
  _id,
  detail{
    body[]{_key, _type, items[]{_key, consentConfirmed}}
  }
}`

function getObsoletePaths(document: ContentDocumentValue): string[] {
  return (document.detail?.body ?? []).flatMap(block => {
    if (block._type !== 'sharedTestimonialBlock' || !block._key) return []
    return (block.items ?? []).flatMap(item => (
      item._key && item.consentConfirmed !== undefined
        ? [`detail.body[_key=="${block._key}"].items[_key=="${item._key}"].consentConfirmed`]
        : []
    ))
  })
}

async function inspect() {
  const documents = await client.fetch<ContentDocumentValue[]>(query)
  console.log({
    documentCount: documents.length,
    fieldCount: documents.reduce((count, document) => count + getObsoletePaths(document).length, 0),
    ids: documents.map(document => document._id),
  })
}

async function migrate() {
  const documents = await client.fetch<ContentDocumentValue[]>(query)
  let transaction = client.transaction()
  let fieldCount = 0

  for (const document of documents) {
    const paths = getObsoletePaths(document)
    if (paths.length === 0) continue
    transaction = transaction.patch(document._id, patch => patch.unset(paths))
    fieldCount += paths.length
  }

  if (fieldCount === 0) {
    console.log('No obsolete testimonial consent fields found.')
    return
  }

  await transaction.commit()
  console.log(`Removed ${fieldCount} obsolete testimonial consent field(s) from ${documents.length} document(s).`)
}

if (phase === 'inspect') await inspect()
else if (phase === 'migrate') await migrate()
else throw new Error('Use one phase: inspect, migrate')
