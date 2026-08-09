import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

import AdminRoute from './components/auth/AdminRoute';

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
import Achievements from './pages/Achievements';
import ControlPanel from './pages/admin/ControlPanel';
import ContentManagement from './pages/admin/ContentManagement';
import UsersManagement from './pages/admin/UsersManagement';
import Error_page from './pages/Error_page';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Admin routes protected by AdminRoute */}
          <Route element={<AdminRoute />}>
            <Route path='/admin/controlpanel' element={<ControlPanel />} />
            <Route path='/admin/content' element={<ContentManagement />} />
            <Route path='/admin/users' element={<UsersManagement />} />
          </Route>
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
<<<<<<< HEAD
            <Route path="/achievements" element={<Achievements />} />
=======
            <Route path='/plan' element={<Plan />} />
>>>>>>> 3875c3597f7e705128fd7899947c723b6e5422e0
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