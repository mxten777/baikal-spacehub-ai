// ============================================================
// CORE TYPES - Baikal SpaceHub AI
// ============================================================

export type UUID = string;
export type ISODateString = string;

// ============================================================
// USER & AUTH
// ============================================================
export interface Profile {
  id: UUID;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: "admin" | "editor" | "viewer";
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// SPACES
// ============================================================
export type SpaceCategory =
  | "cafe"
  | "garden"
  | "studio"
  | "storage"
  | "hall"
  | "other";

export interface Space {
  id: UUID;
  slug: string;
  name: string;
  name_en?: string;
  description?: string | null;
  short_description?: string;
  category: SpaceCategory;
  capacity?: number | null;
  size_sqm?: number | null;
  features?: string[];
  recommended_use?: string[];
  cover_image_url?: string | null;
  /** @deprecated use cover_image_url */
  cover_image?: string;
  images?: string[];
  /** @deprecated use images */
  gallery?: string[];
  rental_price_per_hour?: number | null;
  is_available: boolean;
  sort_order: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// PROGRAMS
// ============================================================
export type ProgramCategory =
  | "exhibition"
  | "performance"
  | "lecture"
  | "workshop"
  | "event";
export type ProgramStatus = "upcoming" | "ongoing" | "closed" | "cancelled";

export interface Program {
  id: UUID;
  slug: string;
  title: string;
  title_en?: string;
  description?: string | null;
  short_description?: string;
  content?: string | null;
  category: ProgramCategory;
  status: ProgramStatus;
  start_date?: ISODateString | null;
  end_date?: ISODateString | null;
  /** @deprecated use start_date */
  location?: string;
  venue?: string | null;
  space_id?: UUID;
  space?: Space;
  cover_image_url?: string | null;
  /** @deprecated use cover_image_url */
  poster_image?: string;
  images?: string[];
  /** @deprecated use images */
  gallery?: string[];
  organizer?: string;
  registration_url?: string | null;
  /** @deprecated use registration_url */
  reservation_link?: string;
  is_free?: boolean;
  price?: number | null;
  capacity?: number | null;
  /** @deprecated use capacity */
  max_participants?: number;
  tags?: string[];
  is_featured: boolean;
  sort_order?: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// ARCHIVE
// ============================================================
export interface ArchiveItem {
  id: UUID;
  slug: string;
  title: string;
  description?: string | null;
  content?: string | null;
  category: string;
  date?: ISODateString | null;
  /** @deprecated use date */
  held_date?: ISODateString;
  cover_image_url?: string | null;
  /** @deprecated use cover_image_url */
  cover_image?: string;
  images?: string[];
  /** @deprecated use images */
  gallery?: string[];
  video_url?: string;
  story?: string;
  tags?: string[];
  program_id?: UUID;
  is_featured: boolean;
  sort_order?: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// BLOG
// ============================================================
export type BlogPostStatus = "draft" | "published" | "archived";

export interface BlogCategory {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  sort_order?: number;
  created_at?: ISODateString;
}

export interface BlogPost {
  id: UUID;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  cover_image_url?: string | null;
  /** @deprecated use cover_image_url */
  cover_image?: string;
  author_id?: UUID | null;
  author?: Profile;
  category_id?: UUID | null;
  category?: BlogCategory;
  tags?: string[];
  status?: BlogPostStatus;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  published_at?: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
}

// ============================================================
// MEDIA / SNS
// ============================================================
export type MediaPlatform = "youtube" | "instagram" | "x";

export interface MediaItem {
  id: UUID;
  platform: MediaPlatform;
  platform_id?: string;
  url: string;
  title?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  /** @deprecated use url */
  media_url?: string;
  embed_url?: string;
  published_at?: ISODateString | null;
  is_featured: boolean;
  sort_order: number;
  created_at: ISODateString;
  updated_at?: ISODateString;
}

// ============================================================
// INQUIRIES
// ============================================================
export type InquiryType = "rental" | "collaboration" | "general" | "media";
export type InquiryStatus = "pending" | "reviewing" | "replied" | "closed";

export interface Inquiry {
  id: UUID;
  inquiry_type: InquiryType;
  /** @deprecated use inquiry_type */
  type?: InquiryType;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string;
  subject: string;
  message: string;
  space_id?: UUID;
  space?: Space;
  preferred_date?: ISODateString;
  preferred_time?: string;
  expected_attendees?: number;
  status: InquiryStatus;
  admin_notes?: string;
  replied_at?: ISODateString;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// SETTINGS
// ============================================================
export interface SiteSetting {
  id: UUID;
  key: string;
  value: string;
  type?: "text" | "number" | "boolean" | "json" | "color";
  group?: string;
  label?: string;
  description?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// RESERVATION — Premium Reservation Experience
// ============================================================

export type EventType =
  | "exhibition"
  | "performance"
  | "workshop"
  | "brand_event"
  | "corporate"
  | "shoot"
  | "wedding"
  | "gathering"
  | "consultation";

export type ReservationStatus =
  | "new"
  | "consulting"
  | "quote_sent"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface ReservationFormData {
  // Step 1
  eventType: EventType | null;
  // Step 2
  preferredDate: string;
  dateFlexible: boolean;
  expectedAttendees: string;
  eventPurpose: string;
  budgetRange: string;
  additionalDetails: Record<string, string>;
  // Step 3
  recommendedSpace: string;
  selectedSpaceId: string;
  // Step 4
  name: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
}

export interface Reservation {
  id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  event_type: EventType;
  preferred_date: string | null;
  date_flexible: boolean;
  expected_attendees: number | null;
  event_purpose: string | null;
  budget_range: string | null;
  additional_details: Record<string, string>;
  recommended_space: string | null;
  selected_space_id: UUID | null;
  name: string;
  phone: string;
  email: string;
  company: string | null;
  notes: string | null;
  status: ReservationStatus;
  admin_notes: string | null;
  assigned_to: string | null;
  spaces?: { name: string; slug: string } | null;
}

// ============================================================
// UI / SHARED
// ============================================================
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  category?: string;
  status?: string;
  search?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  featured?: boolean;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  video?: string;
  cta?: { label: string; href: string };
}

// ============================================================
// PHOTO CURATOR (Sprint 3 + 4)
// ============================================================

export type PhotoUploadStatus = "completed" | "delete_pending" | "error";

// Sprint 4: separate from the Space SpaceCategory (cafe/garden/studio/storage/hall/other)
export type PhotoSpaceCategory =
  | "cafe" | "garden" | "studio" | "exterior" | "program"
  | "event" | "exhibition" | "performance" | "food" | "people"
  | "other" | "unclassified";

export type PhotoType =
  | "hero" | "representative" | "interior" | "exterior" | "detail"
  | "people" | "event" | "promotional" | "archive" | "general";

export type PhotoSortOption = "newest" | "oldest" | "name_asc" | "name_desc";

/** Row returned from the public.photos table */
export interface PhotoRecord {
  id: UUID;
  original_name: string;
  storage_path: string;
  public_url: string | null;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  upload_status: PhotoUploadStatus;
  // Sprint 4 management columns
  space_category: PhotoSpaceCategory;
  photo_type: PhotoType;
  tags: string[];
  is_featured: boolean;
  is_favorite: boolean;
  admin_memo: string | null;
  uploaded_by: string;
  // Sprint 5-A: AI analysis columns
  ai_analysis_status: AiAnalysisStatus;
  ai_quality_score: number | null;
  ai_space_category: PhotoSpaceCategory | null;
  ai_photo_type: PhotoType | null;
  ai_tags: string[];
  ai_description: string | null;
  ai_featured_score: number | null;
  ai_analyzed_at: ISODateString | null;
  ai_error_message: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type UpdatePhotoRecordInput = Partial<
  Pick<
    PhotoRecord,
    | "space_category"
    | "photo_type"
    | "tags"
    | "is_featured"
    | "is_favorite"
    | "admin_memo"
  >
>;

// Sprint 5-A: AI analysis types
export type AiAnalysisStatus =
  | "not_requested"
  | "processing"
  | "completed"
  | "error";

/** Shape of data returned by an AI analysis operation (Sprint 5-B+) */
export interface PhotoAnalysisResult {
  qualityScore: number;
  spaceCategory: PhotoSpaceCategory;
  photoType: PhotoType;
  tags: string[];
  description: string;
  featuredScore: number;
}

/** Patch type for writing AI results back to the photos table */
export interface PhotoAnalysisUpdateInput {
  ai_analysis_status: AiAnalysisStatus;
  ai_quality_score?: number | null;
  ai_space_category?: PhotoSpaceCategory | null;
  ai_photo_type?: PhotoType | null;
  ai_tags?: string[];
  ai_description?: string | null;
  ai_featured_score?: number | null;
  ai_analyzed_at?: string | null;
  ai_error_message?: string | null;
}

/** Input for inserting a new photo record */
export interface CreatePhotoRecordInput {
  original_name: string;
  storage_path: string;
  public_url: string | null;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  uploaded_by: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

// ============================================================
// CONTENT AGGREGATOR — 자기확장형 콘텐츠 시스템
// ============================================================

export type ContentPlatform = "rss" | "youtube" | "instagram" | "x";

export type VisibilityStatus = "pending" | "published" | "hidden" | "featured";

// content_sources 테이블
export interface ContentSource {
  id: UUID;
  name: string;
  platform: ContentPlatform;
  source_url?: string | null;
  rss_url?: string | null;
  channel_id?: string | null;
  account_handle?: string | null;
  is_active: boolean;
  auto_publish: boolean;
  fetch_interval_minutes: number;
  last_fetched_at?: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// external_contents 테이블
export interface ExternalContent {
  id: UUID;
  source_id?: UUID | null;
  source?: ContentSource;
  platform: ContentPlatform;
  external_id: string;
  external_url: string;
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  author_name?: string | null;
  thumbnail_url?: string | null;
  media_url?: string | null;
  published_at?: ISODateString | null;
  fetched_at: ISODateString;
  visibility_status: VisibilityStatus;
  is_featured: boolean;
  category?: string | null;
  related_space_id?: UUID | null;
  related_space?: Space;
  related_program_id?: UUID | null;
  related_program?: Program;
  metadata_json?: Record<string, unknown>;
  tags?: ContentTag[];
  created_at: ISODateString;
  updated_at: ISODateString;
}

// content_tags 테이블
export interface ContentTag {
  id: UUID;
  name: string;
  slug: string;
  created_at: ISODateString;
}

// content_tag_maps 테이블
export interface ContentTagMap {
  external_content_id: UUID;
  tag_id: UUID;
}

// fetch_logs 테이블
export interface FetchLog {
  id: UUID;
  source_id?: UUID | null;
  source?: ContentSource;
  platform?: string | null;
  status: "success" | "partial" | "error";
  items_found: number;
  items_new: number;
  items_skipped: number;
  error_message?: string | null;
  duration_ms?: number | null;
  fetched_at: ISODateString;
}

// 플랫폼별 통계
export interface ExternalContentStats {
  platform: ContentPlatform;
  total: number;
  pending: number;
  published: number;
  hidden: number;
}

// Fetcher 공통 인터페이스
export interface FetchResult {
  source_id: string;
  platform: ContentPlatform;
  items: NormalizedContent[];
  error?: string;
  duration_ms: number;
}

// 정규화된 수집 콘텐츠 (저장 전 중간 형식)
export interface NormalizedContent {
  external_id: string;
  external_url: string;
  title?: string;
  summary?: string;
  content?: string;
  author_name?: string;
  thumbnail_url?: string;
  media_url?: string;
  published_at?: string;
  platform: ContentPlatform;
  metadata_json?: Record<string, unknown>;
}
