import React, { useState, useEffect, useRef } from "react";
import { IoCloseOutline, IoBookOutline } from "react-icons/io5";
import { IoPlayCircleOutline } from "react-icons/io5";
import { HiOutlineLocationMarker } from "react-icons/hi";

/**
 * ExplanationPanel — sliding drawer for Study mode with dual scholar text explanations.
 */
export default function ExplanationPanel({ isOpen, onClose, activeTab, onTabChange, explanation }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop Desktop */}
      <div
        className={`hidden lg:block fixed inset-0 bg-black/30 z-40
                    transition-opacity duration-500 ease-in-out
                    ${isOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer Panel Desktop */}
      <div
        ref={panelRef}
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full w-[360px] z-50
                    bg-base-100 border-e border-base-300 shadow-2xl
                    transition-transform duration-500 ease-in-out will-change-transform
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <IoBookOutline className="text-lg text-cyan-700" />
            <span className="font-3 font-bold text-base">شرح الحديث</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="إغلاق"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <PanelContent
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
          />
        </div>
      </div>

      {/* Backdrop Mobile */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/40 z-50
                    transition-opacity duration-500 ease-in-out
                    ${isOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Bottom Sheet Mobile */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50
                    bg-base-100 rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl
                    transition-transform duration-500 ease-in-out will-change-transform
                    ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        dir="rtl"
      >
        <div className="sticky top-0 bg-base-100 flex items-center justify-between p-4 border-b border-base-300 z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <IoBookOutline className="text-lg text-cyan-700" />
            <span className="font-3 font-bold text-base">شرح الحديث</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="إغلاق"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="p-4">
          <PanelContent
            activeTab={activeTab}
            onTabChange={onTabChange}
            explanation={explanation}
          />
        </div>
      </div>
    </>
  );
}

function PanelContent({ activeTab, onTabChange, explanation }) {
  return (
    <div className="p-4">
      {/* Top Tabbar: Video vs Text Explanation */}
      <div className="flex gap-1 mb-5 border-b border-base-300" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "video"}
          onClick={() => onTabChange("video")}
          className={`flex-1 py-2.5 font-2 text-sm text-center transition-colors ${
            activeTab === "video"
              ? "text-cyan-700 border-b-2 border-cyan-700 font-bold"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح المرئي
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "text"}
          onClick={() => onTabChange("text")}
          className={`flex-1 py-2.5 font-2 text-sm text-center transition-colors ${
            activeTab === "text"
              ? "text-cyan-700 border-b-2 border-cyan-700 font-bold"
              : "text-base-content/50 hover:text-base-content"
          }`}
        >
          الشرح النصي
        </button>
      </div>

      {activeTab === "text" ? (
        <TextExplanation explanation={explanation} />
      ) : (
        <VideoExplanation explanation={explanation} />
      )}
    </div>
  );
}

/**
 * TextExplanation Component with sub-tabs for Scholars:
 * 1. الشيخ صالح العصيمي
 * 2. الشيخ ابن عثيمين
 */
