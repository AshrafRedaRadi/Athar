import { apiFetch } from "../api/client";

export const studyPlanService = {
  /**
   * Get current study plan settings
   * GET /api/study-plan
   * @returns {Promise<object|null>}
   */
  async getPlanSettings() {
    try {
      const res = await apiFetch("/api/study-plan");
      return res?.data ?? res ?? null;
    } catch (error) {
      // 404 means no plan created yet
      if (error?.status === 404 || error?.message?.includes("404")) {
        return null;
      }
      console.warn("Error fetching study plan settings:", error.message);
      return null;
    }
  },

  /**
   * Create or update study plan settings
   * PUT /api/study-plan
   * @param {{ newHadithsPerDay: number, reviewsPerDay: number }} payload
   * @returns {Promise<object>}
   */
  async updatePlanSettings({ newHadithsPerDay = 2, reviewsPerDay = 3 }) {
    try {
      const res = await apiFetch("/api/study-plan", {
        method: "PUT",
        body: JSON.stringify({
          newHadithsPerDay: Number(newHadithsPerDay),
          reviewsPerDay: Number(reviewsPerDay),
        }),
      });
      return res?.data ?? res;
    } catch (error) {
      console.error("Error updating study plan:", error.message);
      throw error;
    }
  },

  /**
   * Initialize today's study plan session
   * POST /api/study-plan/today
   * @returns {Promise<object>}
   */
  async initializeToday() {
    try {
      const res = await apiFetch("/api/study-plan/today", {
        method: "POST",
      });
      return res?.data ?? res;
    } catch (error) {
      console.warn("Error initializing today's study plan:", error.message);
      return null;
    }
  },

  /**
   * Get the complete study plan overview
   * GET /api/study-plan/overview?weekStart=YYYY-MM-DD
   * @param {string} [weekStart] Optional custom week start (YYYY-MM-DD)
   * @returns {Promise<object|null>}
   */
  async getOverview(weekStart) {
    try {
      const endpoint = weekStart
        ? `/api/study-plan/overview?weekStart=${encodeURIComponent(weekStart)}`
        : "/api/study-plan/overview";
      const res = await apiFetch(endpoint);
      return res?.data ?? res ?? null;
    } catch (error) {
      console.error("Error fetching study plan overview:", error.message);
      return null;
    }
  },
};
