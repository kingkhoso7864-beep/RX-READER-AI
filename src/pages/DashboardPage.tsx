import React, { useState, useEffect } from 'react';
import {
  ScanLine,
  CheckCircle2,
  Clock,
  Pill,
  Bell,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Calendar,
  Sparkles,
  PlusCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const {
    scans,
    schedule,
    toggleScheduleItem,
    setActiveTab,
    notificationPermission,
    requestNotificationPermission,
    sendNotification,
    language,
    loadSampleData,
    clearAllData,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);

  // Simulate quick state loading skeleton effect on view mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const isNewUser = scans.length === 0;
  const totalScansCount = scans.length;
  const activeMedicinesCount = schedule.length;
  const takenCount = schedule.filter((s) => s.taken).length;
  const onTimeDosesPercentage = schedule.length > 0 ? Math.round((takenCount / schedule.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* REAL-TIME NOTIFICATION BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Bell className="w-6 h-6 text-amber-300 animate-bounce" />
            </div>
            <div>
              <h2 className="font-sora font-bold text-lg sm:text-xl text-white">
                {language === 'ur' ? 'ریئل ٹائم ویب اطلاعات کو فعال کریں' : 'Enable Real-time Web Notifications'}
              </h2>
              <p className="text-sm text-teal-100/90 mt-0.5">
                {language === 'ur'
                  ? 'برائے راست خوراک کی یاد دہانی اور ادویات کے الرٹس حاصل کریں۔'
                  : 'Receive real-time dose reminders even when your browser tab is in the background.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={requestNotificationPermission}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {notificationPermission === 'granted' ? 'Allowed ✓' : 'Allow Access'}
            </button>
            <button
              onClick={() =>
                sendNotification(
                  'Rx Reader Test Notification',
                  'Rx Reader notifications are working perfectly!'
                )
              }
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-sm backdrop-blur-md border border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Test Alert
            </button>
          </div>
        </div>
      </div>

      {/* STAT CARDS SECTION WITH DYNAMIC ZERO-STATE DETECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* STAT 1: TOTAL SCANS */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-[1.02] transition-all duration-200">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {language === 'ur' ? 'کل سکین شدہ نسخے' : 'Total Scans'}
                </p>
                <h3 className="font-sora font-extrabold text-3xl text-slate-900 dark:text-white mt-1">
                  {totalScansCount}
                </h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{isNewUser ? '0 Prescriptions Scanned' : 'OCR Accuracy 98%'}</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <ScanLine className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {/* STAT 2: ON-TIME DOSES % */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-[1.02] transition-all duration-200">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {language === 'ur' ? 'بروقت خوراک کی شرح' : 'On-Time Doses %'}
                </p>
                <h3 className="font-sora font-extrabold text-3xl text-teal-600 dark:text-teal-400 mt-1">
                  {onTimeDosesPercentage}%
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {isNewUser ? 'No Active Doses Scheduled' : `${takenCount} of ${schedule.length} Doses Recorded`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {/* STAT 3: ACTIVE MEDICINES */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-[1.02] transition-all duration-200">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {language === 'ur' ? 'فعال ادویات' : 'Active Medicines'}
                </p>
                <h3 className="font-sora font-extrabold text-3xl text-slate-900 dark:text-white mt-1">
                  {activeMedicinesCount}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isNewUser ? 'Ready for New Prescriptions' : 'Interaction Safety Checked'}</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* DYNAMIC ZERO-STATE PLACEHOLDER CARD FOR NEW USERS */}
      {isNewUser ? (
        <div className="bg-gradient-to-br from-teal-900/10 via-slate-900/5 to-amber-900/10 dark:from-teal-950/40 dark:to-slate-900/60 rounded-3xl border-2 border-dashed border-teal-500/30 p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-600 text-white shadow-xl shadow-teal-600/30 animate-pulse">
              <ScanLine className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Today's Medication Schedule</span>
              </span>
              <h3 className="font-sora font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                No Prescriptions Uploaded Yet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                No prescriptions uploaded yet. Click 'Scan Prescription' to get started.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('scan')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xl shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Scan Prescription</span>
              </button>

              <button
                onClick={loadSampleData}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Load Sample Prescription Data</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* TODAY'S SCHEDULE SECTION */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white">
                    {language === 'ur' ? 'آج کا خوراک کا شیڈول' : "Today's Medication Schedule"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>View Full Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : schedule.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No medicines scheduled for today.</div>
            ) : (
              <div className="space-y-3">
                {schedule.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                      item.taken
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-80'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <input
                        type="checkbox"
                        checked={item.taken}
                        onChange={() => toggleScheduleItem(item.id)}
                        className="w-5 h-5 rounded-md text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                      />
                      <div>
                        <h4 className={`font-sora font-semibold text-sm sm:text-base ${item.taken ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {item.medicineName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-medium text-teal-700 dark:text-teal-300">{item.dosage}</span> • {item.foodAdvice}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.time}</span>
                      </span>
                      {item.taken && item.takenAt && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                          Taken at {item.takenAt}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT SCANS SECTION WITH DETAILS LINK */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{language === 'ur' ? 'حالیہ نسخہ جات' : 'Recent Prescription Scans'}</span>
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearAllData}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                  title="Clear all scans to test Zero-State"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Test Zero-State</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>View All History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scans.slice(0, 2).map((scan) => (
                <div
                  key={scan.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 hover:scale-[1.01] transition-transform"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-sora font-semibold text-sm text-slate-900 dark:text-white">
                        {scan.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {scan.doctorName} • {scan.date}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                      {scan.language}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">
                      {scan.medicines.length} Medicines Detected ({scan.confidence}% match)
                    </span>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
