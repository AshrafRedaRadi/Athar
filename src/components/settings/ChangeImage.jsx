import React from "react";
import { GrEdit } from "react-icons/gr";
import { BsFillTrashFill } from "react-icons/bs";
import UserImage from "../../assets/user.png";

function ProfileImage() {
  const handleChangeImage = () => {
    console.log("Change image");
  };

  const handleDeleteImage = () => {
    console.log("Delete image");
  };

  return (
    <div className="flex w-full h-full flex-col items-center justify-center text-center rounded-2xl bg-base-100 dark:bg-slate-900 border border-base-200 dark:border-slate-800 p-6 shadow-xs font-2">
      {/* Profile Image Avatar */}
      <div className="relative mb-4">
        <img
          src={UserImage}
          alt="الصورة الشخصية"
          className="h-28 w-28 rounded-full border-4 border-cyan-700 dark:border-cyan-500 object-cover shadow-md"
        />
      </div>

      {/* Info */}
      <div className="space-y-1 mb-5">
        <h3 className="font-1 text-lg font-bold text-base-content">
          الصورة الشخصية
        </h3>
        <p className="font-2 text-xs text-base-content/60 max-w-xs mx-auto">
          يُفضل استخدام صورة مربعة بحجم 400x400 بكسل على الأقل.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={handleChangeImage}
          className="flex-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-xs font-bold text-white transition shadow-xs cursor-pointer"
        >
          <GrEdit className="text-sm" />
          <span>تغيير الصورة</span>
        </button>

        <button
          type="button"
          onClick={handleDeleteImage}
          className="flex h-10 px-4 items-center justify-center gap-1.5 rounded-xl border border-rose-500/80 bg-base-100 dark:bg-slate-900 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
        >
          <BsFillTrashFill className="text-xs" />
          <span>إزالة</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileImage;
