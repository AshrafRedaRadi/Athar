import React, { useState, useEffect } from "react";
import { HiPlus, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineUserAdd } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { IoPeopleOutline } from "react-icons/io5";
import Navbar from "../../components/shared/Navbar";
import CategoryFilters from "../../components/shared/CategoryFilters";
import UserFormModal from "../../components/user-management/UserFormModal";
import UserCard from "../../components/user-management/UserCard";
import DeleteUserModal from "../../components/user-management/DeleteUserModal";
import { usersService } from "../../services/usersService";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("الكل");
  const [selectedStatus, setSelectedStatus] = useState("الكل");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

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

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (user) => {
    setDeletingUser(user);
    setIsDeleteOpen(true);
  };

  const handleSaveUser = async (formData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingUser) {
        // Edit
        await usersService.updateUser(editingUser.id, formData);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)));
      } else {
        // Add new
        const created = await usersService.createUser(formData);
        setUsers((prev) => [created, ...prev]);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error saving user:", err);
      setFormError(err?.message || "تعذَّر إنشاء أو تعديل الحساب، يرجى التأكد من البيانات والمحاولة مجدداً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      await usersService.deleteUser(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setIsDeleteOpen(false);
      setDeletingUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-base-100 text-base-content px-3 sm:px-8 py-8 pt-3 font-2 relative pb-32 lg:pb-16">
      {/* Top Navbar with Admin Dock for Mobile/Tablet */}
      <Navbar
        drawerId="admin-sidebar-drawer"
        activePage="users"
        isAdmin={true}
        showSidebar={true}
        showDock={true}
      />

      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-base-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-1 text-base-content flex items-center gap-3">
            <span>إدارة المستخدمين</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            عرض وإدارة حسابات المعلمين، الطلاب، والمشرفين في المنصة.
          </p>
        </div>

        {/* Action Button: Add User */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold text-sm px-5 gap-2 shadow-sm self-start sm:self-auto"
        >
          <HiOutlineUserAdd className="text-lg" />
          <span>إضافة مستخدم جديد</span>
        </button>
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
            className="select select-bordered rounded-xl text-sm font-2 w-full sm:w-44"
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
            className="select select-bordered rounded-xl text-sm font-2 w-full sm:w-40"
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
                    <th className="py-4 px-4 text-center">الدور</th>
                    <th className="py-4 px-4 text-center">تاريخ الانضمام</th>
                    <th className="py-4 px-4 text-center">الحالة</th>
                    <th className="py-4 px-6 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200 font-2">
                  {filteredUsers.map((userItem) => {
                    const isTeacher = userItem.role === "معلم";
                    const isAdmin = userItem.role === "أدمن";
                    const isActive = userItem.status === "نشط";

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
                            <span className={isActive ? "text-emerald-600" : "text-base-content/50"}>{userItem.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(userItem)}
                              className="btn btn-ghost btn-xs text-base-content/70 hover:text-cyan-700 rounded-lg p-1.5"
                              title="تعديل"
                            >
                              <HiOutlinePencilAlt className="text-lg" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(userItem)}
                              className="btn btn-ghost btn-xs text-base-content/70 hover:text-red-600 rounded-lg p-1.5"
                              title="حذف"
                            >
                              <HiOutlineTrash className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 bg-base-200/30 border-t border-base-200 flex items-center justify-between font-2 text-xs text-base-content/60">
              <span>عرض 1 إلى {filteredUsers.length} من أصل {users.length} مستخدم</span>
              <div className="join">
                <button className="join-item btn btn-xs btn-outline rounded-r-lg">«</button>
                <button className="join-item btn btn-xs btn-active bg-cyan-700 text-white border-transparent">1</button>
                <button className="join-item btn btn-xs btn-outline rounded-l-lg">»</button>
              </div>
            </div>
          </div>

          {/* 2. Mobile Cards Grid View (shown on small screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4 mb-6">
            {filteredUsers.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            ))}
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

      {/* Floating Action Button (+) for Mobile */}
      <button
        type="button"
        onClick={handleOpenAddModal}
        className="fixed bottom-20 lg:bottom-6 left-6 z-40 w-14 h-14 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 md:hidden"
        title="إضافة مستخدم جديد"
        aria-label="إضافة مستخدم جديد"
      >
        <HiPlus className="text-2xl" />
      </button>

      {/* Form Modal (Add / Edit) */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveUser}
        initialData={editingUser}
        isSaving={isSubmitting}
        serverError={formError}
      />

      {/* Delete Confirmation Modal */}
      <DeleteUserModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        userName={deletingUser?.name || ""}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
