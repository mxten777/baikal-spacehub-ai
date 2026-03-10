import { useQuery } from '@tanstack/react-query'
import { spacesService } from '../services/spaces'
import { programsService } from '../services/programs'
import { archiveService } from '../services/archive'
import { blogService } from '../services/blog'
import { mediaService } from '../services/media'
import { inquiriesService } from '../services/inquiries'
import { isSupabaseConfigured } from '../lib/supabase'
import type { FilterOptions, InquiryType } from '../types'

// ── Spaces ──────────────────────────────────────────────────
export const useSpaces = (filters?: FilterOptions) =>
  useQuery({
    queryKey: ['spaces', filters],
    queryFn: () => spacesService.getAll(filters),
    staleTime: 5 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

export const useSpace = (slug: string) =>
  useQuery({
    queryKey: ['space', slug],
    queryFn: () => spacesService.getBySlug(slug),
    enabled: isSupabaseConfigured && !!slug,
    staleTime: 5 * 60 * 1000,
  })

// ── Programs ─────────────────────────────────────────────────
export const usePrograms = (filters?: FilterOptions & { limit?: number }) =>
  useQuery({
    queryKey: ['programs', filters],
    queryFn: () => programsService.getAll(filters),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

export const useUpcomingPrograms = (limit = 6) =>
  useQuery({
    queryKey: ['programs', 'upcoming', limit],
    queryFn: () => programsService.getUpcoming(limit),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

export const useProgram = (slug: string) =>
  useQuery({
    queryKey: ['program', slug],
    queryFn: () => programsService.getBySlug(slug),
    enabled: isSupabaseConfigured && !!slug,
  })

// ── Archive ──────────────────────────────────────────────────
export const useArchive = (filters?: FilterOptions & { limit?: number }) =>
  useQuery({
    queryKey: ['archive', filters],
    queryFn: () => archiveService.getAll(filters),
    staleTime: 10 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

export const useArchiveItem = (slug: string) =>
  useQuery({
    queryKey: ['archive-item', slug],
    queryFn: () => archiveService.getBySlug(slug),
    enabled: isSupabaseConfigured && !!slug,
  })

// ── Blog ─────────────────────────────────────────────────────
export const useBlogPosts = (filters?: FilterOptions & { limit?: number; page?: number }) =>
  useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: () => blogService.getPosts(filters),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

export const useBlogPost = (slug: string) =>
  useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: isSupabaseConfigured && !!slug,
  })

export const useBlogCategories = () =>
  useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogService.getCategories(),
    staleTime: 30 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

// ── Media ─────────────────────────────────────────────────────
export const useMedia = (platform?: 'youtube' | 'instagram' | 'x', limit = 12) =>
  useQuery({
    queryKey: ['media', platform, limit],
    queryFn: () => mediaService.getAll(platform, limit),
    staleTime: 5 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

export const useFeaturedMedia = (limit = 6) =>
  useQuery({
    queryKey: ['media', 'featured', limit],
    queryFn: () => mediaService.getFeatured(limit),
    staleTime: 5 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

// ── Inquiries (admin) ────────────────────────────────────────
export const useInquiries = (filters?: { status?: string; type?: InquiryType }) =>
  useQuery({
    queryKey: ['inquiries', filters],
    queryFn: () => inquiriesService.getAll(filters),
    staleTime: 1 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })
