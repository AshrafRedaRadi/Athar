import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import RecitationVideoSimulator from './components/landing/RecitationVideoSimulator';
import AdminRoute from './components/auth/AdminRoute';
import SubscriptionModal from './components/subscription/SubscriptionModal';

import Home from './pages/Home';
import Library from './pages/Library';
import Study from './pages/Study';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ConfirmEmail from './pages/ConfirmEmail';
import ResetPassword from './pages/ResetPassword';
import ListSection from './pages/ListSection';
import ListHadith from './pages/ListHadith';
import Onboarding from './pages/Onboarding';
import Plan from './pages/Plan';
import Achievements from './pages/Achievements';
import ControlPanel from './pages/admin/ControlPanel';
import ContentManagement from './pages/admin/ContentManagement';
import UsersManagement from './pages/admin/UsersManagement';
import AiAssistantManagement from './pages/admin/AiAssistantManagement';
import PlansManagement from './pages/admin/PlansManagement';
import Error_page from './pages/Error_page';
import LandingPage from './pages/LandingPage';

import SettingPage from './pages/SettingPage';
import HelpCenter from './pages/HelpCenter';

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <BrowserRouter>
          <Routes>

            {/* Admin routes protected by AdminRoute */}
            <Route element={<AdminRoute />}>
              <Route path='/admin/controlpanel' element={<ControlPanel />} />
              <Route path='/admin/content' element={<ContentManagement />} />
              <Route path='/admin/users' element={<UsersManagement />} />
              <Route path='/admin/ai-assistant' element={<AiAssistantManagement />} />
              <Route path='/admin/plans' element={<PlansManagement />} />
              <Route path='/admin/settings' element={<SettingPage isAdminMode={true} />} />
            </Route>
            {/* Public landing & auth routes — automatically redirects logged-in users to /home */}
            <Route element={<GuestRoute fallback="/home" />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/settings" element={<SettingPage />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/:bookId/sections" element={<ListSection />} />
              <Route path="/library/:bookId/sections/:sectionId" element={<ListSection />} />
              <Route path="/library/:bookId/:sectionId" element={<ListHadith />} />
              <Route path="/library/:bookId/:sectionId/:hadithId" element={<Study />} />
            </Route>

            {/* Password reset — deliberately unguarded. The link is proof of access to
                the inbox, and it has to open whether or not a session is already
                signed in on this browser. */}
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Onboarding routes */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding/:stepId" element={<Onboarding />} />

            {/* 404 */}
            {<Route path="*" element={<Error_page />} />}
          </Routes>

          {/* Global Subscription/Upgrade Modal — accessible from anywhere */}
          <SubscriptionModal />
        </BrowserRouter>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;