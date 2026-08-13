import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdFormatSize } from "react-icons/md";
import ScholarTextContent from "./ScholarTextContent";

/**
 * Font Size Scale Levels for comfortable reading within bounded limits:
 * - Minimum: 13px (80%)
 * - Default: 17px (100%)
 * - Maximum: 23px (130%)
 */
const FONT_SIZE_LEVELS = [
  { size: 13, label: "80%" },
  { size: 15, label: "90%" },
  { size: 17, label: "100%" },
  { size: 20, label: "115%" },
  { size: 23, label: "130%" },
];

/**
 * TextExplanation Component
 * 100% Dynamic explanation viewer directly mapped to backend payload:
 * - Dynamically renders tabs for each explanation item from the backend.
 * - Clean Font Size Zoom Controller (A- / A+) within strict bounded limits.
 */
export default function TextExplanation({ explanation }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Font size zoom level (persisted in localStorage)
  const [fontLevelIndex, setFontLevelIndex] = useState(() => {
    const saved = localStorage.getItem("athar_explanation_font_level");
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) && parsed >= 0 && parsed < FONT_SIZE_LEVELS.length
      ? parsed
      : 2; // Default is index 2 (17px / 100%)
  });

  const handleDecreaseFont = () => {
    setFontLevelIndex((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem("athar_explanation_font_level", next.toString());
      return next;
    });
  };

  const handleIncreaseFont = () => {
    setFontLevelIndex((prev) => {
      const next = Math.min(FONT_SIZE_LEVELS.length - 1, prev + 1);
      localStorage.setItem("athar_explanation_font_level", next.toString());
      return next;
    });
  };

  // Normalize backend payload into an array of explanation items
  const items = Array.isArray(explanation)
    ? explanation
    : Array.isArray(explanation?.data)
    ? explanation.data
    : explanation && typeof explanation === "object"
    ? [explanation]
    : [];

  // Reset selected index when explanation prop changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [explanation]);

  // If no explanation is returned from the backend
  if (!items || items.length === 0) {
    return (
      <div className="p-5 text-center bg-base-200/50 rounded-2xl border border-dashed border-base-300 my-3">
        <p className="font-2 text-[13px] sm:text-base text-base-content/60 leading-relaxed">
          لا يوجد شرح متاح حالياً لهذا الحديث.
        </p>
      </div>
    );
  }

  const activeIndex = selectedIndex < items.length ? selectedIndex : 0;
  const activeItem = items[activeIndex];

  return (
    <div className="space-y-3">
      {/* Dynamic Scholar Tabs (rendered if multiple explanations exist from backend) */}
      {items.length > 1 && (
        <div className="flex bg-base-200/90 p-1 rounded-2xl gap-1 border border-base-300 shadow-inner">
          {items.map((item, idx) => {
            const tabLabel = item.author || item.bookTitle || `شرح ${idx + 1}`;
            const isSelected = activeIndex === idx;

            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold font-2 transition-all duration-300 cursor-pointer text-center ${
                  isSelected
                    ? "bg-cyan-700 text-white shadow-md font-bold"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                {tabLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Sleek Font Size Controller Bar */}
      <div className="flex items-center justify-between bg-base-200/50 dark:bg-base-300/30 rounded-xl px-3 py-1.5 border border-base-300/60 transition-all duration-300">
        <div className="flex items-center gap-1.5 text-base-content/70">
          <MdFormatSize className="text-base text-cyan-700 dark:text-cyan-400" />
          <span className="font-2 text-xs font-semibold">حجم خط الشرح</span>
        </div>

        {/* Font Zoom Controller (A- / Level / A+) */}
        <div className="flex items-center gap-1 bg-base-100 dark:bg-base-200 rounded-lg p-0.5 border border-base-300 shadow-2xs">
          <button
            type="button"
            onClick={handleDecreaseFont}
            disabled={fontLevelIndex === 0}
            title="تصغير حجم الخط (الحد الأدنى 80%)"
            className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-base-content/80 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-base-200/80 dark:hover:bg-base-300 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
            aria-label="تصغير حجم الخط"
          >
            <span className="text-[11px] font-bold font-sans">A-</span>
          </button>

          <span className="text-[10px] font-mono px-1.5 text-base-content/70 select-none min-w-[36px] text-center font-bold">
            {FONT_SIZE_LEVELS[fontLevelIndex].label}
          </span>

          <button
            type="button"
            onClick={handleIncreaseFont}
            disabled={fontLevelIndex === FONT_SIZE_LEVELS.length - 1}
            title="تكبير حجم الخط (الحد الأقصى 130%)"
            className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-base-content/80 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-base-200/80 dark:hover:bg-base-300 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
            aria-label="تكبير حجم الخط"
          >
            <span className="text-[12px] font-bold font-sans">A+</span>
          </button>
        </div>
      </div>

      {/* Explanation Text Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem?.id || activeIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <ScholarTextContent
            item={activeItem}
            fontSize={FONT_SIZE_LEVELS[fontLevelIndex].size}
            emptyMsg="لا يوجد شرح متاح حالياً لهذا الحديث."
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
