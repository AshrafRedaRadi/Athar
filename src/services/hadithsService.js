import { apiFetch } from "../api/client";

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
    text: item.text,
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
    audioUrl: item.audioUrl || "",
    videoExplanation: item.videoExplanationYouTubeId || "",
  };
}

/**
 * Dynamic Service for fetching Hadith content from backend API.
 */
export const hadithsService = {
  /**
   * Fetch list of hadiths for a given book (and optional section)
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
   */
  async getHadithById(id) {
    if (!id) return null;
    const item = await apiFetch(`/api/Hadiths/${id}`);
    return formatHadith(item);
  },

  /**
   * Create a new Hadith via POST /api/Hadiths
   * @param {Object} hadithData
   * @returns {Promise<Object>}
   */
  async createHadith(hadithData) {
    const payload = {
      title: hadithData.title || "",
      text: hadithData.matnText || hadithData.text || "",
      order: Number(hadithData.order) || 1,
      hadithBookId: Number(hadithData.hadithBookId),
      hadithSectionId: hadithData.hadithSectionId ? Number(hadithData.hadithSectionId) : null,
      narrator: hadithData.narrator?.trim() || "غير محدد",
      takhrij: hadithData.takhrij?.trim() || "",
      grade: Number(hadithData.grade) || 1,
      audioUrl: hadithData.audioUrl || "",
      videoExplanationYouTubeId: hadithData.videoUrl || hadithData.videoExplanationYouTubeId || "",
    };
    return await apiFetch("/api/Hadiths", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing Hadith via PUT /api/Hadiths/{id}
   * @param {number|string} id
   * @param {Object} hadithData
   * @returns {Promise<Object>}
   */
  async updateHadith(id, hadithData) {
    const payload = {
      id: Number(id) || id,
      title: hadithData.title || "",
      text: hadithData.matnText || hadithData.text || "",
      order: Number(hadithData.order) || 1,
      hadithBookId: Number(hadithData.hadithBookId),
      hadithSectionId: hadithData.hadithSectionId ? Number(hadithData.hadithSectionId) : null,
      narrator: hadithData.narrator?.trim() || "غير محدد",
      takhrij: hadithData.takhrij?.trim() || "",
      grade: Number(hadithData.grade) || 1,
      audioUrl: hadithData.audioUrl || "",
      videoExplanationYouTubeId: hadithData.videoUrl || hadithData.videoExplanationYouTubeId || "",
    };
    return await apiFetch(`/api/Hadiths/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a Hadith by ID via DELETE /api/Hadiths/{id}
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async deleteHadith(id) {
    return await apiFetch(`/api/Hadiths/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetch user progress list for hadiths in a book
   */
  async getHadithProgress(bookId) {
    if (!bookId) return [];
    try {
      return await apiFetch(`/api/hadiths/progress?bookId=${bookId}`);
    } catch (err) {
      console.warn("Could not fetch hadith progress:", err.message);
      return [];
    }
  },

  /** Alias for getHadithProgress */
  async getHadithsProgress(bookId) {
    return this.getHadithProgress(bookId);
  },

  /**
   * Update hadith completion status for current user
   */
  async updateHadithProgress(hadithId, status = 1) {
    if (!hadithId) return null;
    try {
      return await apiFetch(`/api/hadiths/${hadithId}/progress`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    } catch {
      try {
        return await apiFetch(`/api/hadiths/${hadithId}/progress`, {
          method: "POST",
          body: JSON.stringify({ status }),
        });
      } catch (err) {
        console.warn("Could not update hadith progress:", err.message);
        return null;
      }
    }
  },

  // Cache for explanation books to avoid repetitive network requests
  _cachedExpBooks: null,

  /**
   * Fetch all Explanation Books from API (/api/ExplanationBooks)
   */
  async getExplanationBooks() {
    if (this._cachedExpBooks && this._cachedExpBooks.length > 0) {
      return this._cachedExpBooks;
    }
    try {
      const data = await apiFetch("/api/ExplanationBooks");
      this._cachedExpBooks = Array.isArray(data) ? data : data?.data || data?.items || [];
      return this._cachedExpBooks;
    } catch {
      return [];
    }
  },

  /**
   * Fetch explanations for a given hadith from API (/api/Hadiths/{id}/explanations)
   * Automatically resolves author and book info from ExplanationBooks.
   */
  async getHadithExplanations(hadithId) {
    if (!hadithId) return null;
    try {
      const [explanations, expBooks] = await Promise.all([
        apiFetch(`/api/Hadiths/${hadithId}/explanations`),
        this.getExplanationBooks().catch(() => []),
      ]);

      const list = Array.isArray(explanations)
        ? explanations
        : Array.isArray(explanations?.data)
        ? explanations.data
        : explanations && typeof explanations === "object"
        ? [explanations]
        : [];

      return list.map((item) => {
        const book = Array.isArray(expBooks)
          ? expBooks.find((b) => Number(b.id) === Number(item.explanationBookId))
          : null;

        return {
          ...item,
          author: book?.author || "",
          bookTitle: item.explanationBookName || "",
        };
      });
    } catch (err) {
      console.warn("Error fetching hadith explanations:", err.message);
      return null;
    }
  },

  /**
   * Fetch all Hadith Explanations dynamically in 1 batch request (/api/Explanations)
   */
  async getAllExplanations() {
    try {
      const data = await apiFetch("/api/Explanations");
      return Array.isArray(data) ? data : data?.data || data?.items || [];
    } catch (err) {
      console.warn("Could not fetch all explanations:", err.message);
      return [];
    }
  },

  /**
   * Synchronously resolve explanation title / scholar from pre-fetched explanation books list.
   */
  resolveExplanationTitleSync(item, expBooks = []) {
    if (!item) return "";
    const direct = item.title || item.explanationBookTitle || item.author;

    if (direct && typeof direct === "string" && direct.trim().length > 0 && !direct.startsWith("الحديث")) {
      return direct.trim();
    }

    const expBookId = item.explanationBookId;
    if (expBookId && Array.isArray(expBooks)) {
      const found = expBooks.find((b) => Number(b.id) === Number(expBookId));
      if (found) {
        return found.title || found.author || "";
      }
    }

    return "";
  },

  /**
   * Update last opened hadith on account
   */
  async updateLastOpenedHadith(hadithId, retryCount = 1) {
    if (!hadithId) return null;
    try {
      return await apiFetch(`/api/Account/last-opened-hadith/${hadithId}`, {
        method: "PUT",
      });
    } catch (err) {
      if (retryCount > 0 && err?.message?.toLowerCase().includes("concurrency")) {
        await new Promise((res) => setTimeout(res, 350));
        return this.updateLastOpenedHadith(hadithId, retryCount - 1);
      }
      return null;
    }
  },

  /**
   * Fetch Hadith Key Terms dynamically from backend API (/api/HadithKeyTerms)
   * @param {number|string} [hadithId]
   * @returns {Promise<Array>}
   */
  async getHadithKeyTerms(hadithId = null) {
    try {
      let data = null;
      if (hadithId) {
        try {
          data = await apiFetch(`/api/HadithKeyTerms?hadithId=${hadithId}`);
        } catch {
          data = await apiFetch("/api/HadithKeyTerms");
        }
      } else {
        data = await apiFetch("/api/HadithKeyTerms");
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.keyTerms)
        ? data.keyTerms
        : Array.isArray(data?.items)
        ? data.items
        : [];

      let filtered = list;
      if (hadithId && Array.isArray(list) && list.length > 0) {
        const matches = list.filter((kt) => {
          const ktHadithId = kt.hadithId ?? kt.hadithID ?? kt.HadithId ?? kt.hadith_id ?? kt.HadithID;
          return ktHadithId != null && Number(ktHadithId) === Number(hadithId);
        });
        if (matches.length > 0) {
          filtered = matches;
        }
      }

      return filtered.map((kt, index) => {
        const rawText = kt.text ?? kt.Text ?? kt.term ?? kt.word ?? kt.KeyTerm ?? "";
        const rawNorm = kt.normalizedText ?? kt.NormalizedText ?? kt.normalized_text ?? "";
        return {
          id: kt.id ?? kt.Id ?? Date.now() + index,
          hadithId: kt.hadithId ?? kt.HadithId ?? hadithId,
          text: rawText,
          normalizedText: rawNorm,
          order: kt.order ?? kt.Order ?? index + 1,
        };
      });
    } catch (err) {
      console.warn("Could not fetch HadithKeyTerms from API:", err.message);
      throw err;
    }
  },

  /**
   * Create a new HadithKeyTerm via POST /api/HadithKeyTerms
   */
  async createHadithKeyTerm(keyTermData) {
    const payload = {
      hadithId: Number(keyTermData.hadithId),
      text: keyTermData.text || "",
      normalizedText: keyTermData.normalizedText || "",
      order: Number(keyTermData.order || 1),
    };

    return await apiFetch("/api/HadithKeyTerms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update an existing HadithKeyTerm via PUT /api/HadithKeyTerms/{id}
   */
  async updateHadithKeyTerm(id, keyTermData) {
    const payload = {
      id: Number(id) || id,
      hadithId: Number(keyTermData.hadithId),
      text: keyTermData.text || "",
      normalizedText: keyTermData.normalizedText || "",
      order: Number(keyTermData.order || 1),
    };

    return await apiFetch(`/api/HadithKeyTerms/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a HadithKeyTerm via DELETE /api/HadithKeyTerms/{id}
   */
  async deleteHadithKeyTerm(id) {
    return await apiFetch(`/api/HadithKeyTerms/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetch total Hadiths count via GET /api/Hadiths
   */
  async getHadithsCount() {
    try {
      const data = await apiFetch("/api/Hadiths");
      console.log("📜 [Hadiths API Data]:", data);
      if (Array.isArray(data)) {
        return data.length;
      }
      if (data && typeof data === "object") {
        if (typeof data.totalCount === "number") return data.totalCount;
        if (typeof data.total === "number") return data.total;
        if (typeof data.count === "number") return data.count;
        if (Array.isArray(data.items)) return data.items.length;
        if (Array.isArray(data.data)) return data.data.length;
        if (Array.isArray(data.hadiths)) return data.hadiths.length;
      }
      return 0;
    } catch (err) {
      console.warn("Could not fetch hadiths count:", err.message);
      return null;
    }
  },
};
