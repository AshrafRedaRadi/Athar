import ChangeImage from "./ChangeImage";
import DeleteAccountSection from "./DeleteAccountSection";
import ThemeSwitcher from "./ThemeSwitcher";
import UserNameField from "./UserNameField";

function SettingsContent() {
  return (
    <div className="settingPage">
      <h2 className="font-1 f text-2xl">إعدادات الملف الشخصي.</h2>
      <p className="font-2 pb-4">
        قم بتحديث معلوماتك الشخصية وكيفية ظهورك للآخرين.
      </p>

      <ChangeImage />

      <form className="mt-6" onSubmit={(event) => event.preventDefault()}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UserNameField />

          <div className="w-full">
            <label className="mb-2 block text-sm text-base-content">
              مظهر الموقع
            </label>
            <ThemeSwitcher />
          </div>
        </div>

        <div className="mt-8 flex gap-3 border-t border-base-300 pt-6 sm:flex-row sm:items-center ">
          <button
            type="submit"
            className="btn h-10 min-h-10 rounded-md border-cyan-700 bg-cyan-700 px-8 text-white hover:border-cyan-800 hover:bg-cyan-800"
          >
            حفظ التغييرات
          </button>

          <button
            type="button"
            className="btn btn-ghost h-10 min-h-10 rounded-md px-6"
          >
            إلغاء
          </button>
        </div>
      </form>

      <DeleteAccountSection />
    </div>
  );
}

export default SettingsContent;
