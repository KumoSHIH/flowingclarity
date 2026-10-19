import { createClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'
import { parseAboutPage } from '../../web/shared/utils/about.ts'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
if (!projectId) throw new Error('SANITY_STUDIO_PROJECT_ID is required')

const authenticatedClient = getCliClient({ apiVersion: '2026-03-01' })
const previewClient = authenticatedClient.withConfig({ perspective: 'drafts' })
const anonymousClient = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-01',
  perspective: 'published',
  useCdn: false,
})

const imageProjection = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt,
  hotspot
}`

const contentQuery = `{
  "page": *[_id == "about-page" && _type == "aboutPage"][0]{
    title,
    introduction,
    "heroImage": heroImage${imageProjection},
    brandStory{heading, body[]{_key, _type, style, listItem, children[]{_key, _type, text, marks}, markDefs[]{_key, _type, href}}, "image": image${imageProjection}},
    placeAndTeam{heading, body[]{_key, _type, style, listItem, children[]{_key, _type, text, marks}, markDefs[]{_key, _type, href}}, "image": image${imageProjection}},
    featuredMoments{
      heading,
      body[]{_key, _type, style, listItem, children[]{_key, _type, text, marks}, markDefs[]{_key, _type, href}},
      items[]{"key": _key, "image": image${imageProjection}, caption}
    },
    contactHeading,
    contactIntroduction,
    seo{title, description}
  },
  "settings": *[_id == "site-settings" && _type == "siteSettings"][0]{
    contact{address, email, phone{display, href}, businessHours[]{days, hours}, businessHoursNote, map{placeName, embedUrl, externalUrl}},
    socialLinks[]{label, href}
  }
}`

async function preflight() {
  const [publishedAbout, draftAbout, publishedSettings, draftSettings] = await authenticatedClient.getDocuments([
    'about-page',
    'drafts.about-page',
    'site-settings',
    'drafts.site-settings',
  ])
  const isPublished = Boolean(publishedAbout)
  const source = isPublished
    ? await anonymousClient.fetch<unknown>(contentQuery)
    : await previewClient.fetch<unknown>(contentQuery)
  const content = parseAboutPage(source)
  if (!content) {
    const root = source as { page?: Record<string, unknown>; settings?: Record<string, unknown> }
    const page = root?.page
    const sectionSummary = (value: unknown) => {
      const section = value as { heading?: unknown; body?: unknown[]; image?: { src?: unknown; alt?: unknown } } | null
      return section ? {
        headingLength: typeof section.heading === 'string' ? section.heading.trim().length : null,
        bodyBlocks: Array.isArray(section.body) ? section.body.length : null,
        bodyStyles: Array.isArray(section.body) ? section.body.map(block => (block as { style?: unknown }).style) : null,
        image: section.image ? { hasSrc: typeof section.image.src === 'string', altLength: typeof section.image.alt === 'string' ? section.image.alt.trim().length : null } : null,
      } : null
    }
    throw new Error(`The ${isPublished ? 'anonymous published' : 'authenticated draft'} About projection does not satisfy the frontend content contract: ${JSON.stringify({
      hasPage: Boolean(page),
      titleLength: typeof page?.title === 'string' ? page.title.trim().length : null,
      introductionLength: typeof page?.introduction === 'string' ? page.introduction.trim().length : null,
      heroImage: page?.heroImage,
      brandStory: sectionSummary(page?.brandStory),
      placeAndTeam: sectionSummary(page?.placeAndTeam),
      featuredMoments: sectionSummary(page?.featuredMoments),
      momentCount: Array.isArray((page?.featuredMoments as { items?: unknown[] } | undefined)?.items)
        ? (page?.featuredMoments as { items: unknown[] }).items.length
        : null,
      contactHeadingLength: typeof page?.contactHeading === 'string' ? page.contactHeading.trim().length : null,
      contactIntroductionLength: typeof page?.contactIntroduction === 'string' ? page.contactIntroduction.trim().length : null,
      seo: page?.seo,
    })}`)
  }

  if (isPublished && !content.contact) {
    throw new Error('Published About is readable, but published site-settings does not provide valid business hours and map content.')
  }
  if (!isPublished && publishedAbout) {
    throw new Error('About publication state changed during validation; run the check again.')
  }
  if (!isPublished && !draftAbout) {
    throw new Error('Neither a published About document nor an About draft exists.')
  }

  const images = [
    content.heroImage,
    content.brandStory.image,
    content.placeAndTeam.image,
    ...content.featuredMoments.items.map(item => item.image),
  ].filter(image => image !== undefined)
  const uniqueImageUrls = [...new Set(images.map(image => image.src))]
  if (images.length < 5 || uniqueImageUrls.length < 1 || images.some(image => !image.src.startsWith('https://cdn.sanity.io/'))) {
    throw new Error('About images do not satisfy the required hero, place/team, moments, and Sanity CDN asset contract.')
  }

  const imageResponses = await Promise.all(uniqueImageUrls.map(url => fetch(url, { method: 'HEAD' })))
  if (imageResponses.some(response => !response.ok)) {
    throw new Error('At least one About image asset is not publicly readable from the Sanity CDN.')
  }

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    environment: { dataset, perspective: 'published', anonymous: true },
    content: {
      id: isPublished ? 'about-page' : 'drafts.about-page',
      state: isPublished ? 'published' : 'draft',
      title: content.title,
      moments: content.featuredMoments.items.length,
      uniqueImages: uniqueImageUrls.length,
      contactReady: Boolean(content.contact),
      businessHours: content.contact?.businessHours.length ?? 0,
      mapHost: content.contact?.map ? new URL(content.contact.map.embedUrl).hostname : null,
    },
    documents: {
      about: { published: Boolean(publishedAbout), draft: Boolean(draftAbout) },
      siteSettings: { published: Boolean(publishedSettings), draft: Boolean(draftSettings) },
    },
    assets: { checked: uniqueImageUrls.length, publiclyReadable: true },
    result: isPublished ? 'published-flow-passed' : 'preflight-passed-publication-withheld',
  }, null, 2))
}

const phase = process.argv.at(-1)
if (phase === 'preflight') await preflight()
else throw new Error('Use phase "preflight".')
