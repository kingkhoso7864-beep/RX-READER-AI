import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { AppLanguage, PrescriptionScan, TodayScheduleItem, UserProfile } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
  return errInfo;
}

// Helper to sanitize payload for Firestore (replaces undefined with null)
function sanitizeDataForFirestore(data: any): any {
  if (data === undefined) return null;
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (value === undefined ? null : value))
  );
}

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  schedule: TodayScheduleItem[];
  toggleScheduleItem: (id: string) => void;
  toggleSkipScheduleItem: (id: string) => void;
  addScheduleItem: (item: Omit<TodayScheduleItem, 'id' | 'taken'>) => void;
  addBulkScheduleItems: (items: Omit<TodayScheduleItem, 'id' | 'taken'>[]) => void;
  updateScheduleItem: (id: string, updated: Partial<TodayScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  scans: PrescriptionScan[];
  addScan: (scan: PrescriptionScan) => void;
  deleteScan: (id: string) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, body: string) => void;
  voiceRemindersEnabled: boolean;
  setVoiceRemindersEnabled: (enabled: boolean) => void;
  selectedVoiceURI: string | null;
  setSelectedVoiceURI: (voiceURI: string | null) => void;
  availableVoices: SpeechSynthesisVoice[];
  speakText: (text: string) => void;
  testVoiceReminder: () => void;
  exportPDFReport: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
}

const initialScans: PrescriptionScan[] = [
  {
    id: 'scan-1',
    title: 'Post-Surgery Recovery & Pain Management',
    doctorName: 'Dr. Sarah Jenkins (MD)',
    clinic: 'MetroCare Health Center',
    date: '2026-07-25',
    language: 'English',
    confidence: 98,
    medicines: [
      { id: 'm-101', name: 'Lipitor 20mg (Atorvastatin)', dosage: '1 Tablet QHS', frequency: 'Night 10:00 PM', foodAdvice: 'Can be taken with or without food' },
      { id: 'm-102', name: 'Glucophage 500mg (Metformin)', dosage: '1 Tablet BID', frequency: 'Breakfast & Dinner', foodAdvice: 'Take with meals to reduce stomach upset' },
      { id: 'm-103', name: 'Concor 5mg (Bisoprolol)', dosage: '1 Tablet QAM', frequency: 'Morning 8:00 AM', foodAdvice: 'Take before or during breakfast' },
    ],
    notes: 'Regular 3-month cardiology & metabolic follow-up.',
  },
  {
    id: 'scan-2',
    title: 'Antibiotic & Fever Treatment (Urdu Bilingual)',
    doctorName: 'Dr. Tariq Ahmed (FRCP)',
    clinic: 'Shifa General Hospital, Lahore',
    date: '2026-07-20',
    language: 'Urdu / Bilingual',
    confidence: 96,
    medicines: [
      { id: 'm-201', name: 'Panadol Forte 500mg', dosage: '1 Tablet 3x daily', frequency: 'Every 8 hours', foodAdvice: 'Take after meal (کھانے کے بعد)', urduName: 'پیناڈول فورٹ' },
      { id: 'm-202', name: 'Amoxil 500mg (Amoxicillin)', dosage: '1 Capsule 2x daily', frequency: 'Morning & Night', foodAdvice: 'Take with full glass of water (پانی کے ساتھ)', urduName: 'ایموکسل' },
      { id: 'm-203', name: 'Risek 20mg (Omeprazole)', dosage: '1 Capsule before breakfast', frequency: 'Once daily 8:00 AM', foodAdvice: 'Take 30 mins before food (ناشتے سے پہلے)', urduName: 'رائزک ۲۰ ملی گرام' },
    ],
    notes: 'Bilingual prescription for acute chest infection.',
  },
];

