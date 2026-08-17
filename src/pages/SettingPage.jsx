import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import SettingsContent from "../components/settings/SettingsContent";
import Avatars from "../components/settings/Avatars";

const SettingPage = ({ isAdminMode = false }) => {
  const location = useLocation();
  const isAdmin = isAdminMode || location.pathname.startsWith("/admin");
  const [showAvatars, setShowAvatars] = useState(false);

  return (
    <div className="min-h-screen bg-base-200">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        <Navbar
          activePage="settings"
          isAdmin={isAdmin}
          drawerId={isAdmin ? "admin-sidebar-drawer" : "sidebar-drawer"}
          showSidebar={true}
          showDock={true}
        />

        <div className="mt-4 sm:mt-6">
          <SettingsContent setShowAvatars={setShowAvatars} />
        </div>
      </main>
      {showAvatars && <Avatars setShowAvatars={setShowAvatars} />}
    </div>
  );
};

export default SettingPage;
