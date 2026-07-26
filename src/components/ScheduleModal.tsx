import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medicine, PrescriptionScan, TodayScheduleItem } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription?: PrescriptionScan | null;
  editingItem?: TodayScheduleItem | null;
  singleMedicine?: Medicine | null;
}

interface MedicineScheduleConfig {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  foodAdvice: string;
  startDate: string;
  endDate: string;
  times: string[]; // e.g. ["08:00 AM", "02:00 PM"]
  conflictAction?: 'append' | 'replace';
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  prescription,
  editingItem,
  singleMedicine,
}) => {
  const { schedule, addBulkScheduleItems, addScheduleItem, updateScheduleItem, setActiveTab } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Selected medicine IDs when importing from a prescription
  const [selectedMedIds, setSelectedMedIds] = useState<string[]>([]);
  // Config per medicine
  const [medConfigs, setMedConfigs] = useState<Record<string, MedicineScheduleConfig>>({});

  // Single / Edit mode state
  const [editName, setEditName] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editFrequency, setEditFrequency] = useState('2 times daily');
  const [editFoodAdvice, setEditFoodAdvice] = useState('Take after meal');
  const [editStartDate, setEditStartDate] = useState(todayStr);
  const [editEndDate, setEditEndDate] = useState('');
  const [editTimes, setEditTimes] = useState<string[]>(['08:00 AM', '08:00 PM']);

  // Modal active step in prescription mode: 'select' -> 'configure' -> 'review'
  const [step, setStep] = useState<'select' | 'configure'>('select');

  // Convert 24h time "14:00" or raw string to "02:00 PM"
  const formatTimeTo12Hour = (rawTime: string): string => {
    if (!rawTime) return '08:00 AM';
    const clean = rawTime.trim().toUpperCase();
    if (clean.includes('AM') || clean.includes('PM')) return clean;

    const parts = clean.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1].slice(0, 2);
      if (isNaN(hours)) return rawTime;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // convert 0 to 12
      const strHours = hours < 10 ? `0${hours}` : `${hours}`;
      return `${strHours}:${minutes} ${ampm}`;
    }
    return rawTime;
  };

  // Convert 12h "08:00 AM" to 24h "08:00" for <input type="time">
  const format12HTo24HInput = (time12h: string): string => {
    if (!time12h) return '08:00';
    const clean = time12h.trim().toUpperCase();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return '08:00';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const modifier = match[3];

    if (modifier) {
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
    }
    const strH = hours < 10 ? `0${hours}` : `${hours}`;
    return `${strH}:${minutes}`;
  };

  // Determine timeOfDay category
  const getTimeOfDay = (time12h: string): 'Morning' | 'Afternoon' | 'Evening' | 'Night' => {
    const time24 = format12HTo24HInput(time12h);
    const hours = parseInt(time24.split(':')[0], 10);
    if (hours >= 5 && hours < 12) return 'Morning';
    if (hours >= 12 && hours < 17) return 'Afternoon';
    if (hours >= 17 && hours < 21) return 'Evening';
    return 'Night';
  };

  // Initialize modal state when opened
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      // Editing existing schedule item
      setEditName(editingItem.medicineName);
      setEditDosage(editingItem.dosage);
      setEditFrequency(editingItem.frequency || 'Once daily');
      setEditFoodAdvice(editingItem.foodAdvice || 'Take with full glass of water');
      setEditStartDate(editingItem.startDate || todayStr);
      setEditEndDate(editingItem.endDate || '');
      setEditTimes([editingItem.time]);
    } else if (singleMedicine) {
      // Scheduling single medicine directly
      setEditName(singleMedicine.name);
      setEditDosage(singleMedicine.dosage || '1 Tablet');
      setEditFrequency(singleMedicine.frequency || '2 times daily');
      setEditFoodAdvice(singleMedicine.meal_relation || singleMedicine.foodAdvice || 'Take after meal');
      setEditStartDate(todayStr);
      setEditEndDate('');

      // Extract default time suggestions from timing object if available
      const suggestedTimes: string[] = [];
      if (singleMedicine.timing?.morning_subah) suggestedTimes.push('08:00 AM');
      if (singleMedicine.timing?.afternoon_dopahar) suggestedTimes.push('02:00 PM');
      if (singleMedicine.timing?.night_raat) suggestedTimes.push('08:00 PM');

      setEditTimes(suggestedTimes.length > 0 ? suggestedTimes : ['08:00 AM', '08:00 PM']);
    } else if (prescription && prescription.medicines && prescription.medicines.length > 0) {
      // Prescription import mode
      setStep('select');
      const initialIds = prescription.medicines.map((m) => m.id);
      setSelectedMedIds(initialIds);

      const configs: Record<string, MedicineScheduleConfig> = {};
      prescription.medicines.forEach((med) => {
        const times: string[] = [];
        if (med.timing?.morning_subah) times.push('08:00 AM');
        if (med.timing?.afternoon_dopahar) times.push('02:00 PM');
        if (med.timing?.night_raat) times.push('08:00 PM');

        if (times.length === 0) {
          const freq = (med.frequency || '').toLowerCase();
          if (freq.includes('3') || freq.includes('tid')) {
            times.push('08:00 AM', '02:00 PM', '08:00 PM');
          } else if (freq.includes('2') || freq.includes('bid')) {
            times.push('08:00 AM', '08:00 PM');
          } else if (freq.includes('night') || freq.includes('qhs')) {
            times.push('09:00 PM');
          } else {
            times.push('08:00 AM');
          }
        }

        configs[med.id] = {
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage || '1 Tablet',
          frequency: med.frequency || `${times.length} times daily`,
          foodAdvice: med.meal_relation || med.foodAdvice || 'Take after meal',
          startDate: todayStr,
          endDate: '',
          times,
          conflictAction: 'append',
        };
      });
      setMedConfigs(configs);
    } else {
      // Custom manual add mode
      setEditName('');
      setEditDosage('1 Tablet');
      setEditFrequency('2 times daily');
      setEditFoodAdvice('Take after meal');
      setEditStartDate(todayStr);
      setEditEndDate('');
      setEditTimes(['08:00 AM', '08:00 PM']);
    }
  }, [isOpen, prescription, editingItem, singleMedicine]);

  if (!isOpen) return null;

  // Toggle selection of a medicine in prescription mode
  const handleToggleMedSelect = (medId: string) => {
    setSelectedMedIds((prev) =>
      prev.includes(medId) ? prev.filter((id) => id !== medId) : [...prev, medId]
    );
  };

  const handleSelectAllMeds = () => {
    if (!prescription) return;
    setSelectedMedIds(prescription.medicines.map((m) => m.id));
  };

  const handleDeselectAllMeds = () => {
    setSelectedMedIds([]);
  };

  // Medicine config field update helpers
  const updateMedConfig = (medId: string, field: keyof MedicineScheduleConfig, value: any) => {
    setMedConfigs((prev) => ({
      ...prev,
      [medId]: { ...prev[medId], [field]: value },
    }));
  };

  const handleAddTimeToMed = (medId: string) => {
    setMedConfigs((prev) => {
      const cfg = prev[medId];
      if (!cfg) return prev;
      const lastTime = cfg.times[cfg.times.length - 1] || '08:00 AM';
      const newTime = lastTime === '08:00 AM' ? '02:00 PM' : lastTime === '02:00 PM' ? '08:00 PM' : '10:00 PM';
      return {
        ...prev,
        [medId]: { ...cfg, times: [...cfg.times, newTime] },
      };
    });
  };

  const handleRemoveTimeFromMed = (medId: string, timeIdx: number) => {
    setMedConfigs((prev) => {
      const cfg = prev[medId];
      if (!cfg || cfg.times.length <= 1) return prev; // keep at least 1 time
      const nextTimes = cfg.times.filter((_, idx) => idx !== timeIdx);
      return {
        ...prev,
        [medId]: { ...cfg, times: nextTimes },
      };
    });
  };

  const handleUpdateTimeForMed = (medId: string, timeIdx: number, val24h: string) => {
    const formatted12h = formatTimeTo12Hour(val24h);
    setMedConfigs((prev) => {
      const cfg = prev[medId];
      if (!cfg) return prev;
      const nextTimes = [...cfg.times];
      nextTimes[timeIdx] = formatted12h;
      return {
        ...prev,
        [medId]: { ...cfg, times: nextTimes },
      };
    });
  };

  // Single mode time helpers
  const handleAddSingleTime = () => {
    setEditTimes((prev) => [...prev, '02:00 PM']);
  };

  const handleRemoveSingleTime = (idx: number) => {
    if (editTimes.length <= 1) return;
    setEditTimes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSingleTime = (idx: number, val24h: string) => {
    const formatted12h = formatTimeTo12Hour(val24h);
    setEditTimes((prev) => {
      const copy = [...prev];
      copy[idx] = formatted12h;
      return copy;
    });
  };

  // Check if medicine name conflicts with existing items in schedule
  const getExistingScheduleItemsForMed = (medName: string) => {
    const clean = medName.trim().toLowerCase();
    return schedule.filter((s) => s.medicineName.trim().toLowerCase() === clean);
  };

  // Save Prescription Schedule
  const handleSavePrescriptionSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMedIds.length === 0) {
      alert('Please select at least one medicine to schedule.');
      return;
    }

    const itemsToCreate: Omit<TodayScheduleItem, 'id' | 'taken'>[] = [];

    selectedMedIds.forEach((medId) => {
      const cfg = medConfigs[medId];
      if (!cfg) return;

      const existingForMed = getExistingScheduleItemsForMed(cfg.medicineName);

      cfg.times.forEach((timeStr) => {
        itemsToCreate.push({
          medicineId: cfg.medicineId,
          medicineName: cfg.medicineName,
          dosage: cfg.dosage,
          time: timeStr,
          timeOfDay: getTimeOfDay(timeStr),
          foodAdvice: cfg.foodAdvice,
          frequency: cfg.frequency,
          startDate: cfg.startDate,
          endDate: cfg.endDate || undefined,
          prescriptionId: prescription?.id,
          prescriptionTitle: prescription?.title,
        });
      });
    });

    if (itemsToCreate.length > 0) {
      addBulkScheduleItems(itemsToCreate);
    }

    onClose();
    setActiveTab('schedule');
  };

  // Save Single or Edited Item
  const handleSaveSingleOrEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim()) {
      alert('Please enter a medicine name.');
      return;
    }

    if (editingItem) {
      // Update existing item
      updateScheduleItem(editingItem.id, {
        medicineName: editName.trim(),
        dosage: editDosage.trim(),
        frequency: editFrequency.trim(),
        foodAdvice: editFoodAdvice.trim(),
        startDate: editStartDate,
        endDate: editEndDate || undefined,
        time: editTimes[0] || '08:00 AM',
        timeOfDay: getTimeOfDay(editTimes[0] || '08:00 AM'),
      });
    } else {
      // Add new single medicine with multiple times
      const itemsToCreate: Omit<TodayScheduleItem, 'id' | 'taken'>[] = editTimes.map((t) => ({
        medicineId: singleMedicine?.id || `med-custom-${Date.now()}`,
        medicineName: editName.trim(),
        dosage: editDosage.trim(),
        time: t,
        timeOfDay: getTimeOfDay(t),
        foodAdvice: editFoodAdvice.trim(),
        frequency: editFrequency.trim(),
        startDate: editStartDate,
        endDate: editEndDate || undefined,
      }));

      addBulkScheduleItems(itemsToCreate);
    }

    onClose();
    setActiveTab('schedule');
  };

  const isPrescriptionMode = !!prescription && prescription.medicines.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[92vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{editingItem ? 'Edit Dose Schedule' : 'Add Medication Schedule'}</span>
            </span>
            <h3 className="font-sora font-extrabold text-xl text-slate-900 dark:text-white">
              {editingItem
                ? `Edit ${editingItem.medicineName}`
                : isPrescriptionMode
                ? `Schedule Medicines from ${prescription.title}`
                : 'Configure Medication Timing & Schedule'}
            </h3>
            {prescription && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prescription by {prescription.doctorName} • Scanned {prescription.date}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRESCRIPTION MODE: STEP NAVIGATION & CONTENT */}
        {isPrescriptionMode ? (
          <div>
            {/* STEP TABS */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setStep('select')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  step === 'select'
                    ? 'bg-white dark:bg-[#1E293B] text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>1. Select Medicines ({selectedMedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedMedIds.length > 0) setStep('configure');
                }}
                disabled={selectedMedIds.length === 0}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  step === 'configure'
                    ? 'bg-white dark:bg-[#1E293B] text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white opacity-80'
                }`}
              >
                <span>2. Manual Timing & Frequency</span>
              </button>
            </div>

            {/* STEP 1: MEDICINE SELECTION */}
            {step === 'select' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Which medicines from this prescription would you like to schedule?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllMeds}
                      className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllMeds}
                      className="text-slate-500 font-semibold hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {prescription.medicines.map((med) => {
                    const isSelected = selectedMedIds.includes(med.id);
                    const existingCount = getExistingScheduleItemsForMed(med.name).length;

                    return (
                      <div
                        key={med.id}
                        onClick={() => handleToggleMedSelect(med.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMedSelect(med.id)}
                            className="mt-1 w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-sora font-bold text-sm text-slate-900 dark:text-white">
                                {med.name}
                              </h4>
                              {med.dosage && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                                  {med.dosage}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Frequency: {med.frequency || 'As prescribed'} | Meal: {med.meal_relation || med.foodAdvice || 'Not specified'}
                            </p>

                            {existingCount > 0 && (
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>Already in Schedule ({existingCount} existing dose times)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Pill className={`w-5 h-5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={selectedMedIds.length === 0}
                    onClick={() => setStep('configure')}
                    className="px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-teal-700 text-white font-semibold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>Configure Timing ({selectedMedIds.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CONFIGURE TIMING & FREQUENCY FOR SELECTED MEDICINES */}
            {step === 'configure' && (
              <form onSubmit={handleSavePrescriptionSchedule} className="space-y-6">
                <div className="space-y-5">
                  {selectedMedIds.map((medId) => {
                    const cfg = medConfigs[medId];
                    if (!cfg) return null;

                    const existingForMed = getExistingScheduleItemsForMed(cfg.medicineName);

                    return (
                      <div
                        key={medId}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-teal-600" />
                            <h4 className="font-sora font-bold text-sm text-slate-900 dark:text-white">
                              {cfg.medicineName}
                            </h4>
                          </div>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                            Suggested Timing Available
                          </span>
                        </div>

                        {/* EXISTING CONFLICT WARNING */}
                        {existingForMed.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Existing Schedule Detected</span>
                            </p>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300">
                              This medicine already has {existingForMed.length} scheduled dose(s). New doses will be added to your schedule.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                              Dosage:
                            </label>
                            <input
                              type="text"
                              value={cfg.dosage}
                              onChange={(e) => updateMedConfig(medId, 'dosage', e.target.value)}
                              placeholder="e.g. 500 mg / 1 Tablet"
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                              Frequency:
                            </label>
                            <input
                              type="text"
                              value={cfg.frequency}
                              onChange={(e) => updateMedConfig(medId, 'frequency', e.target.value)}
                              placeholder="e.g. 2 times daily"
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* MANUAL TIMING LIST */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              Medication Timing (Daily Dose Times):
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddTimeToMed(medId)}
                              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add Another Time</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {cfg.times.map((time12h, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input
                                    type="time"
                                    value={format12HTo24HInput(time12h)}
                                    onChange={(e) => handleUpdateTimeForMed(medId, idx, e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                                  />
                                </div>

                                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 px-2.5 py-2 bg-teal-50 dark:bg-teal-950/80 rounded-xl border border-teal-200/60 shrink-0 min-w-[80px] text-center">
                                  {time12h}
                                </span>

                                {cfg.times.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTimeFromMed(medId, idx)}
                                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                    title="Remove this dose time"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* START & END DATES & FOOD ADVICE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                              Start Date:
                            </label>
                            <input
                              type="date"
                              required
                              value={cfg.startDate}
                              onChange={(e) => updateMedConfig(medId, 'startDate', e.target.value)}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                              End Date (Optional):
                            </label>
                            <input
                              type="date"
                              value={cfg.endDate}
                              onChange={(e) => updateMedConfig(medId, 'endDate', e.target.value)}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Food Advice / Guidelines:
                          </label>
                          <input
                            type="text"
                            value={cfg.foodAdvice}
                            onChange={(e) => updateMedConfig(medId, 'foodAdvice', e.target.value)}
                            placeholder="e.g. Take after meal"
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Selection</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Schedule</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* SINGLE / CUSTOM OR EDIT MODE FORM */
          <form onSubmit={handleSaveSingleOrEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Medicine Name & Strength:
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Paracetamol 500 mg"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dosage:
                </label>
                <input
                  type="text"
                  value={editDosage}
                  onChange={(e) => setEditDosage(e.target.value)}
                  placeholder="e.g. 500 mg or 1 Tablet"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Frequency:
                </label>
                <input
                  type="text"
                  value={editFrequency}
                  onChange={(e) => setEditFrequency(e.target.value)}
                  placeholder="e.g. 3 times a day"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* MULTIPLE TIMING CONFIGURATION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Schedule Times:
                </label>
                {!editingItem && (
                  <button
                    type="button"
                    onClick={handleAddSingleTime}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Time</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {editTimes.map((t12h, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        value={format12HTo24HInput(t12h)}
                        onChange={(e) => handleUpdateSingleTime(idx, e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>

                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300 px-3 py-2 bg-teal-50 dark:bg-teal-950/80 rounded-xl border border-teal-200/60 shrink-0 min-w-[85px] text-center">
                      {t12h}
                    </span>

                    {!editingItem && editTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSingleTime(idx)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="Remove time"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  required
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  End Date (Optional):
                </label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Food Advice / Instructions:
              </label>
              <input
                type="text"
                value={editFoodAdvice}
                onChange={(e) => setEditFoodAdvice(e.target.value)}
                placeholder="e.g. Take with food"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-teal-700 text-white font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {editingItem ? 'Save Changes' : 'Save Schedule'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
