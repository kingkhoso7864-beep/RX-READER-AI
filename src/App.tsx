import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingChatBot } from './components/FloatingChatBot';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanPage } from './pages/ScanPage';
import { HistoryPage } from './pages/HistoryPage';
import { InteractionsPage } from './pages/InteractionsPage';
import { SchedulePage } from './pages/SchedulePage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'scan':
        return <ScanPage />;
      case 'history':
        return <HistoryPage />;
      case 'interactions':
        return <InteractionsPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  const toastStyle = {
    background: isDark ? '#1E293B' : '#FFFFFF',
    color: isDark ? '#F1F5F9' : '#0F172A',
    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
  };

  // Unauthenticated Route Guard: Render Public Landing Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0F172A] text-[#111827] dark:text-[#F1F5F9] transition-colors duration-300">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: toastStyle,
          }}
        />

        <LandingPage />

        {/* Auth Modal & Onboarding Carousel overlays */}
        <AuthModal />
        <OnboardingModal />
      </div>
    );
  }

  // Authenticated Application Shell protected by Auth Guard
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0F172A] text-[#111827] dark:text-[#F1F5F9] transition-colors duration-300 selection:bg-teal-500 selection:text-white">
      {/* Toast Notifications container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: toastStyle,
        }}
      />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area Protected by ProtectedRoute Auth Guard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProtectedRoute fallback={<LandingPage />}>
          {renderActivePage()}
        </ProtectedRoute>
      </main>

      {/* Floating AI Medical Assistant Chatbot */}
      <FloatingChatBot />

      {/* Auth Modal for Sign In / Sign Up */}
      <AuthModal />

      {/* 3-Step Onboarding Modal Carousel */}
      <OnboardingModal />

      {/* Footer Disclaimer Banner */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
