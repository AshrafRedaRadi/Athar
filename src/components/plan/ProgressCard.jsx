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
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between w-full  mx-auto font-sans" dir="rtl">
      <div className="flex items-center justify-center ml-4">
        <div
          className="radial-progress text-[#077187] font-bold text-3xl"
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
        <h2 className="text-xl font-semibold text-gray-900 leading-tight">
          {title}
        </h2>

        <p className="text-sm text-gray-600">
          {completedText} {completedCount} {itemType} {totalText} {totalCount} {totalItemType}
        </p>
        
        <div className="inline-flex items-center gap-3 bg-gray-100 px-4 py-3 rounded-xl">
          <div className="bg-[#FDAF61] p-3 rounded-full flex items-center justify-center">
            <span role="img" aria-label="streak" className="text-white text-lg">
              🔥
            </span>
          </div>
          
          <div className="flex flex-col text-sm text-gray-800">
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