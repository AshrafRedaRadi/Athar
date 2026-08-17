import React, { useState, useEffect } from "react";
import {
  HiOutlineXMark,
  HiOutlineCreditCard,
  HiOutlineSparkles,
  HiOutlineCurrencyDollar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMicrophone,
} from "react-icons/hi2";

import { isMonthlyPeriod, isYearlyPeriod } from "../../services/subscriptionService";

/**
 * PlanEditModal — Create or Edit subscription plan
 * Form styled identically to UserFormModal & BookFormModal for complete admin dashboard consistency.
 *
 * Props:
 * - plan: SubscriptionPlanDto | null (null = create mode)
 * - isSubmitting: boolean
 * - formError: string | null
 * - onSubmit(formData, priceData): void
 * - onClose(): void
 */
export default function PlanEditModal({
  plan,
  isSubmitting,
  formError,
  onSubmit,
  onClose,
}) {
  const isEdit = !!plan;

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dailyChatRequestLimit, setDailyChatRequestLimit] = useState(3);
  const [dailyRecitationSessionLimit, setDailyRecitationSessionLimit] = useState(2);
  const [canUseRecitationHints, setCanUseRecitationHints] = useState(false);
  const [canViewAdvancedRecitationStatistics, setCanViewAdvancedRecitationStatistics] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Price state
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [monthlyCurrency, setMonthlyCurrency] = useState("EGP");
  const [monthlyActive, setMonthlyActive] = useState(true);
  const [yearlyPrice, setYearlyPrice] = useState("");
  const [yearlyCurrency, setYearlyCurrency] = useState("EGP");
  const [yearlyActive, setYearlyActive] = useState(false);

  // Populate when editing
  useEffect(() => {
    if (plan) {
      setCode(plan.code || plan.Code || "");
      setName(plan.name || plan.Name || "");
      setDescription(plan.description || plan.Description || "");
      setDailyChatRequestLimit(plan.dailyChatRequestLimit ?? plan.DailyChatRequestLimit ?? 3);
      setDailyRecitationSessionLimit(plan.dailyRecitationSessionLimit ?? plan.DailyRecitationSessionLimit ?? 2);
      setCanUseRecitationHints(plan.canUseRecitationHints ?? plan.CanUseRecitationHints ?? false);
      setCanViewAdvancedRecitationStatistics(plan.canViewAdvancedRecitationStatistics ?? plan.CanViewAdvancedRecitationStatistics ?? false);
      setIsFree(plan.isFree ?? plan.IsFree ?? false);
      setIsActive(plan.isActive ?? plan.IsActive ?? true);

      // Populate prices with robust string/number enum checking
      const priceList = plan.prices || plan.Prices || [];
      const monthly = priceList.find((p) => isMonthlyPeriod(p.billingPeriod ?? p.BillingPeriod));
      const yearly = priceList.find((p) => isYearlyPeriod(p.billingPeriod ?? p.BillingPeriod));

      if (monthly) {
        setMonthlyPrice(String(monthly.price ?? monthly.Price ?? ""));
        setMonthlyCurrency(monthly.currency || monthly.Currency || "EGP");
        setMonthlyActive(monthly.isActive ?? monthly.IsActive ?? true);
      } else {
        setMonthlyPrice("");
        setMonthlyCurrency("EGP");
        setMonthlyActive(true);
      }

      if (yearly) {
        setYearlyPrice(String(yearly.price ?? yearly.Price ?? ""));
        setYearlyCurrency(yearly.currency || yearly.Currency || "EGP");
        setYearlyActive(yearly.isActive ?? yearly.IsActive ?? false);
      } else {
        setYearlyPrice("");
        setYearlyCurrency("EGP");
        setYearlyActive(false);
      }
    } else {
      setCode("");
      setName("");
      setDescription("");
      setDailyChatRequestLimit(3);
      setDailyRecitationSessionLimit(2);
      setCanUseRecitationHints(false);
      setCanViewAdvancedRecitationStatistics(false);
      setIsFree(false);
      setIsActive(true);
      setMonthlyPrice("");
      setMonthlyCurrency("EGP");
      setMonthlyActive(true);
      setYearlyPrice("");
      setYearlyCurrency("EGP");
      setYearlyActive(false);
    }
  }, [plan]);

  // Backend rule: Free plan cannot enable paid recitation capabilities
  useEffect(() => {
    if (isFree) {
      setCanUseRecitationHints(false);
      setCanViewAdvancedRecitationStatistics(false);
    }
  }, [isFree]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || null,
      dailyChatRequestLimit: Number(dailyChatRequestLimit),
      dailyRecitationSessionLimit: Number(dailyRecitationSessionLimit),
      canUseRecitationHints,
      canViewAdvancedRecitationStatistics,
      isFree,
      isActive,
    };

    const priceData = {};
    if (monthlyPrice) {
      priceData.monthly = {
        price: Number(monthlyPrice),
        currency: monthlyCurrency,
        isActive: monthlyActive,
      };
    }
    if (yearlyPrice) {
      priceData.yearly = {
        price: Number(yearlyPrice),
        currency: yearlyCurrency,
        isActive: yearlyActive,
      };
    }

    onSubmit(formData, priceData);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 relative animate-fadeIn my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0">
              <HiOutlineCreditCard />
            </div>
            <div>
              <h3 className="font-1 font-bold text-xl text-base-content">
                {isEdit ? `تعديل الباقة: ${plan.name}` : "إنشاء باقة جديدة"}
              </h3>
              <p className="font-2 text-xs text-base-content/60">
                تحديد الحصص اليومية، الصلاحيات، وتفاصيل الأسعار
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
          >
            <HiOutlineXMark className="text-xl" />
          </button>
        </div>

        {/* Server Error Alert Banner */}
        {formError && (
          <div className="alert alert-error text-xs rounded-xl font-2 font-medium flex items-center justify-between py-2.5 px-4">
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 font-2">
          {/* Basic Info (Code & Name) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                كود الباقة (Code)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="مثال: STANDARD"
                required
                className="input input-bordered w-full rounded-xl text-sm font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
                اسم الباقة بالعربية
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: الباقة القياسية"
                required
                className="input input-bordered w-full rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
              الوصف (اختياري)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لميزات الباقة يظهر للمستخدمين..."
              rows={2}
              className="textarea textarea-bordered w-full rounded-xl text-sm resize-none"
            />
          </div>

          {/* Quotas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-base-content/80 mb-1.5">
                <HiOutlineChatBubbleLeftRight className="text-cyan-700" />
                <span>حد المساعد الذكي / يوم</span>
              </label>
              <input
                type="number"
                min={0}
                value={dailyChatRequestLimit}
                onChange={(e) => setDailyChatRequestLimit(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm font-bold font-1"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-base-content/80 mb-1.5">
                <HiOutlineMicrophone className="text-cyan-700" />
                <span>حد جلسات التسميع / يوم</span>
              </label>
              <input
                type="number"
                min={0}
                value={dailyRecitationSessionLimit}
                onChange={(e) => setDailyRecitationSessionLimit(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm font-bold font-1"
              />
            </div>
          </div>

          {/* Feature Flags */}
          <div className="space-y-3 p-4 rounded-2xl bg-base-200/50 dark:bg-slate-800/60 border border-base-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-base-content/70">
              الصلاحيات وحالة الباقة
            </h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <span className="text-sm font-medium text-base-content">باقة مجانية (Free Plan)</span>
            </label>

            <label
              className={`flex items-center gap-3 ${
                isFree ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={canUseRecitationHints}
                onChange={(e) => setCanUseRecitationHints(e.target.checked)}
                disabled={isFree}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <span className="text-sm font-medium text-base-content">
                إتاحة تلميحات الكلمات أثناء التسميع
              </span>
            </label>

            <label
              className={`flex items-center gap-3 ${
                isFree ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={canViewAdvancedRecitationStatistics}
                onChange={(e) =>
                  setCanViewAdvancedRecitationStatistics(e.target.checked)
                }
                disabled={isFree}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <span className="text-sm font-medium text-base-content">
                إتاحة إحصائيات التسميع والتحليل المتقدم
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer pt-1 border-t border-base-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <span className="text-sm font-medium text-base-content">
                الباقة مفعّلة وظاهرة للمستخدمين
              </span>
            </label>
          </div>

          {/* Pricing */}
          {!isFree && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-base-200/50 dark:bg-slate-800/60 border border-base-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-base-content/70 flex items-center gap-1.5">
                <HiOutlineCurrencyDollar className="text-cyan-700 text-sm" />
                <span>الأسعار والعملة</span>
              </h4>

              {/* Monthly */}
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-base-content/60 mb-1">
                    السعر الشهري (Monthly)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    placeholder="100"
                    className="input input-bordered input-sm w-full rounded-xl font-bold font-1"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-semibold text-base-content/60 mb-1">
                    العملة
                  </label>
                  <input
                    type="text"
                    value={monthlyCurrency}
                    onChange={(e) => setMonthlyCurrency(e.target.value.toUpperCase())}
                    className="input input-bordered input-sm w-full rounded-xl font-bold uppercase"
                  />
                </div>
                <div className="col-span-3 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monthlyActive}
                      onChange={(e) => setMonthlyActive(e.target.checked)}
                      className="checkbox checkbox-xs checkbox-primary"
                    />
                    <span className="text-xs font-semibold text-base-content">مفعّل</span>
                  </label>
                </div>
              </div>

              {/* Yearly */}
              <div className="grid grid-cols-12 gap-3 items-end pt-2 border-t border-base-200/70 dark:border-slate-700/70">
                <div className="col-span-6">
                  <label className="block text-[11px] font-semibold text-base-content/60 mb-1">
                    السعر السنوي (Yearly)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={yearlyPrice}
                    onChange={(e) => setYearlyPrice(e.target.value)}
                    placeholder="960"
                    className="input input-bordered input-sm w-full rounded-xl font-bold font-1"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-semibold text-base-content/60 mb-1">
                    العملة
                  </label>
                  <input
                    type="text"
                    value={yearlyCurrency}
                    onChange={(e) => setYearlyCurrency(e.target.value.toUpperCase())}
                    className="input input-bordered input-sm w-full rounded-xl font-bold uppercase"
                  />
                </div>
                <div className="col-span-3 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={yearlyActive}
                      onChange={(e) => setYearlyActive(e.target.checked)}
                      className="checkbox checkbox-xs checkbox-primary"
                    />
                    <span className="text-xs font-semibold text-base-content">مفعّل</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost rounded-xl px-5 text-sm font-bold font-2"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !code.trim() || !name.trim()}
              className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl px-6 text-sm font-bold font-2 shadow-sm"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : isEdit ? (
                "حفظ التعديلات"
              ) : (
                "إنشاء الباقة"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
