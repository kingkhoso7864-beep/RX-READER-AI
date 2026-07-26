import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  X,
  Pill,
  Check,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Volume2,
  Edit3,
  Trash2,
  SkipForward,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TodayScheduleItem } from '../types';
import { ScheduleModal } from '../components/ScheduleModal';

export const SchedulePage: React.FC = () => {
  const {
    schedule,
    toggleScheduleItem,
    toggleSkipScheduleItem,
    deleteScheduleItem,
    language,
    testVoiceReminder,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Night'>('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TodayScheduleItem | null>(null);

  const filteredSchedule = schedule.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.timeOfDay === activeFilter;
  });

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'Morning':
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'Afternoon':
        return <Sun className="w-4 h-4 text-orange-500" />;
      case 'Evening':
        return <Sunset className="w-4 h-4 text-purple-500" />;
      case 'Night':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      default:
        return <Clock className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {language === 'ur' ? 'آج کا خوراک کا شیڈول' : "Today's Medication Schedule"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {language === 'ur'
              ? 'اپنی روزانہ کی ادویات کا وقت اور خوراک ریکارڈ دیکھیں۔'
              : 'Track your daily medication times, food guidelines, and dose history.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={testVoiceReminder}
            className="px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 text-teal-700 dark:text-teal-300 font-semibold text-xs border border-teal-200 dark:border-teal-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span>Test Voice Reminder</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setShowScheduleModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dose to Schedule</span>
          </button>
        </div>
      </div>

      {/* TIME OF DAY FILTER TABS */}
      <div className="bg-white dark:bg-[#1E293B] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-1">
        {(['All', 'Morning', 'Afternoon', 'Evening', 'Night'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01] ${
              activeFilter === filter
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* SCHEDULE CARDS LIST */}
      <div className="space-y-4">
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No medication doses scheduled for this time filter.
            </p>
          </div>
        ) : (
          filteredSchedule.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-[1.005] ${
                item.taken
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                  : item.skipped
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 opacity-80'
                  : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-teal-500'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => toggleScheduleItem(item.id)}
                  title={item.taken ? 'Mark as Pending' : 'Mark as Taken'}
                  className={`mt-1 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    item.taken
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                  }`}
                >
                  {item.taken && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`font-sora font-bold text-base ${
                        item.taken
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : item.skipped
                          ? 'line-through text-amber-700/70 dark:text-amber-400/70'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.medicineName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                      {item.dosage}
                    </span>

                    {item.frequency && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.frequency}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">
                    💡 {item.foodAdvice || 'Take with full glass of water'}
                  </p>

                  {(item.startDate || item.endDate) && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      <span>
                        Start: {item.startDate || 'Today'}
                        {item.endDate ? ` • End: ${item.endDate}` : ''}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {getTimeIcon(item.timeOfDay)}
                  <span>{item.time} ({item.timeOfDay})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleScheduleItem(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      item.taken
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-teal-600 text-white shadow-xs hover:bg-teal-700'
                    }`}
                  >
                    {item.taken ? `Taken (${item.takenAt})` : 'Mark Taken'}
                  </button>

                  <button
                    onClick={() => toggleSkipScheduleItem(item.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      item.skipped
                        ? 'bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800'
                    }`}
                    title={item.skipped ? 'Reset to Pending' : 'Mark Dose Skipped'}
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowScheduleModal(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Schedule Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remove ${item.medicineName} from schedule?`)) {
                        deleteScheduleItem(item.id);
                      }
                    }}
                    className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    title="Delete Schedule Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SCHEDULE MODAL */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
      />

    </div>
  );
};
