import React, { useState, useEffect } from "react";
import { HiOutlineX, HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineUserGroup, HiOutlineBadgeCheck } from "react-icons/hi";
import { normalizeRole } from "../../services/usersService";

/**
 * UserFormModal - Modal for Adding or Editing User accounts (Teachers, Students, Admins).
 */
export default function UserFormModal({ isOpen, onClose, onSubmit, initialData, isSaving, serverError }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "طالب",
    status: "نشط",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        role: normalizeRole(initialData.role),
        status: initialData.status || "نشط",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "طالب",
        status: "نشط",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "الاسم مطلوب";
    if (!formData.email.trim()) {
      errs.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "بريد إلكتروني غير صحيح";
    }
    if (!initialData && !formData.password.trim()) {
      errs.password = "كلمة المرور مطلوبة للحساب الجديد";
    } else if (!initialData && formData.password.trim().length < 6) {
      errs.password = "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 relative animate-fadeIn my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl">
              <HiOutlineUserGroup />
            </div>
            <div>
              <h3 className="font-1 font-bold text-xl text-base-content">
                {initialData ? "تعديل حساب المستخدم" : "إضافة مستخدم جديد"}
              </h3>
              <p className="font-2 text-xs text-base-content/60">
                {initialData ? "قم بتحديث بيانات الحساب أو تغيير الدور والصلاحيات" : "قم بإدخال بيانات المعلم أو الطالب أو الأدمن"}
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
        {serverError && (
          <div className="alert alert-error text-xs rounded-xl font-2 font-medium flex items-center justify-between py-2.5 px-4">
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 font-2">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
              اسم المستخدم <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <HiOutlineUser className="absolute right-3.5 text-base-content/40 text-lg pointer-events-none" />
              <input
                type="text"
                autoComplete="off"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: أحمد محمد"
                className={`input input-bordered w-full pr-10 rounded-xl text-sm ${errors.name ? "input-error" : ""}`}
              />
            </div>
            {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <HiOutlineMail className="absolute right-3.5 text-base-content/40 text-lg pointer-events-none" />
              <input
                type="email"
                autoComplete="off"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ahmed@example.com"
                className={`input input-bordered w-full pr-10 rounded-xl text-sm ${errors.email ? "input-error" : ""}`}
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
          </div>

          {/* Password Field (Only mandatory for new user) */}
          <div>
            <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
              كلمة المرور {!initialData && <span className="text-red-500">*</span>}
            </label>
            <div className="relative flex items-center">
              <HiOutlineLockClosed className="absolute right-3.5 text-base-content/40 text-lg pointer-events-none" />
              <input
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={initialData ? "اتركها فارغة إذا لم تكن تريد تغييرها" : "••••••••"}
                className={`input input-bordered w-full pr-10 rounded-xl text-sm ${errors.password ? "input-error" : ""}`}
              />
            </div>
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password}</span>}
          </div>

          {/* Role & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Role Select */}
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                دور الحساب (الصلاحية) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="select select-bordered w-full rounded-xl text-sm font-2"
              >
                <option value="معلم">معلم</option>
                <option value="طالب">طالب</option>
                <option value="أدمن">مشرف (أدمن)</option>
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                حالة الحساب <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="select select-bordered w-full rounded-xl text-sm font-2"
              >
                <option value="نشط">نشط</option>
                <option value="غير نشط">غير نشط</option>
              </select>
            </div>
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
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <HiOutlineBadgeCheck className="text-lg" />
                  <span>{initialData ? "تحديث الحساب" : "إنشاء الحساب"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
