import React, { useState } from "react";
import { GoPlay } from "react-icons/go";
import { IoBookmarkOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { booksService } from "../../services/booksService";

export default function Progress(props) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleContinue = async () => {
    if (!props.bookId) {
      navigate("/library");
      return;
    }

    try {
      setIsNavigating(true);
      const sections = await booksService.getBookSections(props.bookId);
      if (Array.isArray(sections) && sections.length > 0) {
        navigate(`/library/${props.bookId}/sections`);
      } else {
        navigate(`/library/${props.bookId}/0`);
      }
    } catch (err) {
      console.warn("Could not check book sections:", err.message);
      navigate(`/library/${props.bookId}/sections`);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleResumeHadith = () => {
    if (props.bookId && props.resumeHadithId) {
      const secId = props.resumeSectionId || 0;
      navigate(`/library/${props.bookId}/${secId}/${props.resumeHadithId}`);
    } else {
      handleContinue();
    }
  };

  const memorizedCount = Math.max(Number(props.memorizedHadithCount) || 0, 0);
  const inProgressCount = Math.max(Number(props.inProgressHadithCount) || 0, 0);
  const maxHadithCount = Math.max(Number(props.totalHadithCount || props.totalHadiths) || 40, 1);

  // Calculate percentage for primary progress bar (التقدم) based on memorizedHadithCount / totalHadiths
  const calculatedPercent = Math.min(Math.max(Math.round((memorizedCount / maxHadithCount) * 100), 0), 100);
  const progressPercent =
    typeof props.progress === "number" && props.progress > 0
      ? Math.min(Math.max(props.progress, 0), 100)
      : calculatedPercent;

  return (
    <div dir="rtl" className="mt-6">
      <div className="bg-base-200 rounded-2xl shadow-sm border border-base-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

          {/* Right Side */}
          <div className="flex-1 w-full">
            <p className="text-sm text-cyan-700 font-bold">
              أكمل من حيث توقفت
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-base-content">
              {props.title || "لا يوجد كتاب مفتوح حالياً"}
            </h2>

            <div className="mt-6 space-y-4">
              {/* Primary Progress Bar (التقدم) */}
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-2 font-2">
                  <span>التقدم</span>
                  <span className="font-bold text-cyan-700">{progressPercent}%</span>
                </div>

                <progress
                  className="progress [&::-webkit-progress-value]:bg-cyan-500 w-full h-3"
                  value={memorizedCount > 0 ? memorizedCount : progressPercent}
                  max={memorizedCount > 0 ? maxHadithCount : 100}
                ></progress>
              </div>

              {/* In-Progress Hadith Count Bar (الأحاديث قيد الحفظ) */}
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-2 font-2">
                  <span>الأحاديث قيد الحفظ</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {inProgressCount} حديث
                  </span>
                </div>

                <progress
                  className="progress [&::-webkit-progress-value]:bg-amber-500 w-full h-3"
                  value={inProgressCount}
                  max={maxHadithCount}
                ></progress>
              </div>
            </div>
          </div>

          {/* Left Side */}
          <div className="shrink-0 w-full sm:w-auto flex flex-col gap-2.5">
            <button
              onClick={handleContinue}
              disabled={isNavigating}
              className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl px-8 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isNavigating ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <GoPlay className="text-lg" />
              )}
              <span>متابعة الحفظ</span>
            </button>

            {props.resumeHadithId && (
              <button
                onClick={handleResumeHadith}
                className="btn btn-outline border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white rounded-xl px-8 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <IoBookmarkOutline className="text-lg" />
                <span>آخر حديث</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
