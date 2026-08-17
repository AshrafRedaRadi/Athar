import React, { useState, useEffect } from "react";
import {
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMicrophone,
  HiOutlineArrowUpCircle,
  HiOutlineCheckBadge,
  HiOutlineLockClosed,
  HiOutlineCalendarDays,
  HiOutlineCreditCard,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineLightBulb,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
} from "react-icons/hi2";
import { useSubscription } from "../../context/SubscriptionContext";
import { useAuth } from "../../context/AuthContext";
import {
  getPaymentHistory,
  PaymentStatus,
  createCheckout,
  savePendingPayment,
} from "../../services/paymentService";
import {
  getPublicPlans,
  BillingPeriod,
  isMonthlyPeriod,
  isYearlyPeriod,
  getBillingPeriodLabel,
} from "../../services/subscriptionService";
import PaymobIframeModal from "../subscription/PaymobIframeModal";

const PAYMENT_STATUS_LABELS = {
  [PaymentStatus.Pending]: { text: "قيد الانتظار", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400" },
  [PaymentStatus.Paid]: { text: "مدفوع", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" },
  [PaymentStatus.Failed]: { text: "فشل", color: "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400" },
  [PaymentStatus.Cancelled]: { text: "ملغي", color: "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400" },
  [PaymentStatus.Refunded]: { text: "مسترد", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400" },
};

function findPlanPrice(plan, period) {
  const priceList = plan?.prices || plan?.Prices || [];
  return priceList.find((p) => {
    const rawPeriod = p.billingPeriod ?? p.BillingPeriod;
    const isPeriodMatch =
      period === BillingPeriod.Monthly
        ? isMonthlyPeriod(rawPeriod)
        : isYearlyPeriod(rawPeriod);
    const isActive = p.isActive ?? p.IsActive ?? true;
    return isPeriodMatch && isActive;
  });
}

/**
 * SubscriptionSection — Displayed in the Settings page.
 * Shows current plan, quotas, plan comparisons (Free vs Paid), and payment history.
 */
export default function SubscriptionSection() {
  const {
    entitlements,
    showUpgradeModal,
    pendingPayment,
    checkPendingPaymentStatus,
    dismissPendingPayment,
  } = useSubscription();
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState(BillingPeriod.Monthly);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCheckingPending, setIsCheckingPending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [activePaymobModal, setActivePaymobModal] = useState(null);

  // Load public plans for comparison
  useEffect(() => {
    setPlansLoading(true);
    getPublicPlans()
      .then((data) => {
        const activePlans = (Array.isArray(data) ? data : []).filter(
          (p) => p.isActive ?? p.IsActive ?? true
        );
        setPlans(activePlans);
      })
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  const handleCheckPending = async () => {
    setIsCheckingPending(true);
    setStatusFeedback(null);
    const res = await checkPendingPaymentStatus();
    setIsCheckingPending(false);
    if (res?.message) {
      setStatusFeedback(res.message);
    }
  };

  const handleDirectCheckout = async (plan) => {
    const selectedPrice = findPlanPrice(plan, billingPeriod);
    if (!selectedPrice) {
      showUpgradeModal();
      return;
    }

    const planPriceId = selectedPrice.id ?? selectedPrice.Id;
    setCheckoutLoading(plan.id ?? plan.Id);

    try {
      const result = await createCheckout(planPriceId);

      const userId = user?.id || user?.userId || user?.email;
      if (result?.paymentId && userId) {
        savePendingPayment(
          userId,
          result.paymentId,
          result.checkoutUrl,
          plan.name,
          selectedPrice?.price
        );
      }

      if (result?.checkoutUrl) {
        setActivePaymobModal({
          checkoutUrl: result.checkoutUrl,
          paymentId: result.paymentId,
          planName: plan.name,
          price: selectedPrice?.price,
        });
      }
      setCheckoutLoading(null);
    } catch {
      setCheckoutLoading(null);
      showUpgradeModal();
    }
  };

  // Load payment history when expanded
  useEffect(() => {
    if (showHistory) {
      setPaymentsLoading(true);
      getPaymentHistory()
        .then((data) => setPayments(Array.isArray(data) ? data : []))
        .catch(() => setPayments([]))
        .finally(() => setPaymentsLoading(false));
    }
  }, [showHistory]);

  if (!entitlements.loaded) {
    return (
      <div className="bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs animate-pulse">
        <div className="h-5 bg-base-200 dark:bg-slate-800 rounded w-40 mb-4" />
        <div className="h-4 bg-base-200 dark:bg-slate-800 rounded w-64 mb-3" />
        <div className="h-4 bg-base-200 dark:bg-slate-800 rounded w-48" />
      </div>
    );
  }

  const formatDate = (isoStr) => {
    if (!isoStr) return "—";
    try {
      return new Date(isoStr).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  const chatQuota = entitlements.chat;
  const recitationQuota = entitlements.recitation;

  // Identify free and paid plans from fetched plans list
  const freePlan = plans.find((p) => p.isFree || p.IsFree);
  const paidPlan = plans.find((p) => !p.isFree && !p.IsFree);

  return (
    <div className="bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs font-2 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-200/80 dark:border-slate-800">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-base-content font-1">
            <HiOutlineSparkles className="text-cyan-600 dark:text-cyan-400 text-xl" />
            الباقة والاشتراك
          </h3>
          <p className="text-xs text-base-content/50 mt-0.5">
            تفاصيل باقتك الحالية واستكشاف مميزات الباقات المتاحة
          </p>
        </div>

        {entitlements.isFree && (
          <button
            onClick={() => showUpgradeModal()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-cyan-700 via-cyan-600 to-cyan-700 hover:from-cyan-800 hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-900/10 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <HiOutlineArrowUpCircle className="text-base" />
            <span>ترقية إلى الباقة القياسية</span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold">
              مميز ✨
            </span>
          </button>
        )}
      </div>

      {/* Pending Payment Card / Resume Banner */}
      {pendingPayment && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="loading loading-spinner loading-sm text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  توجد عملية دفع جارية في انتظار التأكيد
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                  إذا لم تكمل الدفع بعد يمكنك العودة لصفحة Paymob، أو فحص حالة التأكيد.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {pendingPayment.checkoutUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    setActivePaymobModal({
                      checkoutUrl: pendingPayment.checkoutUrl,
                      paymentId: pendingPayment.paymentId,
                      planName: pendingPayment.planName,
                      price: pendingPayment.price,
                    })
                  }
                  className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>متابعة الدفع داخل المنصة</span>
                  <HiOutlineShieldCheck className="text-base shrink-0" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleCheckPending}
                disabled={isCheckingPending}
                className="flex-1 md:flex-none px-3.5 py-2 rounded-xl border border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-xs font-bold transition cursor-pointer"
              >
                {isCheckingPending ? "جاري الفحص..." : "فحص الحالة"}
              </button>
              <button
                type="button"
                onClick={dismissPendingPayment}
                className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-base-200/80 hover:bg-base-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-base-content/80 font-bold transition cursor-pointer"
              >
                إلغاء المعاملة والبدء من جديد
              </button>
            </div>
          </div>

          {!pendingPayment.checkoutUrl && (
            <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800/90 dark:text-amber-300/90 font-medium">
              💡 تم فتح هذه الجلسة مسبقاً قبل حفظ الرابط؛ إذا رغبت في إلغائها، اضغط على <b>«إلغاء المعاملة والبدء من جديد»</b> أعلاه، وستنتهي صلاحيتها في السيرفر تلقائياً خلال دقائق لتتمكن من إنشاء طلب جديد.
            </div>
          )}

          {statusFeedback && (
            <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-800/40 text-xs font-bold text-amber-800 dark:text-amber-200">
              {statusFeedback}
            </div>
          )}
        </div>
      )}

      {/* Current Plan Info */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            entitlements.isFree
              ? "bg-base-200 text-base-content/70 dark:bg-slate-800 dark:text-slate-300"
              : "bg-gradient-to-l from-cyan-100 to-cyan-50 text-cyan-800 dark:from-cyan-900/30 dark:to-cyan-900/20 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/40"
          }`}
        >
          {entitlements.isFree ? (
            <HiOutlineLockClosed className="text-xs" />
          ) : (
            <HiOutlineCheckBadge className="text-xs" />
          )}
          {entitlements.planName || "باقة مجانية"}
        </span>
        {entitlements.billingPeriod && (
          <span className="text-xs text-base-content/50">
            ({getBillingPeriodLabel(entitlements.billingPeriod)})
          </span>
        )}
        {entitlements.expiresAtUtc && (
          <span className="flex items-center gap-1 text-xs text-base-content/50">
            <HiOutlineCalendarDays className="text-xs" />
            ينتهي: {formatDate(entitlements.expiresAtUtc)}
          </span>
        )}
      </div>

      {/* Quota Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Chat Quota */}
        {chatQuota && (
          <div className="p-3.5 rounded-xl bg-base-200/40 dark:bg-slate-800/50 border border-base-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-base-content">
                <HiOutlineChatBubbleLeftRight className="text-cyan-600 dark:text-cyan-400" />
                المساعد الذكي
              </span>
              <span className="text-xs text-base-content/50">
                {chatQuota.used} / {chatQuota.limit}
              </span>
            </div>
            <div className="w-full bg-base-300/50 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  chatQuota.remaining <= 0
                    ? "bg-red-500"
                    : chatQuota.remaining <= chatQuota.limit * 0.2
                    ? "bg-amber-500"
                    : "bg-cyan-600"
                }`}
                style={{
                  width: `${Math.min((chatQuota.used / chatQuota.limit) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-base-content/50 mt-1.5">
              المتبقي: <b className="text-base-content/70">{chatQuota.remaining}</b> طلب اليوم
            </p>
          </div>
        )}

        {/* Recitation Quota */}
        {recitationQuota && (
          <div className="p-3.5 rounded-xl bg-base-200/40 dark:bg-slate-800/50 border border-base-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-base-content">
                <HiOutlineMicrophone className="text-cyan-600 dark:text-cyan-400" />
                التسميع
              </span>
              <span className="text-xs text-base-content/50">
                {recitationQuota.used} / {recitationQuota.limit}
              </span>
            </div>
            <div className="w-full bg-base-300/50 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  recitationQuota.remaining <= 0
                    ? "bg-red-500"
                    : recitationQuota.remaining <= recitationQuota.limit * 0.2
                    ? "bg-amber-500"
                    : "bg-cyan-600"
                }`}
                style={{
                  width: `${Math.min((recitationQuota.used / recitationQuota.limit) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-base-content/50 mt-1.5">
              المتبقي: <b className="text-base-content/70">{recitationQuota.remaining}</b> جلسة اليوم
            </p>
          </div>
        )}
      </div>

      {/* Features summary tags */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
            entitlements.canUseRecitationHints
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "bg-base-200/50 text-base-content/40 dark:bg-slate-800/50"
          }`}
        >
          {entitlements.canUseRecitationHints ? "✓" : "✗"} تلميحات الكلمات
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
            entitlements.canViewAdvancedRecitationStatistics
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "bg-base-200/50 text-base-content/40 dark:bg-slate-800/50"
          }`}
        >
          {entitlements.canViewAdvancedRecitationStatistics ? "✓" : "✗"}{" "}
          الإحصائيات المتقدمة
        </span>
      </div>

      {/* Plans Comparison Showcase: Free vs Paid */}
      <div className="pt-3 border-t border-base-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-base-content font-1 flex items-center gap-2">
              <HiOutlineSparkles className="text-cyan-600 dark:text-cyan-400" />
              مقارنة الباقات المتاحة
            </h4>
            <p className="text-[11px] text-base-content/50 mt-0.5">
              قارن بين مزايا الباقة الأساسية المجانية والباقة القياسية المميزة
            </p>
          </div>

          {/* Billing Period Switcher for comparison */}
          {/* Billing Period Switcher for comparison */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-base-200/90 dark:bg-slate-800 border border-base-300 dark:border-slate-700/80 shadow-inner shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingPeriod(BillingPeriod.Monthly)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingPeriod === BillingPeriod.Monthly
                  ? "bg-cyan-700 text-white shadow-xs"
                  : "text-base-content/80 dark:text-slate-200 hover:text-base-content"
              }`}
            >
              شهري
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod(BillingPeriod.Yearly)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingPeriod === BillingPeriod.Yearly
                  ? "bg-cyan-700 text-white shadow-xs"
                  : "text-base-content/80 dark:text-slate-200 hover:text-base-content"
              }`}
            >
              <span>سنوي</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                  billingPeriod === BillingPeriod.Yearly
                    ? "bg-white/25 text-white"
                    : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                وفّر أكثر
              </span>
            </button>
          </div>
        </div>

        {/* 2-Column Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* 1. Free Plan Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              entitlements.isFree
                ? "border-cyan-500/50 bg-gradient-to-b from-cyan-50/20 to-base-100 dark:from-cyan-950/20 dark:to-slate-900 shadow-xs ring-1 ring-cyan-500/20"
                : "border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-1 font-bold text-base text-base-content">
                  {freePlan?.name || "الباقة المجانية"}
                </h5>
                {entitlements.isFree && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                    باقتك الحالية ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-base-content/50 mb-3">
                {freePlan?.description || "الباقة الأساسية للبدء في حفظ وتسميع الأحاديث الشريفة"}
              </p>

              <div className="mb-4">
                <span className="text-2xl font-bold font-1 text-base-content">0</span>
                <span className="text-xs text-base-content/50 mr-1.5 font-bold">
                  ج.م / مجاناً دائماً
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-2 text-xs border-t border-base-200/80 dark:border-slate-800/80 pt-3 mb-4">
                <li className="flex items-center gap-2 text-base-content/80">
                  <HiOutlineChatBubbleLeftRight className="text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>
                    <b>{freePlan?.dailyChatRequestLimit ?? 5}</b> طلبات مساعد ذكي يومياً
                  </span>
                </li>
                <li className="flex items-center gap-2 text-base-content/80">
                  <HiOutlineMicrophone className="text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>
                    <b>{freePlan?.dailyRecitationSessionLimit ?? 2}</b> جلسات تسميع يومياً
                  </span>
                </li>
                <li className="flex items-center gap-2 text-base-content/40">
                  <HiOutlineLockClosed className="shrink-0 text-xs" />
                  <span className="line-through">تلميحات الكلمات أثناء التسميع</span>
                </li>
                <li className="flex items-center gap-2 text-base-content/40">
                  <HiOutlineLockClosed className="shrink-0 text-xs" />
                  <span className="line-through">إحصائيات التسميع المتقدمة</span>
                </li>
              </ul>
            </div>

            {entitlements.isFree ? (
              <div className="w-full py-2.5 rounded-xl bg-base-200/60 dark:bg-slate-800 text-center text-xs font-bold text-base-content/60">
                باقتك الحالية النشطة
              </div>
            ) : (
              <div className="w-full py-2.5 rounded-xl border border-base-200 dark:border-slate-800 text-center text-xs text-base-content/40">
                باقة البداية المجانية
              </div>
            )}
          </div>

          {/* 2. Paid Plan Card (القياسية / المميزة) */}
          {(() => {
            const priceObj = paidPlan ? findPlanPrice(paidPlan, billingPeriod) : null;
            const priceVal = priceObj?.price ?? (billingPeriod === BillingPeriod.Monthly ? 200 : 2000);
            const isPaidActive = !entitlements.isFree;

            return (
              <div
                className={`relative p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isPaidActive
                    ? "border-cyan-500 bg-gradient-to-b from-cyan-50/40 to-base-100 dark:from-cyan-950/30 dark:to-slate-900 shadow-md ring-1 ring-cyan-500/30"
                    : "border-cyan-300 dark:border-cyan-700/50 bg-gradient-to-b from-cyan-50/30 to-base-100 dark:from-cyan-900/10 dark:to-slate-900 shadow-md"
                }`}
              >
                {/* Popular badge */}
                <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-gradient-to-l from-cyan-600 to-cyan-500 text-white text-[10px] font-bold shadow-xs">
                  الباقة الأكثر طلباً ✨
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-1 font-bold text-base text-base-content">
                      {paidPlan?.name || "الباقة القياسية"}
                    </h5>
                    {isPaidActive && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        باقتك الحالية ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/50 mb-3">
                    {paidPlan?.description || "الوصول الكامل لكافة مميزات وتلميحات الذكاء الاصطناعي"}
                  </p>

                  <div className="mb-4 flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-1 text-cyan-700 dark:text-cyan-400">
                      {priceVal}
                    </span>
                    <span className="text-xs text-base-content/60 font-bold">
                      ج.م / {billingPeriod === BillingPeriod.Monthly ? "شهرياً" : "سنوياً"}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2 text-xs border-t border-base-200/80 dark:border-slate-800/80 pt-3 mb-4">
                    <li className="flex items-center gap-2 text-base-content font-medium">
                      <HiOutlineCheckCircle className="text-emerald-600 dark:text-emerald-400 text-sm shrink-0" />
                      <span>
                        <b>{paidPlan?.dailyChatRequestLimit ?? 100}</b> طلب مساعد ذكي يومياً
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-base-content font-medium">
                      <HiOutlineCheckCircle className="text-emerald-600 dark:text-emerald-400 text-sm shrink-0" />
                      <span>
                        <b>{paidPlan?.dailyRecitationSessionLimit ?? 20}</b> جلسة تسميع يومياً
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-base-content font-medium">
                      <HiOutlineLightBulb className="text-amber-500 text-sm shrink-0" />
                      <span>تلميحات الكلمات الفورية أثناء التسميع</span>
                    </li>
                    <li className="flex items-center gap-2 text-base-content font-medium">
                      <HiOutlineChartBar className="text-cyan-600 dark:text-cyan-400 text-sm shrink-0" />
                      <span>إحصائيات التسميع المتقدمة وتقارير الحفظ</span>
                    </li>
                    <li className="flex items-center gap-2 text-base-content/50 text-[11px]">
                      <HiOutlineAcademicCap className="text-sm shrink-0 text-purple-500" />
                      <span>إشراف وتوجيه المعلم — قريباً</span>
                    </li>
                  </ul>
                </div>

                {isPaidActive ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    باقتك الحالية مفعلة بنجاح ✓
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (paidPlan) {
                        handleDirectCheckout(paidPlan);
                      } else {
                        showUpgradeModal();
                      }
                    }}
                    disabled={checkoutLoading === paidPlan?.id}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-l from-cyan-700 via-cyan-600 to-cyan-700 hover:from-cyan-800 hover:to-cyan-700 text-white text-xs font-bold shadow-md transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {checkoutLoading === paidPlan?.id ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <>
                        <HiOutlineArrowUpCircle className="text-sm" />
                        <span>ترقية إلى الباقة القياسية</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Payment History Toggle */}
      <div className="pt-2 border-t border-base-200/80 dark:border-slate-800">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 font-bold cursor-pointer transition hover:underline"
        >
          <HiOutlineCreditCard className="text-sm" />
          {showHistory ? "إخفاء سجل المدفوعات" : "عرض سجل المدفوعات"}
        </button>

        {showHistory && (
          <div className="mt-3">
            {paymentsLoading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm text-cyan-600" />
              </div>
            ) : payments.length === 0 ? (
              <p className="text-xs text-base-content/40 text-center py-3">
                لا توجد عمليات دفع سابقة
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {payments.map((p) => {
                  const statusInfo = PAYMENT_STATUS_LABELS[p.status] || {
                    text: "غير معروف",
                    color: "text-base-content/50 bg-base-200",
                  };
                  return (
                    <div
                      key={p.paymentId}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-base-200/30 dark:bg-slate-800/40 border border-base-200/50 dark:border-slate-800/50"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-base-content">
                          {p.planName}
                        </span>
                        <span className="text-[10px] text-base-content/40">
                          {formatDate(p.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-base-content">
                          {p.amount} {p.currency}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded In-App Paymob Checkout Modal */}
      {activePaymobModal && (
        <PaymobIframeModal
          isOpen={!!activePaymobModal}
          checkoutUrl={activePaymobModal.checkoutUrl}
          paymentId={activePaymobModal.paymentId}
          planName={activePaymobModal.planName}
          price={activePaymobModal.price}
          onClose={() => setActivePaymobModal(null)}
          onPaymentSuccess={() => {
            setActivePaymobModal(null);
          }}
        />
      )}
    </div>
  );
}
