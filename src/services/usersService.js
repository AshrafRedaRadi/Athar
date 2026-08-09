import { apiFetch, getImageUrl } from '../api/client';

/**
 * Format role string to standard Arabic display.
 * Backend roles are: "User" (Regular/Student) and "Admin" (Administrator).
 */
export function normalizeRole(rawRole) {
  if (!rawRole) return "طالب";
  const r = String(rawRole).toLowerCase();
  if (r === "admin" || r.includes("admin") || r.includes("أدمن") || r.includes("مشرف")) return "أدمن";
  if (r === "teacher" || r.includes("teacher") || r.includes("معلم")) return "معلم";
  return "طالب";
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
          return list.map((u) => ({
            id: u.id,
            name: u.fullName || u.email,
            email: u.email,
            role: normalizeRole(u.role),
            status: u.isActive !== false ? "نشط" : "غير نشط",
            joinedDate: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'مؤخراً',
            avatar: getImageUrl(u.avatarUrl),
            details: normalizeRole(u.role) === "معلم" ? "معلم بالمنصة" : normalizeRole(u.role) === "أدمن" ? "مشرف النظام" : "طالب بالمنصة",
          }));
        }
      } catch {
        // Backend list endpoint not deployed yet
      }
    }

    // Fallback: return current authenticated user profile from /api/Account/profile
    try {
      const profile = await apiFetch('/api/Account/profile');
      if (profile && profile.email) {
        return [
          {
            id: profile.id,
            name: profile.fullName || profile.email,
            email: profile.email,
            role: normalizeRole(profile.role),
            status: "نشط",
            joinedDate: profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
              : "مؤخراً",
            avatar: getImageUrl(profile.avatarUrl),
            details: normalizeRole(profile.role) === "أدمن" ? "مشرف بالمنصة" : "طالب بالمنصة",
          },
        ];
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
      fullName: userData.name,
      email: userData.email,
      password: userData.password,
      role: backendRole,
    };

    return await apiFetch('/api/Auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
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
