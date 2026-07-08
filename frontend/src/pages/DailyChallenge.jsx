import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/common/AppLayout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Zap, Play, Trophy, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';

const domainColorMap = {
  Java: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Python: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  SQL: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Data Structures': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Data Analytics': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Web Development': 'text-green-400 bg-green-500/10 border-green-500/20',
  JavaScript: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  React: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'Node.js': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'HR Interview': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const DailyChallenge = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [challenge, setChallenge] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const data = await api.get('/daily-challenge');
        setChallenge(data.challenge);
        setAttempt(data.attempt);
      } catch (err) {
        setError(err.message || 'Failed to load daily challenge.');
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOption) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.post('/daily-challenge/submit', {
        userAnswer: selectedOption,
      });
      setSubmissionResult(result);
      setAttempt(result.attempt);
      await refreshUser(); // Update XP streak header immediately
    } catch (err) {
      setError(err.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm font-medium">Loading today's challenge...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error && !challenge) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Error Loading Daily Challenge</p>
            <p className="text-sm mt-1 text-red-400/80">{error}</p>
            <Link to="/dashboard" className="text-xs text-gold-500 hover:underline mt-2 inline-block font-bold">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Determine current active/view status
  const isAlreadyAttempted = !!attempt;
  const isCorrect = attempt ? attempt.score === 1 : (submissionResult ? submissionResult.success : null);
  const userAns = attempt ? attempt.userAnswer : selectedOption;
  const correctAns = attempt ? attempt.correctAnswer : (submissionResult ? submissionResult.correctAnswer : challenge?.correctAnswer);
  const exp = attempt ? attempt.explanation : (submissionResult ? submissionResult.explanation : challenge?.explanation);
  const xp = attempt ? attempt.xpAwarded : (submissionResult ? submissionResult.xpAwarded : 0);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header Block */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 shrink-0">
              <Zap className="w-5 h-5 fill-gold-500/10" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Daily Challenge</h1>
              <p className="text-neutral-500 text-xs mt-0.5">One unique challenge every single day</p>
            </div>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${domainColorMap[challenge.domain] || 'text-neutral-400 bg-neutral-800 border-neutral-700'}`}>
            {challenge.domain}
          </span>
        </div>

        {/* Main Challenge Card */}
        <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-1/4 -right-1/4 w-[250px] h-[250px] bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Question Text */}
          <h2 className="text-white font-semibold text-lg sm:text-xl leading-relaxed mb-8">
            {challenge.question}
          </h2>

          {/* Submitting/Results Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Option Selector */}
          {!isAlreadyAttempted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {challenge.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center gap-3 cursor-pointer
                        ${isSelected 
                          ? 'border-gold-500 bg-gold-500/10 text-white font-medium shadow-[0_0_15px_rgba(212,175,55,0.08)]' 
                          : 'border-neutral-800/80 bg-neutral-900/30 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900/50'
                        }`}
                    >
                      <span className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center shrink-0 transition-colors
                        ${isSelected 
                          ? 'border-gold-500 bg-gold-500 text-black font-extrabold' 
                          : 'border-neutral-700 text-neutral-400 bg-neutral-900'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={submitting || !selectedOption}
                className="w-full mt-6 py-3.5 rounded bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Submission Summary Card */
            <div className="space-y-6">
              {/* Correct State */}
              {isCorrect ? (
                <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center flex flex-col items-center gap-2 animate-glow">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <h3 className="text-emerald-400 font-extrabold text-lg mt-2">✅ Correct Answer!</h3>
                  <p className="text-neutral-300 text-sm">🎉 Today's Challenge Completed</p>
                  {xp > 0 && (
                    <span className="text-gold-500 font-bold text-xs mt-1 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
                      +{xp} XP Awarded
                    </span>
                  )}
                </div>
              ) : (
                /* Incorrect State */
                <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center gap-2">
                  <XCircle className="w-10 h-10 text-red-500" />
                  <h3 className="text-red-400 font-extrabold text-lg mt-2">❌ Incorrect Answer</h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    Today's Challenge is Over. Come back tomorrow for a new challenge.
                  </p>
                </div>
              )}

              {/* Show options with color coding */}
              <div className="grid grid-cols-1 gap-3">
                {challenge.options?.map((opt, idx) => {
                  const isUserPick = opt === userAns;
                  const isCorrectPick = opt === correctAns;
                  
                  let borderClass = 'border-neutral-800/80 bg-neutral-900/30 text-neutral-500';
                  let badgeClass = 'border-neutral-700 text-neutral-400 bg-neutral-900';

                  if (isCorrectPick) {
                    borderClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-medium';
                    badgeClass = 'border-emerald-500 bg-emerald-500 text-black font-extrabold';
                  } else if (isUserPick) {
                    borderClass = 'border-red-500 bg-red-500/10 text-red-400 font-medium';
                    badgeClass = 'border-red-500 bg-red-500 text-black font-extrabold';
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${borderClass}`}
                    >
                      <span className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center shrink-0 ${badgeClass}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation block */}
              {exp && (
                <div className="p-5 rounded-xl border border-neutral-800/80 bg-neutral-900/20 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500">Explanation</h4>
                  <p className="text-neutral-300 text-sm leading-relaxed">{exp}</p>
                </div>
              )}

              {/* Return CTA */}
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-4 py-3.5 rounded border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DailyChallenge;
