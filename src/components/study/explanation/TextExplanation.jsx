import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScholarTextContent from "./ScholarTextContent";
import { SCHOLARS, extractScholarExplanation } from "./scholarUtils";

/**
 * TextExplanation Component for dual scholars (Osaimi vs Othaymeen)
 * Dynamically adjusts container height based on the active scholar's content length.
 */
export default function TextExplanation({ explanation }) {
  const [scholarTab, setScholarTab] = useState("osaimi");

  const osaimiData = extractScholarExplanation(explanation, "osaimi");
  const othaymeenData = extractScholarExplanation(explanation, "othaymeen");

  const activeData = scholarTab === "osaimi" ? osaimiData : othaymeenData;
  const activeEmptyMsg =
    scholarTab === "osaimi"
      ? "لا يوجد شرح متاح حالياً للشيخ صالح العصيمي لهذا الحديث."
      : "لا يوجد شرح متاح حالياً للشيخ ابن عثيمين لهذا الحديث.";

  return (
    <div className="space-y-3">
      {/* Scholar Selection Toggle */}
      <div className="flex bg-base-200/90 p-1 rounded-2xl gap-1 border border-base-300 shadow-inner">
        {SCHOLARS.map(({ key, name, type }) => (
          <button
            key={key}
            type="button"
            onClick={() => setScholarTab(key)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold font-2 transition-all duration-300 cursor-pointer text-center ${
              scholarTab === key
                ? "bg-cyan-700 text-white shadow-md font-bold"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            {name} <span className="text-[10px] opacity-80 font-normal ms-0.5">{type}</span>
          </button>
        ))}
      </div>

      {/* Selected Scholar Header */}
      <div className="bg-cyan-700/10 border border-cyan-700/20 rounded-xl p-2.5 text-center transition-all duration-300">
        <span className="font-3 font-bold text-sm text-cyan-800 dark:text-cyan-300">
          شرح {scholarTab === "osaimi" ? "الشيخ صالح العصيمي" : "الشيخ ابن عثيمين"}
        </span>
      </div>

      {/* Dynamic Scholar Text Content (Conditional rendering to collapse empty scroll area) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scholarTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <ScholarTextContent item={activeData} emptyMsg={activeEmptyMsg} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
