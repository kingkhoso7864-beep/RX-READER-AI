import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  ScanLine,
  History,
  ShieldAlert,
  CalendarCheck,
  Bot,
  UserCog,
  FileDown,
  Sun,
  Moon,
  Laptop,
  Globe,
  ChevronDown,
  Menu,
  Pill,
  LogOut,
  LogIn,
  Sparkles,
  HelpCircle,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ThemeMode } from '../types';
import { SafetyModal } from './SafetyModal';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, language, setLanguage, exportPDFReport, setIsChatOpen } = useApp();
  const { theme, setTheme, isDark } = useTheme();
  const { user, isAuthenticated, logout, setShowAuthModal, triggerOnboarding } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleNavClick = (tabId: string) => {
    if (tabId === 'assistant') {
      setIsChatOpen(true);
    } else {
      setActiveTab(tabId);
    }
    setIsOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: language === 'ur' ? 'ڈیش بورڈ (Dashboard)' : 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: language === 'ur' ? 'نسخہ سکین کریں (Scan Prescription)' : 'Scan Prescription', icon: ScanLine },
    { id: 'history', label: language === 'ur' ? 'سکین ہسٹری (Prescription History)' : 'Prescription History', icon: History },
    { id: 'interactions', label: language === 'ur' ? 'ادویات کا درمیانی اثر (Interactions & Safety)' : 'Interactions & Safety', icon: ShieldAlert },
    { id: 'schedule', label: language === 'ur' ? 'آج کا شیڈول (Today\'s Schedule)' : 'Today\'s Schedule', icon: CalendarCheck },
    { id: 'assistant', label: language === 'ur' ? 'اے آئی معاون (Ask AI Assistant)' : 'Ask AI Assistant', icon: Bot },
    { id: 'profile', label: language === 'ur' ? 'پروفائل اور ترتیبات (Profile & Settings)' : 'Profile & Settings', icon: UserCog },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Name */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 group hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:rotate-6 transition-transform">
              <Pill className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-sora text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 dark:from-teal-400 dark:to-teal-200 bg-clip-text text-transparent">
                Rx Reader
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400">
                AI Health & Prescription
              </span>
            </div>
          </button>

          {/* Quick Desktop Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : ''}`} />
                  <span>{item.label.split('(')[0]}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section: Theme Selector + Language + Main Menu */}
          <div className="flex items-center gap-2">
            
            {/* Quick Theme Selection Mode Segment */}
            <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
                const active = theme === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      active
                        ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={`Switch to ${mode} mode`}
                  >
                    {mode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    {mode === 'dark' && <Moon className="w-3.5 h-3.5 text-teal-400" />}
                    {mode === 'system' && <Laptop className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                    <span className="hidden lg:inline">{mode}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Direct Theme Toggle Sun/Moon Icon button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="md:hidden p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.02] transition-all"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-teal-700" />}
            </button>

            {/* Quick Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.02] transition-all"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{language === 'en' ? 'EN | اردو' : 'اردو | EN'}</span>
            </button>

            {/* Main Menu Dropdown Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 dark:bg-teal-500 text-white font-medium text-sm shadow-md shadow-teal-500/20 hover:bg-teal-700 dark:hover:bg-teal-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline font-sora">Main Menu</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-h-[85vh] overflow-y-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                  
                  {/* USER ACCOUNT / AUTH STATUS HEADER */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl mb-2 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
                    {user ? (
                      <div className="flex items-center gap-2.5 min-w-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-teal-500" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {user.displayName ? user.displayName.charAt(0) : 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        <span>Guest Mode</span>
                      </div>
                    )}

                    {user ? (
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800 shrink-0 transition-colors flex items-center gap-1"
                        title="Log Out of Session"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          setIsOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>

                  {/* Highlighted Export PDF Button */}
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        exportPDFReport();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold text-sm shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>{language === 'ur' ? 'پی ڈی ایف رپورٹ دیکھیں' : 'Export PDF Report'}</span>
                    </button>
                  </div>

                  {/* Main Navigation Links */}
                  <div className="py-1 space-y-0.5 border-t border-slate-100 dark:border-slate-700/60 pt-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all hover:scale-[1.01] ${
                            isActive
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SECTION: SAFETY & PRIVACY MODAL TRIGGER */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 px-1 mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setIsSafetyModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{language === 'ur' ? 'حفاظت اور پرائیویسی پالیسی' : 'Safety & Privacy Policy'}</span>
                    </button>

                    <button
                      onClick={() => {
                        triggerOnboarding();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>{language === 'ur' ? 'دوبارہ آن بورڈنگ ٹور دیکھیں' : 'Re-play Onboarding Tour'}</span>
                    </button>
                  </div>

                  {/* SECTION: THEME */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 px-1">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">
                      {language === 'ur' ? 'تھیم (THEME)' : 'THEME'}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                      {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
                        const active = theme === mode;
                        return (
                          <button
                            key={mode}
                            onClick={() => setTheme(mode)}
                            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all hover:scale-[1.02] ${
                              active
                                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {mode === 'light' && <Sun className="w-3.5 h-3.5" />}
                            {mode === 'dark' && <Moon className="w-3.5 h-3.5" />}
                            {mode === 'system' && <Laptop className="w-3.5 h-3.5" />}
                            <span>{mode}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION: APPLICATION LANGUAGE */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 px-1 pb-1">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">
                      {language === 'ur' ? 'زبان (APPLICATION LANGUAGE)' : 'APPLICATION LANGUAGE'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] ${
                          language === 'en'
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage('ur')}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] ${
                          language === 'ur'
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        اردو (Urdu)
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* SAFETY & PRIVACY MODAL */}
      <SafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />
    </header>
  );
};
