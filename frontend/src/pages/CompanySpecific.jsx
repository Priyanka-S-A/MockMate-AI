import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AppLayout from '../components/common/AppLayout';
import {
  Building2, BookOpen, ChevronRight, AlertCircle, Play,
  Clock, Target, Layers, Hash, CheckCircle, Cpu
} from 'lucide-react';

const COMPANIES = [
  { id: 'TCS', name: 'TCS', logoText: 'TCS', desc: 'Technical & MR (Managerial Round) style questions' },
  { id: 'Infosys', name: 'Infosys', logoText: 'INF', desc: 'Focus on coding foundations, OOP, and DBMS' },
  { id: 'Accenture', name: 'Accenture', logoText: 'ACN', desc: 'Logical reasoning, coding and situational judgment' },
  { id: 'Oracle', name: 'Oracle', logoText: 'ORCL', desc: 'SQL deep dive, system design, and algorithmic rigor' },
  { id: 'Cognizant', name: 'Cognizant', logoText: 'CTS', desc: 'Database constraints, Javascript, and HR scenarios' },
  { id: 'Wipro', name: 'Wipro', logoText: 'WIP', desc: 'Elite NLTH style coding and structural Q&A' },
  { id: 'Capgemini', name: 'Capgemini', logoText: 'CAP', desc: 'Pseudocode analysis, cloud concepts, and MR' },
  { id: 'IBM', name: 'IBM', logoText: 'IBM', desc: 'Advanced cloud, data structures, and cognitive ability' },
  { id: 'Deloitte', name: 'Deloitte', logoText: 'DEL', desc: 'Case study problems, tech stack audits, and HR' },
  { id: 'HCL', name: 'HCL', logoText: 'HCL', desc: 'Hardware concepts, embedded logic, and web technology' },
];

const DOMAINS = [
  { id: 'Java', label: 'Java', emoji: '☕' },
  { id: 'Python', label: 'Python', emoji: '🐍' },
  { id: 'SQL', label: 'SQL', emoji: '🗄️' },
  { id: 'Data Structures', label: 'Data Structures', emoji: '🌲' },
  { id: 'Data Analytics', label: 'Data Analytics', emoji: '📊' },
  { id: 'Web Development', label: 'Web Development', emoji: '🌐' },
  { id: 'JavaScript', label: 'JavaScript', emoji: '⚡' },
  { id: 'React', label: 'React', emoji: '⚛️' },
  { id: 'Node.js', label: 'Node.js', emoji: '🟢' },
  { id: 'HR Interview', label: 'HR Interview', emoji: '🤝' },
];

const DIFFICULTIES = [
  { id: 'Beginner', label: 'Beginner', color: 'emerald' },
  { id: 'Intermediate', label: 'Intermediate', color: 'yellow' },
  { id: 'Advanced', label: 'Advanced', color: 'red' },
];

const QUESTION_COUNTS = [3, 5, 7, 10];

