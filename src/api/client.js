/**
 * Athar API Client
 * Base URL and HTTP fetch wrapper configured according to Athar API handoff specs.
 */

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "https://atharai.runasp.net";

/**
 * Returns full URL for relative image paths (e.g. coverImageUrl)
 * @param {string} relativePath - e.g. "/uploads/books/example.webp"
 * @returns {string|null} - e.g. "https://atharai.runasp.net/uploads/books/example.webp"
 */
export function getImageUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }
  return `${API_BASE_URL}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
}

/**
 * Translate raw English backend error messages into user-friendly Arabic
 */
export function translateServerError(rawMsg) {
  if (!rawMsg) return "تعذَّر إكمال العملية حالياً، يرجى المحاولة لاحقاً";
  const s = String(rawMsg).toLowerCase();

  if (s.includes("already registered") || s.includes("already exists") || s.includes("is taken") || s.includes("duplicateemail")) {
    return "هذا البريد الإلكتروني مسجل بالفعل لدى حساب آخر.";
  }
  if (s.includes("invalid email or password")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (s.includes("email is not confirmed")) {
    return "البريد الإلكتروني غير مؤكد. يرجى تأكيد حسابك من خلال الرابط المرسل إلى بريدك أولاً.";
  }
  if (s.includes("non alphanumeric") || s.includes("passwords must have")) {
    return "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص (@$!%*?&).";
  }
  if (s.includes("passwordtooshort") || s.includes("password is too short")) {
    return "كلمة المرور قصيرة جداً، يرجى استخدام 6 أحرف/أرقام على الأقل.";
  }
  if (s.includes("user not found") || s.includes("usernotfound")) {
    return "لم يتم العثور على هذا المستخدم.";
  }
  if (s.includes("unauthorized") || s.includes("token")) {
    return "انتهت جلسة التسجيل، يرجى إعادة تسجيل الدخول لمتابعة العمل.";
  }
  if (s === "bad request") {
    return "بيانات الطلب غير صحيحة، يرجى مراجعة المدخلات والمحاولة مجدداً.";
  }

  return rawMsg;
}

/**
 * Core fetch wrapper with auth header, error handling, and 401 redirect support.
 * @param {string} endpoint - e.g. "/api/HadithBooks"
 * @param {object} options - fetch options
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    let resData = null;
    if (contentType && contentType.includes("application/json")) {
      try {
        resData = await response.json();
      } catch {
        resData = null;
      }
    } else {
      resData = await response.text();
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");

      if (endpoint.includes("/api/Auth/login")) {
        const rawMsg = resData?.msg || resData?.message;
        throw new Error(translateServerError(rawMsg || "Invalid email or password."));
      }

      const serverMsg = resData?.msg || resData?.message;
      throw new Error(translateServerError(serverMsg || "انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول لمتابعة التعلم"));
    }

    if (!response.ok) {
      let errorMsg = resData?.msg || resData?.message;
      if (!errorMsg && resData?.errors && typeof resData.errors === "object") {
        const errList = Object.values(resData.errors).flat().filter(Boolean);
        if (errList.length > 0) {
          errorMsg = errList.join(" | ");
        }
      }
      throw new Error(translateServerError(errorMsg || "تعذَّر إكمال العملية حالياً، يرجى المحاولة لاحقاً"));
    }

    // Unpack backend response wrapper { isSuccess, data, message } if present
    if (resData && typeof resData === "object" && "isSuccess" in resData) {
      if (!resData.isSuccess) {
        throw new Error(translateServerError(resData.message || "عذراً، تعذَّر إكمال الطلب في الوقت الحالي"));
      }
      return resData.data;
    }

    return resData;
  } catch (error) {
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      throw new Error("تعذَّر الاتصال بالسيرفر حالياً، يرجى التأكد من اتصالك بالإنترنت أو المحاولة لاحقاً");
    }
    throw error;
  }
}
