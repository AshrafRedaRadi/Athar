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
    <div dir="rtl" className="mt-5 sm:mt-6">
      <div className="bg-base-100 dark:bg-base-100 rounded-2xl border border-base-300/70 shadow-[0_-6px_20px_rgba(0,0,0,0.07),0_6px_24px_rgba(0,0,0,0.08)] p-5 sm:p-7">
        <p className="text-xs sm:text-sm text-cyan-700 dark:text-cyan-400 font-bold">
          أكمل من حيث توقفت
        </p>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 text-base-content">
          {props.title || "لا يوجد كتاب مفتوح حالياً"}
        </h2>

        <div className="mt-5 space-y-4">
          {/* Row 1: Primary Progress Bar (التقدم) + "متابعة الحفظ" Button */}
          <div className="flex items-end gap-3 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs sm:text-sm text-base-content/70 mb-1.5 font-2">
                <span>التقدم</span>
                <span className="font-bold text-cyan-700">{progressPercent}%</span>
              </div>
              <progress
                className="progress [&::-webkit-progress-value]:bg-cyan-500 w-full h-3"
                value={memorizedCount > 0 ? memorizedCount : progressPercent}
                max={memorizedCount > 0 ? maxHadithCount : 100}
              ></progress>
            </div>

            <button
              onClick={handleContinue}
              disabled={isNavigating}
              className="box-border h-10 min-h-0 w-[135px] sm:w-[150px] bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 font-2 font-medium text-xs sm:text-sm transition-all"
            >
              {isNavigating ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <GoPlay className="text-base sm:text-lg shrink-0" />
              )}
              <span>متابعة الحفظ</span>
            </button>
          </div>

          {/* Row 2: In-Progress Hadith Count Bar + "آخر حديث" Button */}
          <div className="flex items-end gap-3 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs sm:text-sm text-base-content/70 mb-1.5 font-2">
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

            <button
              onClick={handleResumeHadith}
              className="box-border h-10 min-h-0 px-4 sm:px-5 bg-transparent border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white rounded-xl shrink-0 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs font-2 font-medium text-xs sm:text-sm"
            >
              <IoBookmarkOutline className="text-base sm:text-lg shrink-0" />
              <span>آخر حديث</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
