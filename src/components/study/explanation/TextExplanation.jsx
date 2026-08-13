import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScholarTextContent from "./ScholarTextContent";

/**
 * TextExplanation Component
 * 100% Dynamic explanation viewer directly mapped to backend payload:
 * - Dynamically renders tabs for each explanation item from the backend.
 * - Extracts `author` / `type` / `text` directly from API response.
 * - Zero hardcoded scholars or static arrays.
 */
export default function TextExplanation({ explanation }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

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
  const authorName = activeItem?.author || "";
  const bookName = activeItem?.bookTitle || "";

  const headerTitle = authorName
    ? authorName.startsWith("الشيخ")
      ? `شرح ${authorName}`
      : `شرح الشيخ ${authorName}`
    : bookName || "شرح الحديث";

  return (
    <div className="space-y-3">
      {/* Dynamic Tabs (rendered if multiple explanations exist from backend) */}
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

      {/* Selected Explanation Header */}
      <div className="bg-cyan-700/10 border border-cyan-700/20 rounded-xl p-2.5 text-center transition-all duration-300">
        <span className="font-3 font-bold text-sm text-cyan-800 dark:text-cyan-300">
          {headerTitle}
        </span>
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
            emptyMsg={`لا يوجد شرح متاح حالياً لـ ${headerTitle} لهذا الحديث.`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
