import React from "react";
import { useNavigate } from "react-router-dom";
import { IoLockClosedOutline, IoPersonAddOutline, IoLogInOutline } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

/**
 * GuestLoginModal Component
 * Prompts guest users to log in or sign up when attempting to access restricted features (e.g. books).
 */
export default function GuestLoginModal({ isOpen, onClose, title = "تسجيل الدخول مطلوب", message = "تصفح وحفظ المتون العلمية ومتابعة تقدمك يتطلب تسجيل الدخول إلى حسابك." }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    logout();
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-base-100 border border-base-200 shadow-2xl rounded-3xl p-6 max-w-sm w-full z-10 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-3xl shrink-0">
          <IoLockClosedOutline />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-1 font-bold text-xl text-base-content mb-1">
            {title}
          </h3>
          <p className="font-2 text-xs sm:text-sm text-base-content/70 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-2 font-2">
          <button
            onClick={handleLoginRedirect}
            className="btn bg-cyan-700 hover:bg-cyan-800 text-white border-none rounded-xl w-full flex items-center justify-center gap-2 shadow-md"
          >
            <IoLogInOutline className="text-lg" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            onClick={handleSignupRedirect}
            className="btn btn-outline border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white rounded-xl w-full flex items-center justify-center gap-2"
          >
            <IoPersonAddOutline className="text-base" />
            <span>إنشاء حساب جديد</span>
          </button>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm text-base-content/60 hover:text-base-content rounded-lg w-full mt-1"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
