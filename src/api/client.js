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
        if (rawMsg === "Invalid email or password.") {
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        }
        throw new Error(rawMsg || "بيانات تسجيل الدخول غير صحيحة.");
      }

      const serverMsg = resData?.msg || resData?.message;
      throw new Error(serverMsg || "انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول لمتابعة التعلم");
    }

    if (!response.ok) {
      let errorMsg = resData?.msg || resData?.message;
      if (errorMsg === "Email is not confirmed. Please confirm your email first.") {
        errorMsg = "البريد الإلكتروني غير مؤكد. يرجى تأكيد حسابك من خلال الرابط المرسل إلى بريدك الإلكتروني أولاً.";
      }
      throw new Error(errorMsg || "تعذَّر الاتصال بخدمة أثر حالياً، يرجى المحاولة لاحقاً");
    }

    // Unpack backend response wrapper { isSuccess, data, message } if present
    if (resData && typeof resData === "object" && "isSuccess" in resData) {
      if (!resData.isSuccess) {
        throw new Error(resData.message || "عذراً، تعذَّر إكمال الطلب في الوقت الحالي");
      }
      return resData.data;
    }

    return resData;
  } catch (error) {
    if (error.name === "TypeError" || error.message?.includes("fetch")) {
      throw new Error("تعذَّر الاتصال بالشبكة، يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً");
    }
    throw error;
  }
}
