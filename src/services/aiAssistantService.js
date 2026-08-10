import { apiFetch, getImageUrl } from '../api/client';

/**
 * Default System Prompt for RAG Athar Assistant
 */
export const DEFAULT_SYSTEM_PROMPT = `أنت "مساعد أثر الذكي"، مجهّز للإجابة عن أسئلة العلوم الإسلامية وأحاديث الرسول صلى الله عليه وسلم بدقة بالغة.

التزم بالقواعد التالية أثناء الإجابة:
1. استخدم السياق المرفق فقط ({context}) للإجابة على سؤال المستخدم ({user_query}).
2. عزز إجابتك بالأحاديث الشريفة والنصوص الشرعية المذكورة في السياق.
3. تذكر دائماً ذكر المصدر والراوي واسم الكتاب إن وجد في السياق.
4. إذا لم تجد الإجابة في السياق المرفق، أجب بلباقة: "عذراً، لم أجد إجابة دقيقة لهذا السؤال في متون وأحاديث منصة أثر."
5. اكتب الإجابة بلغة عربية فصحى ميسرة ومناسبة لجميع المستويات.`;

/**
 * Fallback initial documents list when backend endpoint is deploying
 */
const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    title: "جامع العلوم والحكم - ابن رجب الحنبلي",
    category: "الحديث وشروحه",
    fileName: "Jami_Al-Ulum_Wal-Hikam.pdf",
    fileSize: "14.2 MB",
    chunkCount: 1450,
    status: "مفهرس بنجاح",
    uploadedAt: "2026-08-01",
  },
  {
    id: "doc-2",
    title: "الأربعون النووية - الإمام النووي",
    category: "الحديث الشريف",
    fileName: "Forty_Hadiths_Nawawi.pdf",
    fileSize: "3.8 MB",
    chunkCount: 380,
    status: "مفهرس بنجاح",
    uploadedAt: "2026-08-05",
  },
  {
    id: "doc-3",
    title: "مقدمة الفقه الإسلامي وأصوله",
    category: "الفقه والأصول",
    fileName: "Fiqh_Principles_Intro.pdf",
    fileSize: "8.5 MB",
    chunkCount: 920,
    status: "جاري الفهرسة",
    uploadedAt: "2026-08-10",
  },
];

