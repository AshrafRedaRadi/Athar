import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAccessToken, refreshAccessToken, onTokenChange, getAccessToken } from '../api/client';

const AuthContext = createContext(null);

const formatUserData = (profileData) => {
  if (!profileData) return null;
  const userRole = profileData.role || (Array.isArray(profileData.roles) ? profileData.roles[0] : null) || 'User';
  const roleStr = String(userRole).toLowerCase();
  const isAdmin =
    roleStr.includes('admin') ||
    roleStr.includes('أدمن') ||
    roleStr.includes('مشرف') ||
    profileData.isAdmin === true;

  return { ...profileData, role: userRole, isAdmin };
};

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحديث التوكن في الـ State والـ Client معاً
  const updateToken = (newToken) => {
    setTokenState(newToken);
    if (newToken !== getAccessToken()) {
      setAccessToken(newToken);
    }
  };

  // ---------------------------------------------------------------------------
  // Daily check-in helper — fire-and-forget, never blocks login
  // ---------------------------------------------------------------------------
  const performDailyCheckIn = async (authToken) => {
    try {
      const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })(); // "YYYY-MM-DD"
      const lastCheckIn = localStorage.getItem('athar_last_checkin');
      if (lastCheckIn === today) return; // already checked in today

      await apiFetch('/api/activity/check-in', {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      localStorage.setItem('athar_last_checkin', today);
    } catch {
      // Silently ignore — check-in failure must never block the user
    }
  };

  useEffect(() => {
    onTokenChange((newToken) => {
      setTokenState(newToken);
      if (!newToken) {
        setUser(null);
      }
    });
  }, []);

  // التحقق من الجلسة المخزنة في الكوكيز عند فتح التطبيق
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // 1. تجديد التوكن عبر الـ HttpOnly Cookie
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken && isMounted) {
          updateToken(newAccessToken);
          
          // 2. جلب بيانات المستخدم بالتوكن الجديد
          const profileData = await apiFetch('/api/Account/profile', {
            headers: { Authorization: `Bearer ${newAccessToken}` }
          });
          
          if (isMounted) {
            setUser(formatUserData(profileData));
          }

          // Daily check-in
          const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
          const lastCheckIn = localStorage.getItem('athar_last_checkin');
          if (lastCheckIn !== today) {
            apiFetch('/api/activity/check-in', { 
              method: 'POST',
              headers: { Authorization: `Bearer ${newAccessToken}` }
            })
              .then(() => localStorage.setItem('athar_last_checkin', today))
              .catch(() => {});
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          updateToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // تسجيل الدخول العادي
  const login = async (email, password, rememberMe = true) => {
    const responseData = await apiFetch('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const newToken = responseData?.data?.accessToken || responseData?.accessToken || responseData?.token || (typeof responseData === 'string' ? responseData : null);

    if (newToken) {
      updateToken(newToken);
      try {
        const profileData = await apiFetch('/api/Account/profile', {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        setUser(formatUserData(profileData));
      } catch {
        setUser(null);
      }
      performDailyCheckIn(newToken);
    }
    return responseData;
  };

  const register = async (registerData) => {
    return await apiFetch('/api/Auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  };

  // إرسال رابط إعادة ضبط كلمة المرور إلى البريد الإلكتروني
  const forgotPassword = async (emailAddress) => {
    return await apiFetch('/api/Auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: emailAddress }),
    });
  };

  const confirmEmail = async (userId, tokenParam) => {
    const query = `userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(tokenParam)}`;
    return await apiFetch(`/api/Auth/confirm-email?${query}`, {
      method: 'GET',
    });
  };

  // تسجيل الدخول بجوجل
  const loginGoogle = async (idToken, rememberMe = true) => {
    const responseData = await apiFetch('/api/Auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken, rememberMe }),
    });

    const newToken = responseData?.data?.accessToken || responseData?.accessToken || responseData?.token || (typeof responseData === 'string' ? responseData : null);
    if (newToken) {
      updateToken(newToken);
      try {
        const userData = await apiFetch('/api/Account/profile', {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        setUser(formatUserData(userData));
      } catch {
        setUser(null);
      }
      performDailyCheckIn(newToken);
    }
    return responseData;
  };

  // تسجيل الخروج من الجهاز الحالي
  const logout = async () => {
    try {
      await apiFetch('/api/Auth/logout', {
        method: 'POST',
      });
    } catch {}
    updateToken(null);
    setUser(null);
  };

  // تسجيل الخروج من كل الأجهزة
  const logoutAll = async () => {
    try {
      await apiFetch('/api/Auth/logout-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-CSRF-Token': 'athar-spa-v1',
        },
      });
    } catch {}
    updateToken(null);
    setUser(null);
  };

  const updateUser = (newData) => {
    setUser((prev) => formatUserData({ ...prev, ...newData }));
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isGuest: false,
    isLoading,
    login,
    register,
    forgotPassword,
    confirmEmail,
    loginGoogle,
    logout,
    logoutAll,
    refreshAccessToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;