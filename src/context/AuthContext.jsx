import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

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
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return formatUserData(JSON.parse(savedUser));
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && storedToken !== 'guest-session-token') {
        try {
          const profileData = await apiFetch('/api/Account/profile');
          const formatted = formatUserData(profileData);
          setUser(formatted);
          localStorage.setItem('user', JSON.stringify(formatted));

          // Daily check-in for returning users (fire-and-forget)
          const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
          const lastCheckIn = localStorage.getItem('athar_last_checkin');
          if (lastCheckIn !== today) {
            apiFetch('/api/activity/check-in', { method: 'POST' })
              .then(() => localStorage.setItem('athar_last_checkin', today))
              .catch(() => {}); // silently ignore errors
          }
        } catch {
          logout();
        }
      } else if (storedToken === 'guest-session-token') {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            setUser({ name: 'ضيف أثر', isGuest: true });
          }
        } else {
          setUser({ name: 'ضيف أثر', isGuest: true });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ---------------------------------------------------------------------------
  // Daily check-in helper — fire-and-forget, never blocks login
  // ---------------------------------------------------------------------------
  const performDailyCheckIn = async () => {
    try {
      const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })(); // "YYYY-MM-DD"
      const lastCheckIn = localStorage.getItem('athar_last_checkin');
      if (lastCheckIn === today) return; // already checked in today

      await apiFetch('/api/activity/check-in', { method: 'POST' });
      localStorage.setItem('athar_last_checkin', today);
    } catch {
      // Silently ignore — check-in failure must never block the user
    }
  };

  const login = async (email, password) => {
    const responseData = await apiFetch('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email, 
        password,
      }),
    });

    const newToken = responseData?.token || (typeof responseData === 'string' ? responseData : null);

    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);

      try {
        const profileData = await apiFetch('/api/Account/profile');
        const formatted = formatUserData(profileData);
        localStorage.setItem('user', JSON.stringify(formatted));
        setUser(formatted);
      } catch {
        setUser({ isGuest: false });
      }

      // Daily check-in (fire-and-forget)
      performDailyCheckIn();
    }
    return responseData;
  };

  const register = async (registerData) => {
    return await apiFetch('/api/Auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  };

  const confirmEmail = async (userId, token) => {
    const query = `userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`;
    return await apiFetch(`/api/Auth/confirm-email?${query}`, {
      method: 'GET',
    });
  };

  const loginGoogle = async (idToken) => {
    const responseData = await apiFetch('/api/Auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    const newToken = responseData?.token;
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      try {
        const userData = await apiFetch('/api/Account/profile');
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch {
        setUser({ isGuest: false });
      }

      // Daily check-in (fire-and-forget)
      performDailyCheckIn();
    }
    return responseData;
  };

  const loginGuest = () => {
    const guestUser = { name: 'ضيف أثر', isGuest: true };
    localStorage.setItem('user', JSON.stringify(guestUser));
    setToken('guest-session-token');
    setUser(guestUser);
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = formatUserData({ ...prev, ...newData });
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token) && !user?.isGuest,
    isGuest: Boolean(user?.isGuest),
    isLoading,
    login,
    register,
    confirmEmail,
    loginGoogle,
    loginGuest,
    logout,
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