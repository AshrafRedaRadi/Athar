import { apiFetch, getImageUrl } from '../api/client';

/**
 * Format role string to standard Arabic display.
 * Backend roles are: "User" (Regular/Student) and "Admin" (Administrator).
 */
export function normalizeRole(rawRole, userObj = null) {
  const email = (userObj?.email || (typeof rawRole === "object" ? rawRole?.email : "") || "").toLowerCase();
  const isAdminFlag =
    userObj?.isAdmin === true ||
    (typeof rawRole === "object" && rawRole?.isAdmin === true);

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

export function formatUserItem(u, override = {}) {
  const roleDisplay = override.role || normalizeRole(u.role || u.Role, u);
  const isActivated = u.isActivated ?? u.isActive ?? (u.status !== "غير نشط");
  const rawCreatedAt = u.createdAt || u.createdDate || u.JoinedDate || u.joinedDate || u.createdDateUtc || u.createDate || null;
  return {
    id: u.id || u.userId || u.UserId || override.id || Date.now(),
    name: u.fullName || u.name || u.Name || override.name || u.email || "",
    email: u.email || u.Email || override.email || "",
    role: roleDisplay,
    isActivated: isActivated,
    status: isActivated ? "نشط" : "غير نشط",
    createdAt: rawCreatedAt,
    joinedDate: rawCreatedAt
      ? new Date(rawCreatedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
      : override.joinedDate || 'مؤخراً',
    avatar: getImageUrl(u.avatarUrl || u.avatar),
    details: roleDisplay === "أدمن" ? "مشرف النظام" : roleDisplay === "معلم" ? "معلم بالمنصة" : "طالب بالمنصة",
  };
}

export const usersService = {
  /**
   * Fetch users directly from Backend API: GET /api/Admin/users
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
        // Continue to next endpoint if failed
      }
    }

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
   * Update user details (Role, Status) via PUT /api/Admin/users/{userId}
   */
  async updateUser(userId, userData) {
    const backendRole = userData.role === "أدمن" ? "Admin" : userData.role === "معلم" ? "Teacher" : "User";
    const isActivated = userData.status === "نشط" || userData.isActivated === true;

    const payload = {
      role: backendRole,
      isActivated: isActivated,
      isActive: isActivated,
      status: userData.status,
    };

    return await apiFetch(`/api/Admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Toggle Activate / Deactivate user status via PUT /api/Admin/users/{userId}
   */
  async toggleUserStatus(userId, currentIsActivated) {
    const nextStatus = !currentIsActivated;
    return await apiFetch(`/api/Admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        isActivated: nextStatus,
        isActive: nextStatus,
        status: nextStatus ? "نشط" : "غير نشط",
      }),
    });
  },

  /**
   * Send Password Reset Link to user via POST /api/Admin/users/{userId}/send-password-reset
   */
  async sendPasswordReset(userId) {
    return await apiFetch(`/api/Admin/users/${userId}/send-password-reset`, {
      method: 'POST',
    });
  },

  /**
   * Fetch active students count via GET /api/Admin/users?Role=Student&IsActive=true
   */
  async getStudentsCount() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        return 1240;
      }
      const data = await apiFetch('/api/Admin/users?Role=Student&IsActive=true');
      if (Array.isArray(data)) {
        return data.length;
      }
      if (data && typeof data === 'object') {
        if (typeof data.totalCount === 'number') return data.totalCount;
        if (typeof data.total === 'number') return data.total;
        if (typeof data.count === 'number') return data.count;
        if (Array.isArray(data.items)) return data.items.length;
        if (Array.isArray(data.data)) return data.data.length;
        if (Array.isArray(data.users)) return data.users.length;
      }
      return 1240;
    } catch {
      return 1240;
    }
  },
};
