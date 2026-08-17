import React, { useState, useEffect, useCallback } from "react";
import {
  HiOutlineSparkles,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCurrencyDollar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMicrophone,
  HiOutlineLightBulb,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineCheck,
} from "react-icons/hi2";
import Navbar from "../../components/shared/Navbar";
import {
  getAllPlans,
  createPlan,
  updatePlan,
  togglePlanActive,
  updatePlanPrice,
} from "../../services/adminPlansService";
import { getBillingPeriodLabel } from "../../services/subscriptionService";
import PlanEditModal from "../../components/admin/PlanEditModal";

export default function PlansManagement() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // null = create
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Auto-hide toast notification
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Fetch plans
  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not fetch plans:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Toggle plan active/inactive
  const handleToggleActive = async (plan) => {
    try {
      await togglePlanActive(plan.id, !plan.isActive);
      setToastMsg(
        plan.isActive
          ? `تم إيقاف الباقة "${plan.name}" بنجاح`
          : `تم تفعيل الباقة "${plan.name}" بنجاح`
      );
      loadPlans();
    } catch (err) {
      setToastMsg(`خطأ: ${err.message}`);
    }
  };

  // Open modal for create
  const handleCreate = () => {
    setEditingPlan(null);
    setFormError(null);
    setModalOpen(true);
  };

  // Open modal for edit
  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormError(null);
    setModalOpen(true);
  };

  // Submit create/edit
  const handleSubmit = async (formData, priceData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingPlan) {
        // Update plan
        await updatePlan(editingPlan.id, formData);

        // Update prices if provided
        if (priceData?.monthly) {
          await updatePlanPrice(editingPlan.id, "Monthly", priceData.monthly);
        }
        if (priceData?.yearly) {
          await updatePlanPrice(editingPlan.id, "Yearly", priceData.yearly);
        }
        setToastMsg(`تم تحديث الباقة "${formData.name}" بنجاح`);
      } else {
        // Create plan
        const created = await createPlan(formData);

        // Set prices for new plan
        if (priceData?.monthly && created?.id) {
          await updatePlanPrice(created.id, "Monthly", priceData.monthly);
        }
        if (priceData?.yearly && created?.id) {
          await updatePlanPrice(created.id, "Yearly", priceData.yearly);
        }
        setToastMsg(`تم إنشاء الباقة "${formData.name}" بنجاح`);
      }
      setModalOpen(false);
      loadPlans();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics summary
  const totalPlans = plans.length;
  const activePlansCount = plans.filter((p) => p.isActive).length;
  const freePlansCount = plans.filter((p) => p.isFree).length;
  const paidPlansCount = plans.filter((p) => !p.isFree).length;

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 text-base-content font-2 relative">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        {/* Top Navbar with Admin Drawer & Mobile Dock — Matches UsersManagement & ContentManagement */}
        <Navbar
          drawerId="admin-sidebar-drawer"
          activePage="plans"
          isAdmin={true}
          showSidebar={true}
          showDock={true}
        />

        {/* Toast Notification Alert */}
        {toastMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
            <div className="alert alert-info shadow-xl border border-cyan-700/30 font-2 text-sm rounded-2xl py-3 px-6 flex items-center gap-3">
              <span>{toastMsg}</span>
            </div>
          </div>
        )}

        {/* ── Page Header ── */}
        <header className="mb-6 pb-2 border-b border-base-200 mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-1 text-base-content flex items-center gap-3">
              <span>إدارة الباقات والاشتراكات</span>
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 font-2">
              عرض وإدارة خطط الاشتراك المتاحة، الحصص اليومية، الصلاحيات، والأسعار.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="btn bg-cyan-700 hover:bg-cyan-800 text-white border-none rounded-2xl px-5 h-11 text-sm font-bold font-2 shadow-sm flex items-center gap-2 cursor-pointer shrink-0 transition active:scale-95"
          >
            <HiOutlinePlusCircle className="text-xl" />
            <span>إضافة باقة جديدة</span>
          </button>
        </header>

        {/* ── Overview Metrics Cards ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-base-100 border border-base-300/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0">
              <HiOutlineCreditCard />
            </div>
            <div>
              <div className="text-xs text-base-content/60 font-semibold">إجمالي الباقات</div>
              <div className="text-xl font-bold font-1 text-base-content mt-0.5">{totalPlans}</div>
            </div>
          </div>

          <div className="bg-base-100 border border-base-300/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
              <HiOutlineCheckCircle />
            </div>
            <div>
              <div className="text-xs text-base-content/60 font-semibold">الباقات المفعّلة</div>
              <div className="text-xl font-bold font-1 text-emerald-600 dark:text-emerald-400 mt-0.5">{activePlansCount}</div>
            </div>
          </div>

          <div className="bg-base-100 border border-base-300/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
              <HiOutlineSparkles />
            </div>
            <div>
              <div className="text-xs text-base-content/60 font-semibold">الباقات المجانية</div>
              <div className="text-xl font-bold font-1 text-blue-600 dark:text-blue-400 mt-0.5">{freePlansCount}</div>
            </div>
          </div>

          <div className="bg-base-100 border border-base-300/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
              <HiOutlineCurrencyDollar />
            </div>
            <div>
              <div className="text-xs text-base-content/60 font-semibold">الباقات المدفوعة</div>
              <div className="text-xl font-bold font-1 text-amber-600 dark:text-amber-400 mt-0.5">{paidPlansCount}</div>
            </div>
          </div>
        </section>

        {/* ── Plans Grid ── */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-cyan-700" />
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-base-100 border border-base-300/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
            <HiOutlineCreditCard className="mx-auto text-5xl text-base-content/30 mb-3" />
            <h3 className="text-lg font-bold font-1 text-base-content">لا توجد باقات مضافة بعد</h3>
            <p className="text-xs text-base-content/60 mt-1 max-w-sm mx-auto">
              يمكنك إضافة باقة جديدة الآن وتحديد الحصص اليومية والأسعار الشهرية والسنوية.
            </p>
            <button
              onClick={handleCreate}
              className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl mt-5 px-6 font-2 text-xs font-bold"
            >
              إضافة أول باقة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-base-100 dark:bg-slate-900 border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                  plan.isActive
                    ? "border-base-300/80 dark:border-slate-800"
                    : "border-red-200/60 dark:border-red-900/40 opacity-75"
                }`}
              >
                <div>
                  {/* Top Bar: Badges & Code */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          plan.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40"
                            : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/40"
                        }`}
                      >
                        {plan.isActive ? (
                          <HiOutlineCheckCircle className="text-sm shrink-0" />
                        ) : (
                          <HiOutlineXCircle className="text-sm shrink-0" />
                        )}
                        <span>{plan.isActive ? "مفعّلة" : "معطّلة"}</span>
                      </span>

                      {plan.isFree && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40">
                          مجانية
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono font-bold text-base-content/40 tracking-wider">
                      {plan.code}
                    </span>
                  </div>

                  {/* Plan Name & Description */}
                  <h3 className="text-xl font-bold font-1 text-base-content mb-1 text-right">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-base-content/60 min-h-[32px] line-clamp-2 text-right mb-4 leading-relaxed">
                    {plan.description || "لا يوجد وصف لهذه الباقة"}
                  </p>

                  {/* Capabilities List */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-base-200/50 dark:bg-slate-800/60 border border-base-200 dark:border-slate-800 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-base-content/70 font-medium">
                        <HiOutlineChatBubbleLeftRight className="text-cyan-700 dark:text-cyan-400 text-sm shrink-0" />
                        طلبات المساعد الذكي
                      </span>
                      <b className="text-base-content font-bold font-1">
                        {plan.dailyChatRequestLimit} / يومياً
                      </b>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-base-content/70 font-medium">
                        <HiOutlineMicrophone className="text-cyan-700 dark:text-cyan-400 text-sm shrink-0" />
                        جلسات التسميع
                      </span>
                      <b className="text-base-content font-bold font-1">
                        {plan.dailyRecitationSessionLimit} / يومياً
                      </b>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-base-200/60 dark:border-slate-700/60">
                      <span className="flex items-center gap-2 text-base-content/70 font-medium">
                        <HiOutlineLightBulb
                          className={`text-sm shrink-0 ${
                            plan.canUseRecitationHints
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-base-content/30"
                          }`}
                        />
                        تلميحات الكلمات
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          plan.canUseRecitationHints
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-base-content/40 line-through"
                        }`}
                      >
                        {plan.canUseRecitationHints ? "متاحة" : "غير متاحة"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-base-content/70 font-medium">
                        <HiOutlineChartBar
                          className={`text-sm shrink-0 ${
                            plan.canViewAdvancedRecitationStatistics
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-base-content/30"
                          }`}
                        />
                        إحصائيات التسميع المتقدمة
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          plan.canViewAdvancedRecitationStatistics
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-base-content/40 line-through"
                        }`}
                      >
                        {plan.canViewAdvancedRecitationStatistics ? "متاحة" : "غير متاحة"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Badges */}
                  <div className="mb-4">
                    <div className="text-[11px] font-bold text-base-content/50 mb-1.5 text-right">
                      الأسعار المعرفة:
                    </div>
                    {plan.isFree ? (
                      <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200/50">
                        متاحة مجاناً لجميع المستخدمين
                      </span>
                    ) : (plan.prices || plan.Prices) && (plan.prices || plan.Prices).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(plan.prices || plan.Prices).map((p, pIdx) => (
                          <div
                            key={p.id ?? p.Id ?? pIdx}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                              p.isActive ?? p.IsActive ?? true
                                ? "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800/40"
                                : "bg-base-200/50 text-base-content/40 border-base-300/50 line-through"
                            }`}
                          >
                            <span>{p.price ?? p.Price} {p.currency ?? p.Currency ?? "EGP"}</span>
                            <span className="text-[10px] font-normal opacity-75">
                              / {getBillingPeriodLabel(p.billingPeriod ?? p.BillingPeriod)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-base-content/40 italic">
                        لم يتم تحديد أسعار بعد
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2.5 pt-4 border-t border-base-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-base-200/80 hover:bg-base-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-base-content transition cursor-pointer active:scale-95"
                  >
                    <HiOutlinePencilSquare className="text-base" />
                    <span>تعديل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                      plan.isActive
                        ? "bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 border border-red-200/50 dark:border-red-800/40"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40"
                    }`}
                  >
                    {plan.isActive ? (
                      <>
                        <HiOutlineXCircle className="text-base" />
                        <span>إيقاف</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="text-base" />
                        <span>تفعيل</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Plan Modal */}
      {modalOpen && (
        <PlanEditModal
          plan={editingPlan}
          isSubmitting={isSubmitting}
          formError={formError}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
