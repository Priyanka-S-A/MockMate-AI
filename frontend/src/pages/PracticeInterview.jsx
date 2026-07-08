import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AppLayout from '../components/common/AppLayout';
import {
  BookOpen, ChevronRight, AlertCircle, Play,
  Clock, Target, Layers, Hash,
  CheckCircle, Cpu
} from 'lucide-react';

const DOMAINS = [
  { id: 'Java', label: 'Java', emoji: '☕', desc: 'OOP, Collections, Spring, JVM' },
  { id: 'Python', label: 'Python', emoji: '🐍', desc: 'Syntax, Django, Data Science libs' },
  { id: 'SQL', label: 'SQL', emoji: '🗄️', desc: 'Queries, Joins, Indexing, Optimization' },
  { id: 'Data Structures', label: 'Data Structures', emoji: '🌲', desc: 'Arrays, Trees, Graphs, Sorting' },
  { id: 'Data Analytics', label: 'Data Analytics', emoji: '📊', desc: 'Pandas, Visualization, Statistics' },
  { id: 'Web Development', label: 'Web Development', emoji: '🌐', desc: 'HTML, CSS, REST, Responsive Design' },
  { id: 'JavaScript', label: 'JavaScript', emoji: '⚡', desc: 'ES6+, Async, Closures, DOM' },
  { id: 'React', label: 'React', emoji: '⚛️', desc: 'Hooks, State, Context, Performance' },
  { id: 'Node.js', label: 'Node.js', emoji: '🟢', desc: 'Express, Middleware, Streams, APIs' },
  { id: 'HR Interview', label: 'HR Interview', emoji: '🤝', desc: 'Behavioural, Situational, Soft Skills' },
];

const DIFFICULTIES = [
  { id: 'Beginner', label: 'Beginner', color: 'emerald', desc: 'Foundational concepts and definitions' },
  { id: 'Intermediate', label: 'Intermediate', color: 'yellow', desc: 'Applied knowledge and scenario questions' },
  { id: 'Advanced', label: 'Advanced', color: 'red', desc: 'Deep-dive, system design, edge cases' },
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

const PracticeInterview = () => {
  const navigate = useNavigate();
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
        type: 'standard',
      });
      navigate(`/interview/${session._id}`, { state: { session } });
    } catch (err) {
      setError(err.message || 'Failed to start interview. Check your API configuration.');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Configure Mock Interview</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Choose your domain, difficulty, and preferences — then let MockMate AI generate your personalized questions.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Domain selection */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={BookOpen}
            title="Select Domain"
            subtitle="Choose the technology or topic area you want to practice"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {DOMAINS.map((d) => {
              const isSelected = selectedDomains.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDomain(d.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-gold-500/50 bg-gold-500/10 ring-1 ring-gold-500/20'
                      : 'border-neutral-900 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{d.emoji}</span>
                    {isSelected && (
                      <CheckCircle className="w-3.5 h-3.5 text-gold-500 ml-auto shrink-0" />
                    )}
                  </div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-gold-400' : 'text-neutral-200'}`}>
                    {d.label}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{d.desc}</div>
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
            subtitle="Set the complexity of questions AI will generate"
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
                  <div className={`text-base font-bold mb-1 ${isSelected ? cv.base.split(' ')[2] : 'text-neutral-200'}`}>
                    {d.label}
                  </div>
                  <div className="text-xs text-neutral-500 leading-relaxed">{d.desc}</div>
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
            subtitle="How many AI-generated questions should this session include?"
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
          <p className="text-neutral-600 text-xs mt-3">
            Selected: <span className="text-gold-500 font-semibold">{questionCount} questions</span>
          </p>
        </div>

        {/* Timed Mode */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={Clock}
            title="Timer Settings"
            subtitle="Practice with or without a countdown to simulate real interview conditions"
          />
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {[
              { label: 'Untimed', val: false, desc: 'Take as long as you need' },
              { label: 'Timed', val: true, desc: 'Set a countdown clock' },
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

        {/* Summary & Start */}
        <div className="p-6 rounded-2xl border border-gold-500/20 bg-gold-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Session summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-500 mb-3">Session Summary</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Target className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Domain: <strong className={selectedDomains.length > 0 ? 'text-white' : 'text-neutral-600'}>
                    {selectedDomains.length > 0 ? selectedDomains.join(', ') : 'Not selected'}
                  </strong></span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Layers className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Difficulty: <strong className="text-white">{difficulty}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Hash className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Questions: <strong className="text-white">{questionCount}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Timer: <strong className="text-white">
                    {isTimed ? `${timeLimitMins} minutes` : 'Untimed'}
                  </strong></span>
                </div>
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={loading || selectedDomains.length === 0}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-base tracking-wide transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <Cpu className="w-5 h-5 animate-pulse" />
                  <span>Generating Question...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Interview</span>
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

export default PracticeInterview;
