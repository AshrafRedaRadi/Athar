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

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      throw new Error("انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول لمتابعة التعلم");
    }

    const contentType = response.headers.get("content-type");
    let resData = null;
    if (contentType && contentType.includes("application/json")) {
      resData = await response.json();
    } else {
      resData = await response.text();
    }

    if (!response.ok) {
      const errorMsg = resData?.msg || resData?.message || "تعذَّر الاتصال بخدمة أثر حالياً، يرجى المحاولة لاحقاً";
      throw new Error(errorMsg);
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
