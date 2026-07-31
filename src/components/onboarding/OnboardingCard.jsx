import React from 'react';

/**
 * OnboardingCard — Displays the icon (text-cyan-700), title (Alexandria),
 * description (Tajawal), and progress dots directly below description.
 */
export default function OnboardingCard({ icon, title, description, currentStep = 1, totalSteps = 3 }) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 transition-all duration-300 ease-in-out">
      {/* Icon Badge Container */}
      <div className="flex items-center justify-center text-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-cyan-700/10 dark:bg-cyan-500/20 mb-6 shadow-xs">
        <div className="text-cyan-700 dark:text-cyan-500 text-5xl sm:text-6xl flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* Step Title (Alexandria) */}
      <h2 className="font-1 font-bold text-2xl sm:text-3xl text-base-content mb-3 leading-snug">
        {title}
      </h2>

      {/* Step Description (Tajawal) */}
      <p className="font-2 text-sm sm:text-base text-base-content/70 leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {/* Progress Dots — centered directly below description text */}
      <div className="flex items-center justify-center gap-2 mb-2" dir="rtl">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={stepNumber}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-8 bg-cyan-700 dark:bg-cyan-500'
                  : isCompleted
                  ? 'w-2.5 bg-cyan-700/40 dark:bg-cyan-500/40'
                  : 'w-2.5 bg-base-300'
              }`}
              aria-label={`الخطوة ${stepNumber} من ${totalSteps}`}
            />
          );
        })}
      </div>
    </div>
  );
}
