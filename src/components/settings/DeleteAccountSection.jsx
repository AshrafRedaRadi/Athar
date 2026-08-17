import React, { useState } from "react";
import { HiArrowRightOnRectangle } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";

function DeleteAccountSection() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      window.location.replace("/login");
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-base-200/80 dark:border-slate-800 text-right font-2" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h4 className="font-1 font-bold text-base text-base-content flex items-center gap-2">
            <span>منطقة الحساب والأمان</span>
          </h4>
          <p className="text-xs text-base-content/60 mt-1">
            إدارة تسجيل الخروج وتأمين جلسة حسابك
          </p>
        </div>

        {/* Action Button: Logout */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-outline border-base-300 dark:border-slate-700 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content h-10 min-h-0 px-5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoggingOut ? (
              <span className="loading loading-spinner loading-xs text-cyan-600" />
            ) : (
              <HiArrowRightOnRectangle className="text-base text-cyan-700 dark:text-cyan-400" />
            )}
            <span>{isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default DeleteAccountSection;
