import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { AlertCircle, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { googleLogin } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

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
          const btnElem = document.getElementById('google-signin-btn');
          if (btnElem) {
            window.google.accounts.id.renderButton(btnElem, {
              theme: 'filled_black',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'rectangular',
            });
          }
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

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative selection:bg-gold-500 selection:text-black">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md p-10 rounded-2xl border border-neutral-900 bg-neutral-950/40 glass transition-glow relative z-10">
        {/* Logo & heading */}
        <div className="text-center mb-10 space-y-3">
          <Link to="/" className="inline-block mb-1">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="h-12 object-contain" />
            ) : (
              <span className="font-extrabold text-2xl tracking-wider text-white">
                <span className="text-gold-500 font-extrabold">MockMate</span>{' '}
                <span className="text-neutral-200">AI</span>
              </span>
            )}
          </Link>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Sign in to resume mock training
          </p>
        </div>

        {/* Error alert */}
        {localError && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* Google Sign-In */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          ) : clientId ? (
            <div id="google-signin-btn" />
          ) : (
            isDev && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Google Sign-In Unconfigured:</span> Define{' '}
                  <code className="bg-neutral-900 px-1 py-0.5 rounded font-mono text-white text-[9px]">
                    VITE_GOOGLE_CLIENT_ID
                  </code>{' '}
                  in your environment to activate.
                </div>
              </div>
            )
          )}
        </div>

        {/* Register link */}
        <p className="mt-10 text-center text-neutral-500 text-xs sm:text-sm">
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
