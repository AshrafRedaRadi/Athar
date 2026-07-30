import Button_Step from "./Button_Step";

const Step = ({ icon, title, des, btmTxt = "التالي" }) => {
  return (
    <div dir="rtl" className="px-4 steps_body">
      
      <div className="flex items-center flex-col justify-center max-w-lg m-auto text-center h-[100vh]">
        <a to="/" className="text-gray-700 font-4 skip">تخطي</a>

        <div className="flex items-center justify-center text-center w-28 h-28 rounded-full bg-cyan-700/10">
          <div className=" text-cyan-700 text-5xl ">{icon}</div>
        </div>

        <h2 className="py-4 font-1 text-2xl">{title}</h2>

        <p className="pb-7 font-2 text-gray-600">{des}</p>

        <Button_Step name={btmTxt} />
      </div>
    </div>
  );
};
export default Step;
