import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Shield, Users, BookOpen, Settings, Home, Target, Calendar, Award,
  Zap, AlertTriangle, Search, Trash2, UserCheck, UserX, RefreshCw,
  Eye, CheckCircle, XCircle, Building2, FileText, Cpu, Clock, Star,
  Globe, Menu, LogOut, Activity, UserPlus, ToggleLeft, ToggleRight, Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Tooltip, Legend, Filler
);

// ─── Chart theme defaults ────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const CHART_COLORS = [GOLD, '#60a5fa', '#a78bfa', '#34d399', '#f87171', '#fb923c', '#facc15', '#818cf8'];

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10,10,10,0.9)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      titleColor: '#f5f5f5',
      bodyColor: '#a3a3a3',
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#737373', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#737373', font: { size: 10 } } },
  },
};

// ─── Reusable small components ───────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub, color = 'gold' }) => {
  const cMap = {
    gold: 'text-gold-500 bg-gold-500/10 border-gold-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return (
    <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-xl border shrink-0 ${cMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 mt-0.5 shrink-0">
      <Icon className="w-4.5 h-4.5" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, children, height = 'h-52' }) => (
  <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60">
    <div className="mb-4">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className={height}>{children}</div>
  </div>
);

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
    <div className="bg-neutral-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <Trash2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-bold">{title}</h3>
          <p className="text-xs text-neutral-500">This action cannot be undone</p>
        </div>
      </div>
      <p className="text-sm text-neutral-300">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-semibold transition-all cursor-pointer">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all cursor-pointer">Delete Permanently</button>
      </div>
    </div>
  </div>
);

