import React, { useState } from 'react';
import { ShieldAlert, Pill, HeartHandshake, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SafetyModal } from './SafetyModal';

export const Footer: React.FC = () => {
  const { language } = useApp();
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);

  return (
    <footer className="w-full bg-white dark:bg-[#1E293B] border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-6 text-center md:text-left md:flex-row">
        
        {/* Brand Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sora font-bold text-slate-900 dark:text-white text-base">Rx Reader</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ur'
                ? 'ذہین نسخہ ریڈر اور صحت کا معاون'
                : 'Smart Prescription Reader & Medical Health Assistant'}
            </p>
          </div>
        </div>

        {/* Global Mandatory Disclaimer Banner (Clickable to open Safety & Privacy Modal) */}
        <button
          onClick={() => setIsSafetyOpen(true)}
          className="flex items-center gap-2 max-w-2xl px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium transition-all hover:scale-[1.01] text-left"
          title="Click to view full Safety & Privacy Policy"
        >
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {language === 'ur'
              ? 'صرف معلومات کے مقصد کے لیے۔ کسی اہل طبی ماہر سے مشورہ کریں۔ (حفاظتی پالیسی دیکھیں)'
              : 'For informational purposes only. Consult a qualified medical practitioner. (View Safety & Privacy Policy)'}
          </span>
        </button>

        {/* Copyright, Safety Link & Developer Credit */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setIsSafetyOpen(true)}
            className="flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety & Privacy</span>
          </button>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>© {new Date().getFullYear()} Rx Reader Health</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 font-medium text-slate-700 dark:text-slate-200">
            <span>Developed by</span>
            <span className="font-bold text-teal-700 dark:text-teal-300">MUZAMIL KHOSO</span>
          </div>
        </div>

      </div>

      {/* SAFETY & PRIVACY MODAL */}
      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />
    </footer>
  );
};
