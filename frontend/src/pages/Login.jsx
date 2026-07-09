import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Mail, Lock, LogIn, AlertCircle, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isDev = import.meta.env.DEV;

  const platformName = settings?.platformName || 'MockMate AI';
  const logoUrl = settings?.logoUrl;

  useEffect(() => {
    let checkInterval;
    const initGoogle = () => {
      if (clientId && window.google) {
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
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            {
              theme: 'filled_black',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'rectangular',
            }
          );
        } catch (err) {
          console.error('Google Sign-In initialization failed:', err);
        }
      }
    };

    initGoogle();
    if (clientId && !window.google) {
      checkInterval = setInterval(initGoogle, 500);
    }
    return () => clearInterval(checkInterval);
  }, [clientId, googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    setLocalError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Incorrect email or password.');
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
        {/* Title */}
        <div className="text-center mb-8 space-y-2">
          <Link to="/" className="inline-block mb-2">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="h-12 object-contain" />
            ) : (
              <span className="font-extrabold text-2xl tracking-wider text-white">
                <span className="text-gold-500 font-extrabold">MockMate</span> <span className="text-neutral-200">AI</span>
              </span>
            )}
          </Link>
          <p className="text-neutral-400 text-xs sm:text-sm">Sign in to resume mock training</p>
        </div>

        {/* Local Error alert */}
        {localError && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
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

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-neutral-300 text-xs font-semibold uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-gold-500 hover:text-gold-400 text-xs font-medium transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-neutral-900"></div>
          <span className="flex-shrink mx-4 text-neutral-500 text-xs font-semibold uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-neutral-900"></div>
        </div>

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

        {/* Signup redirection link */}
        <p className="mt-8 text-center text-neutral-500 text-xs sm:text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-500 hover:text-gold-400 font-semibold transition-colors">
            Register for Free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
