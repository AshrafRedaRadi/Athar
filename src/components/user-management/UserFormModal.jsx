import React, { useState, useEffect } from "react";
import { HiOutlineX, HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineUserGroup, HiOutlineBadgeCheck, HiOutlineKey } from "react-icons/hi";
import { normalizeRole } from "../../services/usersService";

/**
 * UserFormModal - Modal for Editing User Roles, Status (Activated/Deactivated), and sending Password Reset link.
 */
export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  onSendPasswordReset,
  initialData,
  isSaving,
  serverError,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "طالب",
    status: "نشط",
  });

  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);
  const [resetError, setResetError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        role: normalizeRole(initialData.role),
        status: initialData.status || (initialData.isActivated !== false ? "نشط" : "غير نشط"),
      });
    }
    setResetMsg(null);
    setResetError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleResetPassword = async () => {
    if (!initialData?.id || !onSendPasswordReset) return;
    setIsSendingReset(true);
    setResetMsg(null);
    setResetError(null);
    try {
      await onSendPasswordReset(initialData.id);
      setResetMsg("تم إرسال رابط إعادة ضبط كلمة المرور إلى البريد الإلكتروني بنجاح!");
    } catch (err) {
      setResetError(err?.message || "تعذَّر إرسال الرابط حالياً، يرجى التأكد من البيانات والمحاولة لاحقاً.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 relative animate-fadeIn my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0">
              <HiOutlineUserGroup />
            </div>
            <div>
              <h3 className="font-1 font-bold text-xl text-base-content">
                تعديل حساب المستخدم
              </h3>
              <p className="font-2 text-xs text-base-content/60">
                إدارة الصلاحيات (الدور) وتفعيل أو تجميد الحساب
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {/* Server Error Alert Banner */}
        {(serverError || resetError) && (
          <div className="alert alert-error text-xs rounded-xl font-2 font-medium flex items-center justify-between py-2.5 px-4">
            <span>{serverError || resetError}</span>
          </div>
        )}

        {/* Success Reset Link Banner */}
        {resetMsg && (
          <div className="alert alert-success text-xs rounded-xl font-2 font-medium flex items-center justify-between py-2.5 px-4 text-emerald-950 dark:text-emerald-100">
            <span>{resetMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 font-2">
          {/* Readonly Name Field */}
          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-base-content/80 mb-1.5">
              <span>اسم المستخدم</span>
              <span className="text-[11px] text-base-content/40 font-normal">(للقراءة فقط)</span>
            </label>
            <div className="relative flex items-center">
              <HiOutlineUser className="absolute right-3.5 text-base-content/40 text-lg pointer-events-none" />
              <input
                type="text"
                disabled
                value={formData.name}
                className="input input-bordered w-full pr-10 rounded-xl text-sm bg-base-200/60 opacity-80 cursor-not-allowed font-bold"
              />
            </div>
          </div>

          {/* Readonly Email Field */}
          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-base-content/80 mb-1.5">
              <span>البريد الإلكتروني</span>
              <span className="text-[11px] text-base-content/40 font-normal">(للقراءة فقط)</span>
            </label>
            <div className="relative flex items-center">
              <HiOutlineMail className="absolute right-3.5 text-base-content/40 text-lg pointer-events-none" />
              <input
                type="email"
                disabled
                value={formData.email}
                className="input input-bordered w-full pr-10 rounded-xl text-sm bg-base-200/60 opacity-80 cursor-not-allowed font-bold"
              />
            </div>
          </div>

          {/* Role & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Role Select */}
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                دور الحساب (الصلاحية) <span className="text-cyan-600">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="select select-bordered w-full rounded-xl text-sm font-2 font-bold"
              >
                <option value="معلم">معلم</option>
                <option value="طالب">طالب</option>
                <option value="أدمن">مشرف (أدمن)</option>
              </select>
            </div>

            {/* Status Select (Activated / Deactivated) */}
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                حالة الحساب <span className="text-cyan-600">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select select-bordered w-full rounded-xl text-sm font-2 font-bold"
              >
                <option value="نشط">نشط (مُفعّل)</option>
                <option value="غير نشط">غير نشط (مُجمّد)</option>
              </select>
            </div>
          </div>

          {/* Password Reset Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isSendingReset}
              className="btn btn-outline border-cyan-700/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-700 hover:text-white w-full rounded-xl text-xs font-2 gap-2"
            >
              {isSendingReset ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>جاري إرسال الرابط...</span>
                </>
              ) : (
                <>
                  <HiOutlineKey className="text-base" />
                  <span>إرسال رابط إعادة ضبط كلمة المرور</span>
                </>
              )}
            </button>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost rounded-xl text-sm font-2"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-sm font-2 font-bold px-6 gap-2"
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>جاري التحديث...</span>
                </>
              ) : (
                <>
                  <HiOutlineBadgeCheck className="text-lg" />
                  <span>تحديث الحساب</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
