import { MdMenuBook } from "react-icons/md"; 
import { AiFillSetting } from "react-icons/ai"; 
import { FaMicrophone } from "react-icons/fa"; 
import Step from "../components/Step";

function Steps() {

  return (
    <div >
      <Step icon={<FaMicrophone />} title={"حفظ الأحاديث بذكاء"} des={"استخدم الذكاء الاصطناعي لاكتشاف اخطاء الحفظ وتحيحها  لحظيًا عبر محرك التسميع الذكيز"} />
      <Step icon={<AiFillSetting />} title={"خطط مراجعة مخصصة"} des={"خوارزميات التكرار المتباعد تضمن لك عدم النسيان وبناء خطه تناسب وقتك ومستواك."} />
      <Step icon={<MdMenuBook />} title={"بيئة تعليمية متكاملة"} des={"تكامل تام مع الشروحات الموثقة، مقاطع يوتيوب، وتسجيلات صوتيه بشرية لضمان النطق الصحيح."} btmTxt={"ابدأ الان"} />
    </div>
  )
}
export default Steps