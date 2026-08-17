import { apiFetch } from "../api/client";

/**
 * Admin Plans Service
 * Admin-only CRUD for subscription plans and price management.
 * Base route: /api/admin/subscription-plans (Requires Admin role)
 * Based on: Athar Frontend API Handoff — Section 20
 */

/**
 * Get all subscription plans (active and inactive).
 * GET /api/admin/subscription-plans
 *
 * @returns {Promise<SubscriptionPlanDto[]>}
 */
export async function getAllPlans() {
  return await apiFetch("/api/admin/subscription-plans");
}

/**
 * Create a new subscription plan.
 * POST /api/admin/subscription-plans
 *
 * Backend rule: A Free plan cannot enable either paid recitation capability.
 *
 * @param {UpsertSubscriptionPlanRequest} planData
 * @returns {Promise<SubscriptionPlanDto>}
 */
export async function createPlan(planData) {
  return await apiFetch("/api/admin/subscription-plans", {
    method: "POST",
    body: JSON.stringify(planData),
  });
}

/**
 * Update an existing subscription plan.
 * PUT /api/admin/subscription-plans/{planId}
 *
 * Same body as create.
 *
 * @param {number} planId
 * @param {UpsertSubscriptionPlanRequest} planData
 * @returns {Promise<SubscriptionPlanDto>}
 */
export async function updatePlan(planId, planData) {
  return await apiFetch(`/api/admin/subscription-plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(planData),
  });
}

/**
 * Toggle plan active/inactive status.
 * PUT /api/admin/subscription-plans/{planId}/active
 *
 * @param {number} planId
 * @param {boolean} isActive
 * @returns {Promise<any>}
 */
export async function togglePlanActive(planId, isActive) {
  return await apiFetch(`/api/admin/subscription-plans/${planId}/active`, {
    method: "PUT",
    body: JSON.stringify({ isActive }),
  });
}

/**
 * Update pricing for a plan's billing period.
 * PUT /api/admin/subscription-plans/{planId}/prices/{billingPeriod}
 *
 * billingPeriod accepts case-insensitive names: "Monthly" or "Yearly"
 *
 * @param {number} planId
 * @param {"Monthly"|"Yearly"} billingPeriod
 * @param {{ price: number, currency: string, isActive: boolean }} priceData
 * @returns {Promise<any>}
 */
export async function updatePlanPrice(planId, billingPeriod, priceData) {
  return await apiFetch(
    `/api/admin/subscription-plans/${planId}/prices/${billingPeriod}`,
    {
      method: "PUT",
      body: JSON.stringify(priceData),
    }
  );
}
