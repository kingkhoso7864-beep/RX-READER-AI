import React from 'react';
import {
  User as UserIcon,
  LogOut,
  LogIn,
  Bell,
  Globe,
  Shield,
  ShieldCheck,
  Lock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Mail,
  Key,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const {
    profile,
    setProfile,
    language,
    setLanguage,
    notificationPermission,
    requestNotificationPermission,
    sendNotification,
    voiceRemindersEnabled,
    setVoiceRemindersEnabled,
    selectedVoiceURI,
    setSelectedVoiceURI,
    availableVoices,
    testVoiceReminder,
  } = useApp();

  const { user, logout, setShowAuthModal, triggerOnboarding } = useAuth();

  const handleToggleAutoAlerts = () => {
    const next = !profile.autoInteractionAlerts;
    setProfile((prev) => ({ ...prev, autoInteractionAlerts: next }));
    toast.success(next ? 'Automatic Drug Interaction Alerts Enabled' : 'Interaction Alerts Disabled');
  };

  const handleToggleBilingualOcr = () => {
    const next = !profile.bilingualOcr;
    setProfile((prev) => ({ ...prev, bilingualOcr: next }));
    toast.success(next ? 'Bilingual Urdu OCR Enabled' : 'Bilingual OCR Disabled');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div>
        <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          {language === 'ur' ? 'پروفائل اور ترتیبات' : 'Profile & Safety Settings'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {language === 'ur'
            ? 'اپنی ذاتی معلومات، اطلاعات، اور ایپ کی زبان اور حفاظت کو کنٹرول کریں۔'
            : 'Manage your user account session, browser notifications, and health safety toggles.'}
        </p>
      </div>

      {/* USER ACCOUNT CARD */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:scale-[1.01] transition-transform">
        <div className="flex items-center gap-4 text-center sm:text-left">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-2 ring-teal-500 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-teal-600/30 shrink-0">
              {user ? user.displayName.charAt(0) : profile.name.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white">
                {user ? user.displayName : profile.name}
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                Patient ID: {profile.patientId}
              </span>
              {user && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 capitalize">
                  {user.provider} Auth
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              <span>{user ? user.email : 'guest.patient@rxreader.org'}</span>
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Age: {profile.age} • Gender: {profile.gender} • Blood Group: {profile.bloodGroup}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={triggerOnboarding}
            className="px-3.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 font-semibold text-xs border border-teal-200 dark:border-teal-800 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Onboarding Tour</span>
          </button>

          {user ? (
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 font-semibold text-xs border border-red-200 dark:border-red-800 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/30 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </div>

      {/* HEALTH & SAFETY SETTINGS GRID */}
      <div className="space-y-6">
        <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-600" />
          <span>Health & Safety Settings</span>
        </h3>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          
          {/* 1. LANGUAGE TOGGLE */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sora font-semibold text-sm text-slate-900 dark:text-white">
                  Application Language
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select preferred UI interface language (English or Urdu)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ur')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  language === 'ur'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                اردو (Urdu)
              </button>
            </div>
          </div>

          {/* 2. BROWSER NOTIFICATIONS FULL PERMISSION STATES */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-sora font-semibold text-sm text-slate-900 dark:text-white">
                    Browser Web Notifications
                  </h4>
                  {notificationPermission === 'granted' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Granted</span>
                    </span>
                  )}
                  {notificationPermission === 'denied' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span>Denied</span>
                    </span>
                  )}
                  {notificationPermission === 'default' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      <span>Default</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allow browser push notifications for medication reminders & interaction warnings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={requestNotificationPermission}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-600 text-white'
                    : notificationPermission === 'denied'
                    ? 'bg-red-600 text-white'
                    : 'bg-[#0D9488] text-white'
                }`}
              >
                Grant Access
              </button>
              <button
                onClick={() =>
                  sendNotification('Rx Reader Test Alert', 'Notifications are fully operational!')
                }
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                Test
              </button>
            </div>
          </div>

          {/* 3. VOICE MEDICATION REMINDERS SETTINGS */}
          <div className="pb-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-sora font-semibold text-sm text-slate-900 dark:text-white">
                      🔊 Voice Medication Reminders
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      voiceRemindersEnabled
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {voiceRemindersEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Text-to-Speech audio announcements when scheduled medication time arrives.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setVoiceRemindersEnabled(!voiceRemindersEnabled)}
                  className="p-1 rounded-xl hover:scale-105 transition-transform"
                >
                  {voiceRemindersEnabled ? (
                    <ToggleRight className="w-10 h-10 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-slate-400" />
                  )}
                </button>

                <button
                  onClick={testVoiceReminder}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Voice Reminder</span>
                </button>
              </div>
            </div>

            {/* PREFERRED VOICE SELECTOR IF AVAILABLE */}
            {availableVoices.length > 0 && (
              <div className="pl-13 pt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                  Preferred Speech Voice:
                </label>
                <select
                  value={selectedVoiceURI || ''}
                  onChange={(e) => setSelectedVoiceURI(e.target.value || null)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-md"
                >
                  <option value="">Browser Default Voice</option>
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 4. TOGGLE: AUTOMATIC DRUG INTERACTION ALERTS */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-sora font-semibold text-sm text-slate-900 dark:text-white">
                Automatic Drug Interaction Alerts
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically analyze new scanned prescriptions against active medications.
              </p>
            </div>

            <button
              onClick={handleToggleAutoAlerts}
              className="p-1 rounded-xl hover:scale-105 transition-transform"
            >
              {profile.autoInteractionAlerts ? (
                <ToggleRight className="w-10 h-10 text-teal-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-400" />
              )}
            </button>
          </div>

          {/* 4. TOGGLE: BILINGUAL OCR */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-sora font-semibold text-sm text-slate-900 dark:text-white">
                Bilingual Urdu OCR Engine
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enable deep Urdu text parsing (نستعلیق / اردو) for regional prescription formats.
              </p>
            </div>

            <button
              onClick={handleToggleBilingualOcr}
              className="p-1 rounded-xl hover:scale-105 transition-transform"
            >
              {profile.bilingualOcr ? (
                <ToggleRight className="w-10 h-10 text-teal-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-400" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* PRIVACY CARD */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-sora font-bold text-base text-white">
            Privacy & Encrypted Local Security
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Data remains encrypted on your device. Your medical history and prescription images are processed securely without third-party tracking.
          </p>
        </div>
      </div>

    </div>
  );
};
