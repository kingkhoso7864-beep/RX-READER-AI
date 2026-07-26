import React, { useState } from 'react';
import {
  ScanLine,
  ShieldAlert,
  CalendarCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Pill,
  Bell,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showOnboarding) return null;

  const steps = [
    {
      id: 'step-1',
      badge: 'Step 1 of 3',
      title: 'AI Prescription Reader',
      subtitle: 'Extract Meds Instantly',
      description:
        'Upload or take a photo of any handwritten or printed prescription. Our Gemini AI OCR engine automatically extracts medicine names, dosages, frequencies, and meal instructions with bilingual English & Urdu support.',
      icon: ScanLine,
      color: 'from-teal-500 to-emerald-600',
      iconBg: 'bg-teal-500/20 text-teal-300',
      highlights: [
        'Instant Gemini AI OCR extraction',
        'Bilingual English & Urdu support',
        'Confidence score & medicine verification',
      ],
    },
    {
      id: 'step-2',
      badge: 'Step 2 of 3',
      title: 'Safety & Interaction Alerts',
      subtitle: 'Prevent Drug Conflicts',
      description:
        'Rx Reader automatically cross-checks newly scanned prescriptions against your active medicines and allergies. Receive real-time severity warnings (High, Moderate, Low) before taking conflicting pills.',
      icon: ShieldAlert,
      color: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-500/20 text-amber-300',
      highlights: [
        'Automatic drug-drug interaction scanning',
        'Known patient allergy conflict checks',
        'Clear clinical recommendations & warnings',
      ],
    },
    {
      id: 'step-3',
      badge: 'Step 3 of 3',
      title: 'Smart Schedule & Reminders',
      subtitle: 'Never Miss a Dose',
      description:
        'Stay on track with personalized Morning, Afternoon, and Night schedule tracking. Receive browser push notifications with specific food advice (e.g. take with meals) so you take every dose safely and on time.',
      icon: CalendarCheck,
      color: 'from-blue-500 to-teal-600',
      iconBg: 'bg-blue-500/20 text-blue-300',
      highlights: [
        'Organized daily Morning / Afternoon / Night view',
        'Real-time browser push notifications',
        '1-tap dose logging & adherence tracker',
      ],
    },
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Top Gradient Banner Header */}
        <div className={`relative p-8 bg-gradient-to-br ${step.color} text-white overflow-hidden`}>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: Badge + Skip */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider text-white">
              {step.badge}
            </span>
            <button
              onClick={completeOnboarding}
              className="text-xs font-semibold text-white/80 hover:text-white underline transition-colors"
            >
              Skip Onboarding
            </button>
          </div>

          {/* Step Hero Visual */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 shadow-lg">
              <StepIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-sora font-extrabold text-2xl text-white">
                {step.title}
              </h2>
              <p className="text-sm text-white/90 font-medium">
                {step.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 bg-white dark:bg-[#1E293B]">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>

          {/* Bullet Highlights */}
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {step.highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Progress Indicators (3 Step Dots) */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-8 bg-teal-600 dark:bg-teal-400'
                    : 'w-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                currentStep === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
