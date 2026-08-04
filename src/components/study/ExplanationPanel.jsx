import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCloseOutline, IoBookOutline } from "react-icons/io5";
import TextExplanation from "./explanation/TextExplanation";
import VideoExplanation from "./explanation/VideoExplanation";

/**
 * Reusable Header for Drawer & Bottom Sheet
 */
function DrawerHeader({ onClose }) {
  return (
    <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100">
      <div className="flex items-center gap-2">
        <IoBookOutline className="text-lg text-cyan-700" />
        <span className="font-3 font-bold text-base">شرح الحديث</span>
      </div>
      <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="إغلاق">
        <IoCloseOutline className="text-xl" />
      </button>
    </div>
  );
}

/**
 * Inner Panel Content containing Video vs Text Explanation tabs
 */
function PanelContent({ isOpen, activeTab, onTabChange, explanation, hadith }) {
  return (
    <div className="p-4">
      {/* Top Tabbar */}
      <div className="flex gap-1 mb-4 border-b border-base-300" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "video"}
          onClick={() => onTabChange("video")}
          className={`flex-1 py-2 font-2 text-sm text-center transition-all duration-300 relative ${
            activeTab === "video" ? "text-cyan-700 font-bold" : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح المرئي
          {activeTab === "video" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-700 rounded-full transition-all duration-300" />
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "text"}
          onClick={() => onTabChange("text")}
          className={`flex-1 py-2 font-2 text-sm text-center transition-all duration-300 relative ${
            activeTab === "text" ? "text-cyan-700 font-bold" : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح النصي
          {activeTab === "text" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-700 rounded-full transition-all duration-300" />
          )}
        </button>
      </div>

      {/* Dynamic Tab Content Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          {activeTab === "text" ? (
            <TextExplanation explanation={explanation} />
          ) : (
            <VideoExplanation explanation={explanation} hadith={hadith} isOpen={isOpen} activeTab={activeTab} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Main ExplanationPanel component — handles responsive drawer (Desktop & Mobile bottom sheet).
 */
export default function ExplanationPanel({ isOpen, onClose, activeTab, onTabChange, explanation, hadith }) {
  const [sheetHeight, setSheetHeight] = useState(70);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(70);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Reset height when closed
  useEffect(() => {
    if (!isOpen) {
      setSheetHeight(70);
      setIsDragging(false);
    }
  }, [isOpen]);

  // ── Mobile Drag Logic ──
  const handleDragStart = (clientY) => {
    setIsDragging(true);
    startY.current = clientY;
    startHeight.current = sheetHeight;
  };

  const handleDragMove = (clientY) => {
    if (!startY.current) return;
    const windowHeight = window.innerHeight || 800;
    const deltaVh = ((startY.current - clientY) / windowHeight) * 100;
    let nextHeight = startHeight.current + deltaVh;
    if (nextHeight < 15) nextHeight = 15;
    if (nextHeight > 94) nextHeight = 94;
    setSheetHeight(nextHeight);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startY.current = 0;
    if (sheetHeight < 62) {
      onClose();
      setTimeout(() => setSheetHeight(70), 300);
    }
  };

  const onMouseDown = (e) => {
    handleDragStart(e.clientY);
    const onMouseMove = (moveEvt) => handleDragMove(moveEvt.clientY);
    const onMouseUp = () => {
      handleDragEnd();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      {/* Desktop Backdrop & Drawer */}
      <div
        className={`hidden lg:block fixed inset-0 bg-black/30 z-40 transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full w-[450px] xl:w-[500px] z-50 bg-base-100 border-e border-base-300 shadow-2xl transition-transform duration-500 ease-in-out will-change-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        dir="rtl"
      >
        <DrawerHeader onClose={onClose} />
        <div className="flex-1 overflow-y-auto">
          <PanelContent
            isOpen={isOpen}
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
            hadith={hadith}
          />
        </div>
      </div>

      {/* Mobile Backdrop & Bottom Sheet */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 z-50 transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        style={{ height: `${sheetHeight}vh` }}
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-base-100 rounded-t-2xl shadow-2xl ${
          isDragging ? "transition-none" : "transition-all duration-300 ease-out"
        } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        dir="rtl"
      >
        {/* Drag Handle Area */}
        <div
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
          onMouseDown={onMouseDown}
          className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none bg-base-100 rounded-t-2xl hover:bg-base-200/50 transition-colors touch-none"
        >
          <div className="w-12 h-1.5 bg-base-300 dark:bg-base-700 rounded-full" />
        </div>

        <DrawerHeader onClose={onClose} />

        <div className="flex-1 overflow-y-auto">
          <PanelContent
            isOpen={isOpen}
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
            hadith={hadith}
          />
        </div>
      </div>
    </>
  );
}
