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
    <div className="flex w-full flex-col items-center rounded-lg bg-base-100 px-4 py-5 text-base-content sm:flex-row sm:px-8">
      {/* Profile Image */}
      <div>
        <img
          src={UserImage}
          alt="الصورة الشخصية"
          className="h-28 w-28 rounded-full border-4 border-cyan-700 object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col  gap-4 px-2 pt-4  sm:px-8 sm:pt-0">
        {/* Title */}
        <div className="text-right">
          <h3 className="font-1 text-lg font-medium text-base-content">
            الصورة الشخصية
          </h3>

          <p className="font-2 mt-1 text-xs text-base-content/60">
            يُفضل استخدام صورة مربعة بحجم 400x400 بكسل على الأقل.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          {/* Change Image */}
          <button
            onClick={handleChangeImage}
            className="flex h-9 w-36 items-center justify-center gap-2 rounded-md bg-cyan-700 text-xs font-medium text-white transition hover:bg-cyan-800"
          >
            <span>
              <GrEdit />
            </span>
            تغيير الصورة
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteImage}
            className="flex h-9 w-24 items-center justify-center gap-1 rounded-md border border-red-500 bg-base-100 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
          >
            <span>
              <BsFillTrashFill />
            </span>
            إزالة
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileImage;
