import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaMicrophone } from 'react-icons/fa';
import { AiFillSetting } from 'react-icons/ai';
import { MdMenuBook } from 'react-icons/md';

import ProgressHeader from '../components/onboarding/ProgressHeader';
import OnboardingCard from '../components/onboarding/OnboardingCard';
import NavigationButtons from '../components/onboarding/NavigationButtons';
import { useAuth } from '../context/AuthContext';

/**
 * Onboarding Steps Data
 */
const ONBOARDING_STEPS = [
  {
    id: 1,
    icon: <FaMicrophone />,
    title: 'حفظ الأحاديث بذكاء',
    description:
      'استخدم الذكاء الاصطناعي لاكتشاف أخطاء الحفظ وتصحيحها لحظيًا عبر محرك التسميع الذكي.',
  },
  {
    id: 2,
    icon: <AiFillSetting />,
    title: 'خطط مراجعة مخصصة',
    description:
      'خوارزميات التكرار المتباعد تضمن لك عدم النسيان وبناء خطة تناسب وقتك ومستواك.',
  },
  {
    id: 3,
    icon: <MdMenuBook />,
    title: 'بيئة تعليمية متكاملة',
    description:
      'تكامل تام مع الشروحات الموثقة، مقاطع يوتيوب، وتسجيلات صوتية بشرية لضمان النطق الصحيح.',
  },
];

export default function Onboarding() {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginGuest } = useAuth();

  const currentStepNum = parseInt(stepId, 10) || 1;
  const totalSteps = ONBOARDING_STEPS.length;

  // Preserve entry point state across step navigation
  const entrySource = location.state?.from || 'default';

  // Ensure stepId parameter is valid (1 <= stepId <= 3)
  useEffect(() => {
    if (!stepId || isNaN(currentStepNum) || currentStepNum < 1 || currentStepNum > totalSteps) {
      navigate('/onboarding/1', { replace: true, state: location.state });
    }
  }, [stepId, currentStepNum, totalSteps, navigate, location.state]);

  const currentStepData = ONBOARDING_STEPS[currentStepNum - 1] || ONBOARDING_STEPS[0];
  const isLastStep = currentStepNum === totalSteps;

  /**
   * Navigate to the final destination based on entry source:
   *  - 'signup' → /login
   *  - 'guest' → /home (with guest session)
   *  - default → /login
   */
  const handleExitOnboarding = () => {
    if (entrySource === 'guest') {
      loginGuest();
      navigate('/home', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleExitOnboarding();
    } else {
      navigate(`/onboarding/${currentStepNum + 1}`, { state: location.state });
    }
  };

  const handlePrev = () => {
    if (currentStepNum > 1) {
      navigate(`/onboarding/${currentStepNum - 1}`, { state: location.state });
    }
  };

  const handleSkip = () => {
    handleExitOnboarding();
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col justify-between selection:bg-cyan-700 selection:text-white transition-colors duration-200">
      {/* Top Bar: Skip button */}
      <ProgressHeader onSkip={handleSkip} />

      {/* Main Content Area: Step Card (Icon + Title + Description + Progress Dots) */}
      <main className="flex-1 flex items-center justify-center py-6 px-4">
        <OnboardingCard
          key={currentStepData.id}
          icon={currentStepData.icon}
          title={currentStepData.title}
          description={currentStepData.description}
          currentStep={currentStepNum}
          totalSteps={totalSteps}
        />
      </main>

      {/* Bottom Bar: Previous & Next Buttons */}
      <NavigationButtons
        currentStep={currentStepNum}
        totalSteps={totalSteps}
        onPrev={handlePrev}
        onNext={handleNext}
        isLastStep={isLastStep}
      />
    </div>
  );
}
