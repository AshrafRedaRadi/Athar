import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";

// ─────────────────────────────────────────────
//  Difficulty badge colour map
// ─────────────────────────────────────────────
const LEVEL_STYLES = {
  مبتدئ: "badge-warning text-warning-content",
  متوسط: "badge-success text-success-content",
  متقدم: "badge-error text-error-content",
};

// ─────────────────────────────────────────────
//  Ultra-fluid Apple-like Spring Physics
// ─────────────────────────────────────────────
const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 220,
  damping: 25,
  mass: 0.8,
};

/**
 * Card component with Ultra-Fluid Shared Element Transition (Layout Animation).
 */
export default function Card({
  id,
  title,
  author,
  level,
  category,
  coverImage,
  description,
  isAdded = false,
  onAdd,
  onClick,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const levelStyle = LEVEL_STYLES[level] ?? "badge-ghost";
  const layoutKey = id || title;

  const defaultDesc =
    description ||
    "متن شريف يتضمن أصول العبادات والأحكام والأخلاق الإيمانية، حظي باهتمام واسع ودراسة مستفيضة من كبار العلماء، ويعتبر من أمهات الكتب المقررة لطلاب العلم.";

  return (
    <>
      {/* ── 1. Initial Grid Card ── */}
      <motion.div
        layoutId={`card-container-${layoutKey}`}
        onClick={() => setIsExpanded(true)}
        transition={SPRING_TRANSITION}
        className="
          card bg-base-100 border border-base-200
          shadow-sm hover:shadow-xl
          w-full overflow-hidden flex flex-col justify-between
          rounded-2xl cursor-pointer transition-shadow duration-300
          hover:border-cyan-600/40 group h-full
        "
        dir="rtl"
      >
        {/* Top: Cover Image */}
        <motion.div
          layoutId={`card-image-container-${layoutKey}`}
          transition={SPRING_TRANSITION}
          className="relative w-full h-32 sm:h-38 lg:h-44 bg-base-200/80 dark:bg-base-300/50 p-2 flex items-center justify-center overflow-hidden shrink-0"
        >
          {coverImage ? (
            <motion.img
              layoutId={`card-image-${layoutKey}`}
              transition={SPRING_TRANSITION}
              src={coverImage}
              alt={title}
              className="max-h-full max-w-full object-contain rounded-lg drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-900/15 via-cyan-800/25 to-base-300 flex flex-col items-center justify-center gap-1 text-cyan-700 dark:text-cyan-400">
              <IoBookOutline className="text-3xl" />
              <span className="text-[10px] font-2 opacity-60">غلاف الكتاب</span>
            </div>
          )}

          {category && (
            <span className="absolute top-2 right-2 badge bg-black/60 backdrop-blur-md text-white border-none font-2 text-[10px] sm:text-xs px-2 py-0.5 rounded-lg shadow-sm z-10">
              {category}
            </span>
          )}

          {level && (
            <span className={`absolute top-2 left-2 badge border-none font-2 text-[10px] sm:text-xs px-2 py-0.5 rounded-lg shadow-sm z-10 ${levelStyle}`}>
              {level}
            </span>
          )}
        </motion.div>

        {/* Bottom: Title & Author */}
        <motion.div
          layoutId={`card-body-${layoutKey}`}
          transition={SPRING_TRANSITION}
          className="card-body p-3.5 sm:p-4 gap-1.5 flex-1 flex flex-col justify-between bg-base-100"
        >
          <div>
            <motion.h2
              layoutId={`card-title-${layoutKey}`}
              transition={SPRING_TRANSITION}
              className="card-title font-1 font-bold text-sm sm:text-base lg:text-lg text-base-content leading-snug mb-0.5 group-hover:text-cyan-700 transition-colors duration-300 line-clamp-1"
            >
              {title}
            </motion.h2>

            <motion.div
              layoutId={`card-author-${layoutKey}`}
              transition={SPRING_TRANSITION}
              className="flex flex-col gap-0.5"
            >
              <span className="text-[9px] sm:text-[10px] text-base-content/50 font-2">المؤلف</span>
              <span className="text-xs font-2 text-base-content/80 font-medium line-clamp-1">
                {author}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── 2. Click-Triggered Expanded Center Modal & Shared Element Transition ── */}
      <AnimatePresence>
        {isExpanded && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            dir="rtl"
          >
            {/* Dark Dimmed Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md z-40 cursor-pointer"
            />

            {/* Expanded Center Modal Dialog */}
            <motion.div
              layoutId={`card-container-${layoutKey}`}
              transition={SPRING_TRANSITION}
              className="
                relative card bg-base-100 border border-base-200/80
                shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[85vh] overflow-hidden
                rounded-3xl z-50 flex flex-col origin-center
              "
            >
              {/* Close Icon Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-3 left-3 btn btn-circle btn-sm bg-black/40 hover:bg-black/70 text-white border-none z-20 transition-colors"
                aria-label="إغلاق"
              >
                <FiX className="text-lg" />
              </button>

              {/* Top Half: Scaled Cover Image */}
              <motion.div
                layoutId={`card-image-container-${layoutKey}`}
                transition={SPRING_TRANSITION}
                className="relative w-full h-36 sm:h-44 lg:h-52 bg-base-200/90 dark:bg-base-300/60 p-3 flex items-center justify-center overflow-hidden shrink-0"
              >
                {coverImage ? (
                  <motion.img
                    layoutId={`card-image-${layoutKey}`}
                    transition={SPRING_TRANSITION}
                    src={coverImage}
                    alt={title}
                    className="max-h-full max-w-full object-contain rounded-xl drop-shadow-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 via-cyan-800/30 to-base-300 flex flex-col items-center justify-center gap-2 text-cyan-700 dark:text-cyan-400">
                    <IoBookOutline className="text-4xl" />
                    <span className="text-xs font-2 opacity-60">غلاف الكتاب</span>
                  </div>
                )}

                {category && (
                  <span className="absolute top-3 right-3 badge bg-black/65 backdrop-blur-md text-white border-none font-2 text-xs px-3 py-1 rounded-xl shadow-md z-10">
                    {category}
                  </span>
                )}
              </motion.div>

              {/* Bottom Half: Detailed Text & Controls */}
              <motion.div
                layoutId={`card-body-${layoutKey}`}
                transition={SPRING_TRANSITION}
                className="card-body p-5 gap-3.5 overflow-y-auto flex-1 bg-base-100"
              >
                <div>
                  <motion.h2
                    layoutId={`card-title-${layoutKey}`}
                    transition={SPRING_TRANSITION}
                    className="font-1 font-bold text-lg sm:text-xl text-base-content leading-snug mb-0.5"
                  >
                    {title}
                  </motion.h2>

                  <motion.div
                    layoutId={`card-author-${layoutKey}`}
                    transition={SPRING_TRANSITION}
                    className="text-xs sm:text-sm font-2 text-cyan-700 dark:text-cyan-400 font-semibold"
                  >
                    المؤلف: {author}
                  </motion.div>
                </div>

                {/* Additional Detailed Content Fades & Slides Up */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                  className="space-y-3.5 border-t border-base-200/80 pt-3.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-2 text-base-content/60">مستوى المتن:</span>
                    <span className={`badge badge-sm font-2 font-semibold ${levelStyle}`}>
                      {level || "مبتدئ"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-1 font-bold text-xs text-base-content/80">نبذة عن الكتاب:</h4>
                    <p className="font-2 text-xs sm:text-sm text-base-content/75 leading-relaxed">
                      {defaultDesc}
                    </p>
                  </div>

                  {/* Action Buttons: Add + Navigate to Index */}
                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdd?.(e);
                        setIsExpanded(false);
                      }}
                      className="btn bg-cyan-700 hover:bg-cyan-800 text-white font-2 flex-1 rounded-xl text-xs sm:text-sm shadow-md"
                    >
                      إضافة المتن للخطة
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                        onClick?.(e);
                      }}
                      className="btn btn-outline border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white font-2 flex-1 rounded-xl text-xs sm:text-sm"
                    >
                      عرض الفهرس
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
