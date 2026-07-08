import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle, AlertTriangle, ArrowLeft, KeyRound, Check } from 'lucide-react';

const Register = () => {
  const { register, verifyRegisterOtp, resendRegisterOtp, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Step 1: Details, Step 2: OTP
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isDev = import.meta.env.DEV;

  // Google OAuth Initialization
  useEffect(() => {
    let checkInterval;
    const initGoogle = () => {
      if (clientId && window.google && step === 1) {
        clearInterval(checkInterval);
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              setLoading(true);
              setLocalError(null);
              try {
                await googleLogin(response.credential);
                navigate('/dashboard');
              } catch (err) {
                setLocalError(err.message || 'Google Authentication failed.');
              } finally {
                setLoading(false);
              }
            },
          });
          const btnElem = document.getElementById('google-signin-btn');
          if (btnElem) {
            window.google.accounts.id.renderButton(
              btnElem,
              {
                theme: 'filled_black',
                size: 'large',
                width: 320,
                text: 'continue_with',
                shape: 'rectangular',
              }
            );
          }
        } catch (err) {
          console.error('Google Sign-In initialization failed:', err);
        }
      }
    };

    initGoogle();
    if (clientId && !window.google && step === 1) {
      checkInterval = setInterval(initGoogle, 500);
    }
    return () => clearInterval(checkInterval);
  }, [clientId, googleLogin, navigate, step]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Handle Step 1 Registration submit (Request OTP)
  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLocalError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2 OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit verification code.');
      return;
    }
    setLocalError(null);
    setLoading(true);
    try {
      await verifyRegisterOtp(email, otp);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLocalError(null);
    setLoading(true);
    try {
      await resendRegisterOtp(email);
      setCooldown(60);
    } catch (err) {
      setLocalError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative selection:bg-gold-500 selection:text-black">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-2xl border border-neutral-900 bg-neutral-950/40 glass transition-glow relative z-10">
        {/* Step 2 Back navigation */}
        {step === 2 && (
          <div className="mb-6">
            <button
              onClick={() => { setStep(1); setOtp(''); setLocalError(null); }}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to registration details
            </button>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block font-extrabold text-2xl tracking-wider text-white mb-2">
            <span className="text-gold-500 font-extrabold">MockMate</span> <span className="text-neutral-200">AI</span>
          </Link>
          <p className="text-neutral-400 text-xs sm:text-sm">
            {step === 1 ? 'Create an account to begin mock trials' : 'Enter verification code'}
          </p>
        </div>

        {/* Local Error alert */}
        {localError && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* STEP 1: Registration form */}
        {step === 1 && (
          <>
            <form onSubmit={handleSubmitDetails} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded bg-gold-500 hover:bg-gold-400 text-black font-bold tracking-wide text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-neutral-900"></div>
              <span className="flex-shrink mx-4 text-neutral-500 text-xs font-semibold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-neutral-900"></div>
            </div>

            {/* Google Login button */}
            {clientId ? (
              <div className="flex justify-center">
                <div id="google-signin-btn" />
              </div>
            ) : (
              isDev && (
                <div className="p-3 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Google Sign-In Unconfigured:</span> Define <code className="bg-neutral-900 px-1 py-0.5 rounded font-mono text-white text-[9px]">VITE_GOOGLE_CLIENT_ID</code> in environment to activate.
                  </div>
                </div>
              )
            )}
          </>
        )}

        {/* STEP 2: OTP Verification form */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 text-center space-y-2">
              <p className="text-xs text-neutral-400">An OTP code has been dispatched to:</p>
              <p className="text-sm font-bold text-white tracking-wide">{email}</p>
              <p className="text-[10px] text-neutral-500">Please enter the 6-digit code within 5 minutes.</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-2">Verification Code</label>
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
                    <span>Verify & Login</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              {cooldown > 0 ? (
                <p className="text-neutral-500 text-xs font-medium">
                  Resend verification code in <span className="text-neutral-300 font-semibold">{cooldown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-gold-500 hover:text-gold-400 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Resend Verification Code
                </button>
              )}
            </div>
          </div>
        )}

        {/* Login redirection link */}
        <p className="mt-8 text-center text-neutral-500 text-xs sm:text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-500 hover:text-gold-400 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
