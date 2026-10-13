export const eventDetailQuery = `*[
  _type == "event" &&
  isPublished == true &&
  detailIsPublished == true &&
  slug.current == $slug
][0]{
  title,
  "slug": slug.current,
  summary,
  startAt,
  endAt,
  scheduleNote,
  deliveryMode,
  city,
  venue,
  image{
    "src": asset->url,
    alt,
    hotspot{x, y}
  },
  registrationStatus,
  registrationUrl,
  isPublished,
  detailIsPublished,
  detail{
    intro,
    feeLabel,
    registrationNote,
    seoTitle,
    seoDescription,
    body[]{
      "key": _key,
      "type": _type,
      _type == "eventDetailText" => {title, paragraphs},
      _type == "eventDetailFacilitator" => {name, role, biography},
      _type == "eventDetailAgenda" => {
        title,
        description,
        items[]{"key": _key, timeLabel, dateTime, title, description}
      },
      _type == "sharedTestimonialBlock" => {
        title,
        items[consentConfirmed == true]{text, sharerName}
      },
      _type == "eventDetailList" => {kind, title, items},
      _type == "eventDetailQuote" => {text, attribution},
      _type == "eventDetailMedia" => {
        title,
        items[]{
          "key": _key,
          caption,
          image{"src": asset->url, alt, hotspot{x, y}}
        }
      }
    }
  }
}`
