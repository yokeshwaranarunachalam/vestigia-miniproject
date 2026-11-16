import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect straight to dashboard or previous route
  const from = location.state?.from?.pathname || '/dashboard';

  // Step state: 'email' (Step 1) | 'otp' (Step 2)
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // References to 6 OTP inputs for auto-focus navigation
  const otpRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // If already logged in, redirect away from login page
  if (user) {
    return <Navigate to={from} replace />;
  }

  // --- Handlers ---
  const handleEmailSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid college or personal email address.');
      return;
    }

    const isConfigured =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY &&
      !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');

    setLoading(true);

    // If Supabase credentials are not yet added, use interactive Demo/Dev OTP Mode
    if (!isConfigured) {
      setTimeout(() => {
        setLoading(false);
        setStep('otp');
        setCountdown(60);
        setOtpDigits(['1', '2', '3', '4', '5', '6']); // Pre-fill 123456 for effortless testing
        setSuccessMessage(
          '✨ Demo Mode Active (Add .env to connect live Supabase). Use test OTP: 123456'
        );
        setTimeout(() => otpRefs.current[5]?.focus(), 100);
      }, 600);
      return;
    }

    try {
      await sendOtp(cleanEmail);
      setSuccessMessage(`One-time security code sent to ${cleanEmail}`);
      setStep('otp');
      setCountdown(60); // 60s cooldown for resending
      // Clear previous digits & focus first input
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error('[Login] Failed to send OTP:', err);
      setErrorMessage(
        err.message || 'Unable to send OTP. Check your Supabase settings or internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only accept single digit numeric or empty
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);
    setErrorMessage('');

    // Auto-advance to next input if digit entered
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace: clear current and focus previous if already empty
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      otpRefs.current[5]?.focus();
      setErrorMessage('');
    }
  };

  const handleOtpSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the full 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, code);
      // Wait a moment for React state to flush, then navigate
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[Login] Failed to verify OTP:', err);
      setErrorMessage(
        err.message || 'Invalid or expired OTP. Please verify and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    await handleEmailSubmit();
  };

  const handleBackToEmail = () => {
    setStep('email');
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden py-12">
      {/* Dynamic Background Gradients & Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-3 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20 transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="text-white w-8 h-8" />
            </div>
            <div className="absolute -top-1 -right-1">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Vestigia
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold tracking-normal">
              Student Portal
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Your Academic Footprints & Achievement Tracker
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all">
          {/* Status Banners */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              <p className="leading-snug">{successMessage}</p>
            </div>
          )}

          {/* STEP 1: EMAIL ENTRY */}
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-200">
                    College or Personal Email
                  </label>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Passwordless OTP
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  We'll send a 6-digit verification code to sign you in or create your student profile securely.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:opacity-90 transition-opacity"></span>
                <span className="relative flex items-center justify-center gap-2 py-3 px-4 bg-slate-900/10 rounded-[11px] text-white font-medium text-sm transition-all group-hover:bg-transparent">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending OTP code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>
          ) : (
            /* STEP 2: 6-DIGIT OTP VERIFICATION */
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-200">
                    Enter Verification Code
                  </label>
                  <span className="text-xs text-blue-400 font-mono font-medium flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> 6-digit OTP
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Sent to <span className="text-slate-200 font-semibold">{email}</span>
                </p>

                {/* 6 Digit Inputs */}
                <div className="flex justify-between gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={loading}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-950/70 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* Submit OTP */}
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></span>
                <span className="relative flex items-center justify-center gap-2 py-3 px-4 bg-slate-900/10 rounded-[11px] text-white font-medium text-sm transition-all group-hover:bg-transparent">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Access Dashboard</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>

              {/* Back to email & Resend timer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    countdown > 0
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-purple-400 hover:text-purple-300'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} Vestigia. Empowering student academic portfolios.</p>
          <p>Protected by Supabase Row-Level Security and OAuth token encryption.</p>
        </div>
      </div>
    </div>
  );
}
