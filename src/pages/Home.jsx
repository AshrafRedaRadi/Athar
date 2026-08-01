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

let userName = "مصطفى صلاح"; //! Should come from backend!!!

function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        {/* Unified Navbar */}
        <Navbar activePage="home" />

        {/* Main Home Content */}
        <Stat days={12} hadith={145} accuracy={92} />
        <Progress title="الأربعين النووية" progress={100} />
        <Tasks />
        <br className="block md:hidden" />
        <br className="block md:hidden" />
      </main>
    </div>
  );
}

export default Home;