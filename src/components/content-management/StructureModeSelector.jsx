import React from "react";
import {
  BOOK_STRUCTURE_MODES,
  STRUCTURE_MODE_CONFIG,
} from "../../utils/hadithSectionTree";

/**
 * StructureModeSelector — Radio card selector for choosing the book's content hierarchy.
 * Displays 3 distinct structure modes with visual descriptions and examples.
 */
export default function StructureModeSelector({ value, onChange, disabled = false }) {
  const modes = Object.entries(STRUCTURE_MODE_CONFIG);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-base-content/90 font-2">
        اختر الهيكل التنظيمي لمحتوى هذا الكتاب: <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modes.map(([modeKey, config]) => {
          const isSelected = value === modeKey;
          return (
            <button
              key={modeKey}
              type="button"
              disabled={disabled}
              onClick={() => onChange(modeKey)}
              className={`relative text-right p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? "border-cyan-600 bg-cyan-50/80 dark:bg-cyan-950/40 shadow-md shadow-cyan-600/10 ring-1 ring-cyan-500/30"
                  : "border-base-300/80 dark:border-slate-700/60 bg-base-100 dark:bg-slate-900/50 hover:border-cyan-500/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {/* Radio indicator */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-cyan-600 bg-cyan-600"
                      : "border-base-300 dark:border-slate-600 group-hover:border-cyan-500"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Mode title */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{config.icon}</span>
                    <h4
                      className={`font-1 font-bold text-sm leading-tight ${
                        isSelected
                          ? "text-cyan-700 dark:text-cyan-400"
                          : "text-base-content"
                      }`}
                    >
                      {config.label}
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] leading-relaxed text-base-content/60 font-2">
                    {config.description}
                  </p>

                  {/* Examples */}
                  <p className="text-[10px] text-base-content/45 font-2 leading-snug">
                    <span className="font-bold text-base-content/55">مثال:</span>{" "}
                    {config.examples}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
