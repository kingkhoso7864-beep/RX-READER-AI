import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LandingPage } from '../pages/LandingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute Component (Auth Guard)
 * Prevents unauthenticated users from accessing protected views (Dashboard, Scan, History, etc.)
 * If `!user` or `!isAuthenticated`, redirects to Landing Page.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { user, isAuthenticated } = useAuth();

  if (!user || !isAuthenticated) {
    return fallback ? <>{fallback}</> : <LandingPage />;
  }

  return <>{children}</>;
};
