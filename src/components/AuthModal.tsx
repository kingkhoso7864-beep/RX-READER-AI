import React, { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Pill, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field touched states for inline validation messages
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Reset state when modal opens or mode changes
  useEffect(() => {
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTouched({
      name: false,
      email: false,
      password: false,
      confirmPassword: false,
    });
  }, [showAuthModal, mode]);

  if (!showAuthModal) return null;

  const validateEmail = (emailStr: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr.trim().toLowerCase());
  };

  // Inline Validation Helpers
  const getNameError = (): string | null => {
    if (mode === 'signup' && touched.name) {
      if (!name.trim()) return 'Full Name is required.';
    }
    return null;
  };

  const getEmailError = (): string | null => {
    if (touched.email) {
      if (!email.trim()) return 'Email address is required.';
      if (!validateEmail(email)) return 'Please enter a valid email address (e.g. user@example.com).';
    }
    return null;
  };

  const getPasswordError = (): string | null => {
    if (touched.password) {
      if (!password) return 'Password is required.';
      if (password.length < 6) return 'Password must be at least 6 characters long.';
    }
    return null;
  };

  const getConfirmPasswordError = (): string | null => {
    if (mode === 'signup' && touched.confirmPassword) {
      if (!confirmPassword) return 'Please confirm your password.';
      if (confirmPassword !== password) return 'Passwords do not match.';
    }
    return null;
  };

  // Check overall form validity
  const isEmailValid = email.trim() !== '' && validateEmail(email);
  const isPasswordValid = password.length >= 6;
  const isNameValid = mode === 'signin' || name.trim() !== '';
  const isConfirmPasswordValid = mode === 'signin' || (confirmPassword !== '' && confirmPassword === password);

  const isFormValid = isEmailValid && isPasswordValid && isNameValid && isConfirmPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched to trigger inline errors if submitted prematurely
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // STRICT GUARD: Do NOT trigger auth or navigation if validation fails
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isFormValid) {
      setError('Please complete all fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await loginWithEmail(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid credentials. Please check your email and password.');
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await signupWithEmail(name, email, password);
        if (!res.success) {
          setError(res.error || 'Failed to create account. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.error || 'Google Sign-In failed.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError('Google Sign-In failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const nameError = getNameError();
  const emailError = getEmailError();
  const passwordError = getPasswordError();
  const confirmPasswordError = getConfirmPasswordError();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Centered modal on desktop and mobile with max-width: 480px, width: 90%, max-height: 90vh */}
      <div className="relative w-[90%] max-w-[480px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        
        {/* Background glow decoration */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close Auth Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white mb-3 shadow-lg shadow-teal-600/30">
            <Pill className="w-8 h-8" />
          </div>
          <h2 className="font-sora font-extrabold text-2xl text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Rx Reader Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'signin'
              ? 'Sign in to access your prescriptions, dose reminders & safety logs'
              : 'Join Rx Reader for smart prescription OCR, schedules & interaction warnings'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Response Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] mb-4 disabled:opacity-60 cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-[#1E293B] px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase relative">
            OR WITH EMAIL
          </span>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Full Name Input (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                    if (!touched.name) setTouched((prev) => ({ ...prev, name: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 ${
                    nameError
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                  }`}
                />
              </div>
              {nameError && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>
          )}

          {/* Email Address Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                placeholder="alex.morgan@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                  if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 ${
                  emailError
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                }`}
              />
            </div>
            {emailError && (
              <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                  if (!touched.password) setTouched((prev) => ({ ...prev, password: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 ${
                  passwordError
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* Confirm Password Input (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                    if (!touched.confirmPassword) setTouched((prev) => ({ ...prev, confirmPassword: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 ${
                    confirmPasswordError
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                  }`}
                />
              </div>
              {confirmPasswordError && (
                <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{confirmPasswordError}</span>
                </p>
              )}
            </div>
          )}

          {/* Submit Button: Strictly disabled if form fields are empty or invalid */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2 cursor-pointer"
          >
            {isSubmitting
              ? mode === 'signin' ? 'Signing In...' : 'Creating Account...'
              : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
};
