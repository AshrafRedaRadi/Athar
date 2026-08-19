import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../context/AuthContext';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { IoCheckmarkCircleOutline, IoAlertCircleOutline, IoLogInOutline } from 'react-icons/io5';

const inputClass =
  'w-full bg-black/15 border border-white/10 text-white rounded-full h-9 min-h-9 px-4 text-[0.8rem] outline-none placeholder:text-white/40 focus:bg-black/25 focus:border-white/40 transition-colors font-2 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden';

const labelClass = 'block text-[0.8rem] mb-0.5 text-white/90 font-2';

const MINIMUM_LENGTH = 6;

/**
 * Lands the link sent by the password reset email, which carries the address and the token
 * as query parameters. Only the two obvious client-side checks are enforced here — that the
 * passwords match and are long enough — because the server owns the complexity rules, and
 * duplicating them badly would reject passwords it would have accepted.
 */
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  // URLSearchParams decodes these, so they arrive as the server encoded them.
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('form'); // 'form' | 'success'
  const [error, setError] = useState('');

  const hasLink = Boolean(email && token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < MINIMUM_LENGTH) {
      setError(`كلمة المرور يجب ألا تقل عن ${MINIMUM_LENGTH} أحرف.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ email, token, newPassword, confirmPassword });
      setStatus('success');
      setTimeout(() => navigate('/login', { state: { from: 'reset-password' } }), 3000);
    } catch (err) {
      // Surfaced as the server worded it: it is the authority on password strength and on
      // whether the link has already been used or has expired.
      setError(err.message || 'تعذّر إعادة ضبط كلمة المرور. قد يكون الرابط منتهي الصلاحية أو تم استخدامه.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordField = (label, value, setValue, show, setShow, placeholder) => (
    <div className="flex flex-col gap-0.5">
      <label className={labelClass}>{label}</label>
      <div className="relative flex items-center">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${inputClass} ${value ? 'pl-11' : ''}`}
          placeholder={placeholder}
          required
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute left-2.5 p-1 rounded-full text-cyan-200 hover:text-white bg-black/20 hover:bg-black/40 border border-white/20 transition-all cursor-pointer focus:outline-none flex items-center justify-center shadow-xs"
            aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {show ? (
              <HiOutlineEyeSlash className="w-4 h-4 text-cyan-100" />
            ) : (
              <HiOutlineEye className="w-4 h-4 text-cyan-100" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col justify-center h-full gap-3" dir="rtl">
          <div className="text-center">
            <h1 className="text-white text-lg font-bold font-1">إعادة ضبط كلمة المرور</h1>
            {hasLink && status === 'form' && (
              <p className="text-white/70 text-[0.78rem] mt-1 font-2 break-all">
                لحساب: {email}
              </p>
            )}
          </div>

          {!hasLink ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <IoAlertCircleOutline className="w-12 h-12 text-amber-300" />
              <p className="text-white/85 text-[0.82rem] font-2 leading-relaxed">
                رابط إعادة الضبط غير مكتمل. افتح الرابط كما وصلك في بريدك الإلكتروني، أو اطلب
                رابطاً جديداً من صفحة تسجيل الدخول.
              </p>
              <Link
                to="/login"
                className="w-full h-9 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-[0.82rem] font-bold font-2 flex items-center justify-center gap-2 transition-colors"
              >
                <IoLogInOutline className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : status === 'success' ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <IoCheckmarkCircleOutline className="w-12 h-12 text-emerald-300" />
              <p className="text-white/85 text-[0.82rem] font-2 leading-relaxed">
                تم تغيير كلمة المرور بنجاح. سيتم تحويلك إلى صفحة تسجيل الدخول.
              </p>
              <Link
                to="/login"
                className="w-full h-9 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-[0.82rem] font-bold font-2 flex items-center justify-center gap-2 transition-colors"
              >
                <IoLogInOutline className="w-4 h-4" />
                تسجيل الدخول الآن
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              {renderPasswordField(
                'كلمة المرور الجديدة',
                newPassword,
                setNewPassword,
                showNew,
                setShowNew,
                'كلمة المرور الجديدة'
              )}
              {renderPasswordField(
                'تأكيد كلمة المرور',
                confirmPassword,
                setConfirmPassword,
                showConfirm,
                setShowConfirm,
                'أعد كتابة كلمة المرور'
              )}

              <p className="text-white/55 text-[0.7rem] font-2 leading-relaxed">
                يُفضّل ألا تقل عن {MINIMUM_LENGTH} أحرف وأن تجمع بين حرف كبير وحرف صغير ورقم
                ورمز.
              </p>

              {error && (
                <div className="flex items-start gap-2 bg-rose-500/15 border border-rose-400/30 rounded-xl px-3 py-2">
                  <IoAlertCircleOutline className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                  <p className="text-rose-100 text-[0.75rem] font-2 leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white text-[0.82rem] font-bold font-2 transition-colors mt-1"
              >
                {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور'}
              </button>

              <Link
                to="/login"
                className="text-cyan-200 hover:text-white text-[0.75rem] font-2 text-center transition-colors"
              >
                العودة لتسجيل الدخول
              </Link>
            </form>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
