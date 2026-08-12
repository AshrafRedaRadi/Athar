import Navbar from "../components/shared/Navbar";
import SettingsContent from "../components/settings/SettingsContent";

const SettingPage = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <main className="px-3 py-8 pt-3 pb-28 sm:px-8 sm:pb-32 lg:pb-8" dir="rtl">
        <Navbar activePage="settings" />

        <SettingsContent />
      </main>
    </div>
  );
};

export default SettingPage;
