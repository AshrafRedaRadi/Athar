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
 * Helper to extract YouTube Video ID from standard YouTube URL or ID string
 * Ensures the output string is EXACTLY 11 characters (or null) as required by backend validation.
 */
export function extractYouTubeId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const str = urlOrId.trim();
  if (!str) return null;

  // 1. Check if it's already an exact 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // 2. Extract from standard YouTube URLs (watch?v=..., youtu.be/..., embed/..., shorts/...)
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = str.match(regExp);
  if (match && match[1] && /^[a-zA-Z0-9_-]{11}$/.test(match[1])) {
    return match[1];
  }

  return null;
}

/**
 * Dynamic Service for fetching Hadith content from backend API.
 */
export const hadithsService = {
  /**
   * Fetch list of hadiths for a given book (and optional section)
   */
  /**
   * One page of hadiths for a book or section.
   * @returns {Promise<{items: Array, pageNumber: number, totalPages: number, totalCount: number}>}
   */
  async getHadithsPaged(bookId, sectionId = null, pageNumber = 1, pageSize = 50) {
    const empty = { items: [], pageNumber: 1, pageSize, totalCount: 0, totalPages: 0 };
    if (!bookId) return empty;

    const params = new URLSearchParams({
      bookId: String(bookId),
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    if (sectionId) params.set("sectionId", String(sectionId));

    const data = await apiFetch(`/api/Hadiths/paged?${params.toString()}`);
    if (!data || !Array.isArray(data.items)) return empty;
    return data;
  },

  async getHadithsByBook(bookId, sectionId = null) {
    if (!bookId) return [];
    let endpoint = `/api/Hadiths?HadithBookId=${bookId}&bookId=${bookId}`;
    if (sectionId) {
      endpoint += `&HadithSectionId=${sectionId}&sectionId=${sectionId}`;
    }
    const data = await apiFetch(endpoint);
    if (!Array.isArray(data)) return [];

    // Filter strictly by bookId (and optional sectionId) to prevent leaking hadiths from other books
    const filtered = data.filter((item) => {
      const bId = item.hadithBookId ?? item.HadithBookId ?? item.bookId ?? item.BookId ?? item.hadithBook?.id;
      if (bId != null && Number(bId) !== Number(bookId)) {
        return false;
      }
      if (sectionId) {
        const sId = item.hadithSectionId ?? item.HadithSectionId ?? item.sectionId ?? item.SectionId ?? item.hadithSection?.id;
        if (sId != null && Number(sId) !== Number(sectionId)) {
          return false;
        }
      }
      return true;
    });

    return filtered.map((item, index) => formatHadith(item, index));
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
    const rawVideo = hadithData.videoUrl || hadithData.videoExplanationYouTubeId || "";
    const ytId = extractYouTubeId(rawVideo);

    const payload = {
      title: hadithData.title || "",
      text: hadithData.matnText || hadithData.text || "",
      order: Number(hadithData.order) || 1,
      hadithNumber: hadithData.hadithNumber?.toString().trim() || null,
      hadithBookId: Number(hadithData.hadithBookId),
      hadithSectionId: hadithData.hadithSectionId ? Number(hadithData.hadithSectionId) : null,
      narrator: hadithData.narrator?.trim() || "غير محدد",
      takhrij: hadithData.takhrij?.trim() || "",
      grade: Number(hadithData.grade) || 1,
      audioUrl: hadithData.audioUrl || null,
      videoExplanationYouTubeId: ytId || null,
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
    const rawVideo = hadithData.videoUrl || hadithData.videoExplanationYouTubeId || "";
    const ytId = extractYouTubeId(rawVideo);

    // hadithBookId is deliberately absent: the update contract does not accept it, so
    // sending it only implied that a hadith could be moved between books.
    const payload = {
      id: Number(id) || id,
      title: hadithData.title || "",
      text: hadithData.matnText || hadithData.text || "",
      order: Number(hadithData.order) || 1,
      hadithNumber: hadithData.hadithNumber?.toString().trim() || null,
      hadithSectionId: hadithData.hadithSectionId ? Number(hadithData.hadithSectionId) : null,
      narrator: hadithData.narrator?.trim() || "غير محدد",
      takhrij: hadithData.takhrij?.trim() || "",
      grade: Number(hadithData.grade) || 1,
      audioUrl: hadithData.audioUrl || null,
      videoExplanationYouTubeId: ytId || null,
    };
    return await apiFetch(`/api/Hadiths/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a Hadith by ID via DELETE /api/Hadiths/{id}
   * Cleans up attached child explanations first to avoid FK 400 Bad Request
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async deleteHadith(id) {
    if (!id) return null;
    try {
      // 1. Delete all attached explanations first to satisfy backend Foreign Key constraint
      const exps = await this.getHadithExplanations(id).catch(() => []);
      if (Array.isArray(exps) && exps.length > 0) {
        for (const exp of exps) {
          if (exp.id) {
            await this.deleteExplanation(exp.id).catch(() => null);
          }
        }
      }
    } catch {
      // Ignore pre-cleanup errors
    }

    // 2. Delete the hadith entity
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
      const explanations = await apiFetch(`/api/Hadiths/${hadithId}/explanations`);

      const list = Array.isArray(explanations)
        ? explanations
        : Array.isArray(explanations?.data)
        ? explanations.data
        : explanations && typeof explanations === "object"
        ? [explanations]
        : [];

      // The response already carries the book name and author, so there is no second
      // request to make. Fetching the whole ExplanationBooks list just to read the author
      // also meant a failed lookup silently blanked the شيخ's name.
      return list.map((item) => ({
        ...item,
        author: item.explanationBookAuthor || "",
        bookTitle: item.explanationBookName || "",
      }));
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
   * Create a new Explanation Book entry on the backend API (/api/ExplanationBooks)
   */
  async createExplanationBook(titleOrScholar) {
    try {
      // The picker supplies both fields explicitly; the string form is the older path that
      // has to infer them, and is kept for callers that only know a single name.
      if (titleOrScholar && typeof titleOrScholar === "object") {
        const res = await apiFetch("/api/ExplanationBooks", {
          method: "POST",
          body: JSON.stringify({
            name: (titleOrScholar.name || "").trim() || "شرح",
            author: (titleOrScholar.author || "").trim() || "غير محدد",
          }),
        });
        this._cachedExpBooks = null;
        return res;
      }

      let title = titleOrScholar || "شرح";
      let author = titleOrScholar || "غير محدد";

      if (titleOrScholar && titleOrScholar.includes(" - ")) {
        const parts = titleOrScholar.split(" - ");
        title = parts[0].trim();
        author = parts[1].trim();
      } else if (titleOrScholar && (titleOrScholar.includes("للشيخ") || titleOrScholar.includes("لـ"))) {
        title = titleOrScholar;
        const match = titleOrScholar.match(/(?:للشيخ|لـ|للإمام)\s+(.+)/);
        if (match && match[1]) {
          author = match[1].trim();
        }
      }

      // The API contract is { name, author }, both required. Sending "title" meant every
      // create failed validation, which is what pushed callers onto the silent fallbacks.
      const payload = {
        name: title,
        author: author,
      };
      const res = await apiFetch("/api/ExplanationBooks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // Invalidate cache
      this._cachedExpBooks = null;
      return res;
    } catch (err) {
      console.error("Could not create explanation book:", err.message);
      throw err;
    }
  },

  /**
   * Resolve which explanation book a شرح belongs to, from either an explicit id or a
   * scholar/book name. Throws rather than guessing: an explanation filed under the wrong
   * شيخ is worse than a save that fails and says why.
   * @param {{ scholarOrBook?: string, explanationBookId?: number }} payload
   * @returns {Promise<number>}
   */
  async resolveExplanationBookId(payload) {
    // An id chosen from the list is exact, so it always beats matching on a name.
    const explicitId = Number(payload.explanationBookId);
    if (Number.isInteger(explicitId) && explicitId > 0) {
      return explicitId;
    }

    const scholar = typeof payload.scholarOrBook === "string" ? payload.scholarOrBook.trim() : "";
    if (!scholar) {
      throw new Error("يجب تحديد الشيخ أو كتاب الشرح قبل حفظ الشرح.");
    }

    // An explicit author means the picker asked for both fields, so nothing needs guessing.
    const author = typeof payload.newBookAuthor === "string" ? payload.newBookAuthor.trim() : "";
    if (author) {
      const created = await this.createExplanationBook({ name: scholar, author });
      if (created?.id) return created.id;
      throw new Error("تعذّر إنشاء كتاب الشرح، يرجى المحاولة مرة أخرى.");
    }

    return await this.getOrCreateExplanationBookId(scholar);
  },

  /**
   * Helper to resolve or find/create a valid explanation book ID
   */
  async getOrCreateExplanationBookId(scholarOrBookName) {
    if (!scholarOrBookName || !scholarOrBookName.trim()) {
      throw new Error("يجب تحديد الشيخ أو كتاب الشرح قبل حفظ الشرح.");
    }

    const s = scholarOrBookName.trim().toLowerCase();
    const books = await this.getExplanationBooks();

    // The API returns `name`, not `title`, so matching on `title` never hit and an
    // existing شيخ was treated as new on every save.
    if (Array.isArray(books) && books.length > 0) {
      const match = books.find((b) =>
        (b.name && b.name.toLowerCase().includes(s)) ||
        (b.author && b.author.toLowerCase().includes(s)) ||
        (b.name && s.includes(b.name.toLowerCase())) ||
        (b.author && s.includes(b.author.toLowerCase()))
      );
      if (match) return match.id;
    }

    const created = await this.createExplanationBook(scholarOrBookName.trim());
    if (created?.id) {
      return created.id;
    }

    // Never guess. Falling back to whichever book happened to be first files the شرح
    // under the wrong شيخ while looking like it succeeded.
    throw new Error("تعذّر إنشاء كتاب الشرح، يرجى المحاولة مرة أخرى.");
  },

  /**
   * Create an explanation for a hadith via POST /api/Explanations
   * @param {Object} payload { hadithId, text, scholarOrBook, explanationBookId }
   */
  async createExplanation(payload) {
    const expBookId = await this.resolveExplanationBookId(payload);
    const body = {
      hadithId: Number(payload.hadithId),
      text: payload.text || "",
      explanationBookId: expBookId,
    };
    return await apiFetch("/api/Explanations", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Update an existing explanation via PUT /api/Explanations/{id}
   */
  async updateExplanation(id, payload) {
    const expBookId = await this.resolveExplanationBookId(payload);
    const body = {
      id: Number(id),
      hadithId: Number(payload.hadithId),
      text: payload.text || "",
      explanationBookId: expBookId,
    };
    return await apiFetch(`/api/Explanations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  /**
   * Delete an explanation via DELETE /api/Explanations/{id}
   */
  async deleteExplanation(id) {
    return await apiFetch(`/api/Explanations/${id}`, {
      method: "DELETE",
    });
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
