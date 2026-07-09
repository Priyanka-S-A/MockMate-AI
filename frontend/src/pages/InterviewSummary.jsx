import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import AppLayout from '../components/common/AppLayout';
import CircularScore from '../components/ui/CircularScore';
import { Trophy, CheckCircle, Target, Map, BarChart3, RotateCcw, Download, Loader2 } from 'lucide-react';
import { api, API_URL } from '../services/api';

const InterviewSummary = () => {
  const { state } = useLocation();
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  const summary = state?.summary;
  const [downloading, setDownloading] = useState(false);

  // Fallback state initialization if summary isn't passed (e.g. on direct page access)
  const [localSummary, setLocalSummary] = useState(summary || null);
  const [loadingSummary, setLoadingSummary] = useState(!summary);

  useEffect(() => {
    if (!summary && interviewId) {
      api.get(`/interviews/${interviewId}`)
        .then(data => {
          setLocalSummary(data);
          setLoadingSummary(false);
        })
        .catch(() => {
          setLoadingSummary(false);
        });
    }
  }, [summary, interviewId]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
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
      link.setAttribute('download', `Interview_Report_${localSummary?.domain || 'Mock'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      const displayMsg = err.message === 'Failed to fetch'
        ? 'Unable to connect to the server. Please check your internet connection or verify the server is running.'
        : err.message;
      alert('Failed to download PDF report: ' + displayMsg);
    } finally {
      setDownloading(false);
    }
  };

  const finalSummary = localSummary;

  if (loadingSummary) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            <span className="text-neutral-500 text-sm">Loading summary report...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!finalSummary) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-neutral-500">No summary data found.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-gold-500 hover:text-gold-400">
            Return to Dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  const scoreColor =
    finalSummary.scores?.overall >= 80 ? '#10b981' :
    finalSummary.scores?.overall >= 60 ? '#eab308' : '#ef4444';

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Interview Complete!</h1>
          <p className="text-neutral-500 text-sm">
            You answered {finalSummary.answeredCount ?? finalSummary.questions?.filter(q => q.status === 'answered').length ?? 0} of {finalSummary.totalQuestions} questions · Earned{' '}
            <span className="text-gold-500 font-semibold">{finalSummary.pointsEarned ?? (finalSummary.questions?.filter(q => q.status === 'answered').length * 10) ?? 0} XP</span>
          </p>
        </div>

        {/* Score cards */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <h2 className="text-base font-bold text-white mb-6 text-center">Performance Scores</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <CircularScore score={finalSummary.scores?.overall ?? 0} label="Overall" color={scoreColor} />
            <CircularScore score={finalSummary.scores?.technicalKnowledge ?? 0} label="Technical" color="#8b5cf6" />
            <CircularScore score={finalSummary.scores?.communicationScore ?? 0} label="Communication" color="#3b82f6" />
            <CircularScore score={finalSummary.scores?.accuracy ?? 0} label="Accuracy %" color="#06b6d4" />
          </div>
        </div>

        {/* Strong/Weak areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-3">
              <CheckCircle className="w-3.5 h-3.5" /> Strong Areas
            </div>
            {finalSummary.summary?.strongAreas?.length > 0 ? (
              <ul className="space-y-1.5">
                {finalSummary.summary.strongAreas.map((a, i) => (
                  <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>{a}
                  </li>
                ))}
              </ul>
            ) : <p className="text-neutral-500 text-sm italic">Keep practicing to discover strengths.</p>}
          </div>
          <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-xs uppercase tracking-wider mb-3">
              <Target className="w-3.5 h-3.5" /> Weak Areas
            </div>
            {finalSummary.summary?.weakAreas?.length > 0 ? (
              <ul className="space-y-1.5">
                {finalSummary.summary.weakAreas.map((a, i) => (
                  <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>{a}
                  </li>
                ))}
              </ul>
            ) : <p className="text-neutral-500 text-sm italic">No critical weak areas detected.</p>}
          </div>
        </div>

        {/* Learning Roadmap */}
        {finalSummary.summary?.learningRoadmap && (
          <div className="p-5 rounded-2xl border border-gold-500/20 bg-gold-500/5">
            <div className="flex items-center gap-2 text-gold-500 font-semibold text-xs uppercase tracking-wider mb-3">
              <Map className="w-3.5 h-3.5" /> Learning Roadmap
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">{finalSummary.summary.learningRoadmap}</p>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400 font-bold text-sm tracking-wide transition-all cursor-pointer hover:bg-gold-500 hover:text-black disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloading ? 'Downloading...' : 'Download PDF Report'}</span>
          </button>
          
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm tracking-wide transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </button>
          
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900 text-neutral-200 font-semibold text-sm transition-all cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Analytics</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900 text-neutral-200 font-semibold text-sm transition-all cursor-pointer"
          >
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default InterviewSummary;
