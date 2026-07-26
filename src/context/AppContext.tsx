import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { AppLanguage, PrescriptionScan, TodayScheduleItem, UserProfile } from '../types';

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  schedule: TodayScheduleItem[];
  toggleScheduleItem: (id: string) => void;
  addScheduleItem: (item: Omit<TodayScheduleItem, 'id' | 'taken'>) => void;
  scans: PrescriptionScan[];
  addScan: (scan: PrescriptionScan) => void;
  deleteScan: (id: string) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, body: string) => void;
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

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Load User Data based on authenticated identity
  useEffect(() => {
    if (!user) {
      // Guest mode: load guest local storage or sample defaults
      const savedScans = localStorage.getItem('rx_guest_scans');
      const savedSched = localStorage.getItem('rx_guest_schedule');
      const savedProf = localStorage.getItem('rx_guest_profile');

      setScans(savedScans ? JSON.parse(savedScans) : initialScans);
      setSchedule(savedSched ? JSON.parse(savedSched) : initialSchedule);
      setProfile(
        savedProf
          ? JSON.parse(savedProf)
          : {
              name: 'Alex Morgan (Guest)',
              patientId: 'RX-77492',
              age: 42,
              gender: 'Male',
              bloodGroup: 'O+',
              allergies: ['Penicillin (Mild Rash)'],
              autoInteractionAlerts: true,
              bilingualOcr: true,
            }
      );
      return;
    }

    // Authenticated user: Load user-isolated data
    const savedScans = localStorage.getItem(`${userStorageKey}_scans`);
    const savedSched = localStorage.getItem(`${userStorageKey}_schedule`);
    const savedProf = localStorage.getItem(`${userStorageKey}_profile`);

    // Real-time Firestore user sync
    const userDocRef = doc(db, 'users', user.id);
    const unsub = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.scans) setScans(data.scans);
          if (data.schedule) setSchedule(data.schedule);
          if (data.profile) setProfile(data.profile);
        } else {
          // New User initial setup: Start with empty clean slate for new real accounts!
          const initialUserScans = savedScans ? JSON.parse(savedScans) : [];
          const initialUserSchedule = savedSched ? JSON.parse(savedSched) : [];
          const initialUserProfile = savedProf
            ? JSON.parse(savedProf)
            : {
                name: user.displayName || 'Patient',
                patientId: `RX-${user.id.slice(0, 6).toUpperCase()}`,
                age: 30,
                gender: 'Not Specified',
                bloodGroup: 'Not Specified',
                allergies: [],
                autoInteractionAlerts: true,
                bilingualOcr: true,
              };

          setScans(initialUserScans);
          setSchedule(initialUserSchedule);
          setProfile(initialUserProfile);

          // Save initial document to Firestore
          setDoc(
            userDocRef,
            {
              scans: initialUserScans,
              schedule: initialUserSchedule,
              profile: initialUserProfile,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((e) => console.warn('Firestore initialization save:', e));
        }
      },
      (err) => {
        console.warn('Firestore snapshot error, using local storage fallback:', err);
        setScans(savedScans ? JSON.parse(savedScans) : []);
        setSchedule(savedSched ? JSON.parse(savedSched) : []);
        setProfile(
          savedProf
            ? JSON.parse(savedProf)
            : {
                name: user.displayName || 'Patient',
                patientId: `RX-${user.id.slice(0, 6).toUpperCase()}`,
                age: 30,
                gender: 'Not Specified',
                bloodGroup: 'Not Specified',
                allergies: [],
                autoInteractionAlerts: true,
                bilingualOcr: true,
              }
        );
      }
    );

    return () => unsub();
  }, [user?.id, userStorageKey]);

  // Persist local storage and Firestore changes
  useEffect(() => {
    localStorage.setItem(`${userStorageKey}_scans`, JSON.stringify(scans));
    localStorage.setItem(`${userStorageKey}_schedule`, JSON.stringify(schedule));
    localStorage.setItem(`${userStorageKey}_profile`, JSON.stringify(profile));

    if (user?.id) {
      const userDocRef = doc(db, 'users', user.id);
      setDoc(
        userDocRef,
        {
          scans,
          schedule,
          profile,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch((err) => console.warn('Firestore update error:', err));
    }
  }, [scans, schedule, profile, userStorageKey, user?.id]);

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

  const addScheduleItem = (newItem: Omit<TodayScheduleItem, 'id' | 'taken'>) => {
    const item: TodayScheduleItem = {
      ...newItem,
      id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taken: false,
    };
    setSchedule((prev) => [item, ...prev]);
    toast.success(`Added ${item.medicineName} to Schedule!`);
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
        addScheduleItem,
        scans,
        addScan,
        deleteScan,
        notificationPermission,
        requestNotificationPermission,
        sendNotification,
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

