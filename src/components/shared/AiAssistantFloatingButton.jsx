import React, { useState } from "react";
import { BsStars } from "react-icons/bs";
import AiChatModal from "./AiChatModal";

/**
 * Enhanced Floating Action Button (FAB) for AI Assistant Chat.
 * Placed at the bottom-left of the screen across Home and Library pages.
 */
export default function AiAssistantFloatingButton({ className = "" }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed bottom-20 lg:bottom-7 left-4 sm:left-7 z-40 flex items-center gap-3 ${className}`}
        dir="ltr"
      >
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-circle w-10 h-10 min-h-0 bg-gradient-to-tr from-cyan-800 via-cyan-700 to-cyan-600 hover:from-cyan-700 hover:to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:shadow-[0_0_18px_rgba(6,182,212,0.65)] ring-2 ring-cyan-400/50 hover:ring-cyan-400/90 border-none flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group relative cursor-pointer"
          aria-label="مساعد أثر الذكي"
          title="مساعد أثر الذكي (أثر AI)"
        >
          {/* Subtle Outer Ping Wave for general pages */}
          <span className="absolute -inset-0.5 rounded-full bg-cyan-400 opacity-25 group-hover:opacity-50 animate-ping pointer-events-none duration-1000" />

          {/* Sparkles Icon matching Study.jsx */}
          <BsStars className="text-base group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 text-white drop-shadow-sm" />

          {/* Hover Tooltip (Left-aligned relative to button) */}
          <div className="absolute left-full ml-2.5 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold font-2 shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-1.5 group-hover:translate-x-0 whitespace-nowrap hidden sm:flex items-center border border-white/10" dir="rtl">
            <span>مساعد أثر الذكي</span>
          </div>
        </button>
      </div>

      {/* AI Chat Large Modal */}
      <AiChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
