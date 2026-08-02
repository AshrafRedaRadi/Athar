import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
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
          setUser(profileData);
          localStorage.setItem('user', JSON.stringify(profileData));
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
        const userData = await apiFetch('/api/Account/profile');
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch {
        setUser({ isGuest: false });
      }
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