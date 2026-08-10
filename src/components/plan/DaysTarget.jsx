import { AiOutlineCalendar } from "react-icons/ai";
export default function DaysTarget() {
  return (
    <div className="overflow-x-auto p-6 bg-base-100 rounded-3xl shadow-sm border border-base-300 flex items-center justify-between w-full mx-auto font-2 text-base-content" dir="rtl">
      <div>
        <div className="text-2xl font-bold font-1 mb-6 flex items-center gap-2">
          <AiOutlineCalendar className="inline text-cyan-600 dark:text-cyan-400" />
          <span>خارطة المراجعة</span>
        </div>
        <ul className="steps w-full min-w-max [--step-icon-size:2.5rem] text-lg font-bold">
          <li className="step min-w-[90px]">start</li>
          <li className="step step-secondary min-w-[90px]">2</li>
          <li className="step step-secondary min-w-[90px]">3</li>
          <li className="step step-secondary min-w-[90px]">4</li>
          <li className="step min-w-[90px]">5</li>
          <li className="step step-accent min-w-[90px]">6</li>
          <li className="step step-accent min-w-[90px]">7</li>
          <li className="step step-neutral min-w-[90px]">end</li>
        </ul>
      </div>
    </div>
  );
}