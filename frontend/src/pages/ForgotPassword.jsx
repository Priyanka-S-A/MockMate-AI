import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, KeyRound, Check, Lock } from 'lucide-react';
import { api } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Steps: 1 = Email Entry, 2 = OTP verification, 3 = Reset Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Step 1: Request Recovery OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStep(2);
      setCooldown(60);
      setSuccessMessage(response.message || 'Recovery OTP sent to your email.');
    } catch (err) {
      setError(err.message || 'Error occurred while requesting recovery code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Recovery OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password-verify', { email, otp });
      setStep(3);
      setSuccessMessage(response.message || 'OTP verified. Please reset your password.');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password-reset', { email, otp, newPassword });
      setSuccessMessage(response.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // Resend recovery OTP helper
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setCooldown(60);
      setSuccessMessage(response.message || 'A new recovery OTP has been sent.');
    } catch (err) {
      setError(err.message || 'Failed to resend recovery code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative selection:bg-gold-500 selection:text-black">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-2xl border border-neutral-900 bg-neutral-950/40 glass transition-glow relative z-10">
        
        {/* Back navigation */}
        <div className="mb-6">
          {step === 1 ? (
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold-500 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          ) : (
            <button
              onClick={() => {
                if (step === 2) setStep(1);
                if (step === 3) setStep(2);
                setError(null);
                setSuccessMessage(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to previous step
            </button>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-neutral-400 text-xs sm:text-sm">
            {step === 1 && 'Enter your email to request recovery code'}
            {step === 2 && 'Enter the 6-digit recovery OTP'}
            {step === 3 && 'Choose a secure new password'}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Email Entry */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded bg-gold-500 hover:bg-gold-400 text-black font-bold tracking-wide text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Recovery OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div className="space-y-6">
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-2">Recovery Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-center text-white tracking-[8px] font-mono placeholder:tracking-normal focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 rounded bg-gold-500 hover:bg-gold-400 text-black font-bold tracking-wide text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              {cooldown > 0 ? (
                <p className="text-neutral-500 text-xs font-medium">
                  Resend recovery code in <span className="text-neutral-300 font-semibold">{cooldown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-gold-500 hover:text-gold-400 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Resend Recovery OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Reset password form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded bg-gold-500 hover:bg-gold-400 text-black font-bold tracking-wide text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Update & Reset Password</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
