import { createClient } from '@sanity/client'

interface SanitySlide {
  _key: string | null
  description: string | null
  image: string | null
  imageAlt: string | null
}

interface PublishedHomeBanner {
  title: string | null
  summary: string | null
  slides: SanitySlide[] | null
  legacyImage: string | null
  legacyImageAlt: string | null
}

const homeBannerQuery = `*[_id == "homeBanner" && _type == "homeBanner"][0]{
  title,
  summary,
  "slides": slides[]{
    _key,
    description,
    "image": image.asset->url,
    "imageAlt": image.alt
  },
  "legacyImage": image.asset->url,
  "legacyImageAlt": image.alt
}`

export default defineEventHandler(async () => {
  const { sanityProjectId, sanityDataset } = useRuntimeConfig()
  const client = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: '2026-03-01',
    perspective: 'published',
    useCdn: false,
  })

  try {
    const banner = await client.fetch<PublishedHomeBanner | null>(homeBannerQuery)

    if (!banner?.title || !banner.summary) {
      return null
    }

    const slides = (banner.slides ?? [])
      .filter((slide) => slide.image && slide.imageAlt && slide.description)
      .map((slide, index) => ({
        id: slide._key || `slide-${index}`,
        image: slide.image!,
        imageAlt: slide.imageAlt!,
        description: slide.description!,
      }))

    if (slides.length === 0 && banner.legacyImage && banner.legacyImageAlt) {
      slides.push({
        id: 'legacy-slide',
        image: banner.legacyImage,
        imageAlt: banner.legacyImageAlt,
        description: banner.summary,
      })
    }

    if (slides.length === 0) {
      return null
    }

    return {
      title: banner.title,
      summary: banner.summary,
      slides,
    }
  } catch (error) {
    console.error('無法讀取已發布的首頁 Banner', error)
    return null
  }
})
