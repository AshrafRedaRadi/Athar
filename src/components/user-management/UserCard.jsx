import React from "react";
import { HiOutlinePencilAlt, HiOutlineKey, HiOutlineCheckCircle, HiOutlineBan } from "react-icons/hi";

/**
 * UserCard - Mobile/Tablet card representation of a User item.
 */
export default function UserCard({ user, onEdit, onToggleStatus, onSendPasswordReset }) {
  const { name, email, role = "طالب", status = "نشط", details, avatar } = user;
  const isStatusActive = status === "نشط" || user.isActivated !== false;

  const roleBadgeClass =
    role === "معلم"
      ? "bg-cyan-600 text-white"
      : role === "أدمن"
      ? "bg-amber-600 text-white"
      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return (
    <div
      className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative"
      dir="rtl"
    >
      {/* Top Header: Avatar, Name, Email, Role Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="avatar shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-base-300 bg-base-200 flex items-center justify-center font-bold text-base-content/70">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-1 bg-cyan-800 text-white w-full h-full flex items-center justify-center">
                  {name ? name.charAt(0) : "م"}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col text-start">
            <h4 className="font-1 font-bold text-base text-base-content leading-snug">
              {name}
            </h4>
            <span className="font-2 text-xs text-base-content/60 truncate max-w-[180px]">
              {email}
            </span>
          </div>
        </div>

        {/* Role Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 font-2 ${roleBadgeClass}`}>
          {role}
        </span>
      </div>

      {/* Details & Status Row */}
      <div className="flex items-center justify-between border-t border-base-200 pt-3 text-xs font-2 text-base-content/60">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isStatusActive ? "bg-emerald-500" : "bg-gray-400"}`} />
          <span className={isStatusActive ? "text-emerald-600 font-bold" : "text-base-content/50"}>
            {isStatusActive ? "نشط" : "غير نشط"}
          </span>
          {details && <span className="opacity-70">| {details}</span>}
        </div>

        {/* Action Button: Edit User */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="p-1.5 rounded-lg bg-base-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-base-content/70 hover:text-cyan-700 transition-colors"
            title="تعديل الصلاحيات والحالة"
          >
            <HiOutlinePencilAlt className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
