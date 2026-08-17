import { apiFetch } from "../api/client";

/**
 * Payment Service
 * Handles Paymob checkout, payment status polling, and payment history.
 * Based on: Athar Frontend API Handoff — Paid Subscription + Premium Recitation
 */

/**
 * Payment status enum values (numeric from backend).
 */
export const PaymentStatus = {
  Pending: 1,
  Paid: 2,
  Failed: 3,
  Cancelled: 4,
  Refunded: 5,
};

/** localStorage key for persisting pending payment ID across Paymob redirects */
const PENDING_PAYMENT_KEY = "athar_pending_payment";

/**
 * Persist the pending paymentId in localStorage keyed by userId.
 * Must be saved before navigating to Paymob because the redirect reloads the app.
 */
export function savePendingPayment(userId, paymentId, checkoutUrl = null, planName = null, price = null) {
  try {
    localStorage.setItem(
      PENDING_PAYMENT_KEY,
      JSON.stringify({
        userId,
        paymentId,
        checkoutUrl,
        planName,
        price,
        createdAt: Date.now(),
      })
    );
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Retrieve the pending paymentId from localStorage for a given user.
 * @returns {{ userId: string, paymentId: number } | null}
 */
export function getPendingPayment(userId) {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Only return if it belongs to the current user
    if (parsed && String(parsed.userId) === String(userId)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Remove the pending paymentId from localStorage.
 * Call after reaching Paid, Failed, Cancelled, or Refunded.
 */
export function clearPendingPayment() {
  try {
    localStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    // silently ignore
  }
}

/**
 * Create a Paymob checkout session.
 * POST /api/payments/checkout (Authenticated)
 *
 * @param {number} planPriceId - The price.id from the selected plan (NOT the plan ID)
 * @returns {Promise<{ paymentId: number, checkoutUrl: string }>}
 */
export async function createCheckout(planPriceId) {
  return await apiFetch("/api/payments/checkout", {
    method: "POST",
    body: JSON.stringify({ planPriceId }),
  });
}

/**
 * Get payment status by paymentId.
 * GET /api/payments/{paymentId}/status (Authenticated)
 *
 * @param {number} paymentId
 * @returns {Promise<{ paymentId: number, status: number }>}
 */
export async function getPaymentStatus(paymentId) {
  return await apiFetch(`/api/payments/${paymentId}/status`);
}

/**
 * Get the user's payment history.
 * GET /api/payments (Authenticated)
 *
 * Backend returns up to 100 most recent payment records.
 *
 * @returns {Promise<PaymentHistoryDto[]>}
 */
export async function getPaymentHistory() {
  return await apiFetch("/api/payments");
}
