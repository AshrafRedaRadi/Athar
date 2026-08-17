import React, { useState } from "react";
import { HiArrowRightOnRectangle, HiOutlineTrash, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";

function DeleteAccountSection() {
  const { user, logout } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = Boolean(
    user?.isAdmin ||
    String(user?.role || "").toLowerCase().includes("admin") ||
    String(user?.role || "").toLowerCase().includes("مشرف") ||
    String(user?.role || "").toLowerCase().includes("أدمن")
  );

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    setTimeout(() => {
      logout();
      window.location.href = "/login";
    }, 1200);
  };

  return (
    <section className="mt-8 pt-6 border-t border-base-200/80 dark:border-slate-800 text-right font-2" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h4 className="font-1 font-bold text-base text-base-content flex items-center gap-2">
            <span>منطقة الحساب والأمان</span>
          </h4>
          <p className="text-xs text-base-content/60 mt-1">
            {isAdmin ? "إدارة تسجيل الخروج من حسابك" : "إدارة تسجيل الخروج والحذف النهائي لحسابك"}
          </p>
        </div>

        {/* Action Buttons Side-by-Side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline border-base-300 dark:border-slate-700 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content h-10 min-h-0 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer"
          >
            <HiArrowRightOnRectangle className="text-base text-cyan-700 dark:text-cyan-400" />
            <span>تسجيل الخروج</span>
          </button>

          {/* Compact Delete Account Button — Hidden for Admin */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              className="btn bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-700 h-10 min-h-0 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer"
            >
              <HiOutlineTrash className="text-base" />
              <span>حذف الحساب</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {!isAdmin && isConfirmOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsConfirmOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-900 bg-base-100 dark:bg-slate-900 p-6 text-right shadow-2xl animate-scaleIn z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto sm:mx-0">
              <HiOutlineExclamationTriangle />
            </div>

            <div>
              <h3 className="font-1 font-bold text-lg text-rose-600 dark:text-rose-400">
                تأكيد حذف الحساب النهائي
              </h3>
              <p className="font-2 mt-2 text-xs sm:text-sm text-base-content/70 leading-relaxed">
                هل أنت متأكد من حذف الحساب بشكل نهائي؟ بمجرد الحذف، لن تتمكن من استعادة معلوماتك أو خطتك المحفوظة.
              </p>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="btn btn-ghost h-10 min-h-0 rounded-xl px-5 text-sm w-full sm:w-auto"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="btn bg-rose-600 hover:bg-rose-700 text-white h-10 min-h-0 rounded-xl px-5 text-sm font-bold w-full sm:w-auto border-none flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <HiOutlineTrash className="text-base" />
                )}
                <span>{isDeleting ? "جاري الحذف..." : "نعم، احذف حسابي"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DeleteAccountSection;
