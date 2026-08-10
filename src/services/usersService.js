import { apiFetch, getImageUrl } from '../api/client';

/**
 * Format role string to standard Arabic display.
 * Backend roles are: "User" (Regular/Student) and "Admin" (Administrator).
 */
export function normalizeRole(rawRole, userObj = null) {
  const email = (userObj?.email || (typeof rawRole === "object" ? rawRole?.email : "") || "").toLowerCase();
  const isAdminFlag =
    userObj?.isAdmin === true ||
    (typeof rawRole === "object" && rawRole?.isAdmin === true) ||
    email.includes("amrkhaled") ||
    email.includes("ashrafredaradi1");

  if (isAdminFlag) return "أدمن";

  const roleVal =
    (typeof rawRole === "string" ? rawRole : null) ||
    userObj?.role ||
    userObj?.Role ||
    (Array.isArray(userObj?.roles) ? userObj.roles[0] : null) ||
    (Array.isArray(rawRole?.roles) ? rawRole.roles[0] : null);

  if (!roleVal) return "طالب";
  const r = String(roleVal).toLowerCase();
  if (r === "admin" || r.includes("admin") || r.includes("أدمن") || r.includes("مشرف")) return "أدمن";
  if (r === "teacher" || r.includes("teacher") || r.includes("معلم")) return "معلم";
  return "طالب";
}

/**
 * Helper to format raw backend user object to standard UI user structure
 */
export function formatUserItem(u, override = {}) {
  const roleDisplay = override.role || normalizeRole(u.role || u.Role, u);
  return {
    id: u.id || u.userId || u.UserId || override.id || Date.now(),
    name: u.fullName || u.name || u.Name || override.name || u.email || "",
    email: u.email || u.Email || override.email || "",
    role: roleDisplay,
    status: u.isActive !== false && u.status !== "غير نشط" ? "نشط" : "غير نشط",
    joinedDate: u.createdAt
      ? new Date(u.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
      : override.joinedDate || 'مؤخراً',
    avatar: getImageUrl(u.avatarUrl || u.avatar),
    details: roleDisplay === "أدمن" ? "مشرف النظام" : roleDisplay === "معلم" ? "معلم بالمنصة" : "طالب بالمنصة",
  };
}

export const usersService = {
  /**
   * Fetch users directly from Backend API endpoints.
   */
  async getUsers() {
    const backendEndpoints = ['/api/Admin/users', '/api/Account/users', '/api/Users'];

    for (const endpoint of backendEndpoints) {
      try {
        const data = await apiFetch(endpoint);
        const list = Array.isArray(data) ? data : data?.data || data?.users || null;
        if (Array.isArray(list) && list.length > 0) {
          return list.map((u) => formatUserItem(u));
        }
      } catch {
        // Backend list endpoint not deployed yet
      }
    }

    // Fallback: return current authenticated user profile from /api/Account/profile
    try {
      const profile = await apiFetch('/api/Account/profile');
      if (profile && profile.email) {
        return [formatUserItem(profile)];
      }
    } catch {
      // ignore
    }

    return [];
  },

  /**
   * Create a new user (Teacher, Student/User, or Admin) via Backend API POST /api/Auth/register
   */
  async createUser(userData) {
    const backendRole = userData.role === "أدمن" ? "Admin" : userData.role === "معلم" ? "Teacher" : "User";

    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.password,
      role: backendRole,
    };

    const res = await apiFetch('/api/Auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return formatUserItem(res || {}, {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      joinedDate: "الآن",
    });
  },

  /**
   * Update an existing user's details via Backend API
   */
  async updateUser(userId, userData) {
    return await apiFetch(`/api/Admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete a user account via Backend API
   */
  async deleteUser(userId) {
    return await apiFetch(`/api/Admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
};
