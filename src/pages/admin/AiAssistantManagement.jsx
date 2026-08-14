import React, { useState, useEffect } from "react";
import {
  HiOutlineSparkles,
  HiOutlineDocumentArrowUp,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCommandLine,
} from "react-icons/hi2";
import Navbar from "../../components/shared/Navbar";
import RagStatsHeader from "../../components/ai-management/RagStatsHeader";
import RagPdfUploader from "../../components/ai-management/RagPdfUploader";
import RagDocumentsList from "../../components/ai-management/RagDocumentsList";
import RagTestSandbox from "../../components/ai-management/RagTestSandbox";
import SystemPromptEditor from "../../components/ai-management/SystemPromptEditor";
import { aiAssistantService } from "../../services/aiAssistantService";

const STORAGE_KEY = "athar_knowledge_books_cache";

const TABS = [
  {
    id: "knowledge",
    label: "رفع وإدارة كتب المعرفة",
    icon: HiOutlineDocumentArrowUp,
  },
  {
    id: "prompts",
    label: "توجيهات النظام (System Prompts)",
    icon: HiOutlineCommandLine,
  },
  {
    id: "chat",
    label: "المحادثة الذكية واستعراض المصادر",
    icon: HiOutlineChatBubbleLeftRight,
  },
];

export default function AiAssistantManagement() {
  const [activeTab, setActiveTab] = useState("knowledge"); // "knowledge" | "prompts" | "chat"

  // Books & Status States
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Load initial knowledge books list
  useEffect(() => {
    async function loadBooks() {
      setIsLoadingDocs(true);
      try {
        const backendBooks = await aiAssistantService.getKnowledgeBooks();
        if (Array.isArray(backendBooks) && backendBooks.length > 0) {
          setDocuments(backendBooks);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(backendBooks));
          } catch {}
        }
      } catch (err) {
        console.warn("Could not load knowledge books:", err.message);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    loadBooks();
  }, []);

  // Save documents updates to local cache
  const handleUpdateDocuments = (updatedDocs) => {
    setDocuments(updatedDocs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
    } catch {}
  };

  // Upload handler
  const handleUploadSuccess = (newBook) => {
    const updated = [newBook, ...documents];
    handleUpdateDocuments(updated);
  };

  // Compute metrics
  const totalDocuments = documents.length;
  const publishedCount = documents.filter((d) => !!d.isPublished).length;
  const readyCount = documents.filter((d) => (d.processingStatus || d.status) === "Ready").length;
  const totalChunks = documents.reduce((acc, curr) => acc + (Number(curr.chunkCount) || 0), 0);

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 relative font-2 text-base-content">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        {/* Top Navbar with Admin Drawer & Dock */}
        <Navbar
          drawerId="admin-sidebar-drawer"
          activePage="ai-assistant"
          isAdmin={true}
          showSidebar={true}
          showDock={true}
        />

        {/* Page Title & Subtitle below Navbar (Matching ContentManagement.jsx exactly) */}
        <header className="mb-4 pb-2 border-b border-base-300/70 dark:border-slate-800 mt-4 sm:mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-1 text-base-content">
            إدارة المساعد الذكي
          </h1>
          <p className="text-xs md:text-sm text-base-content/60 mt-1 font-2">
            رفع وتفكيك كتب الـ PDF، تخصيص توجيهات النظام، ومتابعة المحادثة الذكية وإسناد المصادر.
          </p>
        </header>

        {/* ── Metrics Cards Header ── */}
        <div className="mb-7">
          <RagStatsHeader
            totalDocuments={totalDocuments}
            totalChunks={totalChunks}
            publishedCount={publishedCount}
            readyCount={readyCount}
          />
        </div>

        {/* ── Segmented Navigation Tabs Bar (Compact & Refined) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-2xl mb-6 shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold font-2 text-xs sm:text-sm md:text-base gap-2 transition-all duration-200 ease-out cursor-pointer flex items-center justify-center text-center active:scale-95 ${
                  isActive
                    ? "bg-cyan-700 text-white shadow-sm font-bold scale-[1.01]"
                    : "text-base-content/70 hover:bg-base-200/70 dark:hover:bg-slate-800/70 hover:text-base-content font-medium"
                }`}
              >
                <Icon
                  className={`text-base sm:text-lg shrink-0 transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Animated Tab Views with Smooth Fade-in ── */}
        <div key={activeTab} className="animate-fadeIn transition-opacity duration-300">
          {activeTab === "knowledge" && (
            <div className="space-y-7">
              {/* 1. PDF Uploader Form */}
              <RagPdfUploader onUploadSuccess={handleUploadSuccess} />

              {/* 2. Indexed Knowledge Books Data Table */}
              <RagDocumentsList
                documents={documents}
                onUpdateDocuments={handleUpdateDocuments}
                isLoading={isLoadingDocs}
              />
            </div>
          )}

          {activeTab === "prompts" && (
            <div>
              <SystemPromptEditor />
            </div>
          )}

          {activeTab === "chat" && (
            <div>
              <RagTestSandbox />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
