import { apiFetch } from "../api/client";

export const dashboardService = {
  /**
   * Fetch dashboard summary data for home page
   * @returns {Promise<object>}
   */
  async getSummary() {
    try {
      const data = await apiFetch("/api/Dashboard/summary");
      console.log("📊 [Dashboard Summary API Data]:", data);
      return data;
    } catch (error) {
      console.error("Error fetching dashboard summary:", error.message);
      throw error;
    }
  },
};
