import { apiFetch, getImageUrl } from "../api/client";

/**
 * Mapping for difficulty level enum from backend:
 * 1 -> "مبتدئ" (Beginner)
 * 2 -> "متوسط" (Intermediate)
 * 3 -> "متقدم" (Advanced)
 */
export const DIFFICULTY_LEVEL_MAP = {
  1: "مبتدئ",
  2: "متوسط",
  3: "متقدم",
};

/**
 * Books service for fetching and manipulating Hadith Books from backend.
 */
export const booksService = {
  /**
   * Fetch list of all Hadith books
   * @returns {Promise<Array>} List of formatted book objects
   */
  async getBooks() {
    const data = await apiFetch("/api/HadithBooks");
    if (!Array.isArray(data)) return [];

    return data.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description || "",
      coverImage: getImageUrl(book.coverImageUrl),
      level: DIFFICULTY_LEVEL_MAP[book.difficultyLevel] || "مبتدئ",
      difficultyLevel: book.difficultyLevel,
      category: "الحديث", // Default category label for UI tabs
    }));
  },

  /**
   * Fetch sections for a specific book
   * @param {number|string} bookId
   * @returns {Promise<Array>} List of sections
   */
  async getBookSections(bookId) {
    if (!bookId) return [];
    return await apiFetch(`/api/HadithSections?bookId=${bookId}`);
  },
};
