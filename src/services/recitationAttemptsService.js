import { apiFetch } from "../api/client";

/**
 * Recitation Attempts Service
 * Endpoints for advanced recitation statistics (paid feature).
 * All three endpoints require: canViewAdvancedRecitationStatistics === true
 * Based on: Athar Frontend API Handoff — Sections 12, 13, 14
 */

/**
 * Get paginated recitation attempt history.
 * GET /api/recitation-attempts (Authenticated + advanced-statistics entitlement)
 *
 * @param {{ hadithId?: number, pageNumber?: number, pageSize?: number }} params
 * @returns {Promise<PagedResultDto<RecitationAttemptListItemDto>>}
 */
export async function getRecitationAttempts({ hadithId, pageNumber = 1, pageSize = 20 } = {}) {
  const query = new URLSearchParams();
  if (hadithId != null) query.set("hadithId", String(hadithId));
  query.set("pageNumber", String(pageNumber));
  query.set("pageSize", String(pageSize));
  return await apiFetch(`/api/recitation-attempts?${query.toString()}`);
}

/**
 * Get detailed recitation attempt with transcript and per-word issues.
 * GET /api/recitation-attempts/{attemptId} (Authenticated + advanced-statistics entitlement)
 *
 * @param {number} attemptId
 * @returns {Promise<RecitationAttemptDetailDto>}
 */
export async function getRecitationAttemptDetail(attemptId) {
  return await apiFetch(`/api/recitation-attempts/${attemptId}`);
}

/**
 * Get per-hadith recitation summary statistics.
 * GET /api/hadiths/{hadithId}/recitation/summary (Authenticated + advanced-statistics entitlement)
 *
 * @param {number} hadithId
 * @returns {Promise<HadithRecitationSummaryDto>}
 */
export async function getHadithRecitationSummary(hadithId) {
  return await apiFetch(`/api/hadiths/${hadithId}/recitation/summary`);
}
