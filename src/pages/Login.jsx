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
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleAuth = () => {
    triggerGoogleAuth();
  };

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
      } else if (savedUser?.isAdmin) {
        navigate('/admin/users', { replace: true });
      } else {
        navigate('/home', { replace: true });
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

        <div
          className="overflow-y-visible md:overflow-y-auto pr-0 md:pr-[3px] h-auto md:h-full md:flex-1 flex flex-col justify-start max-h-none md:max-h-[calc(100%-80px)]"
        >
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="كلمة المرور"
                required
              />
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