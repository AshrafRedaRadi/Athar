import { IoMdMic } from "react-icons/io";
import Navbar from "../components/Navbar";
import logo from '../assets/logo.png'; //! Should come from backend!!!
import user from '../assets/user.png';   //! Should come from backend!!!
import Button from "../components/Button";
import Gender from "../components/Gender";
import Age from "../components/Age";
import Card from "../components/Card";
import Password from "../components/Password";
import Stat from "../components/Stat";
import Progress from "../components/Progress";
import Tasks from "../components/Tasks";
import Hero from "../components/Hero";

let userName = "مصطفى صلاح"; //! Should come from backend!!!

function List() {
    return (
        <div>
            <Navbar activePage="library" />
            <br className="block md:hidden" />
            <Hero 
                img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNiZvR1CvWoPfsikkVGri1il1EJ1q22MSVFql_UXd1cA&s=10.jpg"
                title="الأربعين النووية"
            />
            <Stat days={12} hadith={145} accuracy={92} />
            <Progress title="الأربعين النووية" progress={100} />
            <Tasks />
            <br className="block md:hidden" />
            <br className="block md:hidden" />
        </div>
    );
}

export default List;