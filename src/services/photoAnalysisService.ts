/**
 * AI Photo Analysis Service — Sprint 5-A Scaffold
 *
 * This file defines the interface and a stub implementation.
 * Connect a real AI API in Sprint 5-B by replacing `photoAnalysisService`
 * with an implementation that calls the actual AI endpoint.
 *
 * Do NOT call this service directly from components.
 * The integration point is `photoRepository.updatePhotoAnalysis()`.
 */

import type { PhotoAnalysisResult } from "../types";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface PhotoAnalysisService {
  /**
   * Analyse a single photo by its database ID.
   * The implementation should:
   *   1. Fetch a signed / public URL for the photo
   *   2. Call the AI API
   *   3. Return a structured result
   * On failure, throw an Error with a user-facing message.
   */
  analyze(photoId: string): Promise<PhotoAnalysisResult>;
}

// ─── Stub implementation ──────────────────────────────────────────────────────

/**
 * Placeholder — replace with a real implementation once the AI API is ready.
 * Throws a clear error to prevent accidental invocation before Sprint 5-B.
 */
export const photoAnalysisService: PhotoAnalysisService = {
  analyze: async (_photoId: string): Promise<PhotoAnalysisResult> => {
    throw new Error("AI 분석 서비스가 아직 연결되지 않았습니다.");
  },
};
