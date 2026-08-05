import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../context/AuthContext';
import { IoCheckmarkCircleOutline, IoAlertCircleOutline, IoReloadOutline, IoLogInOutline } from 'react-icons/io5';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmEmail } = useAuth();

  const userId = searchParams.get('userId') || searchParams.get('userid') || searchParams.get('id');
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'invalid'
  const [message, setMessage] = useState('');

  const executeConfirmation = async () => {
    if (!userId || !token) {
      setStatus('invalid');
      setMessage('رابط تأكيد الحساب غير اكتمال، يرجى التأكد من الضغط على الرابط الصحيح في بريدك الإلكتروني.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await confirmEmail(userId, token);
      setStatus('success');
      setMessage(res?.message || 'تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول إلى حسابك.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'فشل تأكيد الحساب. قد يكون الرابط منتهي الصلاحية أو تم استخدامه سابقاً.');
    }
  };

  useEffect(() => {
    executeConfirmation();
  }, [userId, token]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/onboarding/1', { state: { from: 'confirm-email' } });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <AuthLayout>
      <AuthCard>
        {/* Header Tab Bar */}
        <div className="flex bg-white/15 p-1 rounded-xl mb-3 gap-1 shrink-0">
          <Link
            to="/login"
            className="flex-1 py-1.5 px-2.5 rounded-lg text-[0.85rem] font-semibold font-2 transition-all duration-300 text-white/70 hover:text-white text-center"
          >
            تسجيل الدخول
          </Link>
          <div className="flex-1 py-1.5 px-2.5 rounded-lg text-[0.85rem] font-semibold font-2 transition-all duration-300 bg-[#f7f9fc] text-[#23566e] text-center shadow-md">
            تأكيد الحساب
          </div>
        </div>

        {/* Content Box */}
        <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-4">
          {/* Loading state */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <h2 className="font-1 text-[1.2rem] font-bold text-white">
                جاري تأكيد البريد الإلكتروني...
              </h2>
              <p className="text-white/70 text-[0.8rem] font-2">
                يرجى الانتظار لحظات بينما نتحقق من بيانات حسابك.
              </p>
            </div>
          )}

          {/* Success state */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-3 animate-[fadeIn_0.3s_ease]">
              <IoCheckmarkCircleOutline className="text-emerald-400 text-5xl animate-bounce" />
              <h2 className="font-1 text-[1.3rem] font-bold text-white">
                تم التأكيد بنجاح!
              </h2>
              <p className="text-white/90 text-[0.85rem] font-2 bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl">
                {message}
              </p>
              <button
                onClick={() => navigate('/onboarding/1', { state: { from: 'confirm-email' } })}
                className="w-full mt-2 py-2 px-6 rounded-full bg-[#4A90A4] hover:bg-[#3b7687] text-white font-2 text-[0.85rem] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <IoCheckmarkCircleOutline className="text-lg" />
                <span>متابعة للشرح التوضيحي</span>
              </button>
            </div>
          )}

          {/* Error & Invalid state */}
          {(status === 'error' || status === 'invalid') && (
            <div className="flex flex-col items-center gap-3 animate-[fadeIn_0.3s_ease]">
              <IoAlertCircleOutline className="text-rose-400 text-5xl" />
              <h2 className="font-1 text-[1.2rem] font-bold text-white">
                {status === 'invalid' ? 'رابط غير صالح' : 'فشل تأكيد البريد الإلكتروني'}
              </h2>
              <p className="text-white/90 text-[0.82rem] font-2 bg-rose-500/20 border border-rose-500/40 p-3 rounded-xl">
                {message}
              </p>

              <div className="flex flex-col gap-2 w-full mt-2">
                {status === 'error' && (
                  <button
                    onClick={executeConfirmation}
                    className="w-full py-2 px-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white font-2 text-[0.8rem] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <IoReloadOutline className="text-base" />
                    <span>إعادة المحاولة</span>
                  </button>
                )}

                <Link
                  to="/login"
                  className="w-full py-2 px-4 rounded-full bg-[#4A90A4] hover:bg-[#3b7687] text-white font-2 text-[0.85rem] font-semibold flex items-center justify-center gap-2 transition-colors text-center"
                >
                  <IoLogInOutline className="text-lg" />
                  <span>العودة لتسجيل الدخول</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
