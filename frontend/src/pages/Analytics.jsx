import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AppLayout from '../components/common/AppLayout';
import {
  ScoreTrendChart,
  WeeklyActivityChart,
  DomainDistributionChart,
  DifficultyRadarChart,
} from '../components/ui/Charts';
import {
  TrendingUp,
  Target,
  Layers,
  Calendar,
  AlertTriangle,
  Award,
  Zap,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.get('/stats/dashboard');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm">Aggregating performance analytics...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Failed to load analytics dashboard</p>
            <p className="text-sm mt-1 text-red-400/70">{error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isEmpty = !stats || stats.totalInterviews === 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Performance Analytics</h1>
          <p className="text-neutral-500 text-sm">Visualize your career readiness, scores over time, and domain proficiency.</p>
        </div>

        {isEmpty ? (
          <div className="p-12 rounded-2xl border border-neutral-900 bg-neutral-950/40 text-center max-w-lg mx-auto">
            <TrendingUp className="w-12 h-12 text-gold-500/40 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">No Analytics Available</h2>
            <p className="text-neutral-500 text-sm mb-6">Take mock interviews in multiple domains to generate detailed score trends, weekly schedules, and strength breakdowns.</p>
            <Link to="/practice" className="px-6 py-2.5 rounded bg-gold-500 text-black font-semibold text-sm hover:bg-gold-400 transition-colors inline-block">
              Start Mock Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid of Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Avg Score</span>
                  <span className="block text-2xl font-extrabold text-white mt-1">{stats.avgScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500 border border-gold-500/20">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Interviews Completed</span>
                  <span className="block text-2xl font-extrabold text-white mt-1">{stats.totalInterviews}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Target className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Highest Score</span>
                  <span className="block text-2xl font-extrabold text-white mt-1">{stats.bestScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Active Days</span>
                  <span className="block text-2xl font-extrabold text-white mt-1">
                    {stats.gamification?.completedInterviewDates?.length || 0} { (stats.gamification?.completedInterviewDates?.length || 0) === 1 ? 'Day' : 'Days' }
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Core charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Trend */}
              <div className="lg:col-span-2 p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Score Progression Trend</h3>
                  <p className="text-neutral-500 text-xs mt-0.5">Chronological timeline of your overall score performance (recent 10 interviews)</p>
                </div>
                <div className="h-64">
                  <ScoreTrendChart data={stats.scoreHistory} />
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Difficulty Breakdown</h3>
                  <p className="text-neutral-500 text-xs mt-0.5">Mock interviews categorized by complexity</p>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <DifficultyRadarChart data={stats.difficultyDistribution} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Domain Coverage */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Domain Focus Distribution</h3>
                  <p className="text-neutral-500 text-xs mt-0.5">Proportion of practice sessions completed across distinct tech domains</p>
                </div>
                <div className="h-60 flex items-center justify-center">
                  <DomainDistributionChart data={stats.domainDistribution} />
                </div>
              </div>

              {/* Weekly Practice counts */}
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Weekly Practice Frequency</h3>
                  <p className="text-neutral-500 text-xs mt-0.5">Count of mock interview trials taken in the last 7 days</p>
                </div>
                <div className="h-60">
                  <WeeklyActivityChart data={stats.weeklyActivity} />
                </div>
              </div>
            </div>

            {/* Strengths / Weaknesses list cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gold-500 mb-4 flex items-center gap-2">
                  <Award className="w-4.5 h-4.5" />
                  <span>Demonstrated Strengths</span>
                </h3>
                {stats.topWeakAreas && stats.topWeakAreas.length > 0 ? (
                  <div className="space-y-3">
                    {['Concept clarification', 'Code syntax and structure', 'Soft-skills and communication flow'].map((strength, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/30 border border-neutral-900">
                        <span className="w-6 h-6 rounded-full bg-gold-500/10 text-gold-500 text-xs font-bold flex items-center justify-center shrink-0">✓</span>
                        <span className="text-sm text-neutral-300">{strength}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-xs italic">Complete practice mocks to identify strong areas.</p>
                )}
              </div>

              <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>Improvement Opportunities</span>
                </h3>
                {stats.topWeakAreas && stats.topWeakAreas.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topWeakAreas.map((area, i) => (
                      <div key={area} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/30 border border-neutral-900">
                        <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-center shrink-0">✗</span>
                        <span className="text-sm text-neutral-300">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-xs italic">Complete practice mocks to map out weaker subjects.</p>
                )}
              </div>
            </div>

            {/* Quick Practice CTA */}
            <div className="p-6 rounded-2xl border border-gold-500/20 bg-gradient-to-r from-gold-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-bold text-base">Ready to level up your accuracy?</h4>
                <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">Attempt recommended practice mocks to increase your overall analytics score.</p>
              </div>
              <Link to="/practice" className="px-5 py-2.5 rounded bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm tracking-wide text-center shrink-0">
                Configure Practice mock
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;
