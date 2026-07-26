export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'ur';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'email' | 'google';
  onboarded: boolean;
  createdAt: string;
}

export interface MedicineTiming {
  morning_subah: boolean;
  afternoon_dopahar: boolean;
  night_raat: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  timing?: MedicineTiming;
  meal_relation?: 'After Food' | 'Before Food' | 'With Food' | 'Not Specified' | string;
  duration_days?: string;
  instructions_summary?: string;
  frequency?: string;
  foodAdvice?: string;
  confidence?: number;
  urduName?: string;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  scheduledTime?: string;
}

export interface TodayScheduleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  foodAdvice: string;
  taken: boolean;
  takenAt?: string;
  skipped?: boolean;
  skippedAt?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  prescriptionId?: string;
  prescriptionTitle?: string;
}

export interface PrescriptionScan {
  id: string;
  title: string;
  doctorName: string;
  clinic?: string;
  date: string;
  language: 'English' | 'Urdu / Bilingual' | 'English & Urdu';
  medicines: Medicine[];
  general_advice?: string[];
  imageUrl?: string;
  notes?: string;
  confidence: number;
}

export interface DrugConflict {
  type: string;
  severity: 'High' | 'Moderate' | 'Low';
  medicines: string[];
  recommendation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  warning?: string | null;
}

export interface UserProfile {
  name: string;
  patientId: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  autoInteractionAlerts: boolean;
  bilingualOcr: boolean;
  voiceRemindersEnabled?: boolean;
  preferredVoiceURI?: string;
}
