/**
 * Athar API Client
 * Base URL and HTTP fetch wrapper configured according to Athar API handoff specs.
 */

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "https://atharai.runasp.net";

let inMemoryToken = null;
let refreshPromise = null;
let tokenChangeListener = null;

export function onTokenChange(listener) {
  tokenChangeListener = listener;
}

export function setAccessToken(token) {
  inMemoryToken = token;
  if (tokenChangeListener) {
    tokenChangeListener(token);
  }
}

export function getAccessToken() {
  return inMemoryToken;
}

/**
 * Returns full URL for relative image paths (e.g. coverImageUrl)
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

  if ((s.includes("email") && (s.includes("already registered") || s.includes("already exists") || s.includes("is taken"))) || s.includes("duplicateemail")) {
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
  if (s.includes("chat model is temporarily unavailable") || s.includes("temporarily unavailable")) {
    return "نموذج المحادثة الذكي غير متاح مؤقتاً في السيرفر، يرجى المحاولة بعد قليل أو الضغط على إعادة المحاولة.";
  }
  if (s.includes("payments are not configured yet")) {
    return "بوابة الدفع غير مهيأة حالياً في النظام.";
  }
  if (s.includes("verified email address is required")) {
    return "يلزم وجود بريد إلكتروني مؤكد لإتمام عملية الدفع.";
  }
  if (s.includes("phone number is required")) {
    return "يلزم إدخال رقم الهاتف لإتمام عملية الدفع.";
  }
  if (s.includes("subscription price is not available")) {
    return "سعر الاشتراك المحدد غير متوفر للشراء حالياً.";
  }
  if (s.includes("already have an active paid subscription")) {
    return "لديك بالفعل اشتراك مدفوع نشط حالياً.";
  }
  if (s.includes("payment checkout is already pending")) {
    return "توجد عملية دفع قيد الانتظار بالفعل، يرجى إتمامها أو الانتظار حتى تنتهي صلاحيتها.";
  }
  if (s.includes("payment checkout could not be created")) {
    return "تعذَّر إنشاء جلسة الدفع حالياً، يرجى المحاولة لاحقاً.";
  }
  if (s.includes("premium_feature_required")) {
    return "هذه الميزة تتطلب اشتراكاً مدفوعاً.";
  }
  if (s.includes("daily_recitation_limit_reached")) {
    return "لقد استنفدت حصتك اليومية من جلسات التسميع. يمكنك ترقية باقتك للحصول على جلسات أكثر.";
  }
  if (s === "bad request") {
    return "بيانات الطلب غير صحيحة، يرجى مراجعة المدخلات والمحاولة مجدداً.";
  }

  return rawMsg;
}

/**
 * Single-flight Refresh: تجديد التوكن تلقائياً مع معالجة تعارض 409
 */
export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      let res = await fetch(`${API_BASE_URL}/api/Auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": "athar-spa-v1",
        },
      });

      // 409 يعني أن تاب آخر قام بالتجديد للتو؛ ننتظر 250ms ونعيد المحاولة لمرة واحدة
      if (res.status === 409) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        res = await fetch(`${API_BASE_URL}/api/Auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRF-Token": "athar-spa-v1",
          },
        });
      }

      if (!res.ok) {
        setAccessToken(null);
        throw new Error(`Refresh failed with status ${res.status}`);
      }

      const resData = await res.json();
      
      // Extract the new token from resData robustly
      let newToken = null;
      if (resData) {
        if (typeof resData.data === "string") {
          newToken = resData.data;
        } else if (resData.data && typeof resData.data === "object") {
          newToken = resData.data.accessToken || resData.data.token;
        }
        
        if (!newToken) {
          newToken = resData.accessToken || resData.token || (typeof resData === "string" ? resData : null);
        }
      }

      setAccessToken(newToken);
      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/**
 * Core fetch wrapper with auth header, error handling, credentials, and auto-refresh on 401.
 */
export async function apiFetch(endpoint, options = {}, isRetry = false) {
  const isFormData = options.body instanceof FormData;
  const currentToken = inMemoryToken;

  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(currentToken && !options.headers?.Authorization && { Authorization: `Bearer ${currentToken}` }),
    ...options.headers,
  };

  // إضافة هيدر CSRF تلقائياً لمسارات المصادقة المعنية
  if (
    endpoint.includes("/api/Auth/refresh") ||
    endpoint.includes("/api/Auth/logout") ||
    endpoint.includes("/api/Auth/logout-all")
  ) {
    headers["X-CSRF-Token"] = "athar-spa-v1";
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
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

    // معالجة 401 وإعادة المحاولة بعد تجديد التوكن
    if (response.status === 401) {
      if (endpoint.includes("/api/Auth/login") || endpoint.includes("/api/Auth/google")) {
        const rawMsg = resData?.msg || resData?.message;
        throw new Error(translateServerError(rawMsg || "Invalid email or password."));
      }

      if (!isRetry && !endpoint.includes("/api/Auth/refresh")) {
        try {
          const newToken = await refreshAccessToken();
          const retryOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          return await apiFetch(endpoint, retryOptions, true);
        } catch {
          setAccessToken(null);
          const serverMsg = resData?.msg || resData?.message;
          throw new Error(translateServerError(serverMsg || "انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول لمتابعة العمل"));
        }
      }

      const serverMsg = resData?.msg || resData?.message;
      throw new Error(translateServerError(serverMsg || "انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول لمتابعة العمل"));
    }

    if (response.status === 403) {
      const serverMsg = resData?.msg || resData?.message;
      throw new Error(translateServerError(serverMsg || "عذراً، هذا الحساب لا يملك صلاحيات المشرف (Admin) على الباكإند لإتمام العملية (HTTP 403 Forbidden)."));
    }

    if (!response.ok) {
      console.error(`🚨 [API Error ${response.status}] ${endpoint}:`, resData);
      let errorMsg = resData?.msg || resData?.message;
      if (resData?.errors && typeof resData.errors === "object") {
        const errList = Object.entries(resData.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .filter(Boolean);
        if (errList.length > 0) {
          errorMsg = errList.join(" | ");
        }
      } else if (!errorMsg && resData?.title) {
        errorMsg = resData.title;
      }
      throw new Error(translateServerError(errorMsg || "تعذَّر إكمال العملية حالياً، يرجى المحاولة لاحقاً"));
    }

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