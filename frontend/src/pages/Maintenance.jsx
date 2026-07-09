import React from 'react';
import { Hammer, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Maintenance = () => {
  const { settings } = useSettings();
  const platformName = settings?.platformName || 'MockMate AI';
  const logoUrl = settings?.logoUrl;

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative selection:bg-gold-500 selection:text-black">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="text-center max-w-lg space-y-8 relative z-10">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={platformName} className="h-16 object-contain" />
          ) : (
            <div className="font-extrabold text-3xl tracking-wider text-white">
              <span className="text-gold-500">MockMate</span> <span className="text-neutral-200">AI</span>
            </div>
          )}
        </div>

        {/* Animated Maintenance Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gold-500/5 border border-gold-500/10 flex items-center justify-center mx-auto relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Hammer className="w-12 h-12 text-gold-500 animate-bounce" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white tracking-tight">Scheduled Maintenance</h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto">
            {platformName} is currently undergoing scheduled updates to enhance performance and stability. 
            We will be back online shortly. Thank you for your patience!
          </p>
        </div>

        {/* Divider */}
        <div className="w-12 h-[1px] bg-neutral-800 mx-auto" />

        {/* Admin Link */}
        <div className="pt-2">
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-gold-500 transition-colors group cursor-pointer"
          >
            <span>Are you a platform administrator?</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
