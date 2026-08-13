import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function useGoogleAuth() {
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleSuccess = async (idToken) => {
    if (!idToken) {
      setGoogleError('لم يتم استلام رمز الهوية من Google.');
      return;
    }
    setGoogleError('');
    setGoogleLoading(true);
    try {
      await loginGoogle(idToken);
      const hasLoggedInBefore = localStorage.getItem('athar_has_logged_in_before') === 'true';
      const defaultTarget = hasLoggedInBefore ? '/home' : '/library';
      localStorage.setItem('athar_has_logged_in_before', 'true');
      const from = location.state?.from?.pathname || defaultTarget;
      navigate(from, { replace: true });
    } catch (err) {
      setGoogleError(err.message || 'فشل تسجيل الدخول باستخدام حساب Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    setGoogleLoading(false);
    setGoogleError(err?.message || 'تعذَّر التواصل مع خدمة Google أو تم إلغاء العملية.');
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
    googleLoading,
    googleError,
  };
}
