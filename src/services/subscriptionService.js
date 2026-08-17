import { apiFetch } from "../api/client";

/**
 * Subscription Service
 * Handles subscription plan discovery and user entitlements.
 * Based on: Athar Frontend API Handoff — Paid Subscription + Premium Recitation
 */

/**
 * Billing period enum values (numeric and string supported).
 */
export const BillingPeriod = {
  Monthly: 1,
  Yearly: 2,
};

export function isMonthlyPeriod(period) {
  if (period == null) return false;
  const s = String(period).toLowerCase().trim();
  return s === "1" || s === "monthly";
}

export function isYearlyPeriod(period) {
  if (period == null) return false;
  const s = String(period).toLowerCase().trim();
  return s === "2" || s === "yearly";
}

export function getBillingPeriodLabel(period) {
  if (isMonthlyPeriod(period)) return "شهري";
  if (isYearlyPeriod(period)) return "سنوي";
  return "شهري";
}

/**
 * Get all public subscription plans with prices and features.
 * GET /api/subscription-plans (Public — no auth required)
 *
 * @returns {Promise<SubscriptionPlanDto[]>}
 */
export async function getPublicPlans() {
  return await apiFetch("/api/subscription-plans");
}

/**
 * Get the current user's subscription entitlements, quotas, and plan info.
 * GET /api/subscriptions/me (Authenticated)
 *
 * This is the frontend's single source of truth for access control.
 * Call it: after login, when opening subscription screen, after payment,
 * after app resume, and when a premium endpoint returns PREMIUM_FEATURE_REQUIRED.
 *
 * @returns {Promise<UserEntitlementsDto>}
 */
export async function getMyEntitlements() {
  return await apiFetch("/api/subscriptions/me");
}
