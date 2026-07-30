import { IoMdMic } from "react-icons/io";
import User from "../components/User";
import Sidebar from "../components/Sidebar";
import logo from '../assets/logo.png' //! Should come from backend!!!
import user from '../assets/user.png'   //! Should come from backend!!!
import Button from "../components/Button";
import Gender from "../components/Gender";
import Age from "../components/Age";
import Card from "../components/Card";
import Password from "../components/Password";
import Stat from "../components/Stat";
import Progress from "../components/Progress";
import Tasks from "../components/Tasks";
import Dock from "../components/Dock";
import Hero from "../components/Hero";
let userName = "مصطفى صلاح" //! Should come from backend!!!
function List() {
    return (
        <div>
            <div className="hidden md:block">
                <Sidebar logo={logo} user={user} userName={userName} />
            </div>

            <div className="block md:hidden">
                <Dock />
            </div>
            <br className="block md:hidden" />
            <Hero 
                img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNiZvR1CvWoPfsikkVGri1il1EJ1q22MSVFql_UXd1cA&s=10.jpg"
                title="الأربعين النووية"
                description="ألفه الأمام النووي، و هو من أشهر كتب الحديث النبوي الشريف، و قد جمع فيه الإمام النووي الأحاديث الصحيحة التي وردت عن النبي صلى الله عليه وسلم، و قد اعتنى الإمام النووي بشرح هذه الأحاديث و توضيح معانيها و فوائدها."
                reminder="مراجعة اليوم"
            />
            <br className="block md:hidden" />
            <br className="block md:hidden" />

        </div>
    )
}
export default List;