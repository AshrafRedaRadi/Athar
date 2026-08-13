import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 text-base-content dir-rtl font-2">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-cyan-600/20 border-t-cyan-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-base-content/80">جاري التحقق من صلاحيات المدير...</p>
      </div>
    </div>
  );
}

/**
 * AdminRoute Guard - Restricts access strictly to users with Admin role.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if current user has Admin privileges
  const isAdmin = Boolean(isAuthenticated) && Boolean(user?.isAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Redirect non-admin regular users to home
    return <Navigate to="/home" replace />;
  }

  // Save the last visited admin route so Navbar can return the user here
  React.useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      localStorage.setItem('lastAdminRoute', location.pathname);
    }
  }, [location.pathname]);

  return children ? children : <Outlet />;
}
