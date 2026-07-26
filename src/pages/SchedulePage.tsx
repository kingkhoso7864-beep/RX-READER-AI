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
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SchedulePage: React.FC = () => {
  const { schedule, toggleScheduleItem, addScheduleItem, language } = useApp();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Night'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('1 Tablet');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newTimeOfDay, setNewTimeOfDay] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [newFoodAdvice, setNewFoodAdvice] = useState('Take with full glass of water');

  const filteredSchedule = schedule.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.timeOfDay === activeFilter;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    addScheduleItem({
      medicineId: `med-custom-${Date.now()}`,
      medicineName: newMedName.trim(),
      dosage: newDosage,
      time: newTime,
      timeOfDay: newTimeOfDay,
      foodAdvice: newFoodAdvice,
    });

    setNewMedName('');
    setShowAddModal(false);
  };

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

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dose to Schedule</span>
        </button>
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
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-[1.01] ${
                item.taken
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 hover:border-teal-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleScheduleItem(item.id)}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    item.taken
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                  }`}
                >
                  {item.taken && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-sora font-bold text-base ${item.taken ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.medicineName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                      {item.dosage}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">
                    💡 {item.foodAdvice}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {getTimeIcon(item.timeOfDay)}
                  <span>{item.time} ({item.timeOfDay})</span>
                </div>

                <button
                  onClick={() => toggleScheduleItem(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] ${
                    item.taken
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-teal-600 text-white shadow-xs'
                  }`}
                >
                  {item.taken ? `Taken (${item.takenAt})` : 'Mark Taken'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD SCHEDULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white">
                Add New Dose to Schedule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Medicine Name & Strength:
                </label>
                <input
                  type="text"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Amoxil 500mg"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Dosage:
                  </label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet"
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Time:
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Time of Day:
                </label>
                <select
                  value={newTimeOfDay}
                  onChange={(e: any) => setNewTimeOfDay(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Food Advice:
                </label>
                <input
                  type="text"
                  value={newFoodAdvice}
                  onChange={(e) => setNewFoodAdvice(e.target.value)}
                  placeholder="e.g. Take after meal"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D9488] text-white text-xs font-semibold shadow-md"
                >
                  Save Schedule
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
