import React from 'react';
import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';

const cardVariants = {
  enter: {
    opacity: 0,
    scale: 0.95,
  },
  center: {
    zIndex: 1,
    opacity: 1,
    scale: 1,
  },
  exit: {
    zIndex: 0,
    opacity: 0,
    scale: 0.95,
  },
};

const transition = {
  duration: 0.25,
  ease: 'easeInOut',
};

export default function OnboardingCard({ icon, title, description, currentStep = 1, totalSteps = 3 }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="flex flex-col items-center justify-center text-center max-w-md mx-auto p-2 sm:p-4 my-auto"
    >
      {/* Icon Badge Container with 3D Flip & Bounce Entrance */}
      <div className="perspective-1000 mb-4 sm:mb-6 shrink-0">
        <motion.div
          initial={{ rotateY: 180, scale: 0.6, opacity: 0 }}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.9, delay: 0.05 }}
          className="flex items-center justify-center text-center w-22 h-22 sm:w-28 sm:h-28 rounded-full bg-cyan-700/10 dark:bg-cyan-500/20 shadow-xs"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="text-cyan-700 dark:text-cyan-500 text-4xl sm:text-5xl flex items-center justify-center">
            {icon}
          </div>
        </motion.div>
      </div>

      {/* Step Title (Alexandria) with Typewriter Animation */}
      <h2 className="font-1 font-bold text-xl sm:text-3xl text-base-content mb-2 sm:mb-3 leading-snug min-h-[36px] sm:min-h-[40px] flex items-center justify-center">
        <TypewriterText
          text={title}
          speed={22}
          delay={50}
          as="span"
        />
      </h2>

      {/* Step Description (Tajawal) with Typewriter Animation */}
      <p className="font-2 text-xs sm:text-base text-base-content/70 leading-relaxed max-w-sm min-h-[60px] sm:min-h-[72px] flex items-start justify-center">
        <TypewriterText
          text={description}
          speed={18}
          delay={250}
          as="span"
        />
      </p>
    </motion.div>
  );
}
