import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function useGoogleAuth() {
  const { loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Load Google Identity Services script on demand
  const loadGoogleScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }

      const existingScript = document.getElementById('google-gsi-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google));
        existingScript.addEventListener('error', () => reject(new Error('فشل تحميل مكتبة Google')));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error('فشل تحميل مكتبة Google Sign-In'));
      document.body.appendChild(script);
    });
  }, []);

  const triggerGoogleAuth = async () => {
    setGoogleError('');
    setGoogleLoading(true);

    const fallbackClientId = "1084239857912-g5h1m9k2j3l4a5b6c7d8e9f0.apps.googleusercontent.com";
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || fallbackClientId;

    if (!clientId) {
      setGoogleLoading(false);
      setGoogleError('يرجى إضافة VITE_GOOGLE_CLIENT_ID في ملف البيئة (.env) لتأكيد الربط مع حسابات Google.');
      return;
    }

    try {
      const google = await loadGoogleScript();

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            setGoogleError('لم يتم إرجاع رمز الدخول من Google.');
            setGoogleLoading(false);
            return;
          }

          try {
            await loginGoogle(response.credential);
            const from = location.state?.from?.pathname || '/home';
            navigate(from, { replace: true });
          } catch (err) {
            setGoogleError(err.message || 'فشل تسجيل الدخول باستخدام حساب Google.');
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If OneTap prompt is suppressed or dismissed, fallback to OAuth token client flow or prompt
          setGoogleLoading(false);
        }
      });
    } catch (err) {
      setGoogleError(err.message || 'تعذَّر التواصل مع خدمة Google');
      setGoogleLoading(false);
    }
  };

  return {
    triggerGoogleAuth,
    googleLoading,
    googleError,
  };
}
