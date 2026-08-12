import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/shared/Navbar";
import {
  HiOutlineFolder,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineMagnifyingGlass,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSparkles,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineWrenchScrewdriver,
  HiOutlineEnvelope,
  HiOutlineCheckCircle,
  HiOutlineXMark,
} from "react-icons/hi2";

const HELP_CATEGORIES = [
  {
    id: "getting-started",
    title: "جديد على أثر؟",
    subtitle: "بعض الإجابات على أسئلة عامة لمساعدتك في انطلاقتك مع منصة أثر",
    icon: HiOutlineSparkles,
    articles: [
      {
        q: "ما هي منصة أثر؟",
        a: "منصة أثر هي منصة تفاعلية متكاملة تهدف إلى مساعدة المسلمين على حفظ ومراجعة المتون العلمية والأحاديث النبوية بأسلوب تفاعلي حديث يعتمد على الذكاء الاصطناعي والتكرار الصوتي.",
      },
      {
        q: "كيف أبدأ خطتي الدراسية الأولى؟",
        a: "يمكنك البدء بالانتقال إلى صفحة 'إدارة خطة الحفظ والمراجعة'، واختيار الكتاب أو المتن المناسب، ثم تحديد عدد الأحاديث اليومية لإنشاء جدول مرن يناسب وقتك.",
      },
      {
        q: "هل خدمات منصة أثر مجانية؟",
        a: "نعم، كافة الخدمات الأساسية في منصة أثر مجانية بالكامل وستظل متاحة لجميع طلاب العلم والحفاظ حول العالم.",
      },
    ],
  },
  {
    id: "features",
    title: "ميزات منصة أثر والتسميع الذكي",
    subtitle: "مقالات تشرح ميزات تطبيق أثر والتسميع التفاعلي بالذكاء الاصطناعي",
    icon: HiOutlineBookOpen,
    articles: [
      {
        q: "كيف يعمل المساعد الذكي للتسميع؟",
        a: "يستخدم المساعد الذكي تقنيات التعرف الصوتي المتقدمة لمعالجة تلاوتك وتسميعك للأحاديث فورياً، والتحقق من صحة الكلمات وإعطائك ملاحظات دقيقة عن مدى الحفظ.",
      },
      {
        q: "كيف أستمع لتكرار الحديث للحفظ؟",
        a: "في صفحة الدراسة لكل حديث، يمكنك استخدام مشغل الصوت التفاعلي لتحديد عدد تكرار القارئ أو التوقف التلقائي لتسهيل عملية التلقين والحفظ.",
      },
      {
        q: "ما هي الكتب والمتون المتاحة؟",
        a: "تضم المكتبة مجموعة من أهم الكتب والمتون مثل الأربعين النووية، رياض الصالحين، وعمدة الأحكام، ويتم إضافة متون جديدة باستمرار.",
      },
    ],
  },
  {
    id: "plan-management",
    title: "إدارة خطة الحفظ والمراجعة",
    subtitle: "إجابات عن الأسئلة الشائعة المتعلقة بالخطة اليومية ومتابعة التقدم",
    icon: HiOutlineAcademicCap,
    articles: [
      {
        q: "كيف أقوم بتعديل المقدار اليومي في خطتي؟",
        a: "من صفحة 'إدارة خطة الحفظ'، اضغط على خيار تعديل الخطة ويمكنك زيادة أو تقليل عدد الأحاديث اليومية بكل سهولة.",
      },
      {
        q: "كيف يتم حساب نسبة الإنجاز والتقدم؟",
        a: "يتم حساب نسبة التقدم بناءً على عدد الأحاديث التي قمت بحفظها وتأكيدها مقارنة بإجمالي أحاديث الكتاب المختار.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "حل المشاكل والدعم الفني",
    subtitle: "مقالات عن أداء المنصة، الميكروفون، سلامة النصوص الصوتيّة",
    icon: HiOutlineWrenchScrewdriver,
    articles: [
      {
        q: "الميكروفون لا يعمل أثناء التسميع الذكي؟",
        a: "تأكد من إعطاء متصفحك إذن الوصول للميكروفون عند طلب الإذن، وافحص إعدادات الصلاحيات للموقع في متصفحك.",
      },
      {
        q: "الصوت لا يعمل في مشغل الأحاديث؟",
        a: "تأكد من وجود اتصال قوي بالإنترنت وعدم تفعيل وضع الصامت في جهازك، وحاول إعادة تحميل الصفحة.",
      },
    ],
  },
  {
    id: "contact-support",
    title: "تواصل مع فريق أثر",
    subtitle: "إرسال استفسارات أو ملاحظات مباشرة لمشرفي المنصة",
    icon: HiOutlineEnvelope,
    articles: [
      {
        q: "كيف أتواصل مع فريق الدعم والمشرفين؟",
        a: "يمكنك استخدام الزر المنبثق في أسفل الشاشة لإرسال رسالة مباشرة أو اقتراح لفريق العمل وسيتم الرد عليك في أقرب وقت.",
      },
    ],
  },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Filter categories and articles based on search query
  const filteredCategories = HELP_CATEGORIES.map((cat) => {
    const matchingArticles = cat.articles.filter(
      (art) =>
        art.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, matchingArticles };
  }).filter(
    (cat) =>
      cat.matchingArticles.length > 0 ||
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handleSendContact = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setIsContactModalOpen(false);
        setContactSubject("");
        setContactMessage("");
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-base-200 font-2 text-base-content relative" dir="rtl">
      <main className="px-3 sm:px-8 py-8 pt-3 pb-28 sm:pb-32 lg:pb-8" dir="rtl">
        <Navbar activePage="settings" />

        <div className="mt-4 sm:mt-6">
          {/* ── Centered Header Title & Back Button (Button on the Right in RTL) ── */}
          <header className="text-center space-y-2 mb-6">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-base-100 dark:bg-slate-900 border border-base-300 dark:border-slate-800 flex items-center justify-center text-base-content hover:text-cyan-600 hover:border-cyan-600/50 transition-all cursor-pointer shadow-xs shrink-0"
                title="الرجوع للصفحة السابقة"
                aria-label="الرجوع للصفحة السابقة"
              >
                <HiChevronRight className="text-xl" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold font-1 text-base-content">
                مركز المساعدة
              </h1>
            </div>
            <p className="text-sm md:text-base text-base-content/60 font-normal">
              إجابات الأسئلة الشائعة والدليل التفاعلي لمنصة أثر
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            {/* ── Search Bar ── */}
            <div className="mb-6">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث..."
                  className="w-full h-12 pr-11 pl-4 rounded-2xl bg-base-100 dark:bg-slate-900 border border-base-300/80 dark:border-slate-800 text-base-content placeholder:text-base-content/40 focus:border-cyan-600 focus:outline-none shadow-xs text-sm sm:text-base font-medium transition-all"
                />
                <HiOutlineMagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-base-content/40 pointer-events-none" />
              </div>
            </div>

            {/* ── Categories List ── */}
            <div className="space-y-3">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12 bg-base-100 dark:bg-slate-900 rounded-3xl border border-base-300/70 p-6">
                  <p className="text-base text-base-content/60">
                    لم نجد نتائج مطابقة لـ "{searchQuery}"
                  </p>
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const isExpanded = expandedCategory === cat.id || searchQuery.length > 0;

                  return (
                    <div
                      key={cat.id}
                      className="bg-base-100 dark:bg-slate-900 rounded-2xl border border-base-300/80 dark:border-slate-800/80 shadow-xs overflow-hidden transition-all"
                    >
                      {/* Category Header Row */}
                      <div
                        onClick={() => toggleCategory(cat.id)}
                        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-base-200/40 dark:hover:bg-slate-800/40 transition-colors select-none"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-cyan-700/10 dark:bg-cyan-400/10 border border-cyan-700/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
                            <HiOutlineFolder className="text-xl" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-1 font-bold text-base sm:text-lg text-base-content">
                              {cat.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-base-content/60 font-normal mt-0.5 truncate">
                              {cat.subtitle}
                            </p>
                          </div>
                        </div>

                        <HiChevronLeft
                          className={`text-xl text-base-content/50 shrink-0 transition-transform duration-300 ${
                            isExpanded ? "-rotate-90 text-cyan-600" : ""
                          }`}
                        />
                      </div>

                      {/* Smooth Animated Accordion Expansion/Collapse using Framer Motion */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="overflow-hidden border-t border-base-200 dark:border-slate-800/60 bg-base-200/30 dark:bg-slate-900/50"
                          >
                            <div className="px-4 sm:px-6 py-4 space-y-3.5">
                              {cat.matchingArticles.map((art, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                                  className="bg-base-100 dark:bg-slate-800/60 p-4 rounded-xl border border-base-300/60 dark:border-slate-700/60 space-y-1.5 shadow-2xs"
                                >
                                  <h4 className="font-bold text-sm sm:text-base text-cyan-800 dark:text-cyan-300">
                                    {art.q}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed font-normal">
                                    {art.a}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Floating Contact Support Button (Elevated on mobile above Dock) ── */}
      <button
        type="button"
        onClick={() => setIsContactModalOpen(true)}
        className="fixed bottom-24 sm:bottom-8 left-5 sm:left-8 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center shadow-2xl shadow-cyan-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="تواصل مع فريق أثر"
        aria-label="تواصل مع الدعم"
      >
        <HiOutlineChatBubbleLeftRight className="text-xl sm:text-2xl" />
      </button>

      {/* ── Contact Support Modal with Smooth Fade & Scale Animation ── */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0"
              onClick={() => setIsContactModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg rounded-3xl border border-cyan-200 dark:border-cyan-900 bg-base-100 dark:bg-slate-900 p-6 text-right shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-base-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-700/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-lg">
                    <HiOutlineChatBubbleLeftRight />
                  </div>
                  <h3 className="font-1 font-bold text-lg text-base-content">
                    تواصل مع الدعم الفني لمأثر
                  </h3>
                </div>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-base-200 dark:bg-slate-800 flex items-center justify-center text-base-content/70 hover:text-base-content cursor-pointer"
                >
                  <HiOutlineXMark className="text-lg" />
                </button>
              </div>

              {sentSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <HiOutlineCheckCircle className="text-5xl text-emerald-500 mx-auto" />
                  <h4 className="font-1 font-bold text-lg text-base-content">
                    تم إرسال رسالتك بنجاح!
                  </h4>
                  <p className="text-xs sm:text-sm text-base-content/70">
                    سيتواصل معك فريق منصة أثر في أقرب وقت.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendContact} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-base-content mb-1">
                      عنوان الاستفسار
                    </label>
                    <input
                      type="text"
                      required
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="مثال: استفسار حول خطة التسميع"
                      className="w-full h-11 px-3.5 rounded-xl bg-base-100 dark:bg-slate-800 border border-base-300 dark:border-slate-700 text-sm font-medium text-base-content focus:border-cyan-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-base-content mb-1">
                      تفاصيل الرسالة
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="اكتب استفسارك هنا..."
                      className="w-full p-3.5 rounded-xl bg-base-100 dark:bg-slate-800 border border-base-300 dark:border-slate-700 text-sm font-medium text-base-content focus:border-cyan-600 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsContactModalOpen(false)}
                      className="btn btn-ghost h-10 min-h-0 rounded-xl px-5 text-sm font-semibold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="btn bg-cyan-700 hover:bg-cyan-800 text-white h-10 min-h-0 rounded-xl px-6 text-sm font-bold border-none cursor-pointer"
                    >
                      {isSending ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        "إرسال الرسالة"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
