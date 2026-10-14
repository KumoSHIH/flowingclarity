export const sessionDetailQuery = `*[_type == "practitioner" && isPublished == true && slug.current == $slug][0]{
  "id": _id, name, englishName, "slug": slug.current, summary, isPublished,
  "regions": regions[]->label,
  "methods": methods[]->label,
  portrait{"src": asset->url, alt, "displayMode": coalesce(displayMode, "contained"), hotspot{x, y}},
  bio, experienceItems,
  serviceLocations[]{"key": _key, "cities": coalesce(cities[]->label, [city->label]), publicDetail,
    "venueName": select(publicDetail in ["venue", "fullAddress"] => venueName),
    "address": select(publicDetail == "fullAddress" => address)
  },
  contactIntro,
  contactItems[]{"key": _key, type, label, displayText, value},
  bookingAction{label, url},
  "seoTitle": seo.title, "seoDescription": seo.description
}`
