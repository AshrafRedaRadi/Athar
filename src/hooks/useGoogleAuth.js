import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function useGoogleAuth() {
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleError('');
      setGoogleLoading(true);
      try {
        const token = tokenResponse.access_token || tokenResponse.credential || tokenResponse.id_token;
        await loginGoogle(token);
        const from = location.state?.from?.pathname || '/home';
        navigate(from, { replace: true });
      } catch (err) {
        setGoogleError(err.message || 'فشل تسجيل الدخول باستخدام حساب Google.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      setGoogleError('تعذَّر التواصل مع خدمة Google أو تم إلغاء العملية.');
    },
  });

  const triggerGoogleAuth = () => {
    setGoogleError('');
    if (!clientId) {
      setGoogleError('رمز VITE_GOOGLE_CLIENT_ID غير مهيأ. يرجى إضافة Client ID صحيح في ملف .env.');
      return;
    }
    setGoogleLoading(true);
    login();
  };

  return {
    triggerGoogleAuth,
    googleLoading,
    googleError,
  };
}
