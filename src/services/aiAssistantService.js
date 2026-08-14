import { apiFetch } from '../api/client';

export const aiAssistantService = {
  /**
   * 1. Upload Knowledge Book (PDF Ingestion)
   * POST /api/KnowledgeBooks
   * @param {FormData} formData
   * @returns {Promise<{ isSuccess: boolean, data: { bookId: number, hangfireJobId: string, processingStatus: string }, message: string }>}
   */
  async uploadKnowledgeBook(formData) {
    const res = await apiFetch("/api/KnowledgeBooks", {
      method: "POST",
      body: formData,
    });
    return res;
  },

  /**
   * 2. Get Processing Status of a Knowledge Book
   * GET /api/KnowledgeBooks/{id}/status
   * @param {number|string} bookId
   * @returns {Promise<{ bookId: number, processingStatus: string, isPublished: boolean, pageCount: number, chunkCount: number, processingError: string|null, processedAtUtc: string|null }>}
   */
  async getBookStatus(bookId) {
    try {
      const res = await apiFetch(`/api/KnowledgeBooks/${bookId}/status`);
      return res?.data ?? res ?? null;
    } catch (err) {
      console.warn(`Error fetching status for book ${bookId}:`, err.message);
      throw err;
    }
  },

  /**
   * 3. Publish a Knowledge Book
   * POST /api/KnowledgeBooks/{id}/publish
   * @param {number|string} bookId
   * @returns {Promise<any>}
   */
  async publishBook(bookId) {
    const res = await apiFetch(`/api/KnowledgeBooks/${bookId}/publish`, {
      method: "POST",
    });
    return res?.data ?? res;
  },

  /**
   * 4. Unpublish a Knowledge Book
   * POST /api/KnowledgeBooks/{id}/unpublish
   * @param {number|string} bookId
   * @returns {Promise<any>}
   */
  async unpublishBook(bookId) {
    const res = await apiFetch(`/api/KnowledgeBooks/${bookId}/unpublish`, {
      method: "POST",
    });
    return res?.data ?? res;
  },

  /**
   * 5. Retry a Failed Knowledge Book
   * POST /api/KnowledgeBooks/{id}/retry
   * @param {number|string} bookId
   * @returns {Promise<any>}
   */
  async retryBook(bookId) {
    const res = await apiFetch(`/api/KnowledgeBooks/${bookId}/retry`, {
      method: "POST",
    });
    return res?.data ?? res;
  },

  /**
   * 6. Reprocess an existing Knowledge Book
   * POST /api/KnowledgeBooks/{id}/reprocess
   * @param {number|string} bookId
   * @returns {Promise<any>}
   */
  async reprocessBook(bookId) {
    const res = await apiFetch(`/api/KnowledgeBooks/${bookId}/reprocess`, {
      method: "POST",
    });
    return res?.data ?? res;
  },

  /**
   * 7. Fetch all registered Knowledge Books (or local/cache registry)
   * GET /api/KnowledgeBooks or endpoint fallback
   * @returns {Promise<Array>}
   */
  async getKnowledgeBooks() {
    try {
      const res = await apiFetch("/api/KnowledgeBooks");
      const list = Array.isArray(res) ? res : res?.data || res?.items || [];
      return list;
    } catch {
      // Return empty array on failure
      return [];
    }
  },

  /**
   * 8. Send Chat / RAG Message
   * POST /api/chat
   * @param {{ conversationId: number|null, message: string }} payload
   * @returns {Promise<{ conversationId: number, answer: string, sources: Array }>}
   */
  async sendMessage({ conversationId = null, message }) {
    const res = await apiFetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId: conversationId ? Number(conversationId) : null,
        message: String(message).trim(),
      }),
    });
    return res?.data ?? res;
  },

  /**
   * 9. Get User's Chat Conversations List
   * GET /api/chat/conversations
   * @returns {Promise<Array<{ id: number, title: string, createdAt: string, lastActivityAt: string }>>}
   */
  async getConversations() {
    try {
      const res = await apiFetch("/api/chat/conversations");
      const list = Array.isArray(res) ? res : res?.data || [];
      return list;
    } catch (err) {
      console.warn("Could not fetch conversations:", err.message);
      return [];
    }
  },

  /**
   * 10. Get Conversation Details with All Messages
   * GET /api/chat/conversations/{id}
   * @param {number|string} conversationId
   * @returns {Promise<{ id: number, title: string, createdAt: string, lastActivityAt: string, messages: Array<{ id: number, role: 'User'|'Assistant', content: string, createdAt: string }> }>}
   */
  async getConversationDetails(conversationId) {
    try {
      const res = await apiFetch(`/api/chat/conversations/${conversationId}`);
      return res?.data ?? res ?? null;
    } catch (err) {
      console.warn(`Could not fetch conversation ${conversationId}:`, err.message);
      return null;
    }
  },

  /**
   * 11. Get Current Active System Prompt
   * GET /api/admin/chat-prompts/current
   */
  async getCurrentPrompt() {
    try {
      const res = await apiFetch("/api/admin/chat-prompts/current");
      return res?.data ?? res ?? null;
    } catch (err) {
      console.warn("Could not fetch current chat prompt:", err.message);
      return null;
    }
  },

  /**
   * 12. Get System Prompts History
   * GET /api/admin/chat-prompts/history
   */
  async getPromptHistory() {
    try {
      const res = await apiFetch("/api/admin/chat-prompts/history");
      const list = Array.isArray(res) ? res : res?.data || [];
      return list;
    } catch (err) {
      console.warn("Could not fetch prompt history:", err.message);
      return [];
    }
  },

  /**
   * 13. Update / Save New System Prompt
   * PUT /api/admin/chat-prompts
   * @param {{ content: string } | string} payload
   */
  async updatePrompt(payload) {
    const content =
      typeof payload === "string"
        ? payload
        : payload.content || payload.promptText || "";
    const body = {
      content: String(content).trim(),
    };
    const res = await apiFetch("/api/admin/chat-prompts", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return res?.data ?? res;
  },

  /**
   * 14. Restore a System Prompt from History
   * POST /api/admin/chat-prompts/{id}/restore
   * @param {number|string} promptId (MUST be record id, not version)
   */
  async restorePrompt(promptId) {
    const res = await apiFetch(`/api/admin/chat-prompts/${promptId}/restore`, {
      method: "POST",
    });
    return res?.data ?? res;
  },
};

