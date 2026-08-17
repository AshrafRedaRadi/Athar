import React, { useState, useEffect, useRef } from "react";
import {
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import { useSubscription } from "../../context/SubscriptionContext";
import { PaymentStatus, getPaymentStatus, clearPendingPayment } from "../../services/paymentService";

/**
 * Ensures the Paymob checkout URL is rendered in Arabic locale.
 */
function getArabicPaymobUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("lang", "ar");
    u.searchParams.set("locale", "ar");
    return u.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}lang=ar&locale=ar`;
  }
}

/**
 * PaymobIframeModal — Embedded Paymob Checkout Modal
 *
 * Embeds the Paymob checkoutUrl directly inside an iframe within the Athar platform.
 * Simultaneously polls the backend payment status until Paid / Cancelled.
 * Never leaves the Athar website!
 *
 * Props:
 * - isOpen: boolean
 * - checkoutUrl: string
 * - paymentId: number
 * - planName: string
 * - price: number | string
 * - onClose(): void
 * - onPaymentSuccess(): void
 */
export default function PaymobIframeModal({
  isOpen,
  checkoutUrl,
  paymentId,
  planName,
  price,
  onClose,
  onPaymentSuccess,
}) {
  const { refreshEntitlements } = useSubscription();
  const [iframeLoading, setIframeLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pollStatus, setPollStatus] = useState("جاري انتظار إتمام الدفع...");
  const pollTimerRef = useRef(null);

  // Poll status while modal is open
  useEffect(() => {
    if (!isOpen || !paymentId) return;

    let isMounted = true;
    setIsSuccess(false);
    setIframeLoading(true);

    const poll = async () => {
      try {
        const result = await getPaymentStatus(paymentId);
        const status = result?.status;

        if (status === PaymentStatus.Paid) {
          if (isMounted) {
            setIsSuccess(true);
            setPollStatus("تم تأكيد الدفع وتفعيل الباقة بنجاح!");
            clearPendingPayment();
            await refreshEntitlements();
            if (onPaymentSuccess) onPaymentSuccess();
            setTimeout(() => {
              if (isMounted && onClose) onClose();
            }, 2500);
          }
          return; // stop polling
        }

        if (status === PaymentStatus.Failed) {
          if (isMounted) {
            setPollStatus("فشلت عملية الدفع، يرجى إعادة المحاولة.");
            clearPendingPayment();
          }
          return;
        }

        if (status === PaymentStatus.Cancelled) {
          if (isMounted) {
            setPollStatus("تم إلغاء عملية الدفع.");
            clearPendingPayment();
          }
          return;
        }

        // Continue polling every 3.5 seconds
        if (isMounted) {
          pollTimerRef.current = setTimeout(poll, 3500);
        }
      } catch {
        if (isMounted) {
          pollTimerRef.current = setTimeout(poll, 5000);
        }
      }
    };

    // Start polling after 2 seconds
    pollTimerRef.current = setTimeout(poll, 2000);

    return () => {
      isMounted = false;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isOpen, paymentId, refreshEntitlements, onClose, onPaymentSuccess]);

  if (!isOpen || !checkoutUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn font-2"
      dir="rtl"
    >
      <div className="bg-base-100 dark:bg-slate-900 rounded-3xl border border-base-300 dark:border-slate-800 shadow-2xl w-full max-w-4xl xl:max-w-5xl h-[92vh] max-h-[780px] flex flex-col overflow-hidden relative animate-scaleUp">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0">
              <HiOutlineShieldCheck />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-1 font-bold text-sm text-base-content">
                  بوابة الدفع الإلكتروني الآمنة
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                  Paymob 🔒
                </span>
              </div>
              <p className="text-[11px] text-base-content/50 font-medium mt-0.5">
                {planName ? `اشتراك: ${planName}` : "إتمام الاشتراك"}
                {price ? ` (${price} EGP)` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Open in full external window option */}
            <a
              href={getArabicPaymobUrl(checkoutUrl)}
              target="_blank"
              rel="noopener noreferrer"
              title="فتح في نافذة خارجية مستقلة"
              className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
            >
              <HiOutlineArrowTopRightOnSquare className="text-base" />
            </a>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
            >
              <HiOutlineXMark className="text-xl" />
            </button>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="px-5 py-2 bg-base-200/50 dark:bg-slate-800/60 border-b border-base-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-base-content/70">
            {isSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <HiOutlineCheckCircle className="text-base" />
                {pollStatus}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-base-content/60">
                <span className="loading loading-spinner loading-xs text-cyan-700" />
                {pollStatus}
              </span>
            )}
          </div>
          <span className="text-[11px] text-base-content/40 font-mono">
            رقم المعاملة: #{paymentId}
          </span>
        </div>

        {/* Main Content: Embedded Paymob Iframe */}
        <div className="relative flex-1 w-full bg-base-200/30 dark:bg-slate-950 overflow-hidden">
          {/* Iframe Loading Skeleton */}
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-base-100/90 dark:bg-slate-900/90 backdrop-blur-xs z-10">
              <span className="loading loading-spinner loading-lg text-cyan-700" />
              <p className="text-xs font-bold text-base-content/70">
                جاري تحميل صفحة الدفع الآمنة...
              </p>
            </div>
          )}

          {/* Success Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 bg-base-100/95 dark:bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4 animate-fadeIn p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                <HiOutlineCheckCircle />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-1 text-base-content mb-1">
                  تم الدفع وتفعيل الباقة بنجاح! 🎉
                </h2>
                <p className="text-xs text-base-content/60">
                  تم تحديث كافة صلاحيات الحساب والحصص اليومية في منصة أثر.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl px-6 font-2 text-xs font-bold mt-2"
              >
                المتابعة إلى المنصة
              </button>
            </div>
          )}

          {/* Embedded Paymob Iframe with Arabic locale */}
          <iframe
            src={getArabicPaymobUrl(checkoutUrl)}
            title="Paymob Secure Checkout"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0"
            allow="payment *"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
          />
        </div>
      </div>
    </div>
  );
}
