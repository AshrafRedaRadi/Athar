import React, { useState, useEffect, useRef } from "react";
import {
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePlus,
  HiOutlineBookmark,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineArrowPath,
  HiOutlineBars3BottomRight,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { aiAssistantService } from "../../services/aiAssistantService";
import renderMarkdownText from "../study/explanation/markdownRenderer";

const SUGGESTED_QUESTIONS = [
  "ما هو الحديث الأول في الأربعين النووية؟",
  "ما فضل الصدق في البيع والشراء؟",
  "اشرح لي معنى 'الدين النصيحة' ومن رواه؟",
];

export default function RagTestSandbox() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ChatGPT-style sidebar toggle on large screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Resizable sidebar width (persisted in localStorage, bounded between 240px and 520px)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("athar_rag_sidebar_width");
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) && parsed >= 240 && parsed <= 520 ? parsed : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(320);

  const startResizing = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    startXRef.current = e.clientX || e.touches?.[0]?.clientX || 0;
    startWidthRef.current = sidebarWidth;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      // RTL: dragging left (smaller clientX) increases width
      const deltaX = startXRef.current - clientX;
      const newWidth = Math.max(240, Math.min(520, startWidthRef.current + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        setSidebarWidth((latestWidth) => {
          localStorage.setItem("athar_rag_sidebar_width", latestWidth.toString());
          return latestWidth;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  // Rich collapsible history drawer on mobile screens
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load user conversations list on mount
  useEffect(() => {
    async function loadConversations() {
      setIsLoadingHistory(true);
      try {
        const list = await aiAssistantService.getConversations();
        setConversations(list || []);
      } catch (err) {
        console.warn("Could not load conversations:", err.message);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadConversations();
  }, []);

  // Select / Open an existing conversation
  const handleSelectConversation = async (convId) => {
    if (activeConversationId === convId) return;
    setActiveConversationId(convId);
    setErrorMessage("");
    setIsLoading(true);

    try {
      const details = await aiAssistantService.getConversationDetails(convId);
      if (details?.messages) {
        setMessages(
          details.messages.map((m) => ({
            id: m.id || Math.random(),
            role: m.role || (m.role === "User" ? "user" : "assistant"),
            content: m.content || m.answer || "",
            createdAt: m.createdAt,
            sources: m.sources || [],
          }))
        );
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn("Could not open conversation:", err.message);
      setErrorMessage("تعذر فتح تفاصيل المحادثة المحددة.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new blank conversation
  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputText("");
    setErrorMessage("");
  };

  // Send message
  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = String(textToSend).trim();
    if (!trimmed || isLoading) return;

    setErrorMessage("");
    setInputText("");

    const optimisticUserMsg = {
      id: Date.now(),
      role: "User",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    // Remove any previous error message if this is a retry
    setMessages((prev) => [...prev.filter((m) => !m.isError), optimisticUserMsg]);
    setIsLoading(true);

    try {
      const res = await aiAssistantService.sendMessage({
        conversationId: activeConversationId,
        message: trimmed,
      });

      const convId = res?.conversationId ?? activeConversationId;
      if (convId && convId !== activeConversationId) {
        setActiveConversationId(convId);
        // Refresh conversations list
        aiAssistantService.getConversations().then(setConversations).catch(() => {});
      }

      const assistantMsg = {
        id: Date.now() + 1,
        role: "Assistant",
        content: res?.answer || "تمت معالجة السؤال بنجاح.",
        sources: Array.isArray(res?.sources) ? res.sources : [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const translated = err?.message || "نموذج المحادثة الذكي غير متاح مؤقتاً في السيرفر، يرجى إعادة المحاولة.";
      setErrorMessage(translated);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "Assistant",
          content: translated,
          sources: [],
          createdAt: new Date().toISOString(),
          isError: true,
          failedQuery: trimmed,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 rounded-3xl shadow-sm font-2 overflow-hidden transition-all flex flex-col lg:flex-row h-[700px] max-h-[85vh] lg:h-[720px]" dir="rtl">
      {/* ── Desktop Collapsible & Resizable Sidebar (ChatGPT Style) ── */}
      <div
        style={{
          width: isSidebarOpen ? `${sidebarWidth}px` : "0px",
          minWidth: isSidebarOpen ? `${sidebarWidth}px` : "0px",
        }}
        className={`hidden lg:flex flex-col justify-between border-l border-base-300 dark:border-slate-800 bg-base-200/40 dark:bg-slate-950/40 relative shrink-0 h-full min-h-0 ${
          isResizing ? "transition-none" : "transition-all duration-300 ease-in-out"
        } ${
          isSidebarOpen
            ? "p-4 sm:p-5 opacity-100 overflow-visible"
            : "p-0 opacity-0 overflow-hidden border-0 pointer-events-none"
        }`}
      >
        <div className="space-y-3.5 min-w-0 flex flex-col flex-1 min-h-0">
          {/* Top Actions: New Chat Button + Collapse Sidebar Button inside Sidebar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleStartNewChat}
              className="btn btn-outline border-cyan-700/50 hover:bg-cyan-700 hover:text-white dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-400 flex-1 rounded-2xl font-bold text-sm sm:text-base gap-2 shadow-xs cursor-pointer active:scale-95 h-11 truncate"
            >
              <HiOutlinePlus className="text-lg shrink-0" />
              <span className="truncate">محادثة جديدة</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="btn btn-ghost btn-sm rounded-xl p-2 text-base-content/70 hover:text-base-content shrink-0 h-11 w-11 flex items-center justify-center cursor-pointer"
              title="إغلاق سجل المحادثات"
            >
              <HiOutlineBars3BottomRight className="text-xl" />
            </button>
          </div>

          {/* History Header */}
          <div className="flex items-center justify-between text-sm text-base-content/80 font-bold px-1 pt-1 font-1 shrink-0">
            <span className="flex items-center gap-2">
              <HiOutlineClock className="text-base text-cyan-700 dark:text-cyan-400" />
              <span>سجل المحادثات السابقة</span>
            </span>
            <span className="badge badge-md badge-ghost text-xs font-mono font-bold rounded-xl">
              {conversations.length}
            </span>
          </div>

          {/* Conversations List */}
          <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {isLoadingHistory ? (
              <div className="py-10 text-center">
                <span className="loading loading-spinner loading-md text-cyan-700" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 text-base-content/60 text-xs sm:text-sm font-2">
                لا توجد محادثات سابقة حتى الآن.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-right p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer font-2 ${
                      isActive
                        ? "bg-cyan-700 text-white font-bold shadow-xs"
                        : "hover:bg-base-200/80 dark:hover:bg-slate-800/80 text-base-content"
                    }`}
                  >
                    <HiOutlineChatBubbleLeftRight
                      className={`text-lg shrink-0 mt-0.5 ${
                        isActive ? "text-white" : "text-cyan-700 dark:text-cyan-400"
                      }`}
                    />
                    <div className="truncate flex-1 min-w-0">
                      <p className="truncate font-bold text-xs sm:text-sm">
                        {conv.title || `محادثة #${conv.id}`}
                      </p>
                      <p
                        className={`text-xs mt-1 truncate font-mono ${
                          isActive ? "text-white/80" : "text-base-content/60"
                        }`}
                      >
                        {conv.lastActivityAt
                          ? new Date(conv.lastActivityAt).toLocaleDateString("ar-EG")
                          : ""}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3.5 bg-base-100 dark:bg-slate-900 rounded-2xl border border-base-300 dark:border-slate-800 text-xs sm:text-sm text-base-content/80 space-y-1 font-2 min-w-0 shrink-0 mt-3">
          <p className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5 font-1">
            <HiOutlineSparkles className="text-base shrink-0" />
            <span className="truncate">المساعد المعرفي الذكي</span>
          </p>
          <p className="text-[11px] sm:text-xs leading-relaxed text-base-content/70">
            يتم البحث والاسترجاع الموثق من كتب ومتون أثر المنشورة بدقة بالغة.
          </p>
        </div>

        {/* ── Resizable Drag Handle on Divider Border ── */}
        {isSidebarOpen && (
          <div
            onMouseDown={startResizing}
            onTouchStart={startResizing}
            className={`absolute top-0 -left-2 h-full w-4 z-30 cursor-col-resize group flex items-center justify-center select-none ${
              isResizing ? "bg-cyan-500/20" : ""
            }`}
            title="اسحب لتكبير أو تصغير حجم القائمة الجانبية"
          >
            {/* Visual indicator bar on hover or active drag */}
            <div
              className={`w-1 rounded-full transition-all duration-200 ${
                isResizing
                  ? "bg-cyan-600 dark:bg-cyan-400 w-1.5 h-24 shadow-md shadow-cyan-500/40"
                  : "h-12 bg-base-300/80 dark:bg-slate-700/80 group-hover:bg-cyan-600 dark:group-hover:bg-cyan-400 group-hover:h-20 group-hover:w-1.5 shadow-2xs"
              }`}
            />
          </div>
        )}
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between space-y-4 font-2 min-w-0 h-full min-h-0">
        {/* Chat Header with ChatGPT-style sidebar toggle and Mobile Collapsible History */}
        <div className="flex flex-col gap-3 pb-4 border-b border-base-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Desktop Expand Sidebar Button (Only visible when sidebar is closed) */}
              {!isSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="hidden lg:flex btn btn-ghost btn-sm rounded-xl p-2 text-base-content/70 hover:text-base-content cursor-pointer"
                  title="فتح سجل المحادثات"
                >
                  <HiOutlineBars3BottomRight className="text-xl" />
                </button>
              )}

              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shadow-xs shrink-0">
                <HiOutlineSparkles />
              </div>
              <div>
                <h3 className="font-1 font-bold text-base sm:text-lg text-base-content">
                  {activeConversationId ? `المحادثة رقم #${activeConversationId}` : "محادثة جديدة"}
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 font-2 mt-0.5">
                  استجابة فورية مع إسناد وتوثيق المصادر الحقيقية من الكتب المنشورة
                </p>
              </div>
            </div>

            {/* Desktop Quick New Chat Button if sidebar is closed */}
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={handleStartNewChat}
                className="hidden lg:flex btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl gap-1.5 font-bold"
              >
                <HiOutlinePlus className="text-base" />
                <span>محادثة جديدة</span>
              </button>
            )}
          </div>

          {/* ── Mobile Rich History Header & Interactive Collapsible List (Visible on < lg screens) ── */}
          <div className="lg:hidden space-y-2.5 pt-1 w-full min-w-0">
            <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-base-200/60 dark:bg-slate-800/80 rounded-2xl border border-base-300 dark:border-slate-700 w-full min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileHistoryOpen((prev) => !prev)}
                className={`flex-1 min-w-0 flex items-center justify-between gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl font-bold font-2 text-xs sm:text-sm transition-all cursor-pointer ${
                  isMobileHistoryOpen
                    ? "bg-cyan-700 text-white shadow-xs"
                    : "bg-base-100/60 dark:bg-slate-900/60 text-base-content/80 hover:bg-base-300 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <HiOutlineClock className={`text-base shrink-0 ${isMobileHistoryOpen ? "text-white" : "text-cyan-700 dark:text-cyan-400"}`} />
                  <span className="truncate">سجل المحادثات</span>
                  <span className={`badge badge-sm font-mono font-bold text-[11px] rounded-lg shrink-0 px-1.5 ${isMobileHistoryOpen ? "badge-neutral text-white" : "badge-ghost"}`}>
                    {conversations.length}
                  </span>
                </div>
                <HiOutlineChevronDown
                  className={`text-sm shrink-0 transition-transform duration-300 ${
                    isMobileHistoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  handleStartNewChat();
                  setIsMobileHistoryOpen(false);
                }}
                className="shrink-0 btn btn-sm bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl gap-1 font-bold font-2 px-3 shadow-xs cursor-pointer active:scale-95 text-xs sm:text-sm h-9 sm:h-10"
              >
                <HiOutlinePlus className="text-sm sm:text-base" />
                <span>جديدة</span>
              </button>
            </div>

            {/* Expandable Mobile History Card */}
            {isMobileHistoryOpen && (
              <div className="p-3.5 bg-base-100 dark:bg-slate-850 rounded-2xl border border-base-300 dark:border-slate-700 shadow-md space-y-2 animate-fadeIn font-2 max-h-72 overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="text-center text-xs text-base-content/60 py-4 font-2">
                    لا توجد محادثات سابقة حتى الآن.
                  </p>
                ) : (
                  conversations.map((conv) => {
                    const isActive = activeConversationId === conv.id;
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => {
                          handleSelectConversation(conv.id);
                          setIsMobileHistoryOpen(false);
                        }}
                        className={`w-full text-right p-3 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer font-2 ${
                          isActive
                            ? "bg-cyan-700 text-white font-bold shadow-xs"
                            : "hover:bg-base-200 dark:hover:bg-slate-800 text-base-content border border-base-200 dark:border-slate-700/60"
                        }`}
                      >
                        <HiOutlineChatBubbleLeftRight
                          className={`text-base shrink-0 mt-0.5 ${
                            isActive ? "text-white" : "text-cyan-700 dark:text-cyan-400"
                          }`}
                        />
                        <div className="truncate flex-1">
                          <p className="truncate font-bold">
                            {conv.title || `محادثة #${conv.id}`}
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 truncate font-mono ${
                              isActive ? "text-white/80" : "text-base-content/50"
                            }`}
                          >
                            {conv.lastActivityAt
                              ? new Date(conv.lastActivityAt).toLocaleDateString("ar-EG")
                              : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="alert alert-error text-xs sm:text-sm rounded-2xl py-3 px-4 flex items-center gap-2.5 font-2 text-white">
            <HiOutlineExclamationCircle className="text-xl shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-5 min-h-[360px] max-h-[480px] p-2 pr-1">
          {messages.length === 0 ? (
            <div className="py-14 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-700/10 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 mx-auto flex items-center justify-center text-3xl shadow-xs">
                <HiOutlineSparkles />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-1 font-bold text-base sm:text-lg text-base-content">
                  ابدأ بسؤال المساعد الذكي حول أي حديث أو متن
                </h4>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-2">
                  سيقوم النظام بالبحث في الكتب المفهرسة واستخراج الإجابة مع ذكر المصادر والصفحات بدقة.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="btn btn-sm btn-ghost bg-base-200/80 dark:bg-slate-800/80 hover:bg-cyan-700 hover:text-white rounded-2xl text-xs sm:text-sm font-normal font-2 border border-base-300/70 dark:border-slate-700/70 px-3.5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "User" || msg.role === "user";
              const hasSources = Array.isArray(msg.sources) && msg.sources.length > 0;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-start" : "items-end"} space-y-2.5 font-2`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] sm:max-w-[82%] rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-cyan-700 text-white rounded-br-xs font-2"
                        : msg.isError
                        ? "bg-rose-950/50 dark:bg-rose-950/70 text-rose-100 border border-rose-500/50 rounded-bl-xs"
                        : "bg-base-200/90 dark:bg-slate-800 text-base-content rounded-bl-xs border border-base-300 dark:border-slate-700"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-2">{msg.content}</p>
                    ) : (
                      <div className="space-y-2 text-base-content dark:text-slate-100 font-2 leading-relaxed">
                        {renderMarkdownText(msg.content)}
                      </div>
                    )}

                    {/* Retry Button on 503 / Network Failure */}
                    {msg.isError && msg.failedQuery && (
                      <div className="mt-3.5 pt-2.5 border-t border-rose-500/30 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSendMessage(msg.failedQuery)}
                          disabled={isLoading}
                          className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-0 rounded-xl gap-2 font-bold font-2 shadow-xs cursor-pointer active:scale-95 text-xs sm:text-sm px-4"
                        >
                          <HiOutlineArrowPath className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
                          <span>إعادة المحاولة</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sources Chips (When available in Assistant Response) */}
                  {!isUser && hasSources && (
                    <div className="w-full max-w-[90%] sm:max-w-[82%] space-y-2.5 pt-1">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-700 dark:text-cyan-400 font-1">
                        <HiOutlineBookmark className="text-base" />
                        <span>المصادر الموثقة المسترجعة من كتب أثر ({msg.sources.length}):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.sources.map((src, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3.5 rounded-2xl bg-base-100 dark:bg-slate-850 border border-base-300 dark:border-slate-700 text-xs sm:text-sm space-y-2 shadow-xs font-2"
                          >
                            <div className="flex items-center gap-2 font-bold text-base-content truncate font-1">
                              <HiOutlineBookOpen className="text-cyan-700 dark:text-cyan-400 shrink-0 text-base" />
                              <span className="truncate">{src.bookTitle || `كتاب #${src.bookId}`}</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-base-content/70 flex-wrap font-mono">
                              {src.hadithNumber && (
                                <span className="badge badge-sm bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 font-bold rounded-lg px-2">
                                  حديث: {src.hadithNumber}
                                </span>
                              )}
                              {src.verseStart && (
                                <span className="badge badge-sm badge-ghost rounded-lg px-2">
                                  آية: {src.verseStart} {src.verseEnd ? `- ${src.verseEnd}` : ""}
                                </span>
                              )}
                              {src.pageStart && (
                                <span>
                                  ص: {src.pageStart} {src.pageEnd && src.pageEnd !== src.pageStart ? `- ${src.pageEnd}` : ""}
                                </span>
                              )}
                              {src.sectionTitle && (
                                <span className="truncate max-w-[140px] font-2" title={src.sectionTitle}>
                                  الباب: {src.sectionTitle}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback Badge when no source is found for assistant message */}
                  {!isUser && !hasSources && !msg.isError && (
                    <div className="text-xs text-base-content/60 pr-2 flex items-center gap-1.5">
                      <span className="badge badge-sm badge-ghost rounded-lg font-2">لا يوجد مصدر منشور مباشر</span>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-sm text-base-content/70 p-4 bg-base-200/60 dark:bg-slate-800/60 rounded-2xl w-fit font-2">
              <span className="loading loading-dots loading-sm text-cyan-700" />
              <span>جاري البحث في الكتب وصياغة الإجابة...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-base-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب سؤالك هنا للبحث في متون وكتب أثر..."
              disabled={isLoading}
              className="input input-bordered w-full rounded-2xl text-sm sm:text-base font-2 bg-base-100 dark:bg-slate-800 border-base-300 dark:border-slate-700 h-12"
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl text-sm sm:text-base font-bold px-6 sm:px-8 gap-2 shrink-0 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer h-12"
            >
              <HiOutlinePaperAirplane className="text-lg rotate-180" />
              <span className="hidden sm:inline">إرسال</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
