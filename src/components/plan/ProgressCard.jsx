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

  return (
    <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-300 flex items-center justify-between w-full mx-auto font-2" dir="rtl">
      <div className="flex items-center justify-center ml-4">
        <div
          className="radial-progress text-cyan-700 dark:text-cyan-400 font-bold text-3xl"
          style={{
            "--value": percentage, 
            "--size": "9rem",
            "--thickness": "12px",
          }}
          role="progressbar"
        >
          {percentage}%
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-bold font-1 text-base-content leading-tight">
          {title}
        </h2>

        <p className="text-sm font-2 text-base-content/70">
          {completedText} {completedCount} {itemType} {totalText} {totalCount} {totalItemType}
        </p>
        
        <div className="inline-flex items-center gap-3 bg-base-200 border border-base-300/60 px-4 py-3 rounded-xl">
          <div className="bg-[#FDAF61] p-3 rounded-full flex items-center justify-center">
            <span role="img" aria-label="streak" className="text-white text-lg">
              🔥
            </span>
          </div>
          
          <div className="flex flex-col text-sm text-base-content">
            <span>{streakTitle}</span>
            <span className="font-semibold text-base">
              {streakDaysCount} {streakDaysText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;