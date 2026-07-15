import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { spacesService } from "../services/spaces";
import { programsService } from "../services/programs";
import { archiveService } from "../services/archive";
import { blogService } from "../services/blog";
import { mediaService } from "../services/media";
import { inquiriesService } from "../services/inquiries";
import { contentSourcesService } from "../services/contentSources";
import { externalContentsService } from "../services/externalContents";
import { fetchLogsService } from "../services/fetchLogs";
import { heroSlidesService } from "../services/heroSlides";
import { getPublicPhotosByCategory } from "../services/photoRepository";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type {
  FilterOptions,
  InquiryType,
  ContentPlatform,
  Space,
  Program,
  BlogPost,
  ArchiveItem,
  ProjectCategory,
  PhotoSpaceCategory,
} from "../types";
import type { ExternalContentFilters } from "../services/externalContents";

// ── Spaces ──────────────────────────────────────────────────
export const useSpaces = (filters?: FilterOptions) =>
  useQuery({
    queryKey: ["spaces", filters],
    queryFn: () => spacesService.getAll(filters),
    staleTime: 5 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useSpace = (slug: string) =>
  useQuery({
    queryKey: ["space", slug],
    queryFn: () => spacesService.getBySlug(slug),
    enabled: isSupabaseConfigured && !!slug,
    staleTime: 5 * 60 * 1000,
  });

// ── Programs ─────────────────────────────────────────────────
export const usePrograms = (filters?: FilterOptions & { limit?: number }) =>
  useQuery({
    queryKey: ["programs", filters],
    queryFn: () => programsService.getAll(filters),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useUpcomingPrograms = (limit = 6) =>
  useQuery({
    queryKey: ["programs", "upcoming", limit],
    queryFn: () => programsService.getUpcoming(limit),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useProgram = (slug: string) =>
  useQuery({
    queryKey: ["program", slug],
    queryFn: () => programsService.getBySlug(slug),
    enabled: isSupabaseConfigured && !!slug,
  });

// ── Archive ──────────────────────────────────────────────────
export const useArchive = (filters?: FilterOptions & { limit?: number }) =>
  useQuery({
    queryKey: ["archive", filters],
    queryFn: () => archiveService.getAll(filters),
    staleTime: 10 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useArchiveItem = (slug: string) =>
  useQuery({
    queryKey: ["archive-item", slug],
    queryFn: () => archiveService.getBySlug(slug),
    enabled: isSupabaseConfigured && !!slug,
  });

// ── Blog ─────────────────────────────────────────────────────
export const useBlogPosts = (
  filters?: FilterOptions & { limit?: number; page?: number },
) =>
  useQuery({
    queryKey: ["blog-posts", filters],
    queryFn: () => blogService.getPosts(filters),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useBlogPost = (slug: string) =>
  useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: isSupabaseConfigured && !!slug,
  });

export const useBlogCategories = () =>
  useQuery({
    queryKey: ["blog-categories"],
    queryFn: () => blogService.getCategories(),
    staleTime: 30 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

// ── Media ─────────────────────────────────────────────────────
export const useMedia = (
  platform?: "youtube" | "instagram" | "x",
  limit = 12,
) =>
  useQuery({
    queryKey: ["media", platform, limit],
    queryFn: () => mediaService.getAll(platform, limit),
    staleTime: 5 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useFeaturedMedia = (limit = 6) =>
  useQuery({
    queryKey: ["media", "featured", limit],
    queryFn: () => mediaService.getFeatured(limit),
    staleTime: 5 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

// ── Inquiries (admin) ────────────────────────────────────────
export const useInquiries = (filters?: {
  status?: string;
  type?: InquiryType;
}) =>
  useQuery({
    queryKey: ["inquiries", filters],
    queryFn: () => inquiriesService.getAll(filters),
    staleTime: 1 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

// ── Content Sources ───────────────────────────────────────────
export const useContentSources = (platform?: ContentPlatform) =>
  useQuery({
    queryKey: ["content-sources", platform],
    queryFn: () => contentSourcesService.getAll(platform),
    staleTime: 5 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useActiveContentSources = () =>
  useQuery({
    queryKey: ["content-sources", "active"],
    queryFn: () => contentSourcesService.getActive(),
    staleTime: 5 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

// ── External Contents ─────────────────────────────────────────
export const useExternalContents = (
  filters: {
    platform?: ContentPlatform;
    category?: string;
    limit?: number;
  } = {},
) =>
  useQuery({
    queryKey: ["external-contents", "public", filters],
    queryFn: () => externalContentsService.getPublished(filters),
    staleTime: 3 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useFeaturedExternalContents = (limit = 6) =>
  useQuery({
    queryKey: ["external-contents", "featured", limit],
    queryFn: () => externalContentsService.getFeatured(limit),
    staleTime: 3 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

export const useExternalContentsAdmin = (
  filters: ExternalContentFilters = {},
) =>
  useQuery({
    queryKey: ["external-contents", filters],
    queryFn: () => externalContentsService.getAllAdmin(filters),
    staleTime: 1 * 60 * 1000,
    enabled: isSupabaseConfigured,
    placeholderData: (prev) => prev,
  });

export const useExternalContentStats = () =>
  useQuery({
    queryKey: ["external-contents", "stats"],
    queryFn: () => externalContentsService.getStats(),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

// ── Fetch Logs ────────────────────────────────────────────────
export const useFetchLogs = (sourceId?: string, limit = 50) =>
  useQuery({
    queryKey: ["fetch-logs", sourceId, limit],
    queryFn: () => fetchLogsService.getRecent(sourceId, limit),
    staleTime: 1 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

// ── Settings ──────────────────────────────────────────────────
/** Returns a flat key→value map of all settings rows. */
export const useSettings = () =>
  useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("key, value");
      const map: Record<string, string> = {};
      for (const row of data ?? []) {
        if (row.key) map[row.key as string] = (row.value as string) ?? "";
      }
      return map;
    },
    staleTime: 10 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

// ── Hero Slides ───────────────────────────────────────────────
/** Admin: 비활성 포함 전체 조회 */
export const useHeroSlides = () =>
  useQuery({
    queryKey: ["hero-slides"],
    queryFn: () => heroSlidesService.getAll(),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

/** Public: 활성 + 게시기간 내 슬라이드만 조회 */
export const useActiveHeroSlides = (options?: {
  placeholderData?: import("../types").HeroSlide[];
}) =>
  useQuery({
    queryKey: ["hero-slides", "active"],
    queryFn: () => heroSlidesService.getActive(),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
    placeholderData: options?.placeholderData,
  });

// ── Public Photos ─────────────────────────────────────────────
/**
 * 공개 페이지용 사진 조회.
 * project_stage='web' + upload_status='completed' 인 사진을 반환.
 * is_featured 우선, 최신순 정렬.
 */
export const usePublicPhotos = (
  projectCategory: ProjectCategory | null,
  options?: { spaceCategory?: PhotoSpaceCategory; limit?: number },
) =>
  useQuery({
    queryKey: ["public-photos", projectCategory, options],
    queryFn: () => getPublicPhotosByCategory(projectCategory, options),
    staleTime: 10 * 60 * 1000,
    enabled: isSupabaseConfigured,
    retry: 1,
  });

// ── Search ────────────────────────────────────────────────────
export interface SearchResults {
  spaces: Space[];
  programs: Program[];
  blog: BlogPost[];
  archive: ArchiveItem[];
}

export const useSearch = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const trimmed = query.trim();
    const id = setTimeout(() => setDebouncedQuery(trimmed), 300);
    return () => clearTimeout(id);
  }, [query]);

  const isActive = debouncedQuery.length >= 2;
  const enabled = isSupabaseConfigured && isActive;

  const spacesQ = useQuery({
    queryKey: ["search", "spaces", debouncedQuery],
    queryFn: async () => {
      const all = await spacesService.getAll({ search: debouncedQuery });
      return all.slice(0, 3);
    },
    enabled,
    staleTime: 30 * 1000,
  });

  const programsQ = useQuery({
    queryKey: ["search", "programs", debouncedQuery],
    queryFn: () => programsService.getAll({ search: debouncedQuery, limit: 3 }),
    enabled,
    staleTime: 30 * 1000,
  });

  const blogQ = useQuery({
    queryKey: ["search", "blog", debouncedQuery],
    queryFn: async () => {
      const result = await blogService.getPosts({
        search: debouncedQuery,
        limit: 3,
      });
      return result.data;
    },
    enabled,
    staleTime: 30 * 1000,
  });

  const archiveQ = useQuery({
    queryKey: ["search", "archive", debouncedQuery],
    queryFn: () => archiveService.getAll({ search: debouncedQuery, limit: 3 }),
    enabled,
    staleTime: 30 * 1000,
  });

  const isLoading =
    isActive &&
    (spacesQ.isFetching ||
      programsQ.isFetching ||
      blogQ.isFetching ||
      archiveQ.isFetching);

  const error: Error | null =
    (spacesQ.error as Error | null) ??
    (programsQ.error as Error | null) ??
    (blogQ.error as Error | null) ??
    (archiveQ.error as Error | null);

  return {
    results: {
      spaces: spacesQ.data ?? [],
      programs: programsQ.data ?? [],
      blog: blogQ.data ?? [],
      archive: archiveQ.data ?? [],
    } as SearchResults,
    isLoading,
    error,
    isActive,
  };
};