// ─── DASHBOARD SECTION ───────────────────────────────────────────────────────
const DashboardSection = ({ data, loading }) => {
  if (loading) return <Spinner />;
  if (!data) return <p className="text-neutral-500 text-sm">Failed to load data. Try refreshing.</p>;

  const { stats, charts, systemAnalytics } = data;

  // Build chart datasets
  const lineLabels = (charts?.registrations || []).map(d => d.date.slice(5));

  const registrationsData = {
    labels: lineLabels,
    datasets: [{ label: 'Registrations', data: (charts?.registrations || []).map(d => d.count), borderColor: GOLD, backgroundColor: 'rgba(212,175,55,0.08)', fill: true, tension: 0.4, pointRadius: 3 }],
  };

  const interviewsData = {
    labels: lineLabels,
    datasets: [{ label: 'Interviews', data: (charts?.interviews || []).map(d => d.count), backgroundColor: 'rgba(212,175,55,0.5)', borderColor: GOLD, borderWidth: 1, borderRadius: 4 }],
  };

  const scoreTrendData = {
    labels: lineLabels,
    datasets: [{ label: 'Avg Score', data: (charts?.scoreTrend || []).map(d => d.score), borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.08)', fill: true, tension: 0.4, pointRadius: 3 }],
  };

  const domainLabels = Object.keys(charts?.domainCounts || {}).slice(0, 8);
  const domainValues = domainLabels.map(k => charts.domainCounts[k]);
  const domainData = {
    labels: domainLabels,
    datasets: [{ data: domainValues, backgroundColor: CHART_COLORS.slice(0, domainLabels.length).map(c => c + 'aa'), borderColor: CHART_COLORS.slice(0, domainLabels.length), borderWidth: 1.5 }],
  };

  const diffLabels = ['Beginner', 'Intermediate', 'Advanced'];
  const diffValues = diffLabels.map(k => charts?.difficultyCounts?.[k] || 0);
  const diffData = {
    labels: diffLabels,
    datasets: [{ data: diffValues, backgroundColor: [CHART_COLORS[3] + 'aa', CHART_COLORS[1] + 'aa', CHART_COLORS[0] + 'aa'], borderColor: [CHART_COLORS[3], CHART_COLORS[1], CHART_COLORS[0]], borderWidth: 1.5 }],
  };

  const companyLabels = Object.keys(charts?.companyCounts || {}).slice(0, 8);
  const companyValues = companyLabels.map(k => charts.companyCounts[k]);
  const companyData = {
    labels: companyLabels,
    datasets: [{ label: 'Interviews', data: companyValues, backgroundColor: CHART_COLORS[2] + '88', borderColor: CHART_COLORS[2], borderWidth: 1, borderRadius: 4 }],
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#a3a3a3', font: { size: 10 }, boxWidth: 10, padding: 10 } },
      tooltip: baseOpts.plugins.tooltip,
    },
  };

  const scoreTrendOpts = { ...baseOpts, scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, min: 0, max: 100 } } };

  return (
    <div className="space-y-8">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} sub="Registered accounts" color="gold" />
        <StatCard icon={Activity} label="Active Users" value={stats?.activeUsers ?? 0} sub="Completed ≥1 interview" color="green" />
        <StatCard icon={BookOpen} label="Total Interviews" value={stats?.totalInterviews ?? 0} sub="Platform-wide completed" color="blue" />
        <StatCard icon={Target} label="Today" value={stats?.interviewsToday ?? 0} sub="Since midnight" color="purple" />
        <StatCard icon={Calendar} label="This Week" value={stats?.interviewsThisWeek ?? 0} sub="Current calendar week" color="amber" />
        <StatCard icon={Star} label="Avg Score" value={`${stats?.overallAvgScore ?? 0}%`} sub="Platform average" color="gold" />
        <StatCard icon={FileText} label="Resume Sessions" value={stats?.resumeInterviews ?? 0} sub="CV-based interviews" color="blue" />
        <StatCard icon={Building2} label="Company Sessions" value={stats?.companyInterviews ?? 0} sub="Company-specific" color="purple" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Registrations" subtitle="New user sign-ups — last 14 days">
          <Line data={registrationsData} options={baseOpts} />
        </ChartCard>
        <ChartCard title="Daily Interviews Completed" subtitle="Completed mock sessions — last 14 days">
          <Bar data={interviewsData} options={baseOpts} />
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Domain Popularity" subtitle="Most practiced topics" height="h-56">
          <Doughnut data={domainData} options={doughnutOpts} />
        </ChartCard>
        <ChartCard title="Difficulty Split" subtitle="Beginner / Intermediate / Advanced" height="h-56">
          <Doughnut data={diffData} options={doughnutOpts} />
        </ChartCard>
        <ChartCard title="Avg Score Trend" subtitle="Platform average — last 14 days">
          <Line data={scoreTrendData} options={scoreTrendOpts} />
        </ChartCard>
      </div>

      {/* Charts row 3 — company */}
      {companyLabels.length > 0 && (
        <ChartCard title="Company-wise Interviews" subtitle="Most selected companies for mock preparation">
          <Bar data={companyData} options={baseOpts} />
        </ChartCard>
      )}

      {/* System Analytics */}
      <div>
        <SectionTitle icon={Cpu} title="System Analytics" subtitle="Platform-wide computed metrics" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'AI Requests', value: systemAnalytics?.totalAIRequests ?? 0, icon: Cpu, color: 'gold' },
            { label: 'Avg Duration', value: systemAnalytics?.avgInterviewDuration ?? '0m 0s', icon: Clock, color: 'blue' },
            { label: 'Total XP Awarded', value: `${systemAnalytics?.totalXPAwarded ?? 0}`, icon: Zap, color: 'amber' },
            { label: 'Top Domain', value: systemAnalytics?.mostPracticedDomain ?? 'N/A', icon: BookOpen, color: 'purple' },
            { label: 'Top Company', value: systemAnalytics?.mostSelectedCompany ?? 'N/A', icon: Building2, color: 'green' },
            { label: 'Est. PDF Reports', value: systemAnalytics?.totalPDFDownloads ?? 0, icon: Download, color: 'red' },
          ].map(({ label, value, icon: Icon, color }) => (
            <StatCard key={label} icon={Icon} label={label} value={value} color={color} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── USERS SECTION ───────────────────────────────────────────────────────────
const UsersSection = ({ onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await api.get('/admin/users')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (u) => {
    setActionId(u._id);
    try {
      await api.put(`/admin/users/${u._id}/status`, { status: u.status === 'active' ? 'suspended' : 'active' });
      await load(); onRefresh?.();
    } catch (e) { alert(e.message); }
    finally { setActionId(null); }
  };

  const doDelete = async (userId) => {
    setActionId(userId); setConfirmDelete(null);
    try { await api.delete(`/admin/users/${userId}`); await load(); onRefresh?.(); }
    catch (e) { alert(e.message); }
    finally { setActionId(null); }
  };

  const filtered = users.filter(u => !search.trim() ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <SectionTitle icon={Users} title="User Management" subtitle={`${users.length} registered accounts`} />

      {confirmDelete && (
        <ConfirmDialog
          title="Delete User Account"
          message={<>Delete <span className="text-white font-semibold">{confirmDelete.name}</span>? This permanently removes the account and all their interview history.</>}
          onConfirm={() => doDelete(confirmDelete._id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40" />
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-semibold transition-all border border-neutral-700 cursor-pointer">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-xs text-left min-w-[900px]">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50 text-neutral-500 uppercase tracking-wider font-semibold">
              <th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Status</th>
              <th className="p-3">Joined</th><th className="p-3">Last Active</th>
              <th className="p-3">Interviews</th><th className="p-3">Avg Score</th><th className="p-3">XP</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {filtered.map(u => (
              <tr key={u._id} className={`hover:bg-neutral-900/30 transition-colors ${u.status === 'suspended' ? 'opacity-60' : ''}`}>
                <td className="p-3"><p className="font-bold text-white">{u.name}</p><p className="text-[10px] text-neutral-500">{u.email}</p></td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${u.role === 'admin' ? 'text-gold-500 border-gold-500/20 bg-gold-500/5' : 'text-neutral-400 border-neutral-800 bg-neutral-900'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${u.status === 'active' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>
                    {u.status === 'active' ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    {u.status === 'active' ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-3 text-neutral-400">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="p-3 text-neutral-400">{u.lastActiveDate ? new Date(u.lastActiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                <td className="p-3 text-white font-semibold">{u.totalInterviews}</td>
                <td className="p-3 text-white font-semibold">{u.avgScore > 0 ? `${u.avgScore}%` : '—'}</td>
                <td className="p-3 text-yellow-400 font-semibold">{u.points}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button onClick={() => toggleStatus(u)} disabled={actionId === u._id} title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                      className={`p-1.5 rounded border transition-colors cursor-pointer disabled:opacity-40 ${u.status === 'active' ? 'bg-neutral-900 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border-neutral-800 hover:border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                      {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setConfirmDelete(u)} disabled={actionId === u._id} title="Delete User"
                      className="p-1.5 rounded border bg-neutral-900 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border-neutral-800 hover:border-red-500/30 transition-colors cursor-pointer disabled:opacity-40">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-neutral-600 italic">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── INTERVIEWS SECTION ──────────────────────────────────────────────────────
const InterviewsSection = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [actionId, setActionId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setInterviews(await api.get('/admin/interviews')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const doDelete = async (id) => {
    setActionId(id); setConfirmDelete(null);
    try { await api.delete(`/admin/interviews/${id}`); await load(); }
    catch (e) { alert(e.message); }
    finally { setActionId(null); }
  };

  const filtered = interviews.filter(iv => {
    const s = search.toLowerCase();
    const matchSearch = !search.trim() || iv.userId?.name?.toLowerCase().includes(s) || iv.userId?.email?.toLowerCase().includes(s) || iv.domain?.toLowerCase().includes(s) || iv.companyName?.toLowerCase().includes(s);
    const matchType = filterType === 'all' || (filterType === 'resume' && iv.type === 'resume') || (filterType === 'company' && iv.type === 'company') || (filterType === 'practice' && iv.type === 'standard');
    return matchSearch && matchType;
  });

  const typeLabel = { standard: 'Practice', resume: 'Resume', company: 'Company' };
  const typeColor = { standard: 'text-blue-400 bg-blue-500/5 border-blue-500/20', resume: 'text-purple-400 bg-purple-500/5 border-purple-500/20', company: 'text-gold-500 bg-gold-500/5 border-gold-500/20' };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <SectionTitle icon={BookOpen} title="Interview Management" subtitle={`${interviews.length} total sessions`} />

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Interview Session"
          message={<>Permanently remove this interview session by <span className="text-white font-semibold">{confirmDelete.userId?.name || 'Unknown'}</span>?</>}
          onConfirm={() => doDelete(confirmDelete._id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input type="text" placeholder="Search by user, domain, company..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-gold-500/40">
          <option value="all">All Types</option>
          <option value="practice">Practice</option>
          <option value="resume">Resume</option>
          <option value="company">Company</option>
        </select>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-semibold transition-all border border-neutral-700 cursor-pointer">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="w-full text-xs text-left min-w-[900px]">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50 text-neutral-500 uppercase tracking-wider font-semibold">
              <th className="p-3">User</th><th className="p-3">Type</th><th className="p-3">Domain</th>
              <th className="p-3">Company</th><th className="p-3">Difficulty</th><th className="p-3">Score</th>
              <th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {filtered.map(iv => (
              <tr key={iv._id} className="hover:bg-neutral-900/30 transition-colors">
                <td className="p-3"><p className="font-bold text-white">{iv.userId?.name || 'Deleted User'}</p><p className="text-[10px] text-neutral-500">{iv.userId?.email || ''}</p></td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeColor[iv.type || 'standard']}`}>{typeLabel[iv.type || 'standard']}</span></td>
                <td className="p-3 text-neutral-300 max-w-[120px] truncate">{iv.domain || '—'}</td>
                <td className="p-3 text-neutral-300">{iv.companyName || '—'}</td>
                <td className="p-3 text-neutral-300">{iv.difficulty || '—'}</td>
                <td className="p-3 text-white font-semibold">{iv.status === 'completed' ? `${iv.scores?.overall ?? 0}%` : '—'}</td>
                <td className="p-3">
                  <span className={`font-semibold ${iv.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {iv.status ? iv.status.charAt(0).toUpperCase() + iv.status.slice(1) : '—'}
                  </span>
                </td>
                <td className="p-3 text-neutral-400">{new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button onClick={() => window.open(`/interview/${iv._id}/summary`, '_blank')} title="View Summary"
                      className="p-1.5 rounded border bg-neutral-900 hover:bg-blue-500/10 text-neutral-400 hover:text-blue-400 border-neutral-800 hover:border-blue-500/30 transition-colors cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDelete(iv)} disabled={actionId === iv._id} title="Delete Session"
                      className="p-1.5 rounded border bg-neutral-900 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border-neutral-800 hover:border-red-500/30 transition-colors cursor-pointer disabled:opacity-40">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-neutral-600 italic">No interviews found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── SETTINGS SECTION ────────────────────────────────────────────────────────
const SettingsSection = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(d => { setSettings(d); setLoading(false); }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', { platformName: settings.platformName, logoUrl: settings.logoUrl, registrationsEnabled: settings.registrationsEnabled, maintenanceMode: settings.maintenanceMode });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert(e.message || 'Failed to save settings.'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ label, sublabel, value, onChange }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
      <div><p className="text-sm font-semibold text-white">{label}</p><p className="text-xs text-neutral-500 mt-0.5">{sublabel}</p></div>
      <button onClick={() => onChange(!value)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${value ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
        {value ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
        {value ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <SectionTitle icon={Settings} title="Platform Settings" subtitle="Configure MockMate AI platform behaviour" />
      {saved && <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"><CheckCircle className="w-4 h-4" /> Settings saved successfully.</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Branding</h3>
          <div>
            <label className="block text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-2">Platform Name</label>
            <input type="text" value={settings?.platformName || ''} onChange={e => setSettings(s => ({ ...s, platformName: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40"
              placeholder="MockMate AI" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-2">Logo URL</label>
            <input type="text" value={settings?.logoUrl || ''} onChange={e => setSettings(s => ({ ...s, logoUrl: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40"
              placeholder="https://example.com/logo.png" />
            {settings?.logoUrl && <img src={settings.logoUrl} alt="Logo Preview" className="h-10 mt-2 rounded border border-neutral-700 object-contain" onError={e => { e.target.style.display = 'none'; }} />}
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platform Controls</h3>
          <Toggle label="User Registrations" sublabel="Allow new users to create accounts" value={settings?.registrationsEnabled ?? true} onChange={v => setSettings(s => ({ ...s, registrationsEnabled: v }))} />
          <Toggle label="Maintenance Mode" sublabel="Block all non-admin users from accessing the platform" value={settings?.maintenanceMode ?? false} onChange={v => setSettings(s => ({ ...s, maintenanceMode: v }))} />
          {settings?.maintenanceMode && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Maintenance mode is <strong>active</strong>. Non-admin users will see a service unavailable message.</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 cursor-pointer">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN ADMIN PORTAL ───────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'interviews', label: 'Interviews', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDash = useCallback(async () => {
    setDashLoading(true);
    try { setDashData(await api.get('/admin/stats')); }
    catch (e) { console.error(e); }
    finally { setDashLoading(false); }
  }, []);

  useEffect(() => { loadDash(); }, [loadDash, refreshKey]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold-500" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-tight">MockMate AI</p>
              <p className="text-[10px] text-gold-500 font-semibold uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActive(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${active === id ? 'bg-gold-500/10 border border-gold-500/20 text-gold-500' : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent'}`}>
              <Icon className="w-4.5 h-4.5" /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-all cursor-pointer">
              <Globe className="w-3 h-3" /> User View
            </button>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all cursor-pointer">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur border-b border-neutral-800 flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-white">{SECTIONS.find(s => s.id === active)?.label}</h1>
              <p className="text-xs text-neutral-500 hidden sm:block">MockMate AI — Admin Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {active === 'dashboard' && (
              <button onClick={loadDash}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-all cursor-pointer">
                <RefreshCw className={`w-3.5 h-3.5 ${dashLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            )}
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-500/20 bg-gold-500/5 text-gold-500 text-xs font-bold">
              <Shield className="w-3 h-3" /> Admin
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {active === 'dashboard' && <DashboardSection data={dashData} loading={dashLoading} />}
          {active === 'users' && <UsersSection onRefresh={() => setRefreshKey(k => k + 1)} />}
          {active === 'interviews' && <InterviewsSection />}
          {active === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
};

export default AdminPortal;
