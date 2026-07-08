import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AppLayout from '../components/common/AppLayout';
import StatCard from '../components/ui/StatCard';
import CircularScore from '../components/ui/CircularScore';
import {
  ScoreTrendChart,
  WeeklyActivityChart,
  DomainDistributionChart,
  DifficultyRadarChart,
} from '../components/ui/Charts';
import {
  BookOpen,
  TrendingUp,
  Trophy,
  Calendar,
  Zap,
  Award,
  Target,
  ChevronRight,
  AlertTriangle,
  Star,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// Badge display config
const BADGE_CONFIG = {
  'First Practice': { emoji: '🎯', desc: 'Completed your first mock interview' },
  'AI Pioneer': { emoji: '🤖', desc: 'Used AI evaluation 5 times' },
  'Streak Master': { emoji: '🔥', desc: 'Maintained a 7-day streak' },
  'High Scorer': { emoji: '⭐', desc: 'Scored above 80 in an interview' },
  'Domain Expert': { emoji: '🏆', desc: 'Completed 10 interviews in one domain' },
  'Consistent': { emoji: '📅', desc: 'Practiced for 30 days' },
};

// Daily challenge questions pool
const DAILY_CHALLENGES = [
  { domain: 'Data Structures', q: 'Explain the difference between a stack and a queue with a real-world example.' },
  { domain: 'Java', q: 'What is the difference between abstract classes and interfaces in Java?' },
  { domain: 'SQL', q: 'Write a query to find the second highest salary from an Employees table.' },
  { domain: 'JavaScript', q: 'Explain event delegation and provide a practical example.' },
  { domain: 'Python', q: 'What are Python decorators? Provide an example with a use case.' },
  { domain: 'React', q: 'Explain the difference between useEffect and useLayoutEffect.' },
  { domain: 'HR Interview', q: 'Describe a situation where you had to work under pressure and how you handled it.' },
];

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

const difficultyColor = {
  Beginner: 'text-emerald-400 bg-emerald-500/10',
  Intermediate: 'text-yellow-400 bg-yellow-500/10',
  Advanced: 'text-red-400 bg-red-500/10',
};

const ScoreBadge = ({ score }) => {
  const color =
    score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    score >= 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
    'text-red-400 bg-red-500/10 border-red-500/20';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
      {score}/100
    </span>
  );
};

