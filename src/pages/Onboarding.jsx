import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FaMicrophone } from 'react-icons/fa';
import { AiFillSetting } from 'react-icons/ai';
import { MdMenuBook } from 'react-icons/md';

import ProgressHeader from '../components/onboarding/ProgressHeader';
import OnboardingCard from '../components/onboarding/OnboardingCard';
import OnboardingDots from '../components/onboarding/OnboardingDots';
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
  const { token } = useAuth();

  const currentStepNum = parseInt(stepId, 10) || 1;
  const totalSteps = ONBOARDING_STEPS.length;

  // Check if user has already completed/seen onboarding previously
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('athar_onboarding_seen') === 'true';
    if (hasSeenOnboarding && !location.state?.from) {
      if (token) {
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }
    // Mark as seen so it won't show again on future visits
    localStorage.setItem('athar_onboarding_seen', 'true');
  }, [token, navigate, location.state]);

  // Ensure stepId parameter is valid (1 <= stepId <= 3)
  useEffect(() => {
    if (!stepId || isNaN(currentStepNum) || currentStepNum < 1 || currentStepNum > totalSteps) {
      navigate('/onboarding/1', { replace: true, state: location.state });
    }
  }, [stepId, currentStepNum, totalSteps, navigate, location.state]);

  const currentStepData = ONBOARDING_STEPS[currentStepNum - 1] || ONBOARDING_STEPS[0];
  const isLastStep = currentStepNum === totalSteps;

  /**
   * Navigate to the final destination after Onboarding:
   * Always redirect logged-in users to /home (الرئيسية)
   */
  const handleExitOnboarding = () => {
    localStorage.setItem('athar_onboarding_seen', 'true');
    localStorage.setItem('athar_has_logged_in_before', 'true');

    if (token) {
      navigate('/home', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const [direction, setDirection] = useState(1); // 1 for Next, -1 for Prev

  const handleNext = () => {
    setDirection(1);
    if (isLastStep) {
      handleExitOnboarding();
    } else {
      navigate(`/onboarding/${currentStepNum + 1}`, { state: location.state });
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    if (currentStepNum > 1) {
      navigate(`/onboarding/${currentStepNum - 1}`, { state: location.state });
    }
  };

  const handleSkip = () => {
    handleExitOnboarding();
  };

  return (
    <div className="h-screen h-dvh max-h-screen w-full bg-base-200 text-base-content flex flex-col justify-between selection:bg-cyan-700 selection:text-white transition-colors duration-200 overflow-hidden select-none">
      {/* Top Bar: Skip button */}
      <ProgressHeader onSkip={handleSkip} />

      {/* Main Content Area: Step Card + Permanent Progress Dots */}
      <main className="flex-1 flex flex-col items-center justify-center py-2 sm:py-4 px-4 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <OnboardingCard
            key={currentStepData.id}
            icon={currentStepData.icon}
            title={currentStepData.title}
            description={currentStepData.description}
            direction={direction}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </AnimatePresence>

        {/* Permanent Progress Dots (Stays mounted so pill slides smoothly without fading) */}
        <OnboardingDots currentStep={currentStepNum} totalSteps={totalSteps} />
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
