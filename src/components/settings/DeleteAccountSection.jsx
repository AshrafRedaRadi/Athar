import { useState } from "react";

function DeleteAccountSection() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <section className="mt-8 rounded-lg border border-red-400 bg-red-50/40 px-4 py-5 text-right">
      <button
        type="button"
        onClick={() => setIsConfirmOpen((current) => !current)}
        className="font-1 text-m font-medium text-red-500 transition hover:text-red-600 hover:underline"
        aria-expanded={isConfirmOpen}
      >
        حذف الحساب بشكل نهائي
      </button>

      <p className="font-2 mt-2 text-sm text-base-content/60">
        بمجرد حذف حسابك، لن تتمكن من استعادة بياناتك أو مجموعاتك المحفوظة.
      </p>

      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-confirm-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsConfirmOpen(false)}
            aria-label="إغلاق تأكيد حذف الحساب"
          />

          <div className="relative w-full max-w-md rounded-lg border border-red-200 bg-base-100 p-5 text-right shadow-xl">
            <h3
              id="delete-account-confirm-title"
              className="font-1 text-base font-medium text-red-500"
            >
              تأكيد حذف الحساب
            </h3>
            <p className="font-2 mt-2 text-sm text-base-content/70">
              هل أنت متأكد من حذف الحساب بشكل نهائي؟
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="btn btn-ghost h-10 min-h-10 rounded-md px-6 text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                className="btn h-10 min-h-10 rounded-md border-red-500 bg-red-500 px-6 text-sm text-white hover:border-red-600 hover:bg-red-600"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DeleteAccountSection;
