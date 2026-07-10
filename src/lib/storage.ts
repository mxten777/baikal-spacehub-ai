import { supabase } from './supabase'

const DEFAULT_BUCKET = 'photos'
const PUBLIC_OBJECT_SEGMENT = '/storage/v1/object/public/'
const SAFE_PATH_PREFIX = 'cms/'

/**
 * Extracts the Storage file path from a Supabase public URL.
 *
 * Returns `null` when:
 * - URL is unparseable
 * - Hostname does not match this project's Supabase URL
 * - Not a public object URL in the expected bucket
 * - Decoded path does not start with `cms/`
 * - Path contains traversal sequences
 */
export function getStoragePathFromPublicUrl(
  publicUrl: string,
  bucketName: string = DEFAULT_BUCKET,
): string | null {
  try {
    const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
    if (!envUrl) return null

    const projectHost = new URL(envUrl).hostname
    const parsed = new URL(publicUrl)

    // Must belong to this exact Supabase project (strict hostname match)
    if (parsed.hostname !== projectHost) return null

    const expectedPrefix = `${PUBLIC_OBJECT_SEGMENT}${bucketName}/`
    if (!parsed.pathname.startsWith(expectedPrefix)) return null

    const raw = parsed.pathname.slice(expectedPrefix.length)
    const storagePath = decodeURIComponent(raw)

    // Only allow paths under cms/ to prevent accidental deletions
    if (!storagePath.startsWith(SAFE_PATH_PREFIX)) return null

    // Reject path traversal and empty segments
    if (storagePath.includes('../') || storagePath.includes('//') || storagePath.includes('./')) {
      return null
    }

    return storagePath
  } catch {
    return null
  }
}

/**
 * Deletes a file from Supabase Storage by its public URL.
 *
 * Silently skips:
 * - null / undefined / empty
 * - External URLs (different host)
 * - URLs not matching the expected bucket / cms/ prefix
 *
 * Throws on Storage API errors so callers can handle them.
 */
export async function deleteStorageFileByUrl(
  publicUrl: string | null | undefined,
  bucketName: string = DEFAULT_BUCKET,
): Promise<void> {
  if (!publicUrl) return

  const storagePath = getStoragePathFromPublicUrl(publicUrl, bucketName)
  if (!storagePath) return // external or unrecognised URL — skip silently

  const { error } = await supabase.storage.from(bucketName).remove([storagePath])
  if (error) {
    throw new Error(error.message)
  }
}

export interface StorageCleanupResult {
  deleted: string[]
  skipped: string[]
  failed: Array<{ url: string; error: unknown }>
}

/**
 * Deletes multiple Storage files by their public URLs.
 *
 * - Deduplicates by decoded storage path (same file referenced by different URL forms won't be double-deleted)
 * - External/invalid URLs are silently skipped (reported in `skipped`)
 * - One failure does not block the rest (`Promise.allSettled`)
 * - Reuses `deleteStorageFileByUrl` for consistent validation
 */
export async function deleteStorageFilesByUrls(
  urls: Iterable<string>,
  bucketName: string = DEFAULT_BUCKET,
): Promise<StorageCleanupResult> {
  const deleted: string[] = []
  const skipped: string[] = []
  const failed: Array<{ url: string; error: unknown }> = []

  // Deduplicate by decoded storage path to prevent double-deleting the same file
  const seenPaths = new Set<string>()
  const toProcess: string[] = []

  for (const url of urls) {
    const storagePath = getStoragePathFromPublicUrl(url, bucketName)
    if (!storagePath) {
      skipped.push(url)
      continue
    }
    if (seenPaths.has(storagePath)) {
      skipped.push(url)
      continue
    }
    seenPaths.add(storagePath)
    toProcess.push(url)
  }

  if (toProcess.length === 0) return { deleted, skipped, failed }

  const results = await Promise.allSettled(
    toProcess.map((url) => deleteStorageFileByUrl(url, bucketName)),
  )

  toProcess.forEach((url, i) => {
    const result = results[i]
    if (result.status === 'fulfilled') {
      deleted.push(url)
    } else {
      failed.push({ url, error: result.reason })
    }
  })

  return { deleted, skipped, failed }
}