const colorVariants = {
  emerald: {
    base: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    selected: 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-500/30',
  },
  yellow: {
    base: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
    selected: 'border-yellow-400 bg-yellow-500/15 ring-1 ring-yellow-500/30',
  },
  red: {
    base: 'border-red-500/30 bg-red-500/5 text-red-400',
    selected: 'border-red-400 bg-red-500/15 ring-1 ring-red-500/30',
  },
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20 mt-0.5">
      <Icon className="w-4 h-4 text-gold-500" />
    </div>
    <div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="text-neutral-500 text-xs mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const CompanySpecific = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimitMins, setTimeLimitMins] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleDomain = (domainId) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  };

  const handleStart = async () => {
    if (!selectedCompany) {
      setError('Please select a target company before starting.');
      return;
    }
    if (selectedDomains.length === 0) {
      setError('Please select at least one domain before starting.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const session = await api.post('/interviews', {
        domain: selectedDomains.join(', '),
        difficulty,
        totalQuestions: questionCount,
        timeLimit: isTimed ? timeLimitMins * 60 : 0,
        type: 'company',
        companyName: selectedCompany,
      });
      navigate(`/interview/${session._id}`, { state: { session } });
    } catch (err) {
      setError(err.message || 'Failed to start company-specific interview.');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Company Specific Mocks</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Practice mock interviews modeled after the recruitment processes, common coding tests, and HR profiles of major tech employers.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Company Selector card */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={Building2}
            title="Select Target Company"
            subtitle="Choose the employer whose interview patterns you want to simulate"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COMPANIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCompany(c.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group overflow-hidden ${
                  selectedCompany === c.id
                    ? 'border-gold-500/50 bg-gold-500/10 ring-1 ring-gold-500/20'
                    : 'border-neutral-900 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] font-extrabold tracking-wider text-neutral-400 flex items-center justify-center">
                    {c.logoText}
                  </span>
                  {selectedCompany === c.id && (
                    <CheckCircle className="w-4 h-4 text-gold-500" />
                  )}
                </div>
                <div className={`text-sm font-semibold ${selectedCompany === c.id ? 'text-gold-400' : 'text-neutral-200'}`}>
                  {c.name}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1 leading-tight">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Domain selection */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={Target}
            title="Select Domain"
            subtitle="Practice target topics (Technical or HR) in the company's stack"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
            {DOMAINS.map((d) => {
              const isSelected = selectedDomains.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDomain(d.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'border-gold-500/50 bg-gold-500/10 ring-1 ring-gold-500/20'
                      : 'border-neutral-900 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/60'
                  }`}
                >
                  <span className="text-lg">{d.emoji}</span>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-gold-400' : 'text-neutral-300'}`}>
                    {d.label}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-3 h-3 text-gold-500 ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty selection */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={Layers}
            title="Difficulty Level"
            subtitle="Adjust interview challenge depth"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => {
              const cv = colorVariants[d.color];
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected ? cv.selected : `border-neutral-900 bg-neutral-900/30 text-neutral-400 hover:border-neutral-700`
                  }`}
                >
                  <div className={`text-sm font-bold mb-0.5 ${isSelected ? cv.base.split(' ')[2] : 'text-neutral-200'}`}>
                    {d.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={Hash}
            title="Number of Questions"
            subtitle="Select the total Q&A count for this mock session"
          />
          <div className="flex flex-wrap gap-3">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`w-16 h-14 rounded-xl border text-lg font-extrabold transition-all cursor-pointer ${
                  questionCount === n
                    ? 'border-gold-500/50 bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20'
                    : 'border-neutral-900 bg-neutral-900/30 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Timed Mode */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={Clock}
            title="Timer Settings"
            subtitle="Simulate real-time corporate test deadlines"
          />
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {[
              { label: 'Untimed', val: false, desc: 'Practice at your own pace' },
              { label: 'Timed', val: true, desc: 'Add test duration countdown' },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setIsTimed(opt.val)}
                className={`flex-1 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isTimed === opt.val
                    ? 'border-gold-500/50 bg-gold-500/10 ring-1 ring-gold-500/20'
                    : 'border-neutral-900 bg-neutral-900/30 hover:border-neutral-700'
                }`}
              >
                <div className={`font-bold mb-0.5 ${isTimed === opt.val ? 'text-gold-400' : 'text-neutral-200'}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-neutral-500">{opt.desc}</div>
              </button>
            ))}
          </div>

          {isTimed && (
            <div className="mt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Total Time Limit
              </label>
              <div className="flex flex-wrap gap-2">
                {[10, 15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setTimeLimitMins(mins)}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                      timeLimitMins === mins
                        ? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
                        : 'border-neutral-800 bg-neutral-900/30 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit action */}
        <div className="p-6 rounded-2xl border border-gold-500/20 bg-gold-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-500 mb-1">Company Mock Template</h3>
              <p className="text-neutral-400 text-xs max-w-md leading-relaxed">
                Start a session focusing on common recruitment styles at <strong className="text-white">{selectedCompany || 'Not selected'}</strong>.
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={loading || !selectedCompany || selectedDomains.length === 0}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-base tracking-wide transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <Cpu className="w-5 h-5 animate-pulse" />
                  <span>Configuring AI...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Test</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanySpecific;