const initialSchedule: TodayScheduleItem[] = [
  {
    id: 'sched-1',
    medicineId: 'm-103',
    medicineName: 'Concor 5mg (Bisoprolol)',
    dosage: '1 Tablet',
    time: '08:00 AM',
    timeOfDay: 'Morning',
    foodAdvice: 'Take before or during breakfast',
    taken: true,
    takenAt: '08:12 AM',
  },
  {
    id: 'sched-2',
    medicineId: 'm-203',
    medicineName: 'Risek 20mg (Omeprazole)',
    dosage: '1 Capsule',
    time: '08:00 AM',
    timeOfDay: 'Morning',
    foodAdvice: 'Take 30 mins before food',
    taken: true,
    takenAt: '08:05 AM',
  },
  {
    id: 'sched-3',
    medicineId: 'm-102',
    medicineName: 'Glucophage 500mg (Metformin)',
    dosage: '1 Tablet',
    time: '01:30 PM',
    timeOfDay: 'Afternoon',
    foodAdvice: 'Take with lunch',
    taken: false,
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userStorageKey = user ? `rx_user_${user.id}` : 'rx_guest';

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('rx_reader_lang') as AppLanguage) || 'en';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [scans, setScans] = useState<PrescriptionScan[]>([]);
  const [schedule, setSchedule] = useState<TodayScheduleItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: user ? user.displayName : 'Patient',
    patientId: user ? `RX-${user.id.slice(0, 6).toUpperCase()}` : 'RX-77492',
    age: 35,
    gender: 'Not Specified',
    bloodGroup: 'Not Specified',
    allergies: [],
    autoInteractionAlerts: true,
    bilingualOcr: true,
  });

  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Voice Reminders State
  const [voiceRemindersEnabled, setVoiceRemindersEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('rx_voice_reminders') !== 'false';
  });

  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(() => {
    return localStorage.getItem('rx_selected_voice') || null;
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const setVoiceRemindersEnabled = (enabled: boolean) => {
    setVoiceRemindersEnabledState(enabled);
    localStorage.setItem('rx_voice_reminders', enabled ? 'true' : 'false');
    toast.success(enabled ? '🔊 Voice Medication Reminders Enabled' : '🔇 Voice Reminders Muted');
  };

  const setSelectedVoiceURI = (voiceURI: string | null) => {
    setSelectedVoiceURIState(voiceURI);
    if (voiceURI) localStorage.setItem('rx_selected_voice', voiceURI);
    else localStorage.removeItem('rx_selected_voice');
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis API not supported in this browser.');
      return;
    }
    if (!voiceRemindersEnabled) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoiceURI && availableVoices.length > 0) {
        const foundVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
        if (foundVoice) utterance.voice = foundVoice;
      }
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  const testVoiceReminder = () => {
    toast('🔊 Playing Test Voice Reminder...', { icon: '📢' });
    sendNotification(
      'Rx Reader AI — Medication Reminder',
      'Your medicine time has arrived. Please take Paracetamol 500 mg.'
    );
    speakText('Your medicine time has arrived. Please take your scheduled medication.');
  };

  // Auto-schedule medication alert checker loop
  const triggeredDosesRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const parseTimeStringToMinutes = (timeStr: string): number | null => {
      if (!timeStr) return null;
      const clean = timeStr.trim().toUpperCase();
      const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const modifier = match[3];

      if (modifier) {
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    const formatDosageForSpeech = (dosage: string): string => {
      if (!dosage) return '';
      return dosage
        .replace(/\bmg\b/gi, 'milligrams')
        .replace(/\bmcg\b/gi, 'micrograms')
        .replace(/\bg\b/gi, 'grams')
        .replace(/\bml\b/gi, 'milliliters')
        .replace(/\btab\b/gi, 'tablet')
        .replace(/\btabs\b/gi, 'tablets')
        .replace(/\bcap\b/gi, 'capsule')
        .replace(/\bcaps\b/gi, 'capsules');
    };

    const checkScheduleTimes = () => {
      if (schedule.length === 0) return;

      const now = new Date();
      const todayDateStr = now.toISOString().slice(0, 10);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const matchingItems = schedule.filter((item) => {
        if (item.taken) return false;
        const itemMin = parseTimeStringToMinutes(item.time);
        if (itemMin === null) return false;
        if (itemMin !== currentMinutes) return false;

        const triggerKey = `${todayDateStr}_${item.id}_${currentMinutes}`;
        return !triggeredDosesRef.current.has(triggerKey);
      });

      if (matchingItems.length === 0) return;

      matchingItems.forEach((item) => {
        const triggerKey = `${todayDateStr}_${item.id}_${currentMinutes}`;
        triggeredDosesRef.current.add(triggerKey);
      });

      if (matchingItems.length === 1) {
        const item = matchingItems[0];
        const medSpoken = formatDosageForSpeech(item.medicineName);
        const dosageSpoken = formatDosageForSpeech(item.dosage);

        const title = 'Rx Reader AI — Medication Reminder';
        const body = `Your medicine time has arrived. Please take ${item.medicineName} ${item.dosage}.`;
        const speechText = `Your medicine time has arrived. Please take your ${medSpoken} ${dosageSpoken}.`;

        sendNotification(title, body);
        speakText(speechText);
      } else {
        const medListBody = matchingItems.map((i) => `${i.medicineName} ${i.dosage}`).join(' and ');
        const medListSpoken = matchingItems
          .map((i) => `${formatDosageForSpeech(i.medicineName)} ${formatDosageForSpeech(i.dosage)}`)
          .join(' and ');

        const title = 'Rx Reader AI — Medication Reminder';
        const body = `You have medication scheduled now. Please take ${medListBody}.`;
        const speechText = `You have medication scheduled now. Please take ${medListSpoken}.`;

        sendNotification(title, body);
        speakText(speechText);
      }
    };

    const interval = setInterval(checkScheduleTimes, 15000);
    checkScheduleTimes();

    return () => clearInterval(interval);
  }, [schedule, voiceRemindersEnabled, selectedVoiceURI, availableVoices]);

  // Load User Data based on authenticated identity
  useEffect(() => {
    setIsDataLoaded(false);

    if (!user || !user.id) {
      // Guest or logged out state: reset in-memory state cleanly
      setScans([]);
      setSchedule([]);
      setProfile({
        name: 'Guest Patient',
        patientId: 'RX-GUEST',
        age: 30,
        gender: 'Not Specified',
        bloodGroup: 'Not Specified',
        allergies: [],
        autoInteractionAlerts: true,
        bilingualOcr: true,
      });
      setLoadedUserId(null);
      return;
    }

    const currentUserId = user.id;
    setLoadedUserId(currentUserId);

    // Real-time Firestore user sync
    const userDocRef = doc(db, 'users', currentUserId);
    const unsub = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setScans(Array.isArray(data.scans) ? data.scans : []);
          setSchedule(Array.isArray(data.schedule) ? data.schedule : []);
          if (data.profile && typeof data.profile === 'object') {
            setProfile(data.profile);
          }
          if (data.settings && typeof data.settings === 'object') {
            if (data.settings.language) setLanguageState(data.settings.language);
            if (data.settings.voiceRemindersEnabled !== undefined) setVoiceRemindersEnabledState(!!data.settings.voiceRemindersEnabled);
            if (data.settings.selectedVoiceURI !== undefined) setSelectedVoiceURIState(data.settings.selectedVoiceURI);
          }
        } else {
          // Genuinely NEW user! Starts with clean empty slate (0 scans, 0 schedule)
          const newProfile: UserProfile = {
            name: user.displayName || 'Patient',
            patientId: `RX-${currentUserId.slice(0, 6).toUpperCase()}`,
            age: 30,
            gender: 'Not Specified',
            bloodGroup: 'Not Specified',
            allergies: [],
            autoInteractionAlerts: true,
            bilingualOcr: true,
          };

          setScans([]);
          setSchedule([]);
          setProfile(newProfile);

          // Save initial document to Firestore
          setDoc(
            userDocRef,
            sanitizeDataForFirestore({
              scans: [],
              schedule: [],
              profile: newProfile,
              settings: {
                language,
                voiceRemindersEnabled,
                selectedVoiceURI,
              },
              updatedAt: new Date().toISOString(),
            }),
            { merge: true }
          ).catch((err) => handleFirestoreError(err, OperationType.WRITE, `users/${currentUserId}`));
        }
        setIsDataLoaded(true);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `users/${currentUserId}`);
        const savedScans = localStorage.getItem(`${userStorageKey}_scans`);
        const savedSched = localStorage.getItem(`${userStorageKey}_schedule`);
        const savedProf = localStorage.getItem(`${userStorageKey}_profile`);

        setScans(savedScans ? JSON.parse(savedScans) : []);
        setSchedule(savedSched ? JSON.parse(savedSched) : []);
        if (savedProf) setProfile(JSON.parse(savedProf));
        setIsDataLoaded(true);
      }
    );

    return () => {
      unsub();
      setIsDataLoaded(false);
    };
  }, [user?.id]);

  // Persist local storage and Firestore changes only when current user data is loaded
  useEffect(() => {
    if (!user?.id || !isDataLoaded || loadedUserId !== user.id) {
      return;
    }

    localStorage.setItem(`${userStorageKey}_scans`, JSON.stringify(scans));
    localStorage.setItem(`${userStorageKey}_schedule`, JSON.stringify(schedule));
    localStorage.setItem(`${userStorageKey}_profile`, JSON.stringify(profile));

    const userDocRef = doc(db, 'users', user.id);
    setDoc(
      userDocRef,
      sanitizeDataForFirestore({
        scans,
        schedule,
        profile,
        settings: {
          language,
          voiceRemindersEnabled,
          selectedVoiceURI,
        },
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    ).catch((err) => handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`));
  }, [
    scans,
    schedule,
    profile,
    language,
    voiceRemindersEnabled,
    selectedVoiceURI,
    isDataLoaded,
    loadedUserId,
    user?.id,
    userStorageKey,
  ]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('rx_reader_lang', lang);
    toast.success(lang === 'ur' ? 'زبان تبدیل ہو گئی۔ (Urdu Selected)' : 'Language updated to English');
  };

  const toggleScheduleItem = (id: string) => {
    let nextStateVal = false;
    let medName = '';
    let medAdvice = '';
    let itemFound = false;

    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          itemFound = true;
          nextStateVal = !item.taken;
          medName = item.medicineName;
          medAdvice = item.foodAdvice;
          return {
            ...item,
            taken: nextStateVal,
            takenAt: nextStateVal ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return item;
      })
    );

    if (itemFound) {
      if (nextStateVal) {
        toast.success('Dose Recorded!');
        setTimeout(() => {
          sendNotification(
            `Upcoming Medication Reminder: ${medName}`,
            `It's time to prepare your next scheduled dose of ${medName}. (${medAdvice})`
          );
        }, 60000);
      } else {
        toast('Dose status updated to pending', { icon: 'ℹ️' });
      }
    }
  };

  const toggleSkipScheduleItem = (id: string) => {
    let nextSkipped = false;
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          nextSkipped = !item.skipped;
          return {
            ...item,
            skipped: nextSkipped,
            skippedAt: nextSkipped ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            taken: false, // reset taken if marked skipped
          };
        }
        return item;
      })
    );
    toast(nextSkipped ? 'Dose marked as Skipped' : 'Dose reset to Pending', { icon: nextSkipped ? '⏭️' : 'ℹ️' });
  };

  const addScheduleItem = (newItem: Omit<TodayScheduleItem, 'id' | 'taken'>) => {
    const item: TodayScheduleItem = {
      ...newItem,
      id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taken: false,
    };
    setSchedule((prev) => [item, ...prev]);
    toast.success(`Added ${item.medicineName} to Schedule!`);
  };

  const addBulkScheduleItems = (newItems: Omit<TodayScheduleItem, 'id' | 'taken'>[]) => {
    const createdItems: TodayScheduleItem[] = newItems.map((newItem, idx) => ({
      ...newItem,
      id: `sched-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      taken: false,
    }));

    setSchedule((prev) => [...createdItems, ...prev]);
    toast.success('Medication schedule added successfully.');
  };

  const updateScheduleItem = (id: string, updated: Partial<TodayScheduleItem>) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    toast.success('Schedule item updated!');
  };

  const deleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((item) => item.id !== id));
    toast.success('Schedule item removed.');
  };

  const addScan = (newScan: PrescriptionScan) => {
    setScans((prev) => [newScan, ...prev]);
    toast.success('Prescription Scan Saved!');
  };

  const deleteScan = (id: string) => {
    setScans((prev) => prev.filter((s) => s.id !== id));
    toast.success('Prescription scan deleted.');
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      toast.error('Browser web notifications are not supported in this browser environment.');
      setNotificationPermission('denied');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast.success('Notification permissions granted!');
        sendNotification(
          'Rx Reader Notifications Enabled',
          'You will now receive real-time dose reminders and safety alerts.'
        );
      } else if (permission === 'denied') {
        toast.error(
          'Notification permission was blocked in browser settings. Please allow notifications in site settings to receive dose alerts.',
          { duration: 6000 }
        );
      } else {
        toast('Notification permission prompt was dismissed.', { icon: 'ℹ️' });
      }
      return permission;
    } catch (err) {
      console.warn('Notification permission error:', err);
      setNotificationPermission('denied');
      toast.error(
        'Browser notifications are restricted in this iframe preview container. Open in a new tab to grant native notifications.',
        { duration: 6000 }
      );
      return 'denied';
    }
  };

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Browser background notification blocked, showing toast fallback:', e);
      }
    }
    toast(body, {
      icon: '🔔',
      duration: 5000,
    });
  };

  const exportPDFReport = () => {
    toast.loading('Generating PDF Health & Medication Report...', { id: 'pdf-export' });

    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow popups to export report.', { id: 'pdf-export' });
        return;
      }

      const activeMedsList = schedule.length > 0
        ? schedule.map((s) => `<li><strong>${s.medicineName}</strong> - ${s.dosage} (${s.time} - ${s.foodAdvice})</li>`).join('')
        : '<li>No active scheduled medications found.</li>';

      const scanList = scans.length > 0
        ? scans.map((sc) => `
          <div style="border-bottom: 1px solid #e2e8f0; padding: 10px 0;">
            <p><strong>${sc.title}</strong> (${sc.date})</p>
            <p style="color: #475569; font-size: 13px;">Doctor: ${sc.doctorName} | Language: ${sc.language}</p>
            <p style="font-size: 13px;">Medicines: ${sc.medicines.map((m) => m.name).join(', ')}</p>
          </div>
        `).join('')
        : '<p>No saved prescription scans found.</p>';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rx Reader - Medication & Health Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #0d9488; font-size: 24px; margin-bottom: 4px; }
            h2 { color: #0f172a; font-size: 18px; border-bottom: 2px solid #0d9488; padding-bottom: 6px; margin-top: 24px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
            .badge { background: #f59e0b; color: white; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; }
            .disclaimer { margin-top: 40px; font-size: 12px; color: #64748b; font-style: italic; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Rx Reader - Medical Summary</h1>
              <p style="color: #64748b; margin: 0;">Generated on: ${new Date().toLocaleDateString()} | Patient: ${profile.name} (ID: ${profile.patientId})</p>
            </div>
            <span class="badge">Official PDF Report</span>
          </div>

          <h2>Current Active Schedule</h2>
          <ul>${activeMedsList}</ul>

          <h2>Prescription Scan History</h2>
          ${scanList}

          <div class="disclaimer">
            Disclaimer: For informational purposes only. Consult a qualified medical practitioner before making healthcare decisions.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
      toast.success('PDF Report Generated!', { id: 'pdf-export' });
    }, 1000);
  };

  const loadSampleData = () => {
    setScans(initialScans);
    setSchedule(initialSchedule);
    toast.success('Sample demo prescription data loaded into workspace!');
  };

  const clearAllData = () => {
    setScans([]);
    setSchedule([]);
    toast.success('Cleared all prescription data.');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        schedule,
        toggleScheduleItem,
        toggleSkipScheduleItem,
        addScheduleItem,
        addBulkScheduleItems,
        updateScheduleItem,
        deleteScheduleItem,
        scans,
        addScan,
        deleteScan,
        notificationPermission,
        requestNotificationPermission,
        sendNotification,
        voiceRemindersEnabled,
        setVoiceRemindersEnabled,
        selectedVoiceURI,
        setSelectedVoiceURI,
        availableVoices,
        speakText,
        testVoiceReminder,
        exportPDFReport,
        profile,
        setProfile,
        isChatOpen,
        setIsChatOpen,
        loadSampleData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

