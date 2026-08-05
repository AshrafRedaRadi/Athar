import React from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

/**
 * NavigationButtons — Displays Previous ("السابق") and Next / Finish ("التالي" / "ابدأ الآن") action buttons.
 */
export default function NavigationButtons({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isLastStep,
}) {
  const isFirstStep = currentStep === 1;

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-between gap-4 px-6 py-4" dir="rtl">
      {/* Previous Button */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className={`btn btn-outline border-base-300 hover:bg-base-200 text-base-content/80 rounded-full font-2 px-5 text-sm sm:text-base flex items-center gap-1 cursor-pointer transition-all ${
          isFirstStep ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
        }`}
      >
        <IoChevronForward className="text-lg" />
        <span>السابق</span>
      </button>

      {/* Next / Finish Button */}
      <button
        type="button"
        onClick={onNext}
        className="btn bg-cyan-700 hover:bg-cyan-800 text-white border-none rounded-full font-2 px-8 text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 min-w-[140px] justify-center cursor-pointer"
      >
        <span>{isLastStep ? 'ابدأ الآن' : 'التالي'}</span>
        {!isLastStep && <IoChevronBack className="text-lg" />}
      </button>
    </div>
  );
}
