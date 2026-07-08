import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AppLayout from '../components/common/AppLayout';
import {
  Shield, Users, BookOpen, Award, BarChart3,
  Trash2, UserCheck, AlertTriangle, Search, Loader2,
  Calendar, Award as PointIcon, Target
} from 'lucide-react';

const AdminPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      const result = await api.get('/admin/stats');
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole.toUpperCase()}?`)) return;

    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      await fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`WARNING: Are you sure you want to delete ${userName}? This will permanently remove their user account and all mock interview history records.`)) return;

    setActionLoadingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm">Loading admin dashboard controls...</span>
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
            <p className="font-semibold">Access Denied / Admin Error</p>
            <p className="text-sm mt-1 text-red-400/70">{error}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { stats, users } = data;

  const filteredUsers = searchQuery.trim() === ''
    ? users
    : users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin Management Panel</h1>
            <p className="text-neutral-500 text-sm">Overview platform usage statistics, manage user credentials, and moderate accounts.</p>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Registered Members</span>
              <span className="block text-2xl font-extrabold text-white mt-1">{stats.totalUsers} Users</span>
            </div>
            <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500 border border-gold-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Mock Trials Completed</span>
              <span className="block text-2xl font-extrabold text-white mt-1">{stats.totalInterviews} Sessions</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-900 bg-neutral-950/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Platform Average Score</span>
              <span className="block text-2xl font-extrabold text-white mt-1">{stats.overallAvgScore}%</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain Breakdown */}
          <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60 h-fit space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Domain Popularity</span>
            </h3>
            <div className="space-y-3">
              {Object.keys(stats.domainCounts).length === 0 ? (
                <p className="text-neutral-500 text-xs italic">No domains recorded yet.</p>
              ) : (
                Object.entries(stats.domainCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([domain, count]) => (
                    <div key={domain} className="flex justify-between items-center text-sm">
                      <span className="text-neutral-300 font-medium">{domain}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-semibold">
                        {count} mocks
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* User management list */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-500 flex items-center gap-2">
                <Users className="w-4.5 h-4.5" />
                <span>Manage Users ({filteredUsers.length})</span>
              </h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 w-full sm:w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-neutral-900/60">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-900 bg-neutral-900/20 text-neutral-500 uppercase tracking-wider font-semibold">
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">XP Points</th>
                    <th className="p-3">Mocks</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/40 text-neutral-300">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-neutral-900/10 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-white leading-tight">{u.name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{u.email}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          u.role === 'admin' 
                            ? 'text-gold-500 border-gold-500/20 bg-gold-500/5' 
                            : 'text-neutral-400 border-neutral-800 bg-neutral-900'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-semibold flex items-center gap-1 mt-1.5">
                        <PointIcon className="w-3 h-3 text-yellow-500" />
                        <span>{u.gamification?.points || 0} XP</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-gold-500" />
                          <span>{u.gamification?.completedInterviewsCount || 0}</span>
                        </div>
                      </td>
                      <td className="p-3 text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Toggle Role */}
                          <button
                            onClick={() => handleToggleRole(u._id, u.role)}
                            disabled={actionLoadingId === u._id}
                            className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-gold-500 disabled:opacity-40 transition-colors cursor-pointer border border-neutral-800"
                            title="Toggle Admin Privilege"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={actionLoadingId === u._id}
                            className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 disabled:opacity-40 transition-colors cursor-pointer border border-neutral-800"
                            title="Delete Account permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminPanel;
