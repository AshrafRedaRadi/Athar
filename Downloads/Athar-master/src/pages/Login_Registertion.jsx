import React, { useState } from 'react';

import '../App.css';
import '../css/Login.css';

// استدعاء المكونات بدون التعديل على بنيتها
import Button from '../components/Button';
import Input from '../components/Input';
import UserName from '../components/UserName';
import Password from '../components/Password';
import Email from '../components/Email';
import Gender from '../components/Gender';
import Age from '../components/Age';

export default function Login_Registertion() {
  const [activeTab, setActiveTab] = useState('login');

  // حالات فحص وتحقق كلمة المرور
  const [passValue, setPassValue] = useState('');
  const [confirmPassValue, setConfirmPassValue] = useState('');
  
  // حالة تتبع ما إذا تم لمس خانة كلمة السر والترك بالخارج (Touched / Blurred)
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  // شروط كلمة المرور
  const reqs = {
    length: passValue.length >= 8,
    uppercase: /[A-Z]/.test(passValue),
    lowercase: /[a-z]/.test(passValue),
    number: /[0-9]/.test(passValue),
    special: /[@$!%*?&]/.test(passValue)
  };

  // حساب عدد الشروط المحققة
  const passedCount = Object.values(reqs).filter(Boolean).length;
  const strengthPercentage = passValue.length > 0 ? Math.max((passedCount / 5) * 100, 10) : 0;
  
  // فحص تطابق كلمتي المرور بدقة
  const isMatch = passValue.length > 0 && confirmPassValue.length > 0 && passValue === confirmPassValue;

  // تحديد شرط ظهور القوانين (تظهر إذا بدأ بالكتابة OR لمس الخانة وتركها غير مكتملة)
  const showPasswordRequirements = passValue.length > 0 || (isPasswordTouched && passedCount < 5);

  // تحديد لون الشريط بناءً على القوة
  const getStrengthColor = () => {
    if (passedCount <= 2) return '#e74c3c'; // أحمر
    if (passedCount <= 4) return '#f1c40f'; // أصفر
    return '#2ecc71'; // أخضر
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();

    setIsPasswordTouched(true);

    if (passedCount < 5) {
      alert("يرجى استيفاء جميع شروط كلمة المرور أولاً.");
      return;
    }

    if (!isMatch) {
      return;
    }

    setActiveTab('registerStep2');
  };

  const handleGoogleAuth = () => {
    alert("سيتم التوجيه لتسجيل الدخول عبر Google...");
  };

  return (
    <div className="login-container">
      {/* القسم الأيمن (النماذج) */}
      <div className="right-side" dir="rtl">
        <div className="login-box">
          
          {/* أزرار التنقل العلوية */}
          <div className="toggle-container">
            <button
              type="button"
              className={`toggle-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              className={`toggle-btn ${activeTab.startsWith('register') ? 'active' : ''}`}
              onClick={() => setActiveTab('registerStep1')}
            >
              إنشاء حساب
            </button>
          </div>

          {/* 1. نموذج تسجيل الدخول */}
          {activeTab === 'login' && (
            <div className="form-content active">
              <h2>تسجيل الدخول</h2>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-control login-user-input">
                  <UserName />
                </div>
                
                <div className="form-control">
                  <Password />
                </div>
                
                <div className="forgot-password">
                  <a href="#">هل نسيت كلمة المرور؟</a>
                </div>
                
                <div className="w-full text-center">
                  <Button name="تسجيل الدخول" />
                </div>
                
                <div className="divider">
                  <span>أو</span>
                </div>

                <button
                  type="button"
                  className="btn-google"
                  onClick={handleGoogleAuth}
                >
                  <svg className="google-icon" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>المتابعة باستخدام Google</span>
                </button>

                <button type="button" className="btn-guest">
                  <span className="btn-guest-title">دخول كضيف</span>
                </button>
              </form>
              
              <div className="register-link">
                ليس لديك حساب؟{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('registerStep1'); }}>
                  سجل الآن
                </a>
              </div>
            </div>
          )}

          {/* 2. الخطوة الأولى من إنشاء الحساب */}
          {activeTab === 'registerStep1' && (
            <div className="form-content active">
              <form onSubmit={handleStep1Submit}>
                
                {/* الاسم الكامل */}
                <div className="form-control input-fullname">
                  <Input fieldName="الاسم الكامل" placeholder="ادخل أسمك الكامل" />
                </div>

                {/* البريد الإلكتروني */}
                <div className="form-control input-email-custom">
                  <label>البريد الإلكتروني</label>
                  <Email />
                </div>
                
                {/* كلمة المرور مع تتبع التفاعل عند الإدخال والتلمس */}
                <div 
                  className="form-control input-password-custom" 
                  onInput={(e) => setPassValue(e.target.value)}
                  onBlur={() => setIsPasswordTouched(true)}
                >
                  <Password />
                </div>

                {/* تأكيد كلمة المرور */}
                <div className="form-control input-confirm-pass">
                  <label>تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassValue}
                    onChange={(e) => setConfirmPassValue(e.target.value)}
                    required
                  />
                </div>

                {/* نص المطابقة والشريط التفاعلي (ظاهر بشكل دائم) */}
                <div className="strength-section">
                  {confirmPassValue.length > 0 && (
                    <small className={`match-message ${isMatch ? 'match-success' : 'match-error'}`}>
                      {isMatch ? 'كلمتا المرور متطابقتان' : 'كلمتا المرور غير متطابقتين'}
                    </small>
                  )}

                  <div className="strength-track">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${strengthPercentage}%`,
                        backgroundColor: getStrengthColor()
                      }}
                    ></div>
                  </div>
                </div>

                {/* قائمة الشروط: تظهر فقط عند التفاعل والخطأ وتختفي بالبداية */}
                {showPasswordRequirements && (
                  <ul className="password-requirements">
                    <li className={reqs.length ? 'valid' : ''}>8 أحرف على الأقل</li>
                    <li className={reqs.uppercase ? 'valid' : ''}>حرف كبير (A-Z)</li>
                    <li className={reqs.lowercase ? 'valid' : ''}>حرف صغير (a-z)</li>
                    <li className={reqs.number ? 'valid' : ''}>رقم (0-9)</li>
                    <li className={reqs.special ? 'valid' : ''}>رمز خاص (@$!%*?&)</li>
                  </ul>
                )}

                <div className="w-full text-center my-2">
                  <Button name="التالي" />
                </div>

                <div className="divider">
                  <span>أو</span>
                </div>

                <button
                  type="button"
                  className="btn-google"
                  onClick={handleGoogleAuth}
                >
                  <svg className="google-icon" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>التسجيل بواسطة Google</span>
                </button>
              </form>
              
              <div className="register-link">
                لديك حساب بالفعل؟{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>
                  سجل الدخول
                </a>
              </div>
            </div>
          )}

          {/* 3. الخطوة الثانية من إنشاء الحساب */}
          {activeTab === 'registerStep2' && (
            <div className="form-content active">
              <form onSubmit={(e) => e.preventDefault()}>
                
                <div className="flex-row-grid input-age-gender">
                  <div className="flex-item">
                    <Age />
                  </div>
                  <div className="flex-item">
                    <Gender />
                  </div>
                </div>

                <div className="form-control input-phone">
                  <Input fieldName="رقم الهاتف" placeholder="010********" />
                </div>

                <div className="flex-row-grid input-country-city">
                  <div className="flex-item">
                    <Input fieldName="الدولة" placeholder="فلسطين" />
                  </div>
                  <div className="flex-item">
                    <Input fieldName="المدينة" placeholder="القدس" />
                  </div>
                </div>

                <div className="w-full text-center mt-4 mb-3">
                  <Button name="إتمام التسجيل" />
                </div>

                <button
                  type="button"
                  className="btn-guest mt-2"
                  onClick={() => setActiveTab('registerStep1')}
                >
                  <span className="btn-guest-title">رجوع للخطوة السابقة</span>
                </button>
              </form>
              
              <div className="register-link mt-3">
                لديك حساب بالفعل؟{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>
                  سجل الدخول
                </a>
              </div>
            </div>
          )}

          {/* الفوتر */}
          <div className="footer-links">
            <p>هل تواجه مشكلة؟ تواصل معنا عبر <span className="email">Athar@gmail.com</span></p>
          </div>
        </div>
      </div>

      {/* القسم الأيسر */}
      <div className="left-side">
        <div className="al-aqsa-illustration"></div>
        <svg className="wave-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M70,0 C95,30 55,70 100,100 L100,100 L100,0 Z" fill="#337FA1" />
        </svg>
      </div>
    </div>
  );
}