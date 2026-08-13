import { apiFetch, getImageUrl } from "../api/client";

export const DIFFICULTY_LEVEL_MAP = {
  1: "مبتدئ",
  2: "متوسط",
  3: "متقدم",
};

const VISIBILITY_STORAGE_KEY = "athar_book_visibility_statuses";

/**
 * Helper to get persisted visibility status for a book ("معروض" / "مخفي")
 */
export function getBookVisibilityStatus(bookId) {
  try {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed[bookId] !== "undefined") {
        return parsed[bookId];
      }
    }
  } catch {
    // Fallthrough
  }
  return "معروض";
}

/**
 * Helper to persist visibility status for a book
 */
export function setBookVisibilityStatus(bookId, status) {
  try {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    parsed[bookId] = status;
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(parsed));
  } catch (err) {
    console.warn("Could not save book visibility:", err);
  }
}

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
      category: "الحديث",
      status: getBookVisibilityStatus(book.id),
      createdAt: book.createdAt || book.createdDate,
      updatedAt: book.updatedAt || book.updatedDate,
      studentsCount: book.studentsCount ?? Math.floor(Math.random() * 100) + 50,
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

  /**
   * Fetch total explanation books count via GET /api/ExplanationBooks
   */
  async getExplanationBooksCount() {
    try {
      const data = await apiFetch("/api/ExplanationBooks");
      console.log("📚 [Explanation Books API Data]:", data);
      if (Array.isArray(data)) {
        return data.length;
      }
      if (data && typeof data === "object") {
        if (typeof data.totalCount === "number") return data.totalCount;
        if (typeof data.total === "number") return data.total;
        if (typeof data.count === "number") return data.count;
        if (Array.isArray(data.items)) return data.items.length;
        if (Array.isArray(data.data)) return data.data.length;
        if (Array.isArray(data.books)) return data.books.length;
      }
      return 0;
    } catch (err) {
      console.warn("Could not fetch explanation books count:", err.message);
      return null;
    }
  },
};
