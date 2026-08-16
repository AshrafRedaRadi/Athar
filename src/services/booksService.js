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
   * Fetch total Hadith books count via GET /api/HadithBooks
   */
  async getBooksCount() {
    try {
      const data = await apiFetch("/api/HadithBooks");
      console.log("📚 [Hadith Books API Data]:", data);
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
      console.warn("Could not fetch hadith books count:", err.message);
      return null;
    }
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

  // ── HadithSections CRUD ──

  /**
   * Create a new section under a book
   * @param {{ name: string, type: number, order: number, hadithBookId: number, parentSectionId?: number }} data
   */
  async createSection(data) {
    return await apiFetch("/api/HadithSections", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing section
   * @param {number|string} sectionId
   * @param {Object} data
   */
  async updateSection(sectionId, data) {
    return await apiFetch(`/api/HadithSections/${sectionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a section by ID
   * @param {number|string} sectionId
   */
  async deleteSection(sectionId) {
    return await apiFetch(`/api/HadithSections/${sectionId}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetch full book content (sections + hadiths) in parallel
   * @param {number|string} bookId
   * @returns {Promise<{ sections: Array, hadiths: Array }>}
   */
  async getBookFullContent(bookId) {
    if (!bookId) return { sections: [], hadiths: [] };
    const [sections, hadiths] = await Promise.all([
      apiFetch(`/api/HadithSections?bookId=${bookId}`).catch(() => []),
      apiFetch(`/api/Hadiths?bookId=${bookId}`).catch(() => []),
    ]);
    return {
      sections: Array.isArray(sections) ? sections : [],
      hadiths: Array.isArray(hadiths) ? hadiths : [],
    };
  },

  // ── HadithBooks CRUD ──

  /**
   * Create a new Hadith book via POST /api/HadithBooks (multipart/form-data)
   * @param {Object} bookData
   * @returns {Promise<Object>} Created book data
   */
  async createBook(bookData) {
    const formData = new FormData();
    formData.append("Title", bookData.title || "");
    formData.append("title", bookData.title || "");
    formData.append("Author", bookData.author || "");
    formData.append("author", bookData.author || "");
    formData.append("Description", bookData.description || "");
    formData.append("description", bookData.description || "");
    formData.append("DifficultyLevel", String(Number(bookData.difficultyLevel) || 1));
    formData.append("difficultyLevel", String(Number(bookData.difficultyLevel) || 1));
    
    if (bookData.category) {
      formData.append("Category", bookData.category);
      formData.append("category", bookData.category);
    }
    
    if (bookData.coverImageFile instanceof File) {
      formData.append("CoverImage", bookData.coverImageFile);
      formData.append("coverImage", bookData.coverImageFile);
      formData.append("File", bookData.coverImageFile);
      formData.append("file", bookData.coverImageFile);
    }

    return await apiFetch("/api/HadithBooks", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Update an existing Hadith book via PUT /api/HadithBooks/{id} (multipart/form-data)
   * @param {number|string} id
   * @param {Object} bookData
   * @returns {Promise<Object>}
   */
  async updateBook(id, bookData) {
    const formData = new FormData();
    formData.append("Id", String(id));
    formData.append("id", String(id));
    formData.append("Title", bookData.title || "");
    formData.append("title", bookData.title || "");
    formData.append("Author", bookData.author || "");
    formData.append("author", bookData.author || "");
    formData.append("Description", bookData.description || "");
    formData.append("description", bookData.description || "");
    formData.append("DifficultyLevel", String(Number(bookData.difficultyLevel) || 1));
    formData.append("difficultyLevel", String(Number(bookData.difficultyLevel) || 1));
    
    if (bookData.category) {
      formData.append("Category", bookData.category);
      formData.append("category", bookData.category);
    }
    
    if (bookData.coverImageFile instanceof File) {
      formData.append("CoverImage", bookData.coverImageFile);
      formData.append("coverImage", bookData.coverImageFile);
      formData.append("File", bookData.coverImageFile);
      formData.append("file", bookData.coverImageFile);
    }

    return await apiFetch(`/api/HadithBooks/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  /**
   * Delete a Hadith book by ID via DELETE /api/HadithBooks/{id}
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async deleteBook(id) {
    return await apiFetch(`/api/HadithBooks/${id}`, {
      method: "DELETE",
    });
  },
};

