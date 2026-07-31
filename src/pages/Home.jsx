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
let userName = "مصطفى صلاح" //! Should come from backend!!!
function Home() {
    return (
        <div>
            <div className="hidden md:block">
                <Sidebar logo={logo} user={user} userName={userName} />
            </div>

            <div className="block md:hidden">
                <Dock />
            </div>
            <Stat days={12} hadith={145} accuracy={92} />
            <Progress title="الأربعين النووية" progress={100} />
            <Tasks />
            <br className="block md:hidden" />
            <br className="block md:hidden" />

        </div>
    )
}
export default Home;