// Empty state with call-to-action
const EmptyDashboard = ({ name }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-6">
      <Play className="w-8 h-8 text-gold-500" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-3">
      Welcome, {name}! Let's get you started.
    </h2>
    <p className="text-neutral-400 max-w-md text-sm mb-8">
      You haven't taken any mock interviews yet. Complete your first session to unlock your personalized performance dashboard with charts, scores, and AI-powered insights.
    </p>
    <Link
      to="/practice"
      className="flex items-center gap-2 px-8 py-3.5 rounded bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
    >
      <Play className="w-4 h-4" />
      <span>Start Your First Mock Interview</span>
    </Link>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyAttempt, setDailyAttempt] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/stats/dashboard');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchDailyChallenge = async () => {
      try {
        const data = await api.get('/daily-challenge');
        setDailyChallenge(data.challenge);
        setDailyAttempt(data.attempt);
      } catch (err) {
        console.error('Failed to load daily challenge:', err);
      } finally {
        setLoadingChallenge(false);
      }
    };

    fetchStats();
    fetchDailyChallenge();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm">Loading your performance data...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Could not load dashboard statistics</p>
            <p className="text-sm mt-1 text-red-400/70">{error}</p>
            <p className="text-xs mt-1 text-red-400/50">
              Ensure your MongoDB Atlas URI is configured in <code>backend/.env</code>
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isEmpty = !stats || stats.totalInterviews === 0;

  return (
    <AppLayout>
      <div className="space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Dashboard{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            to="/practice"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] w-fit"
          >
            <Play className="w-4 h-4" />
            <span>New Mock Interview</span>
          </Link>
        </div>

        {isEmpty ? (
          <EmptyDashboard name={user?.name?.split(' ')[0] || 'there'} />
        ) : (
          <>
            {/* ── Interviews Completed Banner ────────────────────────────── */}
            <div className="p-5 rounded-2xl border border-gold-500/20 bg-gradient-to-r from-gold-500/5 via-amber-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center">
                    <Target className="w-7 h-7 text-gold-500" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-extrabold flex items-center justify-center">
                    {stats.totalInterviews}
                  </span>
                </div>
                <div>
                  <div className="text-white font-bold text-base">
                    {stats.totalInterviews > 0
                      ? `${stats.totalInterviews} ${stats.totalInterviews === 1 ? 'Interview' : 'Interviews'} Completed 🎯`
                      : 'No Interviews Completed Yet'}
                  </div>
                  <div className="text-neutral-400 text-xs mt-0.5">
                    {stats.totalInterviews > 0
                      ? 'Keep practicing to improve your scores.'
                      : 'Complete your first mock interview to start tracking progress.'}
                    {' '}Points: <span className="text-yellow-400 font-semibold">{stats.gamification.points} XP</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {stats.gamification.badges.length > 0 ? (
                  stats.gamification.badges.slice(0, 3).map((badge) => (
                    <span key={badge} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300">
                      {BADGE_CONFIG[badge]?.emoji || '🏅'} {badge}
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-600 text-xs italic">Complete interviews to earn badges</span>
                )}
              </div>
            </div>

            {/* ── Primary Stat Cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Interviews"
                value={stats.totalInterviews}
                subtitle="All-time completed sessions"
                icon={BookOpen}
                color="gold"
              />
              <StatCard
                title="Average Score"
                value={`${stats.avgScore}/100`}
                subtitle="Across all domains"
                icon={TrendingUp}
                color="blue"
              />
              <StatCard
                title="Best Score"
                value={`${stats.bestScore}/100`}
                subtitle="Personal best record"
                icon={Trophy}
                color="purple"
              />
              <StatCard
                title="This Week"
                value={stats.thisWeek}
                subtitle="Interviews this week"
                icon={Calendar}
                color="green"
                trend={stats.thisWeek}
                trendLabel=" sessions"
              />
            </div>

            {/* ── Score Trend + Circular Score Summary ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Trend Chart */}
              <div className="lg:col-span-2 p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Score Trend</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Your last {stats.scoreHistory.length} interview scores over time</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-gold-500" />
                </div>
                <div className="h-52">
                  {stats.scoreHistory.length > 0 ? (
                    <ScoreTrendChart data={stats.scoreHistory} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-neutral-600 text-sm">No score history yet</div>
                  )}
                </div>
              </div>

              {/* Circular Score Summary */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <h2 className="text-base font-bold text-white mb-6">Overall Progress</h2>
                <div className="flex flex-col items-center gap-6">
                  <CircularScore score={stats.avgScore} size={130} label="Average" />
                  <div className="w-full space-y-3">
                    {[
                      { label: 'Technical Knowledge', val: Math.min(stats.avgScore + 5, 100) },
                      { label: 'Communication', val: Math.max(stats.avgScore - 8, 0) },
                      { label: 'Accuracy Rate', val: stats.totalInterviews > 0 ? Math.round((stats.bestScore + stats.avgScore) / 2) : 0 },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-neutral-400 mb-1.5 font-medium">
                          <span>{label}</span>
                          <span className="text-gold-500">{val}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-700"
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Weekly Activity + Domain Distribution ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Activity */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Weekly Activity</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Interview sessions in the last 7 days</p>
                  </div>
                  <Calendar className="w-4 h-4 text-gold-500" />
                </div>
                <div className="h-44">
                  <WeeklyActivityChart data={stats.weeklyActivity} />
                </div>
              </div>

              {/* Domain Distribution */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Domain Distribution</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Practice coverage across topics</p>
                  </div>
                  <Target className="w-4 h-4 text-gold-500" />
                </div>
                <div className="h-44">
                  {Object.keys(stats.domainDistribution).length > 0 ? (
                    <DomainDistributionChart data={stats.domainDistribution} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-neutral-600 text-sm">Practice across domains to see distribution</div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Difficulty Radar + Weak Areas + Recommended Topics ───────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Difficulty Radar */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <h2 className="text-base font-bold text-white mb-6">Difficulty Breakdown</h2>
                <div className="h-52">
                  <DifficultyRadarChart data={stats.difficultyDistribution} />
                </div>
              </div>

              {/* Weak Areas */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-bold text-white">Weak Areas</h2>
                </div>
                {stats.topWeakAreas.length === 0 ? (
                  <p className="text-neutral-600 text-sm italic">Complete more interviews to identify improvement areas</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topWeakAreas.map((area, i) => (
                      <div key={area} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-neutral-300">{area}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Practice Topics */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-4 h-4 text-gold-500 fill-gold-500/20" />
                  <h2 className="text-base font-bold text-white">Recommended Next</h2>
                </div>
                <div className="space-y-3">
                  {['Data Structures', 'SQL Queries', 'System Design', 'React Hooks', 'Java OOP'].map((topic) => (
                    <Link
                      key={topic}
                      to="/practice"
                      className="flex items-center justify-between text-sm text-neutral-300 hover:text-gold-500 transition-colors group"
                    >
                      <span>{topic}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-gold-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Daily Challenge Card ──────────────────────────────────────── */}
            <div className="p-6 rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-transparent">
              {loadingChallenge ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
                </div>
              ) : dailyChallenge ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-gold-500 fill-gold-500/20" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Daily Challenge</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${domainColorMap[dailyChallenge.domain] || 'text-neutral-400 bg-neutral-800 border-neutral-700'}`}>
                          {dailyChallenge.domain}
                        </span>
                        {dailyAttempt && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                            dailyAttempt.score === 1 
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                              : 'text-red-400 bg-red-500/10 border-red-500/20'
                          }`}>
                            {dailyAttempt.score === 1 ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                        {dailyChallenge.question}
                      </p>
                    </div>
                  </div>
                  {dailyAttempt ? (
                    <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Today's Challenge Completed</span>
                    </div>
                  ) : (
                    <Link
                      to="/daily-challenge"
                      className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Attempt</span>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">No daily challenge available.</p>
              )}
            </div>

            {/* ── Achievements Badges Gallery ───────────────────────────────── */}
            <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-4 h-4 text-gold-500" />
                <h2 className="text-base font-bold text-white">Achievements</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(BADGE_CONFIG).map(([badge, config]) => {
                  const earned = stats.gamification.badges.includes(badge);
                  return (
                    <div
                      key={badge}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all
                        ${earned
                          ? 'border-gold-500/30 bg-gold-500/5'
                          : 'border-neutral-900 bg-neutral-900/20 opacity-40 grayscale'
                        }`}
                      title={config.desc}
                    >
                      <span className="text-3xl">{config.emoji}</span>
                      <span className="text-[11px] font-semibold text-neutral-300 leading-tight">{badge}</span>
                      {earned && (
                        <span className="text-[9px] uppercase tracking-wider text-gold-500 font-bold">Earned</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Recent Interviews Table ───────────────────────────────────── */}
            <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-500" />
                  <h2 className="text-base font-bold text-white">Recent Interviews</h2>
                </div>
                <Link to="/history" className="text-xs text-gold-500 hover:text-gold-400 font-semibold flex items-center gap-1 transition-colors">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats.recentInterviews.length === 0 ? (
                <p className="text-neutral-600 text-sm italic">No completed interviews yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-900 text-left">
                        <th className="pb-3 pr-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">Domain</th>
                        <th className="pb-3 pr-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">Type / Company</th>
                        <th className="pb-3 pr-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">Difficulty</th>
                        <th className="pb-3 pr-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">Questions</th>
                        <th className="pb-3 pr-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">Score</th>
                        <th className="pb-3 text-xs uppercase tracking-wider font-semibold text-neutral-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900/60">
                      {stats.recentInterviews.map((iv) => (
                        <tr key={iv._id} className="group hover:bg-neutral-900/20 transition-colors">
                          <td className="py-3.5 pr-4">
                            <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${domainColorMap[iv.domain] || 'text-neutral-400 bg-neutral-800 border-neutral-700'}`}>
                              {iv.domain}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            {iv.type === 'company' && iv.companyName ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-gold-500/30 bg-gold-500/10 text-gold-400">
                                🏢 {iv.companyName}
                              </span>
                            ) : iv.type === 'resume' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/30 bg-blue-500/10 text-blue-400">
                                📄 Resume
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-neutral-800 bg-neutral-900 text-neutral-500">
                                Standard
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColor[iv.difficulty]}`}>
                              {iv.difficulty}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-neutral-400">{iv.totalQuestions}Q</td>
                          <td className="py-3.5 pr-4">
                            <ScoreBadge score={iv.score} />
                          </td>
                          <td className="py-3.5 text-neutral-500 text-xs">
                            {new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
