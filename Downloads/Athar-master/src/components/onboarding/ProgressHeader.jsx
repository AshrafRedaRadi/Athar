import React from 'react';

/**
 * ProgressHeader — Displays top bar containing Skip button ("تخطي").
 */
export default function ProgressHeader({ onSkip }) {
  return (
    <div className="w-full max-w-xl mx-auto flex items-center justify-start px-6 py-4" dir="rtl">
      {/* Skip button */}
      <button
        onClick={onSkip}
        className="font-2 text-sm sm:text-base text-base-content/60 hover:text-cyan-700 dark:hover:text-cyan-400 font-semibold transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-base-200"
        aria-label="تخطي التعريف"
      >
        تخطي
      </button>
    </div>
  );
}
