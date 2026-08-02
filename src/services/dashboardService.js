import { apiFetch } from "../api/client";

export const dashboardService = {
  /**
   * Fetch dashboard summary data for home page
   * @returns {Promise<object>}
   */
  async getSummary() {
    try {
      return await apiFetch("/api/Dashboard/summary");
    } catch (error) {
      console.error("Error fetching dashboard summary:", error.message);
      throw error;
    }
  },
};
