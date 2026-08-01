import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../context/AuthContext';

/* ── Google SVG icon ── */
function GoogleIcon() {
  return (
    <svg className="w-[14px] h-[14px]" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

/* ── Shared auth input styling ── */
const inputClass =
  'w-full bg-black/15 border border-white/10 text-white rounded-full h-8 min-h-8 px-3.5 text-[0.78rem] outline-none placeholder:text-white/40 focus:bg-black/25 focus:border-white/40 transition-colors font-2';

/* ── Shared label styling ── */
const labelClass = 'block text-[0.75rem] mb-0.5 text-white/90 font-2';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleGoogleAuth = () => {
    alert('سيتم التوجيه لتسجيل الدخول عبر Google...');
  };

  const handleGuestAuth = () => {
    navigate('/onboarding/1', { state: { from: 'guest' } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login('sample-auth-token', { name: 'User' });
    const from = location.state?.from?.pathname || '/home';
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* ── Tab bar ── */}
        <div className="flex bg-white/15 p-1 rounded-xl mb-2 gap-1 shrink-0">
          {/* Login tab — active */}
          <button
            type="button"
            className="flex-1 py-1 px-2 rounded-lg text-[0.8rem] font-semibold font-2 transition-all duration-300 cursor-pointer bg-[#f7f9fc] text-[#23566e] shadow-md"
          >
            تسجيل الدخول
          </button>

          {/* Signup tab — inactive → navigate to /signup */}
          <Link
            to="/signup"
            className="flex-1 py-1 px-2 rounded-lg text-[0.8rem] font-semibold font-2 transition-all duration-300 text-white/70 hover:text-white text-center"
          >
            إنشاء حساب
          </Link>
        </div>

        {/* ── Form content container (No scrollbar, scaled to fit) ── */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden py-1">
          <div>
            <h2 className="font-1 text-[1.15rem] font-bold mb-2">
              تسجيل الدخول
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
              {/* Email / Username */}
              <div className="flex flex-col gap-0.5">
                <label className={labelClass}>البريد الإلكتروني أو اسم المستخدم</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="ادخل البريد الإلكتروني أو اسم المستخدم"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-0.5">
                <label className={labelClass}>كلمة المرور</label>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="كلمة المرور"
                  required
                  minLength={8}
                />
              </div>

              {/* Forgot password */}
              <div className="text-left mb-0.5">
                <a
                  href="#"
                  className="text-white/80 text-[0.72rem] no-underline hover:underline font-2"
                >
                  هل نسيت كلمة المرور؟
                </a>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="w-full rounded-full bg-[#4A90A4] hover:bg-[#3b7687] text-white border-0 h-8.5 min-h-8.5 font-semibold text-[0.82rem] font-2 flex items-center justify-center my-1 transition-colors cursor-pointer"
              >
                تسجيل الدخول
              </button>

              {/* Divider */}
              <div className="flex items-center my-1 gap-2">
                <hr className="flex-1 border-white/20" />
                <span className="text-white/60 text-[0.68rem] font-2">أو</span>
                <hr className="flex-1 border-white/20" />
              </div>

              {/* Google login */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-1.5 px-3 bg-white text-[#333] border-0 rounded-full font-2 text-[0.78rem] font-semibold cursor-pointer flex items-center justify-center gap-2 mb-1 hover:bg-gray-100 shadow-sm transition-colors"
              >
                <GoogleIcon />
                <span>المتابعة باستخدام Google</span>
              </button>

              {/* Guest login */}
              <button
                type="button"
                onClick={handleGuestAuth}
                className="w-full py-1.5 rounded-full bg-white/15 border border-white/25 text-white font-2 text-[0.8rem] font-semibold flex items-center justify-center cursor-pointer hover:bg-white/25 transition-colors"
              >
                دخول كضيف
              </button>
            </form>
          </div>

          {/* Bottom info & Switch to signup */}
          <div className="space-y-1 pt-1">
            <div className="text-center text-[0.72rem] text-white/80 font-2">
              ليس لديك حساب؟{' '}
              <Link
                to="/signup"
                className="text-white font-bold no-underline hover:underline font-2"
              >
                سجل الآن
              </Link>
            </div>

            <div className="text-center text-[0.62rem] font-2">
              <p className="text-white/50 leading-tight">
                هل تواجه مشكلة؟ تواصل معنا عبر{' '}
                <span className="text-white/70">Athar@gmail.com</span>
              </p>
            </div>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