function TextExplanation({ explanation }) {
  const [scholarTab, setScholarTab] = useState("osaimi"); // "osaimi" | "othaymeen"

  // Mock data fallbacks for both scholars if not directly passed in API response
  const osaimiData = explanation?.osaimi || {
    scholarName: "الشيخ صالح العصيمي",
    summary:
      explanation?.summary ||
      "شرح كتاب أصول العبادات والأحكام والتأصيل العلمي المتين لمتن الحديث النبوي الشريف وفق منهجية متون طالب العلم.",
    sections: explanation?.sections || [
      {
        title: "التأصيل الشرعي",
        content:
          "إن النية هي المحرك الأساسي للأعمال، ولا تقبل الطاعة إلا بإخلاص النية لله تعالى والمتابعة لرسول الله ﷺ.",
      },
      {
        title: "الفوائد والأحكام",
        content:
          "تفاضل الأعمال بحسب ما يقوم في القلوب من الإيمان والإخلاص والصدق مع الله تعالى.",
      },
    ],
  };

  const othaymeenData = explanation?.othaymeen || {
    scholarName: "الشيخ ابن عثيمين",
    summary:
      "شرح جامع لحديث النية بين فيه الشارح رحمه الله أن الأعمال المقبولة عند الله هي التي تقترن بالإخلاص، وقسم الهجرة إلى هجرة مكان وهجرة عمل وهجرة عامل.",
    sections: [
      {
        title: "أولاً: قاعدة النية ومحلها",
        content:
          "النية محلها القلب والتلفظ بها بدعة، وهي شرط أساسي لصحة قبول كل عمل صالح يتقرب به العبد إلى ربه.",
      },
      {
        title: "ثانياً: أقسام الهجرة الشرعية",
        content:
          "1. هجرة المكان: انتقال من بلد الشرك إلى بلد الإسلام.\n2. هجرة العمل: هجرة المعاصي والذنوب والآثام.\n3. هجرة العامل: هجرة أهل البدع والضلال.",
      },
    ],
  };

  const currentData = scholarTab === "osaimi" ? osaimiData : othaymeenData;

  return (
    <div className="space-y-5">
      {/* Pill Toggle for Scholar Selection */}
      <div className="flex bg-base-200/90 p-1 rounded-2xl gap-1 border border-base-300 shadow-inner">
        <button
          type="button"
          onClick={() => setScholarTab("osaimi")}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold font-2 transition-all duration-300 cursor-pointer text-center ${
            scholarTab === "osaimi"
              ? "bg-cyan-700 text-white shadow-md font-bold"
              : "text-base-content/70 hover:text-base-content"
          }`}
        >
          صالح العصيمي <span className="text-[10px] opacity-80 font-normal ms-0.5">(مختصر)</span>
        </button>

        <button
          type="button"
          onClick={() => setScholarTab("othaymeen")}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold font-2 transition-all duration-300 cursor-pointer text-center ${
            scholarTab === "othaymeen"
              ? "bg-cyan-700 text-white shadow-md font-bold"
              : "text-base-content/70 hover:text-base-content"
          }`}
        >
          ابن عثيمين <span className="text-[10px] opacity-80 font-normal ms-0.5">(مطول)</span>
        </button>
      </div>

      {/* Selected Scholar Title Header */}
      <div className="bg-cyan-700/10 border border-cyan-700/20 rounded-xl p-3 text-center">
        <span className="font-3 font-bold text-xs text-cyan-800 dark:text-cyan-300">
          شرح {currentData.scholarName || (scholarTab === "osaimi" ? "الشيخ صالح العصيمي" : "الشيخ ابن عثيمين")}
        </span>
      </div>

      {/* Summary */}
      {currentData.summary && (
        <div className="space-y-1.5">
          <h3 className="font-3 font-bold text-sm text-cyan-800 dark:text-cyan-400">المعنى الإجمالي:</h3>
          <p className="font-2 text-xs sm:text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap">
            {currentData.summary}
          </p>
        </div>
      )}

      {/* Sections / Key points */}
      {currentData.sections?.map((sec, i) => (
        <div key={i} className="space-y-1.5 pt-1 border-t border-base-200">
          <h3 className="font-3 font-bold text-sm text-cyan-800 dark:text-cyan-400">{sec.title}:</h3>
          {sec.items ? (
            <ul className="font-2 text-xs sm:text-sm leading-relaxed text-base-content/80 space-y-1 list-disc list-inside">
              {sec.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="font-2 text-xs sm:text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap">
              {sec.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function VideoExplanation({ explanation }) {
  return (
    <div className="space-y-5">
      <div className="relative rounded-xl overflow-hidden bg-base-300 aspect-video flex items-center justify-center cursor-pointer group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <IoPlayCircleOutline className="text-5xl text-white drop-shadow-lg z-10 group-hover:scale-110 transition-transform" />
        <div className="absolute bottom-3 right-3 z-10">
          <p className="font-2 text-xs text-white/80">
            {explanation?.videoSpeaker}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-3 font-bold text-sm text-base-content">
          {explanation?.videoTitle}
        </h3>
        <p className="font-2 text-xs text-base-content/50 mt-1">
          {explanation?.videoSpeaker} - {explanation?.videoDuration}
        </p>
      </div>

      {explanation?.keyPoints && (
        <div className="bg-base-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineLocationMarker className="text-cyan-700" />
            <h4 className="font-3 font-bold text-sm text-base-content">النقاط الرئيسية</h4>
          </div>
          <ul className="font-2 text-sm text-base-content/70 space-y-2">
            {explanation.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-700 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
