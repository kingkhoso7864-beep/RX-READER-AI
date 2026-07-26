import React, { useState } from 'react';
import {
  ScanLine,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Pill,
  CheckCircle2,
  Lock,
  Globe,
  Bell,
  Activity,
  Bot,
  FileText,
  ShieldAlert,
  Clock,
  ChevronRight,
  LogIn,
  UserPlus,
  Shield,
  FileCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SafetyModal } from '../components/SafetyModal';

export const LandingPage: React.FC = () => {
  const { setShowAuthModal, triggerOnboarding } = useAuth();
  const { isDark, setTheme, theme } = useTheme();
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors duration-300">
      
      {/* PUBLIC NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sora text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 dark:from-teal-400 dark:to-teal-200 bg-clip-text text-transparent">
                Rx Reader
              </span>
              <span className="block text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400">
                AI Prescription Engine
              </span>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, 'features')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#safety"
              onClick={(e) => {
                handleSmoothScroll(e, 'safety');
              }}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-semibold text-teal-600 dark:text-teal-400"
            >
              Safety & Privacy
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-teal-600" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800/80 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Next-Gen Gemini AI Prescription OCR</span>
              </div>

              <h1 className="font-sora font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-[1.15]">
                Turn Handwritten Prescriptions into <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">Smart Health Schedules</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Scan doctor notes instantly, detect dangerous drug-drug interactions, and receive real-time push reminders in English and Urdu. Private, accurate, and built for patient peace of mind.
              </p>

              {/* Call-to-action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-xl shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => triggerOnboarding()}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>Preview Guided Tour</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                  <h4 className="font-sora font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">98%</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">OCR Accuracy</p>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xl sm:text-2xl text-teal-600 dark:text-teal-400">100%</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Encrypted & Private</p>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">EN & UR</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bilingual Support</p>
                </div>
              </div>

            </div>

            {/* Right Interactive UI Preview Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-500 ml-2">Rx Reader AI Preview</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    Active Session
                  </span>
                </div>

                {/* Mockup Card 1: OCR Scan Success */}
                <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Doctor Prescription Parsed
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Today 10:30 AM</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    Atorvastatin 20mg • Metformin 500mg • Omeprazole 20mg
                  </p>
                </div>

                {/* Mockup Card 2: Interaction Warning */}
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Safety Warning: Moderate Interaction</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Separate Antacid and Iron supplements by at least 2 hours to ensure full absorption.
                  </p>
                </div>

                {/* Mockup Card 3: Schedule Dose */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Next Dose: Panadol 500mg</p>
                      <p className="text-[11px] text-slate-500">Scheduled for 8:00 PM • Take after meal</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
                  >
                    Take
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS GRID */}
      <section id="features" className="py-16 bg-white dark:bg-[#1E293B]/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-sora font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white">
              Built for Complete Medication Intelligence
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Everything you need to digitize prescriptions, stay safe from adverse drug reactions, and never miss a dose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:scale-[1.02] transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold mb-4 shadow-sm">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white">
                AI Prescription Reader
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Powered by Gemini AI vision. Upload handwritten or printed prescription images to automatically extract medicine names, exact dosages, and daily frequencies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:scale-[1.02] transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4 shadow-sm">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white">
                Interaction & Allergy Safety
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Cross-references active prescriptions against your health profile and known allergies. Receives clear severity alerts before taking new pills together.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:scale-[1.02] transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4 shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white">
                Smart Reminders & Push
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Organizes doses into Morning, Afternoon, and Night schedules. Sends real-time web push notifications with meal instructions (e.g. take with food).
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-sora font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white">
              3 Simple Steps to Smart Healthcare
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Transform your paper prescriptions into organized digital health records in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-sora font-bold text-base text-slate-900 dark:text-white">
                Snap & Upload
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Take a picture or upload any doctor's prescription directly from your camera or gallery.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-sora font-bold text-base text-slate-900 dark:text-white">
                AI Vision Extraction
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Gemini OCR identifies drug names, dosage timing, and screens for allergy conflicts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-sora font-bold text-base text-slate-900 dark:text-white">
                Automated Dose Tracker
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Follow your daily schedule, log taken doses, and export clean PDF reports anytime.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* DEDICATED SAFETY & PRIVACY SECTION */}
      <section id="safety" className="py-20 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Medical Safety & Privacy Infrastructure</span>
            </div>

            <h2 className="font-sora font-extrabold text-3xl sm:text-5xl text-white">
              Patient Safety & Data Privacy First
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Designed with strict data protection, client-side encryption, and clinical drug-interaction checks to give you total control over your health information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 hover:border-teal-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-sora font-bold text-lg text-white">100% Encrypted Storage</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prescription scans and schedule histories are saved locally in your encrypted browser state. No third-party data tracking or selling.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 hover:border-teal-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-sora font-bold text-lg text-white">Interaction Shield</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Screens active regimens against multi-drug contraindications and food warnings, alerting you before conflicting doses are taken.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 hover:border-teal-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-sora font-bold text-lg text-white">Bilingual Safety</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Provides warnings and dose timing instructions in clear English and Urdu (اردو), complete with text-to-speech audio support.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 hover:border-teal-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-sora font-bold text-lg text-white">Doctor Verification</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Includes automated OCR confidence scoring. Extractions below threshold are flagged for doctor or pharmacist verification.
              </p>
            </div>

          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 hover:scale-[1.02] transition-all inline-flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Read Full Medical & Safety Policy</span>
            </button>
          </div>

          {/* CTA Banner inside Safety section */}
          <div className="mt-12 bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-8 text-center border border-teal-500/30 shadow-xl relative overflow-hidden">
            <div className="max-w-xl mx-auto space-y-4 relative z-10">
              <h3 className="font-sora font-extrabold text-2xl text-white">
                Ready to Take Control of Your Medication?
              </h3>
              <p className="text-xs sm:text-sm text-teal-100/90">
                Join thousands of patients using Rx Reader for safer, smarter prescription tracking today.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-8 bg-white dark:bg-[#1E293B] border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <span className="font-sora font-bold text-slate-800 dark:text-slate-200">Rx Reader Engine</span>
          </div>

          <div className="flex items-center justify-center gap-6 font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Safety Policy
            </button>
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Medical Disclaimer
            </button>
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Privacy & Encryption
            </button>
          </div>

          <p className="max-w-xl mx-auto leading-relaxed">
            Medical Disclaimer: Rx Reader provides AI assistance for prescription extraction and scheduling. Always consult a licensed healthcare professional before changing your medication regimen.
          </p>
          <p>© {new Date().getFullYear()} Rx Reader Web Application. All rights reserved.</p>

          <div className="pt-1 flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 font-medium text-slate-700 dark:text-slate-200">
              <span>Developed by</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">MUZAMIL KHOSO</span>
            </div>
          </div>
        </div>
      </footer>

      {/* SAFETY & PRIVACY MODAL */}
      <SafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

    </div>
  );
};
