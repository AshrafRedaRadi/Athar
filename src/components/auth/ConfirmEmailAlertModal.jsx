import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMailUnreadOutline, IoCheckmarkCircle, IoArrowForward } from 'react-icons/io5';

/**
 * ConfirmEmailAlertModal — Animated SweetAlert modal shown upon successful registration
 * notifying the user to verify their email address.
 */
export default function ConfirmEmailAlertModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none" dir="rtl">
        {/* Backdrop overlay with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* SweetAlert Animated Card Container */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="relative bg-[#112233]/90 dark:bg-[#0f1d2a]/95 border border-white/20 shadow-[0_0_50px_rgba(74,144,164,0.3)] rounded-3xl p-6 sm:p-8 max-w-sm w-full z-10 flex flex-col items-center text-center text-white backdrop-blur-xl"
        >
          {/* Animated Glowing Icon Badge */}
          <div className="relative mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-[#4A90A4] to-emerald-400 p-0.5 shadow-lg flex items-center justify-center"
            >
              <div className="w-full h-full bg-[#112233] rounded-full flex items-center justify-center relative">
                <IoMailUnreadOutline className="text-4xl text-cyan-300 animate-pulse" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, delay: 0.3 }}
                  className="absolute -top-1 -right-1 text-emerald-400 text-2xl bg-[#112233] rounded-full p-0.5"
                >
                  <IoCheckmarkCircle />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-1 font-bold text-xl sm:text-2xl text-white mb-2"
          >
            تم إنشاء الحساب بنجاح! 🎉
          </motion.h3>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="font-2 text-xs sm:text-sm text-white/80 leading-relaxed mb-6 bg-white/5 border border-white/10 p-3 rounded-2xl"
          >
            {message || 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يُرجى التحقق من صندوق الوارد وتأكيد حسابك.'}
          </motion.p>

          {/* Action Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onConfirm}
            className="btn w-full bg-[#4A90A4] hover:bg-[#3b7687] text-white border-none rounded-full font-2 text-sm sm:text-base py-3 shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>سأتحقق من بريدي</span>
            <IoArrowForward className="text-lg rotate-180" />
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
