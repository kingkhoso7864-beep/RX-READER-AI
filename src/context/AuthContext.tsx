import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeOnboarding: () => void;
  triggerOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'rx_reader_authenticated_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email && parsed.id) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved user session', e);
    }
    return null;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Handle redirect result after page load if redirect flow was triggered
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const fbUser = result.user;
          const googleUser: User = {
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Patient',
            photoURL: fbUser.photoURL || undefined,
            provider: 'google',
            onboarded: true,
            createdAt: new Date().toISOString(),
          };
          setUser(googleUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(googleUser));
          setShowAuthModal(false);
          toast.success(`Welcome, ${googleUser.displayName}! Signed in with Google.`);
        }
      })
      .catch((err: any) => {
        console.warn('Google Auth redirect result handler:', err);
        if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
          const hostname = typeof window !== 'undefined' ? window.location.hostname : 'rx-readerai.ai.studio';
          toast.error(`Firebase Auth Domain Error: '${hostname}' is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.`, { id: 'unauth-domain', duration: 10000 });
        }
      });
  }, []);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mappedUser: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Patient',
          photoURL: fbUser.photoURL || undefined,
          provider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
          onboarded: true,
          createdAt: new Date().toISOString(),
        };
        setUser(mappedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mappedUser));
      } else {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim().toLowerCase());
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    const trimmedPass = pass.trim();

    if (!trimmedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    if (!validateEmail(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!trimmedPass) {
      return { success: false, error: 'Password is required.' };
    }

    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
      const fbUser = userCredential.user;
      const authenticatedUser: User = {
        id: fbUser.uid,
        email: fbUser.email || trimmedEmail,
        displayName: fbUser.displayName || trimmedEmail.split('@')[0] || 'Patient',
        photoURL: fbUser.photoURL || undefined,
        provider: 'email',
        onboarded: true,
        createdAt: new Date().toISOString(),
      };
      setUser(authenticatedUser);
      setShowAuthModal(false);
      toast.success(`Welcome back, ${authenticatedUser.displayName}!`);
      return { success: true };
    } catch (firebaseErr: any) {
      console.error('Firebase email sign-in error:', firebaseErr);
      return { success: false, error: firebaseErr.message || 'Failed to sign in with email.' };
    }
  };

  const signupWithEmail = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      return { success: false, error: 'Full Name is required.' };
    }

    if (!trimmedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    if (!validateEmail(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!pass) {
      return { success: false, error: 'Password is required.' };
    }

    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: trimmedName });
      }
      const newUser: User = {
        id: userCredential.user.uid,
        email: trimmedEmail,
        displayName: trimmedName,
        provider: 'email',
        onboarded: false,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      setShowAuthModal(false);
      setShowOnboarding(true);
      toast.success(`Account created successfully! Welcome to Rx Reader, ${newUser.displayName}.`);
      return { success: true };
    } catch (fbErr: any) {
      console.error('Firebase signup error:', fbErr);
      return { success: false, error: fbErr.message || 'Failed to create account.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Force prompt select_account so Google shows the official account chooser every time
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const googleUser: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Patient',
        photoURL: fbUser.photoURL || undefined,
        provider: 'google',
        onboarded: true,
        createdAt: new Date().toISOString(),
      };

      setUser(googleUser);
      setShowAuthModal(false);
      toast.success(`Welcome, ${googleUser.displayName}! Signed in with Google.`);
      return { success: true };
    } catch (popupErr: any) {
      console.warn('Popup signin error, checking for redirect fallback:', popupErr);

      if (
        popupErr?.code === 'auth/unauthorized-domain' ||
        popupErr?.message?.includes('unauthorized-domain')
      ) {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'rx-readerai.ai.studio';
        const msg = `Unauthorized Domain: '${domain}' is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
        toast.error(msg, { id: 'unauth-domain', duration: 10000 });
        return { success: false, error: msg };
      }
      
      // If popup is blocked by browser or closed, fallback to redirect
      if (
        popupErr.code === 'auth/popup-blocked' ||
        popupErr.code === 'auth/popup-closed-by-user' ||
        popupErr.code === 'auth/cancelled-popup-request'
      ) {
        try {
          toast.loading('Opening Google Account Chooser...', { id: 'google-redirect' });
          await signInWithRedirect(auth, googleProvider);
          return { success: true };
        } catch (redirectErr: any) {
          console.error('Redirect sign-in error:', redirectErr);
          toast.error(`Google Sign-In failed: ${redirectErr.message || 'Error'}`);
          return { success: false, error: redirectErr.message };
        }
      }

      toast.error(`Google Sign-In Error: ${popupErr.message || 'Failed to authenticate with Google'}`);
      return { success: false, error: popupErr.message };
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setUser(null);
    setShowAuthModal(false);
    setShowOnboarding(false);
    toast.success('Logged out successfully.');
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser: User = { ...user, onboarded: true };
      setUser(updatedUser);
    }
    setShowOnboarding(false);
    toast.success('Onboarding completed! Welcome to Rx Reader.');
  };

  const triggerOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        showAuthModal,
        setShowAuthModal,
        showOnboarding,
        setShowOnboarding,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        completeOnboarding,
        triggerOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

