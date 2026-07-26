import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  ShieldAlert,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Heart,
  Globe,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'privacy' | 'interactions' | 'security'>('disclaimer');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-6 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sora font-extrabold text-lg text-white">
                Rx Reader Safety & Privacy Policy
              </h3>
              <p className="text-xs text-teal-100/80">
                Medical compliance, encrypted data handling, and AI safety protocols
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Safety Policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL TABS */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'disclaimer'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Medical Disclaimer</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy & Data Protection</span>
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'interactions'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Drug Interactions Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verification Standards</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
          
          {/* TAB 1: MEDICAL DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-sora font-bold text-amber-900 dark:text-amber-200 text-sm">
                    Important Healthcare & Legal Notice
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Rx Reader is an AI-assisted digitization and scheduling helper. It does not provide licensed medical advice, diagnosis, or treatment recommendations.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-sora font-bold text-slate-900 dark:text-white text-base">
                  1. Physician Verification Requirement
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Always verify digitized drug names, strengths, and administration frequencies against the original physical doctor prescription. Never alter your dosage without consulting a certified physician or pharmacist.
                </p>

                <h4 className="font-sora font-bold text-slate-900 dark:text-white text-base pt-2">
                  2. OCR Confidence Ratings
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Handwritten doctor notes vary significantly in legibility. Rx Reader assigns confidence scores to extracted prescriptions. Any extraction with a score below 90% is flagged for mandatory manual review before adding to your schedule.
                </p>

                <h4 className="font-sora font-bold text-slate-900 dark:text-white text-base pt-2">
                  3. Emergency Situations
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  If you suspect an accidental overdose, severe allergic reaction, or acute adverse event, call emergency services immediately or visit the nearest hospital emergency department.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & DATA PROTECTION */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 flex items-start gap-3">
                <Lock className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sora font-bold text-teal-900 dark:text-teal-200 text-sm">
                    Client-Side & Encrypted Local Storage
                  </h4>
                  <p className="text-xs text-teal-800 dark:text-teal-300">
                    Your medical history and uploaded prescription scans are stored securely on your browser session.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
                  <h5 className="font-sora font-bold text-xs text-slate-900 dark:text-white">Zero Data Monetization</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    We never sell, trade, or share patient health records or scan logs with pharmaceutical marketers or advertising brokers.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
                  <h5 className="font-sora font-bold text-xs text-slate-900 dark:text-white">Full User Control & Erasure</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    You can clear all scanned history, active dose schedules, and stored profile parameters with a single click in your Profile Settings at any time.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
                  <h5 className="font-sora font-bold text-xs text-slate-900 dark:text-white">Secure API Processing</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Image recognition is processed using stateless server-side Gemini AI Vision proxies. Images are analyzed solely for prescription parsing and immediately discarded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DRUG INTERACTIONS ENGINE */}
          {activeTab === 'interactions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="font-sora font-bold text-slate-900 dark:text-white text-base">
                Automated Drug-Drug Interaction Safety
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                When multiple medications are prescribed, Rx Reader screens for common interactions and contraindications:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 space-y-1">
                  <span className="text-xs font-bold text-red-700 dark:text-red-300">Severe Contraindication</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    High risk of toxic accumulation or dangerous blood pressure changes. Requires immediate doctor review.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-1">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Moderate Interaction</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Reduced drug absorption (e.g. Antacids & Antibiotics). Advised to space administration by 2–4 hours.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-1">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Food & Beverage Warning</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Specific dietary advice like avoiding Grapefruit juice or taking with food to prevent gastric irritation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION STANDARDS */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="font-sora font-bold text-slate-900 dark:text-white text-base">
                Verification & Accessibility Features
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><strong>Bilingual Support:</strong> Complete interface and prescription instructions in English & Urdu (اردو).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><strong>Audio Speech Assistant:</strong> Built-in text-to-speech for visually impaired or elderly patients.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><strong>PDF Report Export:</strong> Clean medical summaries to share with your family doctor during visits.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><strong>Web Push Reminders:</strong> Real-time browser notifications for exact dose timings.</span>
                </li>
              </ul>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Version 2.4 Health & Safety Protocol
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};
