import { AiOutlineCalendar } from "react-icons/ai";
export default function DaysTarget() {
  return (
    <div className="overflow-x-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between w-full  mx-auto font-sans" dir="rtl">
    <div>
        <div className="text-2xl font-bold mb-6   " >  <AiOutlineCalendar className="inline"  />
       <div className="inline"> خارطة المراجعة </div>
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