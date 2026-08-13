import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const inputClass =
  'w-full bg-black/15 border border-white/10 text-white rounded-full h-9 min-h-9 px-4 text-[0.8rem] outline-none placeholder:text-white/40 focus:bg-black/25 focus:border-white/40 transition-colors font-2';

const labelClass = 'block text-[0.8rem] mb-0.5 text-white/90 font-2';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginGuest } = useAuth();
  const { handleGoogleSuccess, handleGoogleError, googleLoading, googleError } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGuestAuth = () => {
    loginGuest();
    const hasSeenOnboarding = localStorage.getItem('athar_onboarding_seen') === 'true';
    if (hasSeenOnboarding) {
      navigate('/home', { replace: true });
    } else {
      navigate('/onboarding/1', { state: { from: 'guest' } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      let savedUser = null;
      try {
        savedUser = JSON.parse(localStorage.getItem('user'));
      } catch {
        // ignore
      }

      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname, { replace: true });
      } else if (savedUser?.isAdmin || savedUser?.role === 'admin') {
        navigate('/admin/controlpanel', { replace: true });
      } else {
        const hasLoggedInBefore = localStorage.getItem('athar_has_logged_in_before') === 'true';
        if (!hasLoggedInBefore) {
          localStorage.setItem('athar_has_logged_in_before', 'true');
          navigate('/library', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول، يُرجى التحقق من البيانات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedError = googleError || errorMsg;

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex bg-white/15 p-1 rounded-xl mb-2.5 gap-1 shrink-0">
          <button
            type="button"
            className="flex-1 py-1.5 px-2.5 rounded-lg text-[0.85rem] font-semibold font-2 transition-all duration-300 cursor-pointer bg-[#f7f9fc] text-[#23566e] shadow-md"
          >
            تسجيل الدخول
          </button>

          <Link
            to="/signup"
            className="flex-1 py-1.5 px-2.5 rounded-lg text-[0.85rem] font-semibold font-2 transition-all duration-300 text-white/70 hover:text-white text-center"
          >
            إنشاء حساب
          </Link>
        </div>

        <div className="overflow-y-visible md:overflow-y-auto pr-0 md:pr-[3px] h-auto md:h-full md:flex-1 flex flex-col justify-start max-h-none md:max-h-[calc(100%-80px)]">
          <h2 className="font-1 text-[1.3rem] font-bold mb-2 mt-0 text-center">
            تسجيل الدخول
          </h2>

          {displayedError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-[0.75rem] p-2 rounded-lg mb-2 text-center font-2">
              {displayedError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <label className={labelClass}>البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="ادخل البريد الإلكتروني"
                required
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className={labelClass}>كلمة المرور</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} ${password ? 'pl-10' : ''}`}
                  placeholder="كلمة المرور"
                  required
                />
                
                {/* لن تظهر الأيقونة إلا عند كتابة أحرف داخل الحقل */}
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 text-white/60 hover:text-white transition-colors cursor-pointer focus:outline-none"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.074-4.65 5.062-8 10.033-8 4.97 0 8.959 3.35 10.033 8-1.074 4.65-5.062 8-10.033 8-4.97 0-8.959-3.35-10.033-8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="text-left mb-1">
              <button
                type="button"
                className="text-white/80 text-[0.75rem] no-underline hover:underline font-[Cairo,sans-serif] bg-transparent border-0 p-0 cursor-pointer"
              >
                هل نسيت كلمة المرور؟
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#4A90A4] hover:bg-[#3b7687] disabled:opacity-50 text-white border-0 h-9.5 min-h-9.5 font-semibold text-[0.85rem] font-2 flex items-center justify-center mb-2 transition-colors cursor-pointer"
            >
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

            <div className="flex items-center my-1.5 gap-2.5">
              <hr className="flex-1 border-white/20" />
              <span className="text-white/60 text-[0.7rem] font-2">أو</span>
              <hr className="flex-1 border-white/20" />
            </div>

            <div className="w-full flex justify-center my-1.5 overflow-hidden rounded-full font-2">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    handleGoogleSuccess(credentialResponse.credential);
                  }
                }}
                onError={() => handleGoogleError()}
                shape="circle"
                width="100%"
                locale="ar"
                text="continue_with"
              />
            </div>

            <button
              type="button"
              onClick={handleGuestAuth}
              className="w-full py-1.5 rounded-full bg-white/15 border border-white/25 text-white font-2 text-[0.85rem] font-semibold flex items-center justify-center cursor-pointer hover:bg-white/25 transition-colors"
            >
              دخول كضيف
            </button>
          </form>

          <div className="text-center mt-1.5 text-[0.75rem] text-white/80 font-2 pt-3 ">
            ليس لديك حساب؟{' '}
            <Link
              to="/signup"
              className="text-white font-bold no-underline hover:underline font-2"
            >
              انشاء حساب 
            </Link>
          </div>

          <div className="text-center text-[0.65rem] font-[Tajawal,sans-serif] mt-auto pt-3 pb-1">
            <p className="text-white/50 leading-tight">
              هل تواجه مشكلة؟ تواصل معنا عبر{' '}
              <span className="text-white/70">Athar@gmail.com</span>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}