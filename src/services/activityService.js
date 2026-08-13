import { apiFetch } from "../api/client";

export const activityService = {
  /**
   * Fetch all achievements for the current user.
   * Returns the data array from the API response.
   * @returns {Promise<Array>}
   */
  async getAchievements() {
    try {
      const data = await apiFetch("/api/achievements");
      console.log("🏆 [Achievements API Data]:", data);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    } catch (error) {
      console.error("Error fetching achievements:", error.message);
      return [];
    }
  },

  /**
   * Fetch the check-in calendar for a given year and month.
   * Returns an array of date strings (e.g. ["2026-08-01", "2026-08-03", ...])
   * that represent days the user checked in.
   *
   * @param {number} year  - e.g. 2026
   * @param {number} month - 1-indexed (e.g. 8 for August)
   * @returns {Promise<string[]>}
   */
  async getCalendar(year, month) {
    try {
      const data = await apiFetch(
        `/api/activity/calendar?year=${year}&month=${month}`
      );
      console.log("📅 [Activity Calendar API Data]:", data);

      // The API (after apiFetch unwraps isSuccess/data) returns:
      // { year, month, activeDates: ["YYYY-MM-DD", ...], currentStreak: N, ... }
      // Normalise to a consistent { dates, currentStreak } shape.
      if (Array.isArray(data)) {
        return { dates: data, currentStreak: null };
      }
      const dates =
        (data && Array.isArray(data.activeDates) && data.activeDates) ||
        (data && Array.isArray(data.dates)       && data.dates)       ||
        (data && Array.isArray(data.activeDays)  && data.activeDays)  ||
        (data && Array.isArray(data.data)        && data.data)        ||
        [];
      const currentStreak =
        (data && typeof data.currentStreak === "number" ? data.currentStreak : null);

      return { dates, currentStreak };
    } catch (error) {
      console.error("Error fetching activity calendar:", error.message);
      return { dates: [], currentStreak: null };
    }
  },
};

/**
 * Given an array of date strings (YYYY-MM-DD), compute the longest
 * consecutive streak that includes or ends on today.
 *
 * @param {string[]} activeDates - array of "YYYY-MM-DD" strings
 * @returns {number} streak count
 */
export function computeCurrentStreak(activeDates) {
  if (!activeDates || activeDates.length === 0) return 0;

  const dateSet = new Set(activeDates);

  // Use local date parts — toISOString() returns UTC and shifts the date for UTC+ timezones
  const toDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d, n) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  };

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  // If today isn't in the set, check yesterday (streak may still be alive)
  let cursor = today;
  if (!dateSet.has(toDateStr(cursor))) {
    cursor = addDays(cursor, -1);
    if (!dateSet.has(toDateStr(cursor))) return 0; // streak broken
  }

  let streak = 0;
  while (dateSet.has(toDateStr(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
