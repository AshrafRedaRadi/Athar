import { apiFetch } from "../api/client";

/**
 * Mapping for hadith grade enum:
 * 1 -> "صحيح" (Sahih)
 * 2 -> "حسن" (Hasan)
 * 3 -> "ضعيف" (Daif)
 */
export const HADITH_GRADE_MAP = {
  1: "صحيح",
  2: "حسن",
  3: "ضعيف",
};

/**
 * Helper to format raw hadith API response object to UI object.
 */
export function formatHadith(item, fallbackIndex = 0) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title || "",
    text: item.text, // Authoritative hadith text
    normalizedText: item.normalizedText,
    order: item.order || fallbackIndex + 1,
    hadithNumber: item.hadithNumber
      ? `الحديث ${item.hadithNumber}`
      : `الحديث ${fallbackIndex + 1}`,
    narrator: item.narrator || "",
    takhrij: item.takhrij || "",
    source: item.takhrij || (item.narrator ? `عن ${item.narrator}` : ""),
    grade: HADITH_GRADE_MAP[item.grade] || "",
    hadithBookId: item.hadithBookId,
    hadithSectionId: item.hadithSectionId,
  };
}

/**
 * Service for fetching Hadith content from backend API.
 */
export const hadithsService = {
  /**
   * Fetch list of hadiths for a given book (and optional section)
   * @param {number|string} bookId 
   * @param {number|string} [sectionId]
   * @returns {Promise<Array>}
   */
  async getHadithsByBook(bookId, sectionId = null) {
    if (!bookId) return [];
    let endpoint = `/api/Hadiths?bookId=${bookId}`;
    if (sectionId) {
      endpoint += `&sectionId=${sectionId}`;
    }
    const data = await apiFetch(endpoint);
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => formatHadith(item, index));
  },

  /**
   * Fetch single hadith details by ID
   * @param {number|string} id 
   * @returns {Promise<object>}
   */
  async getHadithById(id) {
    if (!id) return null;
    const item = await apiFetch(`/api/Hadiths/${id}`);
    return formatHadith(item);
  },
};
