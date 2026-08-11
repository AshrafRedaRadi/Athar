import { AiOutlineCalendar } from "react-icons/ai";

export default function DaysTarget() {
  return (
    <div className="w-full bg-base-100 rounded-3xl shadow-sm border border-base-300 p-6 font-2 text-base-content" dir="rtl">
      <style>{`
        .steps .step-secondary::before,
        .steps .step-secondary::after {
          background-color: #007595 !important;
          border-color: #007595 !important;
          color: #ffffff !important;
        }
      `}</style>

      <div className="text-2xl font-bold font-1 mb-6 flex items-center gap-2">
        <AiOutlineCalendar className="inline text-cyan-600 dark:text-cyan-400" />
        <span>خارطة المراجعة</span>
      </div>

      {/* حاوية السكرول الأفقية */}
      <div className="w-full overflow-x-auto pb-2">
        <ul className="steps steps-horizontal w-full min-w-[700px] [--step-icon-size:2.5rem] text-lg font-bold">
          <li className="step flex-1">start</li>
          <li className="step step-secondary flex-1">2</li>
          <li className="step step-secondary flex-1">3</li>
          <li className="step step-secondary flex-1">4</li>
          <li className="step flex-1">5</li>
          <li className="step step-accent flex-1">6</li>
          <li className="step step-accent flex-1">7</li>
          <li className="step step-neutral flex-1">end</li>
        </ul>
      </div>
    </div>
  );
}