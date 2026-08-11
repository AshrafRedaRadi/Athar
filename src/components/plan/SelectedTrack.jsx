import React, { useState } from 'react';

const SelectedTrack = (props) => {
  const tracks = props.tracks || [
    { id: 1, title: 'الأربعون النووية', count: 42, countUnit: 'حديثاً', level: 'مستوى مبتدئ' },
    { id: 2, title: 'رياض الصالحين', count: 1896, countUnit: 'حديثاً', level: 'مستوى متقدم' },
  ];

  const [selectedId, setSelectedId] = useState(props.selectedId || tracks[0]?.id);

  const handleSelect = (id) => {
    setSelectedId(id);
    if (props.onSelect) {
      props.onSelect(id);
    }
  };

  return (
    <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-300 w-full max-w-sm space-y-4 font-2" dir="rtl">

      <div className="flex items-center justify-start gap-2 text-base-content font-bold font-1 text-lg mb-2">
        <svg
          className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span>اختار مسار الحفظ</span>
      </div>

      <div className="space-y-3" dir='ltr'>
        {tracks.map((track) => {
          const isSelected = selectedId === track.id;

          return (
            <div
              key={track.id}
              onClick={() => handleSelect(track.id)}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${isSelected
                ? 'border-cyan-700 bg-cyan-300/10 dark:bg-cyan-100/30 border-2'
                : 'border-base-300 bg-base-100 hover:border-base-400'
                }`}
            >
              <div className="flex items-center justify-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-cyan-700 text-cyan-800' : 'border-base-300'
                    }`}
                >
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-cyan-700" />
                  )}
                </div>
              </div>

              <div className="text-right">
                <h4
                  style={isSelected ? { color: '#007595' } : undefined}
                  className={`font-bold text-base ${isSelected ? '!text-cyan-600' : 'text-base-content'}`}
                >
                  {track.title}
                </h4>
                <p className="text-xs text-base-content/60 mt-0.5">
                  {track.count} {track.countUnit || 'حديثاً'} • {track.level}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default SelectedTrack;