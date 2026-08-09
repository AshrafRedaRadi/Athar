import React from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

/**
 * DeleteConfirmModal - Confirmation modal when deleting a content item.
 */
export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemTitle, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
      <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-center animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
          <HiOutlineExclamationCircle className="text-3xl" />
        </div>

        <h3 className="font-1 font-bold text-xl text-base-content">
          تأكيد حذف المحتوى
        </h3>

        <p className="font-2 text-sm text-base-content/70">
          هل أنت تأكد من إرادتك لحذف <span className="font-bold text-base-content">"{itemTitle}"</span>؟ لا يمكن التراجع عن هذا الإجراء بعد الحذف.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost rounded-xl font-2 text-sm"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="btn bg-red-600 hover:bg-red-700 text-white rounded-xl font-2 font-bold text-sm px-6"
          >
            {isDeleting ? "جاري الحذف..." : "نعم، احذف المتن"}
          </button>
        </div>
      </div>
    </div>
  );
}
