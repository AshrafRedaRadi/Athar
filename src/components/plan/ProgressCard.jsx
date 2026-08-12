import React from 'react';

const ProgressCard = (props) => {
  const title = props.title || "مسار الأربعون النووية";
  const completedText = props.completedText || "لقد أتممت حفظ";
  const completedCount = props.completedCount || 18;
  const itemType = props.itemType || "حديثاً";
  const totalText = props.totalText || "من أصل";
  const totalCount = props.totalCount || 42;
  const totalItemType = props.totalItemType || "حديث";
  const streakTitle = props.streakTitle || "سلسلة الاستمرار";
  const streakDaysCount = props.streakDaysCount || 5;
  const streakDaysText = props.streakDaysText || "أيام متتالية";
  const percentage = props.percentage || 45;

  const radius = 70;
  const strokeWidth = 14;
  const size = (radius + strokeWidth) * 2;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <div 
      className="bg-base-100 p-4 sm:p-6 rounded-3xl shadow-sm border border-base-300 flex flex-col sm:flex-row items-center justify-between gap-6 w-full mx-auto font-2" 
      dir="ltr"
    >
      <div className="flex-1 space-y-4 text-center sm:text-right w-full">
        <h2 className="text-lg sm:text-xl font-bold font-1 text-base-content leading-tight">
          {title}
        </h2>

        <p className="text-xs sm:text-sm font-2 text-base-content/70">
          {completedText} {completedCount} {itemType} {totalText} {totalCount} {totalItemType}
        </p>
        
        <div className="inline-flex items-center justify-center sm:justify-start gap-3 bg-base-200 border border-base-300/60 px-4 py-2.5 sm:py-3 rounded-xl w-full sm:w-auto">
          <div className="bg-[#FDAF61] p-2.5 sm:p-3 rounded-full flex items-center justify-center shrink-0">
            <span role="img" aria-label="streak" className="text-white text-base sm:text-lg leading-none">
              🔥
            </span>
          </div>
          
          <div className="flex flex-col text-xs sm:text-sm text-base-content text-right">
            <span>{streakTitle}</span>
            <span className="font-semibold text-sm sm:text-base" dir='rtl' >
              {streakDaysCount} {streakDaysText} 
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center shrink-0 w-28 h-28 sm:w-36 sm:h-36">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full -rotate-90"
        >
          {/* the color of the background of the circle*/}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-base-200"
          />

          {/* line of the pre prograss */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-cyan-200/70"
            strokeWidth={strokeWidth}
          />

          {/* line of the prograss */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-cyan-500 transition-all duration-500 ease-out"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <span className="absolute text-xl sm:text-2xl font-bold text-cyan-500">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default ProgressCard;