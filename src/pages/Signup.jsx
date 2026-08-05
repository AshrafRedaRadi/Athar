import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

/* ── Google SVG icon ── */
function GoogleIcon() {
  return (
    <svg className="w-[14px] h-[14px]" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

/* ── Shared styling helpers ── */
const inputClass =
  'w-full bg-black/15 border border-white/10 text-white rounded-full h-8 min-h-8 px-3.5 text-[0.78rem] outline-none placeholder:text-white/40 focus:bg-black/25 focus:border-white/40 transition-colors font-2';

const labelClass = 'block text-[0.72rem] mb-0.5 text-white/90 font-2';

/* ── Password strength helpers ── */
function checkReqs(pass) {
  return {
    length: pass.length >= 8,
    uppercase: /[A-Z]/.test(pass),
    lowercase: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[@$!%*?&]/.test(pass),
  };
}

function getStrengthColor(passedCount) {
  if (passedCount <= 2) return '#e74c3c';
  if (passedCount <= 4) return '#f1c40f';
  return '#2ecc71';
}

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { triggerGoogleAuth, googleLoading, googleError } = useGoogleAuth();

  // multi-step state
  const [step, setStep] = useState(1); // 1 | 2

  // step 1 fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  // step 2 fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  // API submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // derived password state
  const reqs = checkReqs(password);
  const passedCount = Object.values(reqs).filter(Boolean).length;
  const strengthPercentage = password.length > 0 ? Math.max((passedCount / 5) * 100, 10) : 0;
  const isMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const handleGoogleAuth = () => {
    triggerGoogleAuth();
  };

  /* ── Step 1 submit ── */
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setIsPasswordTouched(true);

    if (passedCount < 5) {
      alert('يرجى استيفاء جميع شروط كلمة المرور أولاً.');
      return;
    }
    if (!isMatch) return;

    setStep(2);
  };

  /* ── Step 2 submit ── */
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await register({
        name: fullName,
        email,
        password,
        confirmPassword,
      });

      const message = res?.message || 'تم إنشاء الحساب بنجاح! يُرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.';
      setSuccessMsg(message);

      setTimeout(() => {
        navigate('/onboarding/1', { state: { from: 'signup' } });
      }, 2000);
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
        <div className="flex bg-white/15 p-1 rounded-xl mb-2 gap-1 shrink-0">
          {/* Login tab — inactive → navigate to /login */}
          <Link
            to="/login"
            className="flex-1 py-1 px-2 rounded-lg text-[0.8rem] font-semibold font-2 transition-all duration-300 text-white/70 hover:text-white text-center"
          >
            تسجيل الدخول
          </Link>

          {/* Signup tab — active */}
          <button
            type="button"
            className="flex-1 py-1 px-2 rounded-lg text-[0.8rem] font-semibold font-2 transition-all duration-300 cursor-pointer bg-[#f7f9fc] text-[#23566e] shadow-md"
          >
            إنشاء حساب
          </button>
        </div>

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

        {/* ── Form content container (No scrollbar, scaled to fit) ── */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden py-1">
          <h2 className="font-1 text-[1.3rem] font-bold mb-2 mt-0">
            إنشاء حساب
          </h2>

          {/* ═══════════════════════════════════════ STEP 1 ═══════════════════════════════════════ */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="flex-1 flex flex-col justify-between animate-[fadeIn_0.3s_ease]">
              <div className="space-y-1">
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
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setIsPasswordTouched(true)}
                    required
                    minLength={8}
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-0.5">
                  <label className={labelClass}>تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Password validation & strength (shown only when user starts typing password) */}
                {password.length > 0 && (
                  <>
                    {/* Match message + Strength track */}
                    <div className="mt-1 mb-1 w-full">
                      {confirmPassword.length > 0 && (
                        <small
                          className={`block text-[0.68rem] font-2 mb-0.5 font-semibold ${
                            isMatch ? 'text-[#2ecc71]' : 'text-[#ff7675]'
                          }`}
                        >
                          {isMatch ? 'كلمتا المرور متطابقتان' : 'كلمتا المرور غير متطابقتين'}
                        </small>
                      )}

                      {/* Strength track */}
                      <div className="w-full h-1 bg-black/25 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full rounded-full transition-all duration-[350ms] ease-in-out"
                          style={{
                            width: `${strengthPercentage}%`,
                            backgroundColor: getStrengthColor(passedCount),
                          }}
                        />
                      </div>
                    </div>

                    {/* Password requirements checklist (Compact 2-column Grid) */}
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 list-none p-0 mt-0.5 text-[0.62rem] font-2">
                      {[
                        { key: 'length', label: '8 أحرف على الأقل' },
                        { key: 'uppercase', label: 'حرف كبير (A-Z)' },
                        { key: 'lowercase', label: 'حرف صغير (a-z)' },
                        { key: 'number', label: 'رقم (0-9)' },
                        { key: 'special', label: 'رمز خاص (@$!%*?&)' },
                      ].map(({ key, label }) => (
                        <li
                          key={key}
                          className={`relative pr-3 transition-colors duration-300 ${
                            reqs[key] ? 'text-[#2ecc71]' : 'text-[#ff7675]'
                          }`}
                        >
                          <span className="absolute right-0 text-[0.55rem]">
                            {reqs[key] ? '✔' : '✖'}
                          </span>
                          {label}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Step 1 Actions & Footer */}
              <div className="space-y-1 pt-1">
                {/* Next button */}
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#4A90A4] hover:bg-[#3b7687] text-white border-0 h-8.5 min-h-8.5 font-semibold text-[0.82rem] font-2 flex items-center justify-center transition-colors cursor-pointer"
                >
                  التالي
                </button>

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <hr className="flex-1 border-white/20" />
                  <span className="text-white/60 text-[0.68rem] font-2">أو</span>
                  <hr className="flex-1 border-white/20" />
                </div>

                {/* Google register */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full py-1.5 px-3 bg-white text-[#333] border-0 rounded-full font-2 text-[0.78rem] font-semibold cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-100 shadow-sm transition-colors disabled:opacity-50"
                >
                  <GoogleIcon />
                  <span>{googleLoading ? 'جاري الاتصال بـ Google...' : 'التسجيل بواسطة Google'}</span>
                </button>

                {/* Switch to login */}
                <div className="text-center text-[0.72rem] text-white/80 font-2">
                  لديك حساب بالفعل؟{' '}
                  <Link
                    to="/login"
                    className="text-white font-bold no-underline hover:underline font-2"
                  >
                    سجل الدخول
                  </Link>
                </div>

                {/* Footer */}
                <div className="text-center text-[0.62rem] font-2">
                  <p className="text-white/50 leading-tight">
                    هل تواجه مشكلة؟ تواصل معنا عبر{' '}
                    <span className="text-white/70">Athar@gmail.com</span>
                  </p>
                </div>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════ STEP 2 ═══════════════════════════════════════ */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="flex-1 flex flex-col justify-between animate-[fadeIn_0.3s_ease]">
              <div className="space-y-1.5">
                {/* Age + Gender row */}
                <div className="flex gap-2 w-full items-end">
                  {/* Age */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className={labelClass}>السن</label>
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="السن"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min={5}
                      max={100}
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className={labelClass}>الجنس</label>
                    <div className="flex gap-2 bg-black/15 border border-white/10 rounded-full h-8 items-center px-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={gender === 'male'}
                          onChange={(e) => setGender(e.target.value)}
                          className="radio radio-xs radio-info"
                          required
                        />
                        <span className="text-white text-[0.75rem] font-2">ذكر</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={gender === 'female'}
                          onChange={(e) => setGender(e.target.value)}
                          className="radio radio-xs radio-info"
                        />
                        <span className="text-white text-[0.75rem] font-2">أنثى</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-0.5">
                  <label className={labelClass}>رقم الهاتف</label>
                  <input
                    type="tel"
                    className={inputClass}
                    placeholder="010********"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Country + City row */}
                <div className="flex gap-2 w-full items-end">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className={labelClass}>الدولة</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="فلسطين"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className={labelClass}>المدينة</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="القدس"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 2 Actions & Footer */}
              <div className="space-y-1.5 pt-2">
                {/* Complete registration button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#4A90A4] hover:bg-[#3b7687] disabled:opacity-50 text-white border-0 h-8.5 min-h-8.5 font-semibold text-[0.82rem] font-2 flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'جاري التسجيل...' : 'إتمام التسجيل'}
                </button>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-1.5 rounded-full bg-white/15 border border-white/25 text-white font-2 text-[0.8rem] font-semibold flex items-center justify-center cursor-pointer hover:bg-white/25 transition-colors"
                >
                  رجوع للخطوة السابقة
                </button>

                {/* Switch to login */}
                <div className="text-center text-[0.72rem] text-white/80 font-2">
                  لديك حساب بالفعل؟{' '}
                  <Link
                    to="/login"
                    className="text-white font-bold no-underline hover:underline font-2"
                  >
                    سجل الدخول
                  </Link>
                </div>

                {/* Footer */}
                <div className="text-center text-[0.62rem] font-2">
                  <p className="text-white/50 leading-tight">
                    هل تواجه مشكلة؟ تواصل معنا عبر{' '}
                    <span className="text-white/70">Athar@gmail.com</span>
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
