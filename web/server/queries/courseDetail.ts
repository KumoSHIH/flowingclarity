export const courseDetailQuery = `{
  "course": *[
    _type == "course" &&
    isPublished == true &&
    slug.current == $slug
  ][0]{
    title,
    "slug": slug.current,
    deliveryModes,
    summary,
    isPublished,
    image{
      "src": asset->url,
      alt,
      hotspot{x, y}
    },
    detail{
      notice,
      englishTitle,
      body[]{
        "key": _key,
        "type": _type,
        _type == "courseDetailIntroduction" => {
          title,
          lead,
          paragraphs
        },
        _type == "courseDetailGallery" => {
          title,
          description,
          layout,
          note,
          statement,
          items[]{
            "key": _key,
            group,
            title,
            description,
            points,
            image{
              "src": asset->url,
              alt,
              hotspot{x, y}
            }
          }
        },
        _type == "courseDetailTeacher" => {
          name,
          englishName,
          lead,
          biography,
          image{
            "src": asset->url,
            alt,
            hotspot{x, y}
          }
        },
        _type == "courseDetailQuote" => {text, attribution},
        _type == "courseDetailCurriculum" => {
          title,
          description,
          units[]{"key": _key, stage, title, description}
        },
        _type == "courseDetailVideo" => {
          title,
          statusLabel,
          url,
          image{
            "src": asset->url,
            alt,
            hotspot{x, y}
          }
        },
        _type == "courseDetailAudience" => {title, description, items},
        _type == "sharedTestimonialBlock" => {
          title,
          items[]{text, sharerName}
        },
        _type == "courseDetailCarousel" => {
          title,
          text,
          items[]{
            "key": _key,
            caption,
            image{
              "src": asset->url,
              "width": asset->metadata.dimensions.width,
              "height": asset->metadata.dimensions.height,
              alt,
              hotspot{x, y}
            }
          }
        }
      },
      schedule{title, description},
      registration{
        title,
        description,
        openActionLabel,
        closedActionLabel,
        image{
          "src": asset->url,
          alt,
          hotspot{x, y}
        }
      },
      "relatedArticles": relatedArticles[]->[
        defined(_id) && defined(slug.current) && defined(category->key) && defined(coverImage.asset)
      ]{
        "id": _id,
        title,
        "slug": slug.current,
        excerpt,
        category->{key, name, order},
        "coverImage": coverImage{
          "src": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height,
          alt,
          hotspot{x, y}
        }
      }
    }
  },
  "runs": *[
    _type == "courseRun" &&
    isPublished == true &&
    course->slug.current == $slug &&
    registrationStatus in ["scheduled", "open", "full", "closed"]
  ] | order(stages[0].dateRanges[0].startDate asc){
    "key": _id,
    label,
    registrationStatus,
    registrationUrl,
    city,
    venue,
    timeLabel,
    capacityLabel,
    feeLabel,
    notes,
    stages[]{dateRanges[]{startDate, endDate}},
    isPublished
  }
}`
