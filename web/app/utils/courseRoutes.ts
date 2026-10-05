export function getCoursePath(slug: string) {
  return `/course/${encodeURIComponent(slug)}`
}
