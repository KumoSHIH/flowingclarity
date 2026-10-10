export type CourseDetailStatus = "loading" | "ready" | "not-found" | "error";

export interface CourseDetailImage {
  src: string;
  alt: string;
  label?: string;
  objectPosition?: string;
}

export interface CourseDetailGalleryItem {
  key: string;
  title: string;
  description: string;
  image: CourseDetailImage;
  points?: string[];
  group?: string;
}

export type CourseDetailGalleryLayout =
  | "collage"
  | "stages"
  | "weave"
  | "folio"
  | "dossier";

export interface CourseDetailGalleryMode {
  key: string;
  label: string;
  layout: CourseDetailGalleryLayout;
  note: string;
  statement?: string;
  items: CourseDetailGalleryItem[];
}

export interface CourseDetailCurriculumUnit {
  key: string;
  stage: string;
  title: string;
  description: string;
}

export interface CourseDetailSession {
  key: string;
  title: string;
  status: string;
  details: string[];
}

export interface CourseDetailContent {
  slug: string;
  notice: string;
  hero: {
    title: string;
    englishTitle?: string;
    summary: string;
    image: CourseDetailImage;
    meta: Array<{ label: string; value: string }>;
    actionLabel: string;
    actionUrl?: string;
  };
  introduction: {
    title: string;
    lead: string;
    paragraphs: string[];
  };
  gallery: {
    title: string;
    description: string;
    modes: CourseDetailGalleryMode[];
  };
  teacher?: {
    name: string;
    englishName?: string;
    lead: string;
    biography: string;
    image?: CourseDetailImage;
  };
  quote?: { text: string; attribution: string };
  curriculum: {
    title: string;
    description: string;
    units: CourseDetailCurriculumUnit[];
  };
  video?: {
    title: string;
    statusLabel: string;
    image: CourseDetailImage;
    url?: string;
  };
  audience: {
    title: string;
    description: string;
    items: string[];
  };
  schedule: {
    title: string;
    description: string;
    sessions: CourseDetailSession[];
  };
  registration: {
    title: string;
    description: string;
    actionLabel: string;
    actionUrl?: string;
    image?: CourseDetailImage;
  };
}
