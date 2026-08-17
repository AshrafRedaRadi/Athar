import { GrEdit } from "react-icons/gr";
import { useAuth } from "../../context/AuthContext";
import defaultAvatar from "../../assets/user.png";
import { API_BASE_URL } from "../../api/client";

function ProfileImage({ setShowAvatars, children }) {
  const { user } = useAuth();

  const avatarImgPath = user?.avatar?.imageUrl || user?.avatarUrl;
  const resolvedAvatar = avatarImgPath
    ? (avatarImgPath.startsWith("http") ? avatarImgPath : `${API_BASE_URL}${avatarImgPath.startsWith("/") ? "" : "/"}${avatarImgPath}`)
    : defaultAvatar;

  return (
    <div className="flex w-full flex-col items-center text-center rounded-2xl bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs font-2">
      {/* Top Section: Avatar, text & Change button */}
      <div className="flex flex-col items-center justify-center w-full">
        {/* Profile Image Avatar */}
        <div className="relative mb-3">
          <img
            src={resolvedAvatar}
            alt="الصورة الشخصية"
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-cyan-700 dark:border-cyan-500 object-cover shadow-md transition-all duration-300"
          />
        </div>

        {/* Info */}
        <div className="space-y-1 mb-3">
          <h3 className="font-1 text-lg font-bold text-base-content">
            الصورة الشخصية
          </h3>
          <p className="font-2 text-xs text-base-content/60 max-w-xs mx-auto">
            يُفضل استخدام صورة مربعة بحجم 400x400 بكسل على الأقل.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 w-full max-w-xs mb-1">
          <button
            type="button"
            onClick={() => setShowAvatars(true)}
            className="flex-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-xs font-bold text-white transition shadow-xs cursor-pointer"
          >
            <GrEdit className="text-sm" />
            <span>تغيير الصورة</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Name & Email inputs stacked naturally */}
      {children && (
        <div className="w-full pt-4 mt-3 border-t border-base-200/80 dark:border-slate-800 text-start">
          {children}
        </div>
      )}
    </div>
  );
}

export default ProfileImage;
