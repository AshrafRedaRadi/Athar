import React from 'react';
import { motion } from 'framer-motion';

/**
 * OnboardingDots — Permanent Progress Indicator bar with sliding active pill.
 * Remains mounted across step changes so the pill glides smoothly without fading.
 */
export default function OnboardingDots({ currentStep = 1, totalSteps = 3 }) {
  return (
    <div className="flex items-center justify-center gap-3.5 mt-2 mb-2 py-1.5 px-4 bg-base-100/70 dark:bg-base-800/50 rounded-full border border-base-200/60 shadow-2xs z-10" dir="rtl">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === currentStep;

        return (
          <div
            key={stepNumber}
            className="relative flex items-center justify-center py-0.5"
          >
            {/* Background dot slot */}
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                isActive ? 'bg-transparent' : 'bg-base-300 dark:bg-base-600'
              }`}
            />

            {/* Sliding Active Pill */}
            {isActive && (
              <motion.div
                layoutId="activeOnboardingPill"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="absolute inset-0 -my-0.5 -mx-2 rounded-full bg-cyan-700 dark:bg-cyan-500 shadow-xs"
                aria-label={`الخطوة الحالية ${stepNumber} من ${totalSteps}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
