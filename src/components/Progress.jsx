import { GoPlay } from "react-icons/go";

export default function Progress(props) {
  return (
    <div dir="rtl" className="mt-6">
      <div className="bg-base-200 rounded-2xl shadow-sm border border-base-200 p-6">
        <div className="flex items-center justify-between gap-8">

          {/* Right Side */}
          <div className="flex-1">
            <p className="text-sm text-cyan-700 font-bold">
              أكمل من حيث توقفت
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {props.title}
            </h2>

            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>التقدم</span>
                <span>{props.progress}%</span>
              </div>

              <progress
                className="progress [&::-webkit-progress-value]:bg-cyan-500 w-fll h-3"
                value={props.progress}
                max="100"
              ></progress>
            </div>
          </div>

          {/* Left Side */}
          <div>
            <button className="btn bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl px-8">
              <GoPlay className="text-lg" />
              متابعة الحفظ
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}