import React, { useState, useEffect } from "react";
import {
  HiOutlineXMark,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMicrophone,
  HiOutlineLightBulb,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineShieldCheck,
  HiOutlineCheckBadge,
} from "react-icons/hi2";
import { useSubscription } from "../../context/SubscriptionContext";
import { useAuth } from "../../context/AuthContext";
import {
  getPublicPlans,
  BillingPeriod,
  isMonthlyPeriod,
  isYearlyPeriod,
} from "../../services/subscriptionService";
import {
  createCheckout,
  savePendingPayment,
} from "../../services/paymentService";
import PaymobIframeModal from "./PaymobIframeModal";

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
 * SubscriptionModal — Pricing page / upgrade flow.
 *
 * Shows plans from GET /api/subscription-plans, toggles between Monthly/Yearly,
 * and initiates Paymob checkout via POST /api/payments/checkout.
 *
 * Per spec: use price.id (not plan.id) when starting checkout.
 */
export default function SubscriptionModal() {
  const {
    upgradeModalOpen,
    closeUpgradeModal,
    entitlements,
    refreshEntitlements,
    pendingPayment,
    checkPendingPaymentStatus,
    dismissPendingPayment,
  } = useSubscription();
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState(BillingPeriod.Monthly);
  const [checkoutLoading, setCheckoutLoading] = useState(null); // planId currently checking out
  const [error, setError] = useState(null);
  const [isCheckingPending, setIsCheckingPending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [activePaymobModal, setActivePaymobModal] = useState(null); // { checkoutUrl, paymentId, planName, price }

  // Fetch plans when modal opens
  useEffect(() => {
    if (upgradeModalOpen) {
      setCheckoutLoading(null);
      setLoading(true);
      setError(null);
      getPublicPlans()
        .then((data) => {
          const activePlans = (Array.isArray(data) ? data : []).filter(
            (p) => p.isActive ?? p.IsActive ?? true
          );
          setPlans(activePlans);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [upgradeModalOpen]);

  // Reset checkout button spinner on window focus / pageshow (browser Back button navigation)
  useEffect(() => {
    const handleReturn = () => {
      setCheckoutLoading(null);
    };

    window.addEventListener("pageshow", handleReturn);
    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", handleReturn);

    return () => {
      window.removeEventListener("pageshow", handleReturn);
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleReturn);
    };
  }, []);

  if (!upgradeModalOpen) return null;

  const handleCheckout = async (plan) => {
    setError(null);
    const selectedPrice = findPlanPrice(plan, billingPeriod);
    if (!selectedPrice) {
      setError("هذا السعر غير متوفر حالياً لهذه الباقة");
      return;
    }

    const planPriceId = selectedPrice.id ?? selectedPrice.Id;
    setCheckoutLoading(plan.id ?? plan.Id);

    try {
      const result = await createCheckout(planPriceId);

      // Persist paymentId and checkoutUrl in localStorage
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

      // Open Paymob embedded iframe modal inside the Athar website
      if (result?.checkoutUrl) {
        setActivePaymobModal({
          checkoutUrl: result.checkoutUrl,
          paymentId: result.paymentId,
          planName: plan.name,
          price: selectedPrice?.price,
        });
      }
      setCheckoutLoading(null);
    } catch (err) {
      setError(err.message);
      setCheckoutLoading(null);
    }
  };

  const handleCheckPending = async () => {
    setIsCheckingPending(true);
    setStatusFeedback(null);
    const res = await checkPendingPaymentStatus();
    setIsCheckingPending(false);
    if (res?.message) {
      setStatusFeedback(res.message);
    }
  };

  /**
   * Build feature list dynamically from plan API data.
   * Per spec: "Teacher guidance — Coming Soon" is static roadmap text.
   */
  const buildFeatures = (plan) => {
    const features = [
      {
        icon: <HiOutlineChatBubbleLeftRight className="text-sm" />,
        text: `${plan.dailyChatRequestLimit} طلب مساعد ذكي / يوم`,
        enabled: true,
      },
      {
        icon: <HiOutlineMicrophone className="text-sm" />,
        text: `${plan.dailyRecitationSessionLimit} جلسة تسميع / يوم`,
        enabled: true,
      },
      {
        icon: <HiOutlineLightBulb className="text-sm" />,
        text: "تلميحات الكلمات أثناء التسميع",
        enabled: plan.canUseRecitationHints,
      },
      {
        icon: <HiOutlineChartBar className="text-sm" />,
        text: "إحصائيات التسميع المتقدمة",
        enabled: plan.canViewAdvancedRecitationStatistics,
      },
      {
        icon: <HiOutlineAcademicCap className="text-sm" />,
        text: "إشراف المعلم — قريباً",
        enabled: false,
        comingSoon: true,
      },
    ];
    return features;
  };

  const isCurrentPlan = (plan) =>
    entitlements.loaded && entitlements.planId === plan.id;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-base-100 dark:bg-slate-900 rounded-2xl border border-base-200 dark:border-slate-800 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto font-2"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-base-200 dark:border-slate-800 sticky top-0 bg-base-100 dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold font-1 text-base-content flex items-center gap-2">
              <HiOutlineSparkles className="text-cyan-600 dark:text-cyan-400" />
              استكشاف الباقات
            </h2>
            <p className="text-xs text-base-content/50 mt-1">
              اختر الباقة المناسبة لرحلتك في حفظ الأحاديث الشريفة
            </p>
          </div>
          <button
            onClick={closeUpgradeModal}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-base-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <HiOutlineXMark className="text-xl" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* Pending Payment Card / Resume Banner */}
          {pendingPayment && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 shadow-xs">
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

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-7">
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-base-200/90 dark:bg-slate-800 border border-base-300 dark:border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingPeriod(BillingPeriod.Monthly)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingPeriod === BillingPeriod.Monthly
                    ? "bg-cyan-700 text-white shadow-md shadow-cyan-900/20"
                    : "text-base-content/80 dark:text-slate-200 hover:text-base-content hover:bg-base-100/60 dark:hover:bg-slate-700/60"
                }`}
              >
                شهري
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod(BillingPeriod.Yearly)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingPeriod === BillingPeriod.Yearly
                    ? "bg-cyan-700 text-white shadow-md shadow-cyan-900/20"
                    : "text-base-content/80 dark:text-slate-200 hover:text-base-content hover:bg-base-100/60 dark:hover:bg-slate-700/60"
                }`}
              >
                <span>سنوي</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
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

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-cyan-600" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center text-base-content/40 py-16">
              لا توجد باقات متوفرة حالياً
            </p>
          ) : (
            /* Plans Grid (Centered with max-w if 2 plans) */
            <div
              className={`grid gap-6 mx-auto w-full ${
                plans.length === 1
                  ? "grid-cols-1 max-w-sm"
                  : plans.length === 2
                  ? "grid-cols-1 md:grid-cols-2 max-w-2xl"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl"
              }`}
            >
              {plans.map((plan) => {
                const price = findPlanPrice(plan, billingPeriod);
                const features = buildFeatures(plan);
                const isCurrent = isCurrentPlan(plan);

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col p-5 rounded-2xl border transition-all ${
                      !plan.isFree
                        ? "border-cyan-300/60 dark:border-cyan-700/40 bg-gradient-to-b from-cyan-50/50 to-base-100 dark:from-cyan-900/10 dark:to-slate-900 shadow-md"
                        : "border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900 shadow-xs"
                    }`}
                  >
                    {/* Popular badge for paid plans */}
                    {!plan.isFree && (
                      <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-l from-cyan-600 to-cyan-500 text-white text-[10px] font-bold shadow-sm">
                        الأكثر شيوعاً
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-base-content font-1 mb-1">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-xs text-base-content/50 mb-4">
                        {plan.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="mb-5">
                      {plan.isFree ? (
                        <div className="text-3xl font-bold text-base-content font-1">
                          مجانية
                        </div>
                      ) : price ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold text-base-content font-1">
                            {price.price}
                          </span>
                          <span className="text-sm text-base-content/60">
                            {price.currency}
                          </span>
                          <span className="text-xs text-base-content/40">
                            / {billingPeriod === BillingPeriod.Monthly ? "شهر" : "سنة"}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-base-content/40">
                          السعر غير متوفر لهذه الفترة
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="flex-1 space-y-2.5 mb-5">
                      {features.map((f, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-2 text-xs ${
                            f.comingSoon
                              ? "text-base-content/30"
                              : f.enabled
                              ? "text-base-content"
                              : "text-base-content/35 line-through"
                          }`}
                        >
                          <span
                            className={`shrink-0 ${
                              f.comingSoon
                                ? "text-base-content/25"
                                : f.enabled
                                ? "text-emerald-500"
                                : "text-base-content/25"
                            }`}
                          >
                            {f.enabled && !f.comingSoon ? (
                              <HiOutlineCheckCircle className="text-sm" />
                            ) : (
                              <HiOutlineLockClosed className="text-sm" />
                            )}
                          </span>
                          {f.text}
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    {isCurrent ? (
                      <div className="w-full h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-emerald-800 dark:text-emerald-300 text-xs font-bold gap-1.5 shadow-xs">
                        <HiOutlineCheckBadge className="text-base text-emerald-600 dark:text-emerald-400" />
                        <span>باقتك الحالية النشطة ✓</span>
                      </div>
                    ) : plan.isFree ? (
                      <div className="w-full h-11 rounded-xl flex items-center justify-center bg-base-200/50 dark:bg-slate-800/50 text-base-content/40 text-xs">
                        الباقة الأساسية
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckout(plan)}
                        disabled={!price || checkoutLoading === plan.id}
                        className="w-full h-11 rounded-xl bg-gradient-to-l from-cyan-700 to-cyan-600 hover:from-cyan-800 hover:to-cyan-700 text-white text-sm font-bold shadow-sm transition active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {checkoutLoading === plan.id ? (
                          <span className="loading loading-spinner loading-sm" />
                        ) : (
                          <>
                            <HiOutlineSparkles className="text-sm" />
                            اشترك الآن
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
            closeUpgradeModal();
          }}
        />
      )}
    </div>
  );
}
