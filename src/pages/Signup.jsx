import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import ConfirmEmailAlertModal from '../components/auth/ConfirmEmailAlertModal';
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const inputClass =
  'w-full bg-black/15 border border-white/10 text-white rounded-full h-9 min-h-9 px-4 text-[0.8rem] outline-none placeholder:text-white/40 focus:bg-black/25 focus:border-white/40 transition-colors font-2 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden';

const labelClass = 'block text-[0.8rem] mb-0.5 text-white/90 font-2';
// Password strength helpers 
function checkReqs(pass) {
  return {
    length: pass.length >= 8,
    uppercase: /[A-Z]/.test(pass),
    lowercase: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[@$!%*?&#]/.test(pass),
  };
}

function getStrengthInfo(passedCount) {
  if (passedCount <= 1) {
    return { label: 'ضعيفة جداً', color: '#e74c3c', filledSegments: 1 };
  }
  if (passedCount === 2) {
    return { label: 'ضعيفة', color: '#e67e22', filledSegments: 2 };
  }
  if (passedCount <= 4) {
    return { label: 'متوسطة', color: '#f1c40f', filledSegments: 3 };
  }
  return { label: 'قوية جداً', color: '#2ecc71', filledSegments: 4 };
}

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { handleGoogleSuccess, handleGoogleError, googleLoading, googleError } = useGoogleAuth();

  // form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // API submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // derived password state
  const reqs = checkReqs(password);
  const passedCount = Object.values(reqs).filter(Boolean).length;
  const isMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const handleProceedAfterSignup = () => {
    setShowSuccessModal(false);
    const hasSeenOnboarding = localStorage.getItem('athar_onboarding_seen') === 'true';
    if (hasSeenOnboarding) {
      navigate('/login', { replace: true });
    } else {
      navigate('/onboarding/1', { state: { from: 'signup' } });
    }
  };

  // Registration submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordTouched(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (passedCount < 5) {
      alert('يرجى استيفاء جميع شروط كلمة المرور أولاً.');
      return;
    }
    if (!isMatch) return;

    setIsSubmitting(true);

    try {
      const res = await register({
        name: fullName,
        email,
        password,
        confirmPassword,
      });

      const message = res?.message || 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يُرجى التحقق من صندوق الوارد وتأكيد حسابك.';
      setSuccessMsg(message);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* ── Tab bar ── */}
        <div className="flex bg-white/15 p-1 rounded-xl mb-2.5 gap-1 shrink-0">
          <Link
            to="/login"
            className="flex-1 py-1.5 px-2.5 rounded-lg text-[0.85rem] font-semibold font-2 transition-all duration-300 text-white/70 hover:text-white text-center"
          >
            تسجيل الدخول
          </Link>

          <button
            type="button"
            className="flex-1 py-1.5 px-2.5 rounded-lg text-[0.85rem] font-semibold font-2 transition-all duration-300 cursor-pointer bg-[#f7f9fc] text-[#23566e] shadow-md"
          >
            إنشاء حساب
          </button>
        </div>

        <div className="overflow-y-visible md:overflow-y-auto pr-0 md:pr-[3px] h-auto md:h-full md:flex-1 flex flex-col justify-start max-h-none md:max-h-[calc(100%-80px)]">
          <h2 className="font-1 text-[1.3rem] font-bold mb-2 mt-0 text-center">
            إنشاء حساب
          </h2>

          {(googleError || errorMsg) && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-[0.75rem] p-2 rounded-lg mb-2 text-center font-2">
              {googleError || errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-[0.75rem] p-2 rounded-lg mb-2 text-center font-2">
              {successMsg}
            </div>
          )}

          {/* sign up*/}
          <form onSubmit={handleSubmit} className="h-auto md:h-full flex-1 flex flex-col justify-start gap-1.5 animate-[fadeIn_0.3s_ease]">
            <div className="flex flex-col gap-1.5">
              {/* Full Name */}
              <div className="flex flex-col gap-0.5">
                <label className={labelClass}>الاسم الكامل</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="ادخل اسمك الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-0.5">
                <label className={labelClass}>البريد الإلكتروني</label>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="mail@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-0.5">
                <label className={labelClass}>كلمة المرور</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputClass} ${password ? 'pl-10' : ''}`}
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setIsPasswordTouched(true)}
                    required
                    minLength={8}
                  />
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-0.5">
                <label className={labelClass}>تأكيد كلمة المرور</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`${inputClass} ${confirmPassword ? 'pl-10' : ''}`}
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 text-white/60 hover:text-white transition-colors cursor-pointer focus:outline-none"
                      aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showConfirmPassword ? (
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

              {/* Password strength indicator & match message */}
              {password.length > 0 && (() => {
                const strength = getStrengthInfo(passedCount);

                const hints = [
                  { key: 'length', text: 'يجب أن تكون 8 أحرف على الأقل' },
                  { key: 'uppercase', text: 'أضف حرفاً كبيراً (A-Z)' },
                  { key: 'lowercase', text: 'أضف حرفاً صغيراً (a-z)' },
                  { key: 'number', text: 'أضف رقماً (0-9)' },
                  { key: 'special', text: 'أضف رمزاً خاصاً (@$!%*?&#)' },
                ];
                const firstMissing = hints.find((h) => !reqs[h.key]);

                return (
                  <div className="mt-1 mb-0.5 w-full space-y-1 font-2">
                    {/* Password match message */}
                    {confirmPassword.length > 0 && (
                      <small
                        className={`block text-[0.68rem] font-semibold ${isMatch ? 'text-[#2ecc71]' : 'text-[#ff7675]'}`}
                      >
                        {isMatch ? 'كلمتا المرور متطابقتان' : 'كلمتا المرور غير متطابقتين'}
                      </small>
                    )}

                    {/* Strength indicator: label + 4 segments */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[0.68rem] font-semibold transition-colors duration-300"
                        style={{ color: strength.color }}
                      >
                        قوة كلمة المرور: {strength.label}
                      </span>

                      <div className="flex gap-1 items-center flex-1 max-w-[120px]">
                        {[1, 2, 3, 4].map((seg) => {
                          const isFilled = seg <= strength.filledSegments;
                          return (
                            <div
                              key={seg}
                              className="h-1.5 flex-1 rounded-full transition-all duration-300 border border-white/10"
                              style={{
                                backgroundColor: isFilled ? strength.color : 'rgba(0, 0, 0, 0.25)',
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Dynamic hint */}
                    {firstMissing && (
                      <p
                        className="text-[0.62rem] transition-colors duration-300 m-0"
                        style={{ color: strength.color }}
                      >
                        {firstMissing.text}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Actions & Footer */}
            <div className="flex flex-col gap-1.5 pt-1">
              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[#4A90A4] hover:bg-[#3b7687] disabled:opacity-50 text-white border-0 h-9.5 min-h-9.5 font-semibold text-[0.85rem] font-2 flex items-center justify-center mb-2 transition-colors cursor-pointer"
              >
                {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>

              {/* Divider */}
              <div className="flex items-center my-1.5 gap-2.5">
                <hr className="flex-1 border-white/20" />
                <span className="text-white/60 text-[0.7rem] font-2">أو</span>
                <hr className="flex-1 border-white/20" />
              </div>

              {/* Google register */}
              <div className="w-full flex justify-center my-1.5 items-center min-h-[40px]">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleSuccess(credentialResponse.credential);
                    }
                  }}
                  onError={() => handleGoogleError()}
                  shape="circle"
                  width={280}
                  locale="ar"
                  text="signup_with"
                />
              </div>

              {/* Switch to login */}
              <div className="text-center mt-1.5 text-[0.75rem] text-white/80 font-2">
                لديك حساب بالفعل؟{' '}
                <Link
                  to="/login"
                  className="text-white font-bold no-underline hover:underline font-2"
                >
                  سجل الدخول
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[0.65rem] font-[Tajawal,sans-serif] mt-auto pt-3 pb-1">
              <p className="text-white/50 leading-tight">
                هل تواجه مشكلة؟ تواصل معنا عبر{' '}
                <span className="text-white/70">Athar@gmail.com</span>
              </p>
            </div>
          </form>
        </div>
      </AuthCard>

      {/* Confirm Email Modal */}
      <ConfirmEmailAlertModal
        isOpen={showSuccessModal}
        onClose={handleProceedAfterSignup}
        onConfirm={handleProceedAfterSignup}
        message={successMsg}
      />
    </AuthLayout>
  );
}