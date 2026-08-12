import React, { useState, useEffect } from "react";
import { HiOutlineSparkles, HiOutlineDatabase, HiOutlineDocumentText, HiOutlineTerminal } from "react-icons/hi";
import Navbar from "../../components/shared/Navbar";
import RagStatsHeader from "../../components/ai-management/RagStatsHeader";
import RagPdfUploader from "../../components/ai-management/RagPdfUploader";
import RagDocumentsList from "../../components/ai-management/RagDocumentsList";
import SystemPromptEditor from "../../components/ai-management/SystemPromptEditor";
import RagTestSandbox from "../../components/ai-management/RagTestSandbox";
import { aiAssistantService } from "../../services/aiAssistantService";

export default function AiAssistantManagement() {
  const [activeTab, setActiveTab] = useState("knowledge"); // "knowledge" | "prompt" | "sandbox"

  // RAG Data States
  const [documents, setDocuments] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoadingDocs(true);
      try {
        const docs = await aiAssistantService.getKnowledgeDocuments();
        const prompt = await aiAssistantService.getSystemPrompt();
        setDocuments(docs);
        setSystemPrompt(prompt);
      } catch (err) {
        console.warn("Could not load AI Assistant data:", err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleUploadDocument = async (file, metadata) => {
    const createdDoc = await aiAssistantService.uploadPdfDocument(file, metadata);
    setDocuments((prev) => [createdDoc, ...prev]);
  };

  const handleDeleteDocument = async (docId) => {
    await aiAssistantService.deletePdfDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSavePrompt = async (newPrompt) => {
    setIsSavingPrompt(true);
    try {
      await aiAssistantService.updateSystemPrompt(newPrompt);
      setSystemPrompt(newPrompt);
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleTestQuery = async (query, prompt) => {
    return await aiAssistantService.testQuery(query, prompt);
  };

  const totalChunks = documents.reduce((acc, curr) => acc + (curr.chunkCount || 0), 0);

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 text-base-content font-2 relative">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
      {/* Top Navbar with Admin Drawer & Dock */}
      <Navbar
        drawerId="admin-sidebar-drawer"
        activePage="ai-assistant"
        isAdmin={true}
        showSidebar={true}
        showDock={true}
      />

      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-base-200 mt-4 sm:mt-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-1 text-base-content flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-2xl">
              <HiOutlineSparkles />
            </span>
            <span>إدارة المساعد الذكي (RAG Engine)</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            إدارة وتغذية كتب ومتون RAG، وتعيين البرومبت النظامي الحاكم للمستجيب الذكي مع تجربة الاستجابة فورياً.
          </p>
        </div>
      </header>

      {/* ── Metrics Cards Header ── */}
      <RagStatsHeader
        totalDocuments={documents.length}
        totalChunks={totalChunks}
        systemPromptLength={systemPrompt.length}
      />

      {/* ── Navigation Tabs Bar ── */}
      <div className="flex items-center gap-2 border-b border-base-200 mb-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("knowledge")}
          className={`btn btn-sm rounded-xl font-bold text-xs gap-2 transition-all ${activeTab === "knowledge"
              ? "bg-cyan-700 text-white shadow-sm"
              : "bg-base-200/60 hover:bg-base-200 text-base-content/80 border-transparent"
            }`}
        >
          <HiOutlineDatabase className="text-base" />
          <span>قاعدة المعرفة والكتب (PDF Documents)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("prompt")}
          className={`btn btn-sm rounded-xl font-bold text-xs gap-2 transition-all ${activeTab === "prompt"
              ? "bg-cyan-700 text-white shadow-sm"
              : "bg-base-200/60 hover:bg-base-200 text-base-content/80 border-transparent"
            }`}
        >
          <HiOutlineDocumentText className="text-base" />
          <span>البرومبت المخصص (System Prompt)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sandbox")}
          className={`btn btn-sm rounded-xl font-bold text-xs gap-2 transition-all ${activeTab === "sandbox"
              ? "bg-cyan-700 text-white shadow-sm"
              : "bg-base-200/60 hover:bg-base-200 text-base-content/80 border-transparent"
            }`}
        >
          <HiOutlineTerminal className="text-base" />
          <span>مختبر التجارب (Sandbox Playground)</span>
        </button>
      </div>

      {/* ── Tab Views ── */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          {/* PDF Uploader Form */}
          <RagPdfUploader onUploadSuccess={handleUploadDocument} />

          {/* Indexed PDFs Data Table */}
          <RagDocumentsList
            documents={documents}
            onDeleteDocument={handleDeleteDocument}
            isLoading={isLoadingDocs}
          />
        </div>
      )}

      {activeTab === "prompt" && (
        <SystemPromptEditor
          initialPrompt={systemPrompt}
          onSavePrompt={handleSavePrompt}
          isSaving={isSavingPrompt}
        />
      )}

      {activeTab === "sandbox" && (
        <RagTestSandbox
          onTestQuery={handleTestQuery}
          currentPrompt={systemPrompt}
        />
      )}
      </main>
    </div>
  );
}
