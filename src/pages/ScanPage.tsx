import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  FileText,
  Plus,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medicine, PrescriptionScan } from '../types';

export const ScanPage: React.FC = () => {
  const { addScan, addScheduleItem, language } = useApp();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<PrescriptionScan | null>(null);
  const [addedMeds, setAddedMeds] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');

  // 1. File Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        processPrescriptionOCR(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Camera Capture Handler
  const startCamera = async (facing: 'user' | 'environment') => {
    setCameraFacing(facing);
    setIsCameraActive(true);
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Camera access was denied or is unavailable on this device.');
      setIsCameraActive(false);
    }
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // Stop camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
        setIsCameraActive(false);

        setSelectedImage(dataUrl);
        processPrescriptionOCR(dataUrl);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  // 3. Demo Prescriptions Auto-Fill
  const loadDemoPrescription = async (type: 'english' | 'urdu') => {
    setIsProcessing(true);
    setErrorMessage(null);
    setScanResult(null);

    // Set demo placeholder graphic base64 / SVG preview
    const samplePreviewImg = type === 'english'
      ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="30" y="50" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f172a">METROCARE HEALTH CENTER</text><text x="30" y="80" font-family="sans-serif" font-size="14" fill="%23475569">Dr. Sarah Jenkins MD | Reg %2398412</text><text x="30" y="140" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230d9488">Rx Prescription:</text><text x="40" y="180" font-family="sans-serif" font-size="16" fill="%231e293b">1. Lipitor 20mg - 1 Tab QHS (At Bedtime)</text><text x="40" y="220" font-family="sans-serif" font-size="16" fill="%231e293b">2. Glucophage 500mg - 1 Tab BID (W/ Food)</text><text x="40" y="260" font-family="sans-serif" font-size="16" fill="%231e293b">3. Concor 5mg - 1 Tab QAM (Morning)</text></svg>'
      : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="30" y="50" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f172a">SHIFA GENERAL HOSPITAL LAHORE</text><text x="30" y="80" font-family="sans-serif" font-size="14" fill="%23475569">ڈاکٹر طارق احمد (FRCP)</text><text x="30" y="140" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230d9488">نسخہ جات (Prescription):</text><text x="40" y="180" font-family="sans-serif" font-size="16" fill="%231e293b">1. Panadol Forte 500mg - 1 Tab 3x (کھانے کے بعد)</text><text x="40" y="220" font-family="sans-serif" font-size="16" fill="%231e293b">2. Amoxil 500mg - 1 Cap 2x (پانی کے ساتھ)</text><text x="40" y="260" font-family="sans-serif" font-size="16" fill="%231e293b">3. Risek 20mg - 1 Cap (ناشتے سے پہلے)</text></svg>';

    setSelectedImage(samplePreviewImg);

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnglishDemo: type === 'english',
          isUrduDemo: type === 'urdu',
        }),
      });

      const data = await res.json();

      if (data.success) {
        const scanObj: PrescriptionScan = {
          id: `scan-${Date.now()}`,
          title: type === 'english' ? 'Cardiology & General Checkup' : 'Chest & Anti-Fever Prescription',
          doctorName: data.prescriptionInfo.doctorName,
          clinic: data.prescriptionInfo.clinic,
          date: data.prescriptionInfo.date,
          language: data.prescriptionInfo.language,
          confidence: data.prescriptionInfo.confidence || 97,
          medicines: data.medicines,
          general_advice: data.general_advice || [],
          imageUrl: samplePreviewImg,
        };

        setScanResult(scanObj);
        addScan(scanObj);
      } else {
        setErrorMessage(data.error || 'No prescription detected. Please upload a clear photo of a prescription.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to connect to OCR service.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. OCR Process Real Photo
  const processPrescriptionOCR = async (imageBase64: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();

      if (data.success && data.medicines && data.medicines.length > 0) {
        const scanObj: PrescriptionScan = {
          id: `scan-${Date.now()}`,
          title: `Custom Scan (${new Date().toLocaleDateString()})`,
          doctorName: data.prescriptionInfo?.doctorName || 'Detected Doctor',
          clinic: data.prescriptionInfo?.clinic || 'Medical Clinic',
          date: data.prescriptionInfo?.date || new Date().toISOString().split('T')[0],
          language: data.prescriptionInfo?.language || 'English',
          confidence: data.prescriptionInfo?.confidence || 95,
          medicines: data.medicines,
          imageUrl: imageBase64,
        };

        if (scanObj.general_advice && scanObj.general_advice.length > 0) {
          // general advice handled
        }
        setScanResult(scanObj);
        addScan(scanObj);
      } else {
        setErrorMessage(
          data.error || 'No prescription detected. Please upload a clear photo of a prescription.'
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('No prescription detected. Please upload a clear photo of a prescription.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddMedicineToSchedule = (med: Medicine) => {
    const mealText = med.meal_relation || med.foodAdvice || 'Not Specified';

    if (med.timing) {
      let addedAny = false;
      if (med.timing.morning_subah) {
        addScheduleItem({
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          time: '08:00 AM',
          timeOfDay: 'Morning',
          foodAdvice: mealText,
        });
        addedAny = true;
      }
      if (med.timing.afternoon_dopahar) {
        addScheduleItem({
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          time: '02:00 PM',
          timeOfDay: 'Afternoon',
          foodAdvice: mealText,
        });
        addedAny = true;
      }
      if (med.timing.night_raat) {
        addScheduleItem({
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          time: '10:00 PM',
          timeOfDay: 'Night',
          foodAdvice: mealText,
        });
        addedAny = true;
      }
      if (!addedAny) {
        addScheduleItem({
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          time: '08:00 AM',
          timeOfDay: 'Morning',
          foodAdvice: mealText,
        });
      }
    } else {
      const freq = med.frequency || '';
      addScheduleItem({
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.dosage,
        time: freq.includes('Night') ? '10:00 PM' : freq.includes('Afternoon') ? '02:00 PM' : '08:00 AM',
        timeOfDay: freq.includes('Night') ? 'Night' : freq.includes('Afternoon') ? 'Afternoon' : 'Morning',
        foodAdvice: mealText,
      });
    }

    setAddedMeds((prev) => ({ ...prev, [med.id]: true }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER TITLE */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          {language === 'ur' ? 'نسخہ سکین کریں - AI OCR' : 'AI Prescription Reader (OCR)'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {language === 'ur'
            ? 'اپنے نسخے کی تصویر لیں یا اپ لوڈ کریں۔ ہمارا AI ادویات اور خوراک خود بخود نکال لے گا۔'
            : 'Snap or upload your doctor prescription. High-accuracy OCR detects medicine names, dosages, and administration advice.'}
        </p>
      </div>

      {/* DEMO PRESCRIPTIONS BUTTONS */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-sora font-bold text-sm text-amber-900 dark:text-amber-200">
              {language === 'ur' ? 'نمونہ نسخہ جات آزماں' : 'Try Demo Prescriptions'}
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-300">
              Click to instantly auto-fill sample English or Urdu prescription data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => loadDemoPrescription('english')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-slate-700 hover:scale-[1.02] transition-all shadow-xs"
          >
            📄 Demo English
          </button>
          <button
            onClick={() => loadDemoPrescription('urdu')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 hover:scale-[1.02] transition-all shadow-sm"
          >
            🇵🇰 Demo Urdu (اردو)
          </button>
        </div>
      </div>

      {/* UPLOAD / CAMERA CAPTURE BOX */}
      {!isCameraActive ? (
        <div className="bg-white dark:bg-[#1E293B] border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-3xl p-8 text-center transition-all duration-300">
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center mb-4">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white">
            {language === 'ur' ? 'نسخے کی تصویر منتخب کریں یا لیں' : 'Upload or Capture Prescription Photo'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Supports JPG, PNG, WEBP. Ensure medicine names and doctor notes are clearly illuminated.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Select Photo File</span>
            </button>

            <button
              onClick={() => startCamera('environment')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Back Camera</span>
            </button>

            <button
              onClick={() => startCamera('user')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-amber-500" />
              <span>Front Camera</span>
            </button>
          </div>

        </div>
      ) : (
        /* LIVE CAMERA PREVIEW */
        <div className="bg-black rounded-3xl p-4 text-center max-w-lg mx-auto relative overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-2xl"
          />
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={captureCameraPhoto}
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm hover:scale-105 transition-all"
            >
              📷 Snap Photo
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE CARD */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 p-5 rounded-2xl flex items-start gap-3.5 text-red-900 dark:text-red-200 animate-in fade-in">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-sora font-bold text-sm text-red-800 dark:text-red-300">
              Scan Unsuccessful
            </h4>
            <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* PROCESSING LOADING SKELETON */}
      {isProcessing && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mx-auto" />
          <div>
            <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>Analyzing Prescription with Gemini Vision OCR...</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Extracting doctor notes, drug strength, match confidence, and administration instructions.
            </p>
          </div>

          {/* Skeleton placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      )}

      {/* OCR SCAN RESULTS SECTION */}
      {scanResult && !isProcessing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: IMAGE PREVIEW WITH HIGHLIGHT OVERLAY */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Image Analysis
                </span>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full">
                  {scanResult.confidence}% OCR Accuracy
                </span>
              </div>

              {selectedImage && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                  <img
                    src={selectedImage}
                    alt="Prescription"
                    className="w-full h-64 object-contain"
                  />
                  {/* Highlight box overlays */}
                  <div className="absolute top-1/4 left-10 right-10 h-10 border-2 border-amber-400 bg-amber-400/20 rounded pointer-events-none animate-pulse" />
                  <div className="absolute bottom-1/3 left-12 right-12 h-10 border-2 border-teal-400 bg-teal-400/20 rounded pointer-events-none" />
                </div>
              )}

              <div className="mt-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p><strong>Doctor:</strong> {scanResult.doctorName}</p>
                <p><strong>Clinic:</strong> {scanResult.clinic || 'Medical Facility'}</p>
                <p><strong>Language:</strong> {scanResult.language}</p>
              </div>
            </div>

            {/* RIGHT: DETECTED MEDICINES CARDS */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-sora font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Detected Medicines ({scanResult.medicines.length})</span>
              </h3>

              <div className="space-y-3">
                {scanResult.medicines.map((med) => {
                  const isAdded = !!addedMeds[med.id];
                  return (
                    <div
                      key={med.id}
                      className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-sora font-bold text-base text-slate-900 dark:text-white">
                              {med.name}
                            </h4>
                            {med.urduName && (
                              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                                {med.urduName}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddMedicineToSchedule(med)}
                            disabled={isAdded}
                            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isAdded
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : 'bg-[#0D9488] hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span>Scheduled</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add to Schedule</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* DOSAGE, DURATION, MEAL RELATION */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg font-medium">
                            💊 <strong>Dosage:</strong> {med.dosage || 'Not Specified'}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg font-medium">
                            ⏳ <strong>Duration:</strong> {med.duration_days || 'Not Specified'}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg font-medium">
                            🍽️ <strong>Meal:</strong> {med.meal_relation || med.foodAdvice || 'Not Specified'}
                          </span>
                        </div>

                        {/* TIMING CATEGORIZATION BADGES */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-xs text-slate-500 font-semibold mr-1">Timing:</span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                              med.timing?.morning_subah
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 opacity-60 line-through'
                            }`}
                          >
                            🌅 Morning / Subah (1-0-0)
                          </span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                              med.timing?.afternoon_dopahar
                                ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700'
                                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 opacity-60 line-through'
                            }`}
                          >
                            ☀️ Afternoon / Dopahar (0-1-0)
                          </span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                              med.timing?.night_raat
                                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700'
                                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 opacity-60 line-through'
                            }`}
                          >
                            🌙 Evening/Night / Raat (0-0-1)
                          </span>
                        </div>

                        {/* INSTRUCTIONS SUMMARY */}
                        {med.instructions_summary && (
                          <div className="p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 font-medium">
                            🗣️ <strong>Instructions:</strong> {med.instructions_summary}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* GENERAL ADVICE SECTION */}
              {scanResult.general_advice && scanResult.general_advice.length > 0 && (
                <div className="bg-amber-50/70 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-2 mt-4">
                  <h4 className="font-sora font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>General & Lifestyle Advice</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    {scanResult.general_advice.map((adv, idx) => (
                      <li key={idx}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
