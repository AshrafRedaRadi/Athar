import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getMyEntitlements } from "../services/subscriptionService";
import {
  getPaymentStatus,
  getPendingPayment,
  clearPendingPayment,
  PaymentStatus,
} from "../services/paymentService";
import { useAuth } from "./AuthContext";

/**
 * SubscriptionContext
 *
 * Central entitlement state following the recommended EntitlementState model
 * from the Athar API Handoff spec (sections 4, 17, 18).
 *
 * Provides:
 * - entitlements (plan info, quotas, feature flags)
 * - UI helpers (isHintsLocked, isAdvancedStatsLocked, isChatLimitReached, isRecitationLimitReached)
 * - refreshEntitlements() for on-demand refresh
 * - Automatic pending payment polling on mount (resumePendingPaymentPolling)
 * - showUpgradeModal / closeUpgradeModal for opening the pricing modal
 */

const SubscriptionContext = createContext(null);

/** Default entitlement state before loading */
const DEFAULT_ENTITLEMENTS = {
  loaded: false,
  loading: false,
  planId: null,
  planCode: null,
  planName: null,
  isFree: true,
  canUseRecitationHints: false,
  canViewAdvancedRecitationStatistics: false,
  billingPeriod: null,
  startsAtUtc: null,
  expiresAtUtc: null,
  chat: null,
  recitation: null,
};

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [entitlements, setEntitlements] = useState(DEFAULT_ENTITLEMENTS);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState(null);
  const pollTimerRef = useRef(null);

  /**
   * Refresh pending payment object from localStorage
   */
  const refreshPendingPayment = useCallback(() => {
    if (!user) {
      setPendingPayment(null);
      return null;
    }
    const currentPending = getPendingPayment(user.id || user.userId || user.email);
    setPendingPayment(currentPending);
    return currentPending;
  }, [user]);

  /**
   * Fetch entitlements from GET /api/subscriptions/me and populate state.
   */
  const refreshEntitlements = useCallback(async () => {
    if (!user) return;
    setEntitlements((prev) => ({ ...prev, loading: true }));
    try {
      const data = await getMyEntitlements();
      const isAdminUser = Boolean(
        user?.isAdmin ||
        String(user?.role || "").toLowerCase().includes("admin") ||
        String(user?.role || "").toLowerCase().includes("مشرف") ||
        String(user?.role || "").toLowerCase().includes("أدمن")
      );

      setEntitlements({
        loaded: true,
        loading: false,
        planId: data?.plan?.id ?? null,
        planCode: data?.plan?.code ?? null,
        planName: isAdminUser
          ? "باقة الإدارة الشاملة (صلاحيات كاملة 🛡️)"
          : (data?.plan?.name ?? null),
        isFree: isAdminUser ? false : (data?.plan?.isFree ?? true),
        canUseRecitationHints: isAdminUser ? true : (data?.plan?.canUseRecitationHints ?? false),
        canViewAdvancedRecitationStatistics: isAdminUser
          ? true
          : (data?.plan?.canViewAdvancedRecitationStatistics ?? false),
        billingPeriod: data?.billingPeriod ?? null,
        startsAtUtc: data?.startsAtUtc ?? null,
        expiresAtUtc: data?.expiresAtUtc ?? null,
        chat: data?.chat ?? null,
        recitation: data?.recitation ?? null,
      });
    } catch (err) {
      console.warn("Failed to fetch entitlements:", err?.message);
      setEntitlements((prev) => ({ ...prev, loaded: true, loading: false }));
    }
  }, [user]);

  /**
   * Manual trigger to check pending payment status immediately
   */
  const checkPendingPaymentStatus = useCallback(async () => {
    const pending = refreshPendingPayment();
    if (!pending?.paymentId) return null;

    try {
      const result = await getPaymentStatus(pending.paymentId);
      const status = result?.status;

      if (status === PaymentStatus.Paid) {
        clearPendingPayment();
        setPendingPayment(null);
        await refreshEntitlements();
        return { status, paid: true, message: "تم تأكيد الدفع وتفعيل الباقة بنجاح!" };
      }

      if (status === PaymentStatus.Failed) {
        clearPendingPayment();
        setPendingPayment(null);
        return { status, failed: true, message: "فشلت عملية الدفع السابقة. يمكنك البدء من جديد." };
      }

      if (status === PaymentStatus.Cancelled) {
        clearPendingPayment();
        setPendingPayment(null);
        return { status, cancelled: true, message: "تم إلغاء عملية الدفع السابقة." };
      }

      if (status === PaymentStatus.Refunded) {
        clearPendingPayment();
        setPendingPayment(null);
        await refreshEntitlements();
        return { status, refunded: true, message: "تم استرداد المبلغ." };
      }

      return { status, pending: true, message: "العملية لا تزال قيد الانتظار في بوابة الدفع." };
    } catch (err) {
      return { error: err.message };
    }
  }, [refreshPendingPayment, refreshEntitlements]);

  /**
   * Dismiss/clear pending payment locally (e.g. if user abandons and wants to clear local state)
   */
  const dismissPendingPayment = useCallback(() => {
    clearPendingPayment();
    setPendingPayment(null);
  }, []);

  /**
   * Resume polling for a pending Paymob payment.
   * Per spec: persist paymentId in localStorage before navigating to Paymob.
   * On app reload, resume polling until Paid/Failed/Cancelled/Refunded.
   */
  const resumePendingPaymentPolling = useCallback(async () => {
    if (!user) return;
    const pending = refreshPendingPayment();
    if (!pending) return;

    const poll = async () => {
      try {
        const result = await getPaymentStatus(pending.paymentId);
        const status = result?.status;

        if (status === PaymentStatus.Paid) {
          clearPendingPayment();
          setPendingPayment(null);
          await refreshEntitlements();
          return; // stop polling
        }

        if (
          status === PaymentStatus.Failed ||
          status === PaymentStatus.Cancelled
        ) {
          clearPendingPayment();
          setPendingPayment(null);
          return; // stop polling
        }

        if (status === PaymentStatus.Refunded) {
          clearPendingPayment();
          setPendingPayment(null);
          await refreshEntitlements(); // access revoked
          return; // stop polling
        }

        // Pending — continue polling every 5 seconds
        pollTimerRef.current = setTimeout(poll, 5000);
      } catch {
        // Network error — retry in 10 seconds
        pollTimerRef.current = setTimeout(poll, 10000);
      }
    };

    poll();
  }, [user, refreshPendingPayment, refreshEntitlements]);

  // Fetch entitlements on user change (login/logout)
  useEffect(() => {
    if (user) {
      refreshEntitlements();
      resumePendingPaymentPolling();
    } else {
      setEntitlements(DEFAULT_ENTITLEMENTS);
    }

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [user, refreshEntitlements, resumePendingPaymentPolling]);

  const isAdminUser = Boolean(
    user?.isAdmin ||
    String(user?.role || "").toLowerCase().includes("admin") ||
    String(user?.role || "").toLowerCase().includes("مشرف") ||
    String(user?.role || "").toLowerCase().includes("أدمن")
  );

  // ─── UI Helpers (computed from entitlements) ───
  const isHintsLocked =
    !isAdminUser && entitlements.loaded && !entitlements.canUseRecitationHints;

  const isAdvancedStatsLocked =
    !isAdminUser && entitlements.loaded && !entitlements.canViewAdvancedRecitationStatistics;

  const isChatLimitReached =
    !isAdminUser &&
    entitlements.loaded &&
    entitlements.chat !== null &&
    entitlements.chat.remaining <= 0;

  const isRecitationLimitReached =
    !isAdminUser &&
    entitlements.loaded &&
    entitlements.recitation !== null &&
    entitlements.recitation.remaining <= 0;

  // ─── Upgrade Modal Controls ───
  const showUpgradeModal = useCallback((featureHint = null) => {
    setUpgradeHint(featureHint);
    setUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModalOpen(false);
    setUpgradeHint(null);
  }, []);

  const value = {
    entitlements,
    refreshEntitlements,
    pendingPayment,
    refreshPendingPayment,
    checkPendingPaymentStatus,
    dismissPendingPayment,
    isHintsLocked,
    isAdvancedStatsLocked,
    isChatLimitReached,
    isRecitationLimitReached,
    upgradeModalOpen,
    upgradeHint,
    showUpgradeModal,
    closeUpgradeModal,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to access subscription entitlements and UI helpers.
 */
export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
}
