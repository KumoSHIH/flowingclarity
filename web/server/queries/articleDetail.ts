const imageProjection = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt,
  hotspot{x, y}
}`

const portableTextProjection = `[]{
  _key,
  _type,
  style,
  listItem,
  level,
  children[]{_key, _type, text, marks},
  markDefs[]{_key, _type, href}
}`

export const articleDetailQuery = `*[
  _type == "article" &&
  slug.current == $slug
][0]{
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  category->{key, name, order},
  "tags": tags[]->{"slug": slug.current, name, order},
  heroStyle,
  "coverImage": select(defined(coverImage.asset) => coverImage${imageProjection}),
  body[]{
    "key": _key,
    "type": _type,
    heading,
    mediaSide,
    caption,
    "image": select(defined(image.asset) => image${imageProjection}),
    "content": content${portableTextProjection}
  },
  "relatedArticles": relatedArticles[]->{
    "id": _id,
    title,
    "slug": slug.current,
    excerpt,
    category->{key, name, order},
    "coverImage": select(defined(coverImage.asset) => coverImage${imageProjection})
  },
  seoTitle,
  seoDescription,
  "shareImage": select(defined(shareImage.asset) => shareImage${imageProjection})
}`
