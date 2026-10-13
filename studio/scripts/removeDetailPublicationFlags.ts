import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-03-01' }).withConfig({ perspective: 'raw' })
const phase = process.argv.at(-1)
const query = '*[_type in ["course", "event"] && defined(detailIsPublished)]._id'

async function inspect() {
  const ids = await client.fetch<string[]>(query)
  console.log({ count: ids.length, ids })
}

async function migrate() {
  const ids = await client.fetch<string[]>(query)
  if (ids.length === 0) {
    console.log('No obsolete detail publication fields found.')
    return
  }

  let transaction = client.transaction()
  for (const id of ids) transaction = transaction.patch(id, patch => patch.unset(['detailIsPublished']))
  await transaction.commit()
  console.log(`Removed obsolete detail publication fields from ${ids.length} document(s).`)
}

if (phase === 'inspect') await inspect()
else if (phase === 'migrate') await migrate()
else throw new Error('Use one phase: inspect, migrate')
