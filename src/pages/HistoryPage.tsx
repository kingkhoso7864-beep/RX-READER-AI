import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Tag,
  ExternalLink,
  Pill,
  X,
  Printer,
  Sparkles,
  CalendarPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrescriptionScan } from '../types';
import { ScheduleModal } from '../components/ScheduleModal';

export const HistoryPage: React.FC = () => {
  const { scans, language } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'English' | 'Bilingual'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<PrescriptionScan | null>(null);
  const [schedulingScan, setSchedulingScan] = useState<PrescriptionScan | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredScans = scans.filter((scan) => {
    // Search query match
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      scan.title.toLowerCase().includes(query) ||
      scan.doctorName.toLowerCase().includes(query) ||
      scan.date.includes(query) ||
      scan.medicines.some((m) => m.name.toLowerCase().includes(query));

    // Category tag match
    let matchesCategory = true;
    if (activeFilter === 'English') {
      matchesCategory = scan.language === 'English';
    } else if (activeFilter === 'Bilingual') {
      matchesCategory = scan.language.includes('Urdu') || scan.language.includes('Bilingual');
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            {language === 'ur' ? 'نسخہ جات کی تاریخ' : 'Prescription History'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {language === 'ur'
              ? 'اپنے تمام پہلے سکین کیے گئے نسخے تلاش اور کاپیاں محفوظ دیکھیں۔'
              : 'Browse, search, and manage all your historical prescription scans.'}
          </p>
        </div>

        {/* STAT BADGE */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold w-fit">
          <FileText className="w-4 h-4 text-teal-600" />
          <span>{scans.length} Total Saved Scans</span>
        </div>
      </div>

      {/* SEARCH BAR & FILTER TAGS */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* SEARCH INPUT */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ur' ? 'ڈاکٹر، دوا یا تاریخ سے تلاش کریں...' : 'Search by date, doctor, or medicine...'}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        {/* FILTER TAG BUTTONS */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <span className="text-xs text-slate-500 font-semibold hidden sm:block">Filter:</span>
          
          {(['All', 'English', 'Bilingual'] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] ${
                activeFilter === tag
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>

      {/* HISTORY CARDS GRID WITH SKELETONS */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No prescription scans found matching your search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 hover:scale-[1.01] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-sora font-bold text-base text-slate-900 dark:text-white">
                      {scan.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>{scan.doctorName}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                    {scan.language}
                  </span>
                </div>

                {/* MEDICINE TAGS */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {scan.medicines.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <Pill className="w-3 h-3 text-teal-600" />
                      <span>{m.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{scan.date}</span>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSchedulingScan(scan)}
                    className="font-bold text-xs text-white bg-[#0D9488] hover:bg-teal-700 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Add to Schedule</span>
                  </button>

                  <button
                    onClick={() => setSelectedScan(scan)}
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 hover:scale-[1.02] transition-transform"
                  >
                    <span>View Full Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* FULL DETAILS MODAL */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="font-sora font-bold text-xl text-slate-900 dark:text-white">
                  {selectedScan.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedScan.doctorName} • {selectedScan.clinic || 'Medical Facility'}
                </p>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="text-slate-400 font-medium">Date:</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedScan.date}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">OCR Confidence:</span>
                <p className="font-semibold text-teal-600 dark:text-teal-400 mt-0.5">{selectedScan.confidence}% Match</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Language:</span>
                <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">{selectedScan.language}</p>
              </div>
            </div>

            <div>
              <h4 className="font-sora font-bold text-sm text-slate-900 dark:text-white mb-3">
                Extracted Prescription Medicines
              </h4>
              <div className="space-y-2.5">
                {selectedScan.medicines.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-sora font-semibold text-sm text-slate-900 dark:text-white">
                        {m.name}
                      </h5>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        {m.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Frequency: {m.frequency} | Food Advice: {m.foodAdvice}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <button
                onClick={() => {
                  const currentScan = selectedScan;
                  setSelectedScan(null);
                  setSchedulingScan(currentScan);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Add Prescription to Schedule</span>
              </button>

              <button
                onClick={() => setSelectedScan(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      <ScheduleModal
        isOpen={!!schedulingScan}
        onClose={() => setSchedulingScan(null)}
        prescription={schedulingScan}
      />

    </div>
  );
};
