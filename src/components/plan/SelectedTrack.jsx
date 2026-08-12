import React, { useState } from 'react';
import { HiOutlinePlus, HiOutlineBookOpen } from 'react-icons/hi';
import SelectBookModal from './SelectBookModal';

const SelectedTrack = (props) => {
  const defaultTracks = props.tracks || [
    { id: 1, title: 'الأربعون النووية', count: 42, countUnit: 'حديثاً', level: 'مستوى مبتدئ' },
    { id: 2, title: 'رياض الصالحين', count: 1896, countUnit: 'حديثاً', level: 'مستوى متقدم' },
  ];

  const [tracksList, setTracksList] = useState(defaultTracks);
  const [selectedId, setSelectedId] = useState(props.selectedId || defaultTracks[0]?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (id) => {
    setSelectedId(id);
    if (props.onSelect) {
      props.onSelect(id);
    }
  };

  const handleBookFromModal = (book) => {
    // Check if book is already in the list
    const existingIndex = tracksList.findIndex((t) => String(t.id) === String(book.id));
    
    if (existingIndex >= 0) {
      setSelectedId(tracksList[existingIndex].id);
      if (props.onSelect) props.onSelect(tracksList[existingIndex].id);
    } else {
      // Add new book as a custom track item
      const newTrack = {
        id: book.id,
        title: book.title,
        count: book.hadithsCount || book.hadithCount || 42,
        countUnit: 'حديثاً',
        level: book.category || 'متن علمي',
      };
      const updated = [...tracksList, newTrack];
      setTracksList(updated);
      setSelectedId(newTrack.id);
      if (props.onSelect) props.onSelect(newTrack.id);
    }
  };

  return (
    <>
      <div className="bg-base-100 dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-base-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.09)] transition-all duration-300 w-full h-full flex flex-col justify-between space-y-4 font-2" dir="rtl">
        <div>
          <div className="flex items-center justify-start gap-2.5 text-base-content font-bold font-1 text-lg mb-4">
            <svg
              className="w-6 h-6 text-cyan-700 dark:text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>اختار مسار الحفظ</span>
          </div>

          <div className="space-y-3" dir="rtl">
            {tracksList.map((track) => {
              const isSelected = String(selectedId) === String(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => handleSelect(track.id)}
                  className={`relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 ease-out border active:scale-[0.98] ${isSelected
                    ? 'border-cyan-700 bg-cyan-50/80 dark:bg-cyan-950/40 border-2 shadow-sm scale-[1.02]'
                    : 'border-base-200 bg-base-100 dark:bg-slate-900/50 hover:border-cyan-300/80 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20 hover:scale-[1.005]'
                    }`}
                >
                  {/* Soft active edge accent bar */}
                  <div
                    className={`absolute right-0 top-0 bottom-0 w-1 bg-cyan-700 transition-all duration-300 ${isSelected ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                      }`}
                  />

                  <div className="text-right">
                    <h4
                      className={`font-bold text-sm sm:text-base transition-colors duration-300 ${isSelected ? 'text-cyan-800 dark:text-cyan-300' : 'text-base-content'}`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-base-content/60 mt-0.5 transition-colors duration-300">
                      {track.count} {track.countUnit || 'حديثاً'} • {track.level}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-cyan-700 bg-cyan-700/10 scale-110 shadow-2xs' : 'border-base-300'
                        }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full bg-cyan-700 transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 3rd Option Button: Select Another Track From Library */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 border border-dashed border-cyan-600/50 bg-cyan-50/40 dark:bg-cyan-950/20 hover:bg-cyan-50/80 dark:hover:bg-cyan-950/40 hover:border-cyan-600 hover:scale-[1.01] active:scale-[0.98] group shadow-2xs text-right"
            >
              <div>
                <h4 className="font-bold text-sm sm:text-base text-cyan-800 dark:text-cyan-300 group-hover:text-cyan-900 dark:group-hover:text-cyan-200 transition-colors flex items-center gap-1.5">
                  <HiOutlinePlus className="text-base sm:text-lg text-cyan-700 dark:text-cyan-400 shrink-0" />
                  <span>اختيار مسار آخر...</span>
                </h4>
                <p className="text-xs text-base-content/60 mt-0.5">
                  تصفح واختيار من مكتبة المنصة
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-base group-hover:bg-cyan-700 group-hover:text-white transition-all shrink-0">
                <HiOutlineBookOpen />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Library Book Selection Modal */}
      <SelectBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectBook={handleBookFromModal}
        selectedBookId={selectedId}
      />
    </>
  );
};

export default SelectedTrack;