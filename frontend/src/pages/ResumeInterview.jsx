import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AppLayout from '../components/common/AppLayout';
import {
  Upload, FileText, ChevronRight, AlertCircle, Play,
  Clock, Target, Layers, Hash, CheckCircle, Cpu, Trash
} from 'lucide-react';

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

const ResumeInterview = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimitMins, setTimeLimitMins] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are supported for resume upload.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleStart = async () => {
    if (!file) {
      setError('Please upload your PDF resume before starting.');
      return;
    }
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('difficulty', difficulty);
    formData.append('totalQuestions', questionCount);
    formData.append('timeLimit', isTimed ? timeLimitMins * 60 : 0);

    try {
      const session = await api.upload('/interviews/resume', formData);
      navigate(`/interview/${session._id}`, { state: { session } });
    } catch (err) {
      setError(err.message || 'Failed to parse resume or start interview. Check backend logs.');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Resume-Tailored Interview</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Upload your professional resume. AI-powered evaluation will analyze your projects and experience to generate matching questions.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resume Uploader card */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={Upload}
            title="Upload Resume"
            subtitle="Drag & drop or browse your resume in PDF format (Max 5MB)"
          />

          {!file ? (
            <div className="border-2 border-dashed border-neutral-800 hover:border-gold-500/40 rounded-xl p-8 text-center transition-all bg-neutral-900/10 relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-300">Click to upload or drag PDF here</p>
              <p className="text-xs text-neutral-500 mt-1">Supported file type: PDF</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-gold-500/20 bg-gold-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-gold-500/10 text-gold-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{file.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:text-red-400 transition-colors cursor-pointer"
                title="Remove uploaded resume"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>


        {/* Difficulty selection */}
        <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <SectionHeader
            icon={Layers}
            title="Difficulty Level"
            subtitle="Set the target depth for the resume Q&A round"
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
            subtitle="How many tailored questions should this interview contain?"
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
            subtitle="Simulate real interview timing constraints"
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

        {/* Start Button Container */}
        <div className="p-6 rounded-2xl border border-gold-500/20 bg-gold-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-500 mb-1.5">Resume Mode Enabled</h3>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-md">
                AI-powered evaluation will scan your resume to find technical projects and work history to formulate tailored questions.
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={loading || !file}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-base tracking-wide transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <Cpu className="w-5 h-5 animate-pulse" />
                  <span>Parsing Resume...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Generate Interview</span>
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

export default ResumeInterview;
