import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d1f2d] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-emerald-100/80 dir-rtl font-2">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function GuestRoute({ children, fallback = '/home' }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    let defaultTarget = fallback;
    if (user?.isAdmin || user?.role === 'admin') {
      defaultTarget = '/admin/controlpanel';
    } else if (user?.isGuest) {
      defaultTarget = '/home';
    }
    
    const destination = location.state?.from?.pathname || defaultTarget;
    return <Navigate to={destination} replace />;
  }

  return children ? children : <Outlet />;
}
