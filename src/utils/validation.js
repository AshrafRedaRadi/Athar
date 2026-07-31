// src/utils/validation.js

export const validateEmail = (email) => {
  if (!email) return "البريد الإلكتروني مطلوب";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "البريد الإلكتروني غير صحيح";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "كلمة المرور مطلوبة";
  if (password.length < 8) return "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
  if (!/[A-Z]/.test(password)) return "يجب أن تحتوي على حرف كبير واحد على الأقل";
  if (!/[a-z]/.test(password)) return "يجب أن تحتوي على حرف صغير واحد على الأقل";
  if (!/[0-9]/.test(password)) return "يجب أن تحتوي على رقم واحد على الأقل";
  if (!/[@$!%*?&]/.test(password)) return "يجب أن تحتوي على رمز خاص (@$!%*?&)";
  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "تأكيد كلمة المرور مطلوب";
  if (password !== confirmPassword) return "كلمتا المرور غير متطابقتين";
  return "";
};

export const validateUsername = (username) => {
  if (!username) return "اسم المستخدم مطلوب";
  if (username.length < 3 || username.length > 30) return "يجب أن يكون بين 3 و 30 حرفاً";
  if (!/^[A-Za-z0-9\-]+$/.test(username)) return "يحتوي فقط على حروف، أرقام و شرطة (-)";
  return "";
};