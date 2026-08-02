import React from "react";
import { GoPlay } from "react-icons/go";
import { useNavigate } from "react-router-dom";

export default function Progress(props) {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (props.bookId) {
      navigate(`/library/${props.bookId}/sections`);
    } else {
      navigate("/library");
    }
  };

  const progressPercent = typeof props.progress === 'number' ? Math.min(Math.max(props.progress, 0), 100) : 0;

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
                  value={progressPercent}
                  max="100"
                ></progress>
              </div>

              {/* In-Progress Hadith Count Bar (الأحاديث قيد الحفظ) */}
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-2 font-2">
                  <span>الأحاديث قيد الحفظ</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {props.inProgressHadithCount || 0} حديث
                  </span>
                </div>

                <progress
                  className="progress [&::-webkit-progress-value]:bg-amber-500 w-full h-3"
                  value={props.inProgressHadithCount || 0}
                  max={props.totalHadiths || 40}
                ></progress>
              </div>
            </div>
          </div>

          {/* Left Side */}
          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={handleContinue}
              className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl px-8 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <GoPlay className="text-lg" />
              متابعة الحفظ
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
