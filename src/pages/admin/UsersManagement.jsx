import React, { useState, useEffect } from "react";
import { HiOutlinePencilAlt, HiOutlineKey, HiOutlineBan, HiOutlineCheckCircle } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { IoPeopleOutline } from "react-icons/io5";
import Navbar from "../../components/shared/Navbar";
import CategoryFilters from "../../components/shared/CategoryFilters";
import UserFormModal from "../../components/user-management/UserFormModal";
import UserCard from "../../components/user-management/UserCard";
import { usersService } from "../../services/usersService";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("الكل");
  const [selectedStatus, setSelectedStatus] = useState("الكل");

  // Modal & Toast States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Auto-hide toast notification after 4 seconds
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole, selectedStatus]);

  // Mobile Category Tabs list
  const ROLE_CATEGORIES = [
    { id: "الكل", label: `الكل (${users.length})` },
    { id: "معلم", label: `المعلمين (${users.filter((u) => u.role === "معلم").length})` },
    { id: "طالب", label: `الطلاب (${users.filter((u) => u.role === "طالب").length})` },
    { id: "أدمن", label: `الأدمن (${users.filter((u) => u.role === "أدمن").length})` },
  ];

  // Fetch users list
  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const data = await usersService.getUsers();
        setUsers(data);
      } catch (err) {
        console.warn("Could not fetch users:", err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRole === "الكل" || u.role === selectedRole;

    const matchesStatus =
      selectedStatus === "الكل" || u.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length);

  // Open Edit Role / Status Modal
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Save User Updates (PUT /api/Admin/users/{id})
  const handleSaveUser = async (formData) => {
    if (!editingUser) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      await usersService.updateUser(editingUser.id, formData);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                role: formData.role,
                status: formData.status,
                isActivated: formData.status === "نشط",
              }
            : u
        )
      );
      setIsFormOpen(false);
      setToastMsg("تم تحديث بيانات وم صلاحيات المستخدم بنجاح.");
    } catch (err) {
      console.error("Error updating user:", err);
      setFormError(err?.message || "تعذَّر تحديث الحساب، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle User Activated / Deactivated Status (PUT /api/Admin/users/{id})
  const handleToggleStatus = async (userItem) => {
    const currentActive = userItem.status === "نشط" || userItem.isActivated !== false;
    const nextActive = !currentActive;
    const nextStatusText = nextActive ? "نشط" : "غير نشط";

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userItem.id
          ? { ...u, status: nextStatusText, isActivated: nextActive }
          : u
      )
    );

    try {
      await usersService.toggleUserStatus(userItem.id, currentActive);
      setToastMsg(
        nextActive
          ? `تم تفعيل حساب المستخدم "${userItem.name}" بنجاح.`
          : `تم تجميد حساب المستخدم "${userItem.name}".`
      );
    } catch (err) {
      console.error("Error toggling user status:", err);
      // Revert optimism on error
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userItem.id
            ? { ...u, status: userItem.status, isActivated: currentActive }
            : u
        )
      );
      setToastMsg("تعذَّر تغيير حالة الحساب، يرجى المحاولة لاحقاً.");
    }
  };

  // Send Password Reset Link (POST /api/Admin/users/{id}/send-password-reset)
  const handleSendPasswordReset = async (userId) => {
    try {
      await usersService.sendPasswordReset(userId);
      setToastMsg("تم إرسال رابط إعادة ضبط كلمة المرور إلى البريد الإلكتروني بنجاح!");
    } catch (err) {
      console.error("Error sending reset password link:", err);
      setToastMsg(err?.message || "تعذَّر إرسال رابط إعادة الضبط، يرجى المحاولة لاحقاً.");
      throw err;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 text-base-content font-2 relative">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
      {/* Top Navbar with Admin Dock for Mobile/Tablet */}
      <Navbar
        drawerId="admin-sidebar-drawer"
        activePage="users"
        isAdmin={true}
        showSidebar={true}
        showDock={true}
      />

      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="alert alert-info shadow-xl border border-cyan-700/30 font-2 text-sm rounded-2xl py-3 px-6 flex items-center gap-3">
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <header className="mb-6 pb-4 border-b border-base-200">
        <h1 className="text-2xl md:text-3xl font-bold font-1 text-base-content flex items-center gap-3">
          <span>إدارة المستخدمين</span>
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 mt-1">
          عرض وإدارة حسابات المعلمين، الطلاب، والمشرفين (تعديل الصلاحيات، تفعيل/تجميد الحسابات، وإرسال روابط إعادة ضبط كلمة المرور).
        </p>
      </header>

      {/* ── Mobile Category Tabs Filter (Shown on Mobile screens) ── */}
      <div className="block sm:hidden mb-4">
        <CategoryFilters
          activeCategory={selectedRole}
          onSelectCategory={setSelectedRole}
          categories={ROLE_CATEGORIES}
        />
      </div>

      {/* ── Desktop/Tablet Filter Toolbar ── */}
      <section className="bg-base-100 border border-base-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <label className="input input-bordered flex items-center gap-2 w-full md:flex-1 rounded-xl text-sm font-2">
          <FiSearch className="text-base-content/40 text-base shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            className="grow"
          />
        </label>

        {/* Desktop Role Filter Dropdown */}
        <div className="hidden sm:flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="select select-bordered rounded-xl text-sm font-2 w-full sm:w-44 font-bold"
          >
            <option value="الكل">جميع الأدوار</option>
            <option value="معلم">معلم</option>
            <option value="طالب">طالب</option>
            <option value="أدمن">مشرف (أدمن)</option>
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select select-bordered rounded-xl text-sm font-2 w-full sm:w-40 font-bold"
          >
            <option value="الكل">جميع الحالات</option>
            <option value="نشط">نشط</option>
            <option value="غير نشط">غير نشط</option>
          </select>
        </div>
      </section>

      {/* ── Main Users Display View ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full animate-spin" />
          <span className="text-sm text-base-content/60">جاري استحضار قائمة المستخدمين...</span>
        </div>
      ) : filteredUsers.length > 0 ? (
        <>
          {/* 1. Desktop & Tablet Table View (hidden on small screens) */}
          <div className="hidden md:block bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="table w-full text-start text-sm">
                <thead className="bg-base-200/50 text-base-content/70 font-2 text-xs border-b border-base-200">
                  <tr>
                    <th className="py-4 px-6">المستخدم</th>
                    <th className="py-4 px-4 text-center">الدور (الصلاحية)</th>
                    <th className="py-4 px-4 text-center">تاريخ الانضمام</th>
                    <th className="py-4 px-4 text-center">الحالة</th>
                    <th className="py-4 px-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200 font-2">
                  {paginatedUsers.map((userItem) => {
                    const isTeacher = userItem.role === "معلم";
                    const isAdmin = userItem.role === "أدمن";
                    const isActive = userItem.status === "نشط" || userItem.isActivated !== false;

                    const badgeClass = isTeacher
                      ? "bg-cyan-600 text-white"
                      : isAdmin
                      ? "bg-amber-600 text-white"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

                    return (
                      <tr key={userItem.id} className="hover:bg-base-200/40 transition-colors">
                        {/* User info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="avatar shrink-0">
                              <div className="w-10 h-10 rounded-full bg-cyan-800 text-white flex items-center justify-center font-bold font-1 text-sm border border-base-300 overflow-hidden">
                                {userItem.avatar ? (
                                  <img src={userItem.avatar} alt={userItem.name} className="w-full h-full object-cover" />
                                ) : (
                                  userItem.name?.charAt(0) || "م"
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="font-bold text-base-content font-1">{userItem.name}</span>
                              <span className="text-xs text-base-content/60">{userItem.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role badge */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                            {userItem.role}
                          </span>
                        </td>

                        {/* Joined date */}
                        <td className="py-4 px-4 text-center text-xs text-base-content/70">
                          {userItem.joinedDate}
                        </td>

                        {/* Status dot + text */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center gap-1.5 text-xs font-medium">
                            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                            <span className={isActive ? "text-emerald-600 font-bold" : "text-base-content/50"}>
                              {isActive ? "نشط" : "غير نشط"}
                            </span>
                          </span>
                        </td>

                        {/* Actions: Edit Role & Status Modal Trigger */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(userItem)}
                              className="btn btn-ghost btn-xs text-base-content/70 hover:text-cyan-700 rounded-lg p-1.5"
                              title="تعديل الحساب والصلاحيات"
                            >
                              <HiOutlinePencilAlt className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Mobile Cards Grid View (shown on small screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4 mb-4">
            {paginatedUsers.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onEdit={handleOpenEditModal}
                onToggleStatus={handleToggleStatus}
                onSendPasswordReset={handleSendPasswordReset}
              />
            ))}
          </div>

          {/* 3. Responsive Pagination & Count Footer (Visible on Mobile & Desktop) */}
          <div className="bg-base-100 border border-base-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-2 text-xs sm:text-sm text-base-content/70 mb-10 sm:mb-6">
            <span className="font-bold text-center sm:text-right">
              عرض {filteredUsers.length > 0 ? startIndex + 1 : 0} إلى {endIndex} من أصل {filteredUsers.length} مستخدم
            </span>

            {totalPages > 1 && (
              <div className="join flex items-center justify-center">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="join-item btn btn-xs sm:btn-sm btn-outline rounded-r-lg"
                >
                  «
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`join-item btn btn-xs sm:btn-sm ${
                      currentPage === pg
                        ? "bg-cyan-700 text-white border-transparent font-bold"
                        : "btn-outline text-base-content/80"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="join-item btn btn-xs sm:btn-sm btn-outline rounded-l-lg"
                >
                  »
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <IoPeopleOutline className="text-6xl text-base-content/20" />
          <p className="font-2 text-base-content/60 text-lg max-w-md">
            لم نجد مستخدمين مطابقين لخيارات البحث والحقول الحالية.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(""); setSelectedRole("الكل"); setSelectedStatus("الكل"); }}
            className="btn btn-sm btn-outline border-base-300 font-2 rounded-xl px-5"
          >
            عرض جميع المستخدمين
          </button>
        </div>
      )}

      {/* Edit Form Modal */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveUser}
        onSendPasswordReset={handleSendPasswordReset}
        initialData={editingUser}
        isSaving={isSubmitting}
        serverError={formError}
      />
      </main>
    </div>
  );
}
