import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

import Home from './pages/Home';
import Library from './pages/Library';
import Study from './pages/Study';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ConfirmEmail from './pages/ConfirmEmail';
import ListSection from './pages/ListSection';
import ListHadith from './pages/ListHadith';
import Onboarding from './pages/Onboarding';
import Plan from './pages/Plan';
import ControlPanel from './pages/admin/ControlPanel';
import Error_page from './pages/Error_page';
import SettingPage from './pages/SettingPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/plan' element={<Plan />} />
          <Route path='/admin/controlpanel' element={<ControlPanel />} />
          {/* Guest-only routes: opening / opens Login page first */}
          <Route element={<GuestRoute fallback="/home" />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/settings" element={<SettingPage />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:bookId/sections" element={<ListSection />} />
            <Route path="/library/:bookId/:sectionId" element={<ListHadith />} />
            <Route path="/library/:bookId/:sectionId/:hadithId" element={<Study />} />
          </Route>

          {/* Onboarding routes */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/:stepId" element={<Onboarding />} />

          {/* 404 */}
          { <Route path="*" element={<Error_page />} /> }
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
