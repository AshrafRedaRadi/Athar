import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";

// Difficulty badge colour map
const LEVEL_STYLES = {
  مبتدئ: "badge-warning text-warning-content",
  متوسط: "badge-success text-success-content",
  متقدم: "badge-error text-error-content",
};

// Ultra-smooth Spring Physics
const SMOOTH_SPRING = {
  type: "spring",
  stiffness: 210,
  damping: 24,
  mass: 0.75,
};

/**
 * Clean & Refactored Card component for Library with Shared Element Transition.
 */
export default function Card({
  id,
  title,
  author,
  level,
  category,
  coverImage,
  description,
  onAdd,
  onClick,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const layoutKey = id || title;
  const levelStyle = LEVEL_STYLES[level] ?? "badge-ghost";
  const defaultDesc =
    description ||
    "متن شريف يتضمن أصول العبادات والأحكام والأخلاق الإيمانية، حظي باهتمام واسع ودراسة مستفيضة من كبار العلماء، ويعتبر من أمهات الكتب المقررة لطلاب العلم.";

  const renderCover = (heightClass = "h-32 sm:h-38 lg:h-44", showLevelBadge = true, categoryPosClass = "top-2.5 right-2.5") => (
    <motion.div
      layoutId={`card-image-container-${layoutKey}`}
      className={`relative w-full ${heightClass} p-0 flex items-center justify-center overflow-hidden shrink-0 rounded-t-2xl`}
    >
      {coverImage ? (
        <motion.img
          layoutId={`card-image-${layoutKey}`}
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-cyan-900/15 via-cyan-800/25 to-base-300 flex flex-col items-center justify-center gap-1 text-cyan-700 dark:text-cyan-400">
          <IoBookOutline className="text-3xl" />
          <span className="text-[10px] font-2 opacity-60">غلاف الكتاب</span>
        </div>
      )}

      {category && (
        <span className={`absolute ${categoryPosClass} badge bg-black/65 backdrop-blur-md text-white border-none font-2 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-lg shadow-sm z-10`}>
          {category}
        </span>
      )}

      {level && showLevelBadge && (
        <span className={`absolute top-2.5 left-2.5 badge border-none font-2 text-[10px] sm:text-xs px-2 py-0.5 rounded-lg shadow-sm z-10 ${levelStyle}`}>
          {level}
        </span>
      )}
    </motion.div>
  );

  const renderTitleAuthor = (titleSizeClass) => (
    <motion.div layoutId={`card-body-${layoutKey}`}>
      <motion.h2
        layoutId={`card-title-${layoutKey}`}
        className={`card-title font-1 font-bold ${titleSizeClass} text-base-content leading-snug mb-0.5 group-hover:text-cyan-700 transition-colors duration-300 line-clamp-1`}
      >
        {title}
      </motion.h2>
      <motion.div layoutId={`card-author-${layoutKey}`} className="flex flex-col gap-0.5">
        <span className="text-[9px] sm:text-[10px] text-base-content/50 font-2">المؤلف</span>
        <span className="text-xs font-2 text-base-content/80 font-medium line-clamp-1">
          {author}
        </span>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <motion.div
        layoutId={`card-container-${layoutKey}`}
        onClick={() => setIsExpanded(true)}
        whileHover={{ scale: 1.02, y: -3 }}
        whileTap={{ scale: 0.98 }}
        transition={SMOOTH_SPRING}
        className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-xl w-full overflow-hidden flex flex-col justify-between rounded-2xl cursor-pointer hover:border-cyan-600/40 group h-full"
        dir="rtl"
      >
        {renderCover("h-32 sm:h-38 lg:h-44", true, "top-2.5 right-2.5")}
        <div className="card-body p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-base-100">
          {renderTitleAuthor("text-sm sm:text-base lg:text-lg")}
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md z-40 cursor-pointer"
            />

            <motion.div
              layoutId={`card-container-${layoutKey}`}
              transition={SMOOTH_SPRING}
              className="relative card bg-base-100 border border-base-200/80 shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[85vh] overflow-hidden rounded-3xl z-50 flex flex-col origin-center"
            >
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-3.5 left-3.5 btn btn-circle btn-sm bg-black/40 hover:bg-black/70 text-white border-none z-20 transition-colors shadow-md"
                aria-label="إغلاق"
              >
                <FiX className="text-lg" />
              </button>

              {renderCover("h-36 sm:h-44 lg:h-52", false, "top-3.5 right-3.5 sm:top-4 sm:right-4")}

              <div className="card-body p-5 gap-3.5 overflow-y-auto flex-1 bg-base-100">
                {renderTitleAuthor("text-lg sm:text-xl")}

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