export const aiAssistantService = {
  /**
   * Fetch current System Prompt from Backend
   */
  async getSystemPrompt() {
    const endpoints = ['/api/Admin/ai/prompt', '/api/Admin/prompt'];

    for (const endpoint of endpoints) {
      try {
        const data = await apiFetch(endpoint);
        if (data && (data.prompt || data.systemPrompt || typeof data === 'string')) {
          return typeof data === 'string' ? data : data.prompt || data.systemPrompt;
        }
      } catch {
        // Fallback to local storage or default prompt
      }
    }

    const saved = localStorage.getItem('athar_rag_system_prompt');
    return saved || DEFAULT_SYSTEM_PROMPT;
  },

  /**
   * Save / Update System Prompt to Backend
   */
  async updateSystemPrompt(promptText) {
    localStorage.setItem('athar_rag_system_prompt', promptText);

    try {
      return await apiFetch('/api/Admin/ai/prompt', {
        method: 'PUT',
        body: JSON.stringify({ prompt: promptText, systemPrompt: promptText }),
      });
    } catch {
      // Endpoint fallback
      return { isSuccess: true, message: "تم حفظ البرومبت محلياً وفي انتظار اعتماد الباكإند" };
    }
  },

  /**
   * Fetch RAG Knowledge Base PDF Documents list
   */
  async getKnowledgeDocuments() {
    const endpoints = ['/api/Admin/ai/documents', '/api/Admin/documents'];

    for (const endpoint of endpoints) {
      try {
        const data = await apiFetch(endpoint);
        const list = Array.isArray(data) ? data : data?.documents || data?.data || null;
        if (Array.isArray(list) && list.length > 0) {
          return list.map((doc) => ({
            id: doc.id || doc.documentId,
            title: doc.title || doc.name,
            category: doc.category || "عام",
            fileName: doc.fileName || doc.originalName || "document.pdf",
            fileSize: doc.fileSize || "5 MB",
            chunkCount: doc.chunkCount || doc.vectorsCount || 0,
            status: doc.status || "مفهرس بنجاح",
            uploadedAt: doc.createdAt
              ? new Date(doc.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
              : doc.uploadedAt || "مؤخراً",
          }));
        }
      } catch {
        // Fallback
      }
    }

    const localDocs = localStorage.getItem('athar_rag_documents');
    if (localDocs) {
      try {
        return JSON.parse(localDocs);
      } catch {
        // fallback to MOCK
      }
    }
    return MOCK_DOCUMENTS;
  },

  /**
   * Upload PDF document for RAG processing
   */
  async uploadPdfDocument(file, metadata = {}) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", metadata.title || file.name);
    formData.append("category", metadata.category || "الحديث");
    formData.append("chunkSize", metadata.chunkSize || 500);

    try {
      const result = await apiFetch('/api/Admin/ai/documents/upload', {
        method: 'POST',
        body: formData,
      });

      return {
        id: result?.id || `doc-${Date.now()}`,
        title: metadata.title || file.name.replace('.pdf', ''),
        category: metadata.category || "الحديث",
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        chunkCount: Math.ceil(file.size / 3000),
        status: "مفهرس بنجاح",
        uploadedAt: "الآن",
      };
    } catch {
      // Mock upload for local demo
      const newDoc = {
        id: `doc-${Date.now()}`,
        title: metadata.title || file.name.replace('.pdf', ''),
        category: metadata.category || "الحديث",
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        chunkCount: Math.ceil(file.size / 3000),
        status: "مفهرس بنجاح",
        uploadedAt: "الآن",
      };

      const existing = await this.getKnowledgeDocuments();
      const updated = [newDoc, ...existing];
      localStorage.setItem('athar_rag_documents', JSON.stringify(updated));
      return newDoc;
    }
  },

  /**
   * Delete PDF Document from Vector Store
   */
  async deletePdfDocument(documentId) {
    try {
      await apiFetch(`/api/Admin/ai/documents/${documentId}`, {
        method: 'DELETE',
      });
    } catch {
      // Local fallback
      const existing = await this.getKnowledgeDocuments();
      const filtered = existing.filter((d) => d.id !== documentId);
      localStorage.setItem('athar_rag_documents', JSON.stringify(filtered));
    }
  },

  /**
   * Sandbox query test against current RAG prompt
   */
  async testQuery(userQuery, customPrompt = null) {
    try {
      return await apiFetch('/api/Admin/ai/test-query', {
        method: 'POST',
        body: JSON.stringify({ query: userQuery, prompt: customPrompt }),
      });
    } catch {
      // Simulated response
      return {
        answer: `بناءً على المتون والأحاديث المتاحة في قاعدة المعرفة:

قال رسول الله صلى الله عليه وسلم: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى».
المصدر: كتاب الأربعون النووية (الحديث الأول).

الشرح والاستنباط:
هذا الحديث يمثل أصل الأعمال المقبولة عند الله، وأن صلاح الأعمال واستحقاق الثواب مرتهن بنيّة العبد الإيمانية الخالصة.`,
        retrievedChunks: [
          {
            bookTitle: "الأربعون النووية - الإمام النووي",
            content: "عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ...",
            score: 0.94,
          },
          {
            bookTitle: "جامع العلوم والحكم - ابن رجب الحنبلي",
            content: "هذا الحديث أحد الأحاديث التي يدور عليها الإسلام، وقال الشافعي: يدخل في سبعين بابا من الفقه...",
            score: 0.88,
          },
        ],
      };
    }
  },
};
