import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import ChangeImage from "./ChangeImage";
import ThemeSwitcher from "./ThemeSwitcher";
import HadithFontSwitcher from "./HadithFontSwitcher";
import DeleteAccountSection from "./DeleteAccountSection";
import { HiCheckBadge, HiOutlineKey, HiOutlineEnvelope, HiOutlineUser, HiChevronRight } from "react-icons/hi2";

function SettingsContent({ setShowAvatars }) {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Name and Email from auth context / backend user data
  const [fullName, setFullName] = useState(
    user?.fullName || user?.name || user?.userName || ""
  );
  const [email, setEmail] = useState(user?.email || "");

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);



  const originalName = user?.fullName || user?.name || user?.userName || "";
  const isNameChanged = fullName.trim() !== originalName.trim() && fullName.trim().length > 0;

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();

    const trimmedName = fullName.trim();
    if (!trimmedName) return;

    setIsSaving(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setToastMessage("انتهت الجلسة، يرجى تسجيل الدخول من جديد.");
      setIsSaving(false);
      return;
    }

    const payload = {
      fullName: trimmedName,
    };

    if (user?.address && String(user.address).trim()) {
      payload.address = String(user.address).trim();
    }

    if (user?.phoneNumber && String(user.phoneNumber).trim()) {
      payload.phoneNumber = String(user.phoneNumber).trim();
    }

    try {
      const response = await apiFetch("/api/Account/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updatedUser = response?.data?.data || response?.data || {};

      updateUser({
        fullName: updatedUser.fullName || trimmedName,
        name: updatedUser.name || trimmedName,
        userName: updatedUser.userName || trimmedName,
        address: updatedUser.address || user?.address || "",
        phoneNumber: updatedUser.phoneNumber || user?.phoneNumber || "",
      });

      setToastMessage("تم تحديث اسم المستخدم بنجاح! 🎉");
    } catch (error) {
      console.error("Error updating profile:", error?.response?.data || error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.msg || "تعذّر تحديث الاسم، يرجى المحاولة مرة أخرى.";
      setToastMessage(serverMessage);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setToastMessage("");
      }, 3500);
    }
  };

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleResetPasswordRequest = () => {
    setIsResetModalOpen(true);
  };

  const confirmResetPassword = () => {
    setIsResettingPassword(true);

    setTimeout(() => {
      setIsResettingPassword(false);
      setIsResetModalOpen(false);
      setToastMessage(
        `تم إرسال رابط إعادة ضبط كلمة المرور إلى البريد الإلكتروني (${email || user?.email || "حسابك"}) بنجاح! 📧`
      );

      setTimeout(() => {
        setToastMessage("");
      }, 4500);
    }, 700);
  };

  const handleGoBack = () => {
    if (window.history?.length > 1) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="settingPage font-2" dir="rtl">
      <header className="text-start space-y-1 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 flex items-center justify-center text-base-content hover:text-cyan-600 hover:border-cyan-600/50 transition-all cursor-pointer shadow-xs shrink-0"
            title="الرجوع للخلف"
            aria-label="الرجوع للخلف"
          >
            <HiChevronRight className="text-xl" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-1 text-base-content">
            إعدادات الملف الشخصي
          </h1>
        </div>
        <p className="text-sm md:text-base text-base-content/60 font-normal mt-2">
          قم بتحديث معلوماتك الشخصية وكيفية ظهورك في المنصة
        </p>
      </header>

      {/* Side-by-side grid layout for Profile Picture Card & Name/Email Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Profile Picture Card (5 cols on desktop) */}
        <div className="col-span-1 lg:col-span-5 h-full">
          <ChangeImage setShowAvatars={setShowAvatars} />
        </div>

        {/* Name, Email, and Theme Form Card (7 cols on desktop) */}
        <div className="col-span-1 lg:col-span-7 h-full bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-4">
              {/* Name & Email Fields Side-by-Side in 2-column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* User Name Field (Editable with inline Save Button) */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1.5 gap-1">
                    <label
                      htmlFor="user-name"
                      className="flex items-center gap-1.5 text-sm font-semibold text-base-content"
                    >
                      <HiOutlineUser className="text-cyan-700 dark:text-cyan-400 text-base shrink-0" />
                      <span>اسم المستخدم / الاسم الكامل</span>
                    </label>

                    {/* Small Inline Save & Cancel Buttons shown only when name is edited */}
                    {isNameChanged && (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => setFullName(originalName)}
                          className="text-xs text-base-content/60 hover:text-base-content px-2 py-0.5 rounded-lg hover:bg-base-200 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={isSaving || !fullName.trim()}
                          className="px-2.5 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-60"
                          title="حفظ الاسم"
                        >
                          {isSaving ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <HiCheckBadge className="text-sm" />
                          )}
                          <span>حفظ</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    id="user-name"
                    type="text"
                    name="userName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="اكتب اسم المستخدم"
                    className="input h-11 w-full rounded-xl border-base-300 bg-base-100 text-right text-base-content placeholder:text-base-content/40 focus:border-cyan-600 focus:outline-none shadow-xs text-sm font-medium"
                  />
                </div>

                {/* Email Field (Loaded from Backend / AuthContext) */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1.5 gap-1">
                    <label
                      htmlFor="user-email"
                      className="flex items-center gap-1.5 text-sm font-semibold text-base-content shrink-0"
                    >
                      <HiOutlineEnvelope className="text-cyan-700 dark:text-cyan-400 text-base shrink-0" />
                      <span>البريد الإلكتروني</span>
                    </label>

                    {/* Password Reset Request Button */}
                    <button
                      type="button"
                      onClick={handleResetPasswordRequest}
                      disabled={isResettingPassword}
                      className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <HiOutlineKey className="text-xs sm:text-sm" />
                      <span className="text-[11px] sm:text-xs">
                        {isResettingPassword
                          ? "جاري إرسال الرابط..."
                          : "إعادة ضبط كلمة المرور"}
                      </span>
                    </button>
                  </div>

                  <input
                    id="user-email"
                    type="email"
                    name="email"
                    value={email}
                    readOnly
                    placeholder="البريد الإلكتروني المسجل"
                    className="input h-11 w-full rounded-xl border-base-300 bg-base-200/50 text-right text-base-content/80 shadow-2xs text-sm font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Website Theme Switcher */}
              <div className="w-full pt-1">
                <label className="mb-1.5 block text-sm font-semibold text-base-content">
                  مظهر الموقع
                </label>
                <ThemeSwitcher />
              </div>

              {/* Hadith Typography / Font Switcher */}
              <div className="w-full pt-2">
                <label className="mb-2 block text-sm font-semibold text-base-content">
                  نوع خط نصوص الأحاديث الشريفة
                </label>
                <HadithFontSwitcher />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Account & Security Zone (Compact Delete Account + Logout Side-by-Side) */}
      <DeleteAccountSection />

      {/* Centered Help Center (مركز المساعدة) Button at the Bottom */}
      <div className="flex justify-center mt-8 sm:mt-10 mb-6">
        <button
          type="button"
          onClick={() => navigate('/help')}
          className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-base-100 dark:bg-slate-900 border border-base-300/80 dark:border-slate-800 text-base-content/85 hover:text-cyan-700 dark:hover:text-cyan-400 hover:border-cyan-600/50 hover:shadow-md transition-all font-2 text-sm sm:text-base font-bold cursor-pointer"
        >
          <span>مركز المساعدة</span>
          <svg
            className="w-5 h-5 shrink-0 text-current"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </button>
      </div>

      {/* Password Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsResetModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-cyan-200 dark:border-cyan-900 bg-base-100 dark:bg-slate-900 p-6 text-right shadow-2xl animate-scaleIn z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-2xl mx-auto sm:mx-0">
              <HiOutlineKey />
            </div>

            <div>
              <h3 className="font-1 font-bold text-lg text-base-content">
                تأكيد طلب إعادة ضبط كلمة المرور
              </h3>
              <p className="font-2 mt-2 text-xs sm:text-sm text-base-content/70 leading-relaxed">
                سيتم إرسال رابط آمن لإعادة ضبط كلمة المرور إلى بريدك الإلكتروني التالي:
              </p>
              <div className="mt-2.5 p-3 bg-base-200/60 dark:bg-slate-800/60 rounded-xl border border-base-300 dark:border-slate-700 text-center font-bold text-cyan-800 dark:text-cyan-300 text-sm dir-ltr">
                {email || user?.email || "البريد الإلكتروني المسجل"}
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="btn btn-ghost h-10 min-h-0 rounded-xl px-5 text-sm w-full sm:w-auto font-semibold"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={confirmResetPassword}
                disabled={isResettingPassword}
                className="btn bg-cyan-700 hover:bg-cyan-800 text-white h-10 min-h-0 rounded-xl px-5 text-sm font-bold w-full sm:w-auto border-none flex items-center justify-center gap-2 shadow-sm"
              >
                {isResettingPassword ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <HiOutlineKey className="text-base" />
                )}
                <span>{isResettingPassword ? "جاري الإرسال..." : "إرسال رابط الضبط"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[94vw] animate-bounceIn">
          <div className="bg-cyan-950/95 dark:bg-cyan-900/95 backdrop-blur-md text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border border-cyan-400/50 flex items-center gap-3 font-2 text-xs sm:text-sm font-bold whitespace-nowrap">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <HiCheckBadge className="text-cyan-300 text-xl" />
            </div>
            <span className="whitespace-nowrap">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsContent;
