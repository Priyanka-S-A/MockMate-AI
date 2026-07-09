import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Target, Zap, LogOut, User as UserIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Attendance calendar modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  // Calendar calculations
  const firstDayIdx = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const blanks = Array(firstDayIdx).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells = [...blanks, ...days];

  const completedDates = user?.gamification?.completedInterviewDates || [];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wider text-white">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.platformName || 'MockMate AI'} className="h-8 object-contain" />
            ) : (
              <>
                <span className="text-gold-500 font-extrabold font-sans">
                  {settings?.platformName ? settings.platformName.split(' ')[0] : 'MockMate'}
                </span>
                <span className="text-neutral-200">
                  {settings?.platformName ? settings.platformName.split(' ').slice(1).join(' ') : ' AI'}
                </span>
              </>
            )}
          </Link>
        </div>

        {/* Action / Stats Section */}
        <div className="flex items-center gap-4 sm:gap-6">
          {user && (
            <>
              {/* Interviews Completed (Clickable to open Attendance Calendar) */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 font-medium text-sm transition-glow cursor-pointer hover:bg-gold-500/20 hover:border-gold-500/40 select-none"
                title="View Interview Activity Calendar"
              >
                <Target className="w-4.5 h-4.5" />
                <span>
                  {user.gamification?.completedInterviewsCount ?? 0}
                  {' '}{(user.gamification?.completedInterviewsCount ?? 0) === 1 ? 'Interview' : 'Interviews'}
                </span>
              </button>

              {/* XP Points Tracker */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-medium text-sm transition-glow" title="Practice Points">
                <Zap className="w-4 h-4 fill-yellow-500/40" />
                <span>{user.gamification?.points || 0} XP</span>
              </div>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-4 border-l border-neutral-800 pl-4 sm:pl-6">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:border-gold-500/40 flex items-center justify-center text-gold-500 text-sm font-semibold transition-all">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <span className="hidden sm:inline text-neutral-300 text-sm font-medium group-hover:text-white transition-colors">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-neutral-400 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded bg-gold-500 text-black hover:bg-gold-400 text-sm font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Attendance Calendar Modal ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-gold-500" />
                <h3 className="text-white font-bold text-base sm:text-lg">Interview Activity Calendar</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance stats */}
            <div className="p-3.5 rounded-xl border border-gold-500/10 bg-gold-500/5 text-center">
              <span className="text-neutral-400 text-xs">Total Active Days: </span>
              <span className="text-gold-500 font-extrabold text-sm ml-1">
                {completedDates.length} {completedDates.length === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-neutral-850 bg-neutral-900/50 text-neutral-300 hover:text-gold-500 hover:border-gold-500/30 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white font-bold text-sm select-none">
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-neutral-850 bg-neutral-900/50 text-neutral-300 hover:text-gold-500 hover:border-gold-500/30 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Weekdays names */}
              {WEEKDAYS.map(day => (
                <div key={day} className="text-neutral-500 text-[10px] font-bold uppercase py-1">
                  {day}
                </div>
              ))}

              {/* Day cells */}
              {cells.map((val, idx) => {
                if (val === null) {
                  return <div key={`blank-${idx}`} className="aspect-square" />;
                }

                // Check active status
                const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${val.toString().padStart(2, '0')}`;
                const hasPractice = completedDates.includes(dateKey);

                return (
                  <div
                    key={`day-${val}`}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold select-none border transition-all
                      ${hasPractice 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-bold' 
                        : 'bg-neutral-900/20 text-neutral-400 border-neutral-900/80'
                      }`}
                    title={hasPractice ? `Interview Completed on ${dateKey}` : `No completed interviews`}
                  >
                    {val}
                  </div>
                );
              })}
            </div>

            {/* Legend info */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30" />
                <span>Practice Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-neutral-900/30 border border-neutral-900" />
                <span>No Practice</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
