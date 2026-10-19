import { createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'
import { buildAboutDraft } from '../lib/aboutDraft.ts'

const client = getCliClient({ apiVersion: '2026-03-01' })
const aboutIds = ['about-page', 'drafts.about-page']
const assetRoot = resolve(process.cwd(), '../web/public/assets/about')

const sourceImages = {
  team: 'about-team-preparation.png',
  mandala: 'about-moment-mandala.png',
  circle: 'about-moment-circle.png',
  bodywork: 'about-moment-bodywork.png',
} as const

const approvedEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3734.1234201130032!2d120.30924848181711!3d22.62724635065776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346e049029005659%3A0x8d8f788cee2cfff8!2zODAw6auY6ZuE5biC5paw6IiI5Y2A5b6355Sf6YeM5rCR55Sf5LiA6LevMjAx6JmfYSAy!5e0!3m2!1szh-TW!2stw!4v1792337523424!5m2!1szh-TW!2stw'
const prototypeEmbedUrl = 'https://www.google.com/maps?q=Kaohsiung%2C+Taiwan&output=embed'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
if (!projectId) throw new Error('SANITY_STUDIO_PROJECT_ID is required')
const anonymousClient = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-01',
  perspective: 'published',
  useCdn: false,
})

async function inspect() {
  const documents = await client.getDocuments(aboutIds)
  console.log(JSON.stringify({
    published: documents[0] ? { _id: documents[0]._id, _type: documents[0]._type } : null,
    draft: documents[1] ? { _id: documents[1]._id, _type: documents[1]._type } : null,
  }, null, 2))
}

async function seed() {
  const documents = await client.getDocuments(aboutIds)
  if (documents.some(Boolean)) {
    throw new Error('About singleton already exists; refusing to overwrite published or draft content.')
  }

  const uploaded = {} as Record<keyof typeof sourceImages, { _id: string }>
  for (const [key, filename] of Object.entries(sourceImages) as [keyof typeof sourceImages, string][]) {
    uploaded[key] = await client.assets.upload('image', createReadStream(resolve(assetRoot, filename)), {
      filename,
      title: `About prototype — ${filename}`,
    })
  }

  const reference = (id: string) => ({ _type: 'reference' as const, _ref: id })
  const draft = buildAboutDraft({
    team: reference(uploaded.team._id),
    mandala: reference(uploaded.mandala._id),
    circle: reference(uploaded.circle._id),
    bodywork: reference(uploaded.bodywork._id),
  })
  await client.create(draft)
  console.log(`created ${draft._id} with ${Object.keys(uploaded).length} uploaded image assets; content remains unpublished`)
}

async function verify() {
  const [published, draft] = await client.getDocuments(aboutIds)
  if (published || !draft || draft._type !== 'aboutPage') {
    throw new Error('Expected one unpublished aboutPage draft and no published document.')
  }
  const items = (draft as { featuredMoments?: { items?: unknown[] } }).featuredMoments?.items
  const assetReferences = Array.isArray(items)
    ? items.filter(item => Boolean((item as { image?: { asset?: { _ref?: string } } }).image?.asset?._ref)).length
    : 0
  const publicPage = await anonymousClient.fetch<unknown>(
    '*[_id == "about-page" && _type == "aboutPage"][0]{_id}',
  )
  if (assetReferences !== 3 || publicPage !== null) {
    throw new Error(`About draft validation mismatch: moment references=${assetReferences}, anonymous published=${JSON.stringify(publicPage)}.`)
  }
  const [publishedSettings, draftSettings] = await client.getDocuments(['site-settings', 'drafts.site-settings'])
  const contactState = (document: Record<string, unknown> | null) => {
    const contact = document?.contact as { businessHours?: unknown[]; map?: unknown } | undefined
    return document ? {
      exists: true,
      hasBusinessHours: Array.isArray(contact?.businessHours) && contact.businessHours.length > 0,
      hasMap: Boolean(contact?.map),
    } : { exists: false, hasBusinessHours: false, hasMap: false }
  }
  console.log('verified drafts.about-page; 3 moment references plus shared hero/place asset are stored, anonymous published query remains empty')
  console.log(JSON.stringify({
    siteSettings: {
      published: contactState(publishedSettings as Record<string, unknown> | null),
      draft: contactState(draftSettings as Record<string, unknown> | null),
    },
  }, null, 2))
}

function withoutSystemFields(document: Record<string, unknown>, id: string) {
  const { _rev, _createdAt, _updatedAt, ...content } = document
  return { ...content, _id: id }
}

async function seedContactDraft() {
  const [published, draft] = await client.getDocuments(['site-settings', 'drafts.site-settings'])
  if (!published) throw new Error('Published site-settings is required before creating an update draft.')
  if (draft) throw new Error('A site-settings draft already exists; refusing to overwrite it.')
  const publishedDocument = published as Record<string, unknown>
  const contact = (publishedDocument.contact && typeof publishedDocument.contact === 'object')
    ? publishedDocument.contact as Record<string, unknown>
    : {}
  await client.create({
    ...withoutSystemFields(publishedDocument, 'drafts.site-settings'),
    contact: {
      ...contact,
      businessHours: [{ _key: 'prototype-hours-1', days: '週二至週日', hours: '10:00–18:00' }],
      businessHoursNote: '採預約制・實際時間待核准',
      map: {
        placeName: '高雄市示意地點',
        embedUrl: approvedEmbedUrl,
        externalUrl: 'https://www.google.com/maps/search/?api=1&query=Kaohsiung%2C%20Taiwan',
      },
    },
  })
  console.log('created drafts.site-settings from the published document with prototype business hours and map; content remains unpublished')
}

async function updateMapEmbed() {
  const [published, draft] = await client.getDocuments(['site-settings', 'drafts.site-settings'])
  if (!published || !draft) throw new Error('Both published and draft site-settings must exist before updating the draft map.')
  const contact = (draft as { contact?: { map?: { embedUrl?: string } } }).contact
  const current = contact?.map?.embedUrl
  if (current === approvedEmbedUrl) {
    console.log('drafts.site-settings already uses the approved Google Maps embed URL')
    return
  }
  if (current !== prototypeEmbedUrl) {
    throw new Error('The site-settings draft map has changed; refusing to overwrite an unexpected embed URL.')
  }
  await client.patch('drafts.site-settings').set({ 'contact.map.embedUrl': approvedEmbedUrl }).commit()
  console.log('updated drafts.site-settings with the approved Google Maps embed URL; published settings remain unchanged')
}

const phase = process.argv.at(-1)
if (phase === 'inspect') await inspect()
else if (phase === 'seed') await seed()
else if (phase === 'verify') await verify()
else if (phase === 'seed-contact-draft') await seedContactDraft()
else if (phase === 'update-map-embed') await updateMapEmbed()
else throw new Error('Use phase "inspect", "seed", "seed-contact-draft", "update-map-embed", or "verify".')
