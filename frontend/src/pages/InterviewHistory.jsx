import React, { useState, useEffect } from 'react';
import { api, API_URL } from '../services/api';
import AppLayout from '../components/common/AppLayout';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

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
  Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const DOMAINS = [
  'Java', 'Python', 'SQL', 'Data Structures', 'Data Analytics',
  'Web Development', 'JavaScript', 'React', 'Node.js', 'HR Interview'
];

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  const [selectedDomain, setSelectedDomain] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let endpoint = `/interviews?page=${page}&limit=8`;
      if (selectedDomain) {
        endpoint += `&domain=${selectedDomain}`;
      }
      const data = await api.get(endpoint);
      setInterviews(data.interviews);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err.message || 'Failed to load interview logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, selectedDomain]);

  const handleDownloadPDF = async (interviewId, domainName) => {
    setDownloadingId(interviewId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/interviews/${interviewId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        let errorMsg = 'Failed to generate PDF report. Please try again.';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            if (errorJson && errorJson.message) {
              errorMsg = errorJson.message;
            }
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Interview_Report_${domainName}_${interviewId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      const displayMsg = err.message === 'Failed to fetch'
        ? 'Unable to connect to the server. Please check your internet connection or verify the server is running.'
        : err.message;
      alert('Failed to download PDF report: ' + displayMsg);
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter client-side on searchQuery as well (also matches company name)
  const filteredInterviews = searchQuery.trim() === ''
    ? interviews
    : interviews.filter(iv =>
        iv.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        iv.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (iv.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (iv.type || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interview History Logs</h1>
          <p className="text-neutral-500 text-sm">Browse your completed sessions, read detailed feedback cards, and export PDF summaries.</p>
        </div>

        {/* Filter controls */}
        <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/60 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by topic or level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40"
            />
          </div>

          {/* Domain Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-neutral-500" />
            <select
              value={selectedDomain}
              onChange={(e) => { setSelectedDomain(e.target.value); setPage(1); }}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-8 text-sm text-neutral-300 focus:outline-none focus:border-gold-500/40 appearance-none cursor-pointer"
            >
              <option value="">All Domains</option>
              {DOMAINS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Failed to load history</p>
              <p className="text-sm mt-1 text-red-400/70">{error}</p>
            </div>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="p-12 rounded-xl border border-neutral-900 bg-neutral-950/40 text-center">
            <History className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 font-semibold text-sm">No completed mock interviews found.</p>
            <p className="text-neutral-600 text-xs mt-1">Configure and complete mock sessions to build your logs archive.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table layout */}
            <div className="rounded-xl border border-neutral-900 bg-neutral-950/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-900 bg-neutral-900/10 text-left text-neutral-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Domain</th>
                      <th className="p-4 font-semibold">Type / Company</th>
                      <th className="p-4 font-semibold">Difficulty</th>
                      <th className="p-4 font-semibold">Score</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/60 text-neutral-300">
                    {filteredInterviews.map((iv) => {
                      const scoreVal = iv.scores?.overall ?? 0;
                      const scoreColor = scoreVal >= 80 ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                                         scoreVal >= 60 ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' :
                                         'text-red-400 border-red-500/20 bg-red-500/5';
                      return (
                        <tr key={iv._id} className="hover:bg-neutral-900/10 transition-colors">
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2.5 py-1 rounded text-xs font-semibold border w-fit ${domainColorMap[iv.domain] || 'text-neutral-400 bg-neutral-800'}`}>
                                {iv.domain}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-bold border w-fit ${scoreColor}`}>
                                {scoreVal}/100
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            {iv.type === 'company' && iv.companyName ? (
                              <span className="px-2.5 py-1 rounded text-xs font-bold border border-gold-500/30 bg-gold-500/10 text-gold-400">
                                🏢 {iv.companyName}
                              </span>
                            ) : iv.type === 'resume' ? (
                              <span className="px-2.5 py-1 rounded text-xs font-bold border border-blue-500/30 bg-blue-500/10 text-blue-400">
                                📄 Resume
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded text-xs font-bold border border-neutral-800 bg-neutral-900 text-neutral-500">
                                Standard
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${difficultyColor[iv.difficulty] || 'text-neutral-400'}`}>
                              {iv.difficulty}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-neutral-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* View Report */}
                              <Link
                                to={`/interview/${iv._id}/summary`}
                                className="p-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:text-gold-500 transition-all text-neutral-400 cursor-pointer"
                                title="View Feedback Summary"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>

                              {/* Download PDF */}
                              <button
                                onClick={() => handleDownloadPDF(iv._id, iv.domain)}
                                disabled={downloadingId === iv._id}
                                className="p-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:text-gold-500 transition-all text-neutral-400 disabled:opacity-40 cursor-pointer"
                                title="Download PDF Report"
                              >
                                {downloadingId === iv._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-neutral-500">
                  Showing page {page} of {pages} ({total} total reports)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    className="p-2 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default InterviewHistory;
