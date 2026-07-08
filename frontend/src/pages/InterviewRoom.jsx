import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Clock, ChevronRight, SkipForward, Send, Mic, MicOff,
  CheckCircle, XCircle, AlertCircle, Loader2, Trophy,
  Lightbulb, Star, ThumbsUp, ThumbsDown, BookOpen, Cpu,
  Volume2, VolumeX, Save
} from 'lucide-react';

// ── Timer Component ─────────────────────────────────────────────────────────
const Timer = ({ totalSeconds, onExpire }) => {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (totalSeconds === 0) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(id); onExpire?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [totalSeconds, onExpire]);

  if (totalSeconds === 0) return null;

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 100;
  const urgency = pct < 20;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold transition-all
      ${urgency ? 'border-red-500/40 bg-red-500/10 text-red-400 animate-pulse' : 'border-neutral-800 bg-neutral-900/40 text-neutral-300'}`}>
      <Clock className="w-4 h-4" />
      <span>{mins}:{secs}</span>
    </div>
  );
};

// ── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const color = score >= 7 ? '#10b981' : score >= 5 ? '#eab308' : '#ef4444';
  const pct = (score / 10) * 100;
  const r = 28; const c = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color}80)`, transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <span className="absolute text-base font-extrabold text-white">{score}</span>
    </div>
  );
};

// ── Evaluation Card ──────────────────────────────────────────────────────────
const EvaluationCard = ({ evaluation, idealAnswer, onNext, isLast }) => {
  const score = evaluation?.score ?? 0;
  const scoreColor = score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="mt-6 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-5 animate-in fade-in duration-300">
      {/* Score header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <ScoreRing score={score} />
          <div>
            <div className={`text-2xl font-extrabold ${scoreColor}`}>{score}/10</div>
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              {score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Average' : 'Needs Work'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Technical Accuracy</div>
          <div className="text-sm text-neutral-300 max-w-xs text-right">{evaluation?.technicalAccuracy}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths */}
        {evaluation?.strengths?.length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-3">
              <ThumbsUp className="w-3.5 h-3.5" /> Strengths
            </div>
            <ul className="space-y-1.5">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {evaluation?.weaknesses?.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
            <div className="flex items-center gap-1.5 text-red-400 font-semibold text-xs uppercase tracking-wider mb-3">
              <ThumbsDown className="w-3.5 h-3.5" /> Weaknesses
            </div>
            <ul className="space-y-1.5">
              {evaluation.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                  <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Missing Points */}
      {evaluation?.missingPoints?.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-3">
            <AlertCircle className="w-3.5 h-3.5" /> Missing Points
          </div>
          <div className="flex flex-wrap gap-2">
            {evaluation.missingPoints.map((mp, i) => (
              <span key={i} className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                {mp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {evaluation?.suggestions && (
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Lightbulb className="w-3.5 h-3.5" /> Suggestions
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">{evaluation.suggestions}</p>
        </div>
      )}

      {/* Ideal Answer */}
      {idealAnswer && (
        <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/15">
          <div className="flex items-center gap-1.5 text-gold-500 font-semibold text-xs uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-gold-500/20" /> Ideal Answer
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">{idealAnswer}</p>
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
        >
          {isLast ? (
            <><Trophy className="w-4 h-4" /><span>Complete Interview</span></>
          ) : (
            <><span>Next Question</span><ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main InterviewRoom ───────────────────────────────────────────────────────
const InterviewRoom = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [session, setSession] = useState(state?.session || null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalGenerated, setTotalGenerated] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [idealAnswer, setIdealAnswer] = useState('');
  const [phase, setPhase] = useState('answering'); // 'answering' | 'submitting' | 'evaluated' | 'loading-next' | 'completing'
  const [draftSavedAlert, setDraftSavedAlert] = useState(false);

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Set local state based on a question document
  const loadQuestionState = (question) => {
    setCurrentQuestion(question);
    setCurrentIndex(question.orderIndex);
    if (question.status === 'draft' && question.userAnswerText) {
      setAnswer(question.userAnswerText);
    } else {
      setAnswer('');
    }
    setEvaluation(null);
    setIdealAnswer('');
  };

  // Load session from DB
  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then((data) => {
        setSession(data);
        setTotalQuestions(data.totalQuestions);
        setTotalGenerated(data.questions.length);
        // Find the first question needing attention (pending or draft)
        const activeQuestion = data.questions.find((q) => q.status === 'pending' || q.status === 'draft');
        if (activeQuestion) {
          loadQuestionState(activeQuestion);
        } else {
          // If all answered, route to summary
          navigate(`/interview/${id}/summary`);
        }
      })
      .catch(() => navigate('/practice'));
  }, [id, navigate]);

  // Handle TTS Question playback
  const handleToggleSpeak = () => {
    if (!currentQuestion) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    if (speaking) {
      setSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech synthesis on clean-up or question change
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion]);

  // Speech-to-Text Recognition hook
  const toggleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join('');
      setAnswer(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    setListening(true);
  }, [listening]);

  const handleSaveDraft = async () => {
    if (!currentQuestion) return;
    setDraftSavedAlert(false);
    try {
      await api.post(`/interviews/${id}/answer`, {
        questionId: currentQuestion._id,
        userAnswer: answer,
        isDraft: true,
      });
      setDraftSavedAlert(true);
      setTimeout(() => setDraftSavedAlert(false), 3000);
    } catch (err) {
      alert('Failed to save draft: ' + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); }
    window.speechSynthesis.cancel();
    setSpeaking(false);
    
    setPhase('submitting');
    try {
      const result = await api.post(`/interviews/${id}/answer`, {
        questionId: currentQuestion._id,
        userAnswer: answer,
        isDraft: false,
      });
      setEvaluation(result.evaluation);
      setIdealAnswer(result.evaluation?.idealAnswer || '');
      setPhase('evaluated');
    } catch (err) {
      setPhase('answering');
      alert('Evaluation failed: ' + err.message);
    }
  };

  const handleSkip = async () => {
    if (!currentQuestion) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    
    try {
      await api.post(`/interviews/${id}/skip`, { questionId: currentQuestion._id });
      await handleNext(true);
    } catch (err) {
      alert('Failed to skip: ' + err.message);
    }
  };

  const handleNext = async (skipped = false) => {
    const isLast = totalGenerated >= totalQuestions;
    if (isLast || (skipped && totalGenerated >= totalQuestions)) {
      await handleComplete();
      return;
    }
    setPhase('loading-next');
    setAnswer('');
    setEvaluation(null);
    setIdealAnswer('');
    try {
      const result = await api.post(`/interviews/${id}/next-question`, {});
      if (result.done) {
        await handleComplete();
        return;
      }
      setTotalGenerated(result.totalGenerated);
      loadQuestionState(result.currentQuestion);
      setPhase('answering');
    } catch (err) {
      setPhase('answering');
      alert('Failed to load next question: ' + err.message);
    }
  };

  const handleComplete = async () => {
    setPhase('completing');
    try {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const result = await api.post(`/interviews/${id}/complete`, { timeTaken: elapsed });
      // Refresh user state so navbar immediately shows updated streak & XP
      await refreshUser();
      navigate(`/interview/${id}/summary`, { state: { summary: result, interviewId: id } });
    } catch (err) {
      alert('Failed to complete interview: ' + err.message);
      setPhase('evaluated');
    }
  };

  const progressPct = totalQuestions > 0 ? Math.round((currentIndex / totalQuestions) * 100) : 0;
  const isLastQuestion = totalGenerated >= totalQuestions;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
          <span className="text-neutral-500 text-sm">Resuming interview room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-gold-500 selection:text-black">
      {/* Header bar */}
      <div className="sticky top-0 z-40 border-b border-neutral-900 bg-black/70 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold-500" />
              <span className="font-bold text-white text-sm">{session?.domain || 'Mock Interview'}</span>
            </div>
            <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-900 border border-neutral-800 text-neutral-400">
              {session?.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            {session?.timeLimit > 0 && (
              <Timer totalSeconds={session.timeLimit} onExpire={handleComplete} />
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Question card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 relative group overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gold-500/5 blur-xl pointer-events-none" />
          
          <div className="flex items-start gap-4 justify-between">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-500 font-extrabold text-sm flex items-center justify-center shrink-0">
                Q{currentIndex + 1}
              </span>
              <p className="text-white text-base sm:text-lg font-medium leading-relaxed pt-0.5">
                {currentQuestion.questionText}
              </p>
            </div>
            
            {/* TTS Speaker icon */}
            <button
              onClick={handleToggleSpeak}
              title={speaking ? "Stop Question Audio" : "Listen to Question"}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                speaking 
                  ? 'bg-gold-500/20 border-gold-500/30 text-gold-500 animate-pulse'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-gold-500 hover:border-gold-500/30'
              }`}
            >
              {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Saved draft feedback banner */}
        {draftSavedAlert && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Draft response saved to database successfully. You can safely resume this session later.</span>
          </div>
        )}

        {/* Answer / Evaluation phase */}
        {phase === 'loading-next' || phase === 'completing' ? (
          <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 flex flex-col items-center gap-4">
            <Cpu className="w-8 h-8 text-gold-500 animate-pulse" />
            <p className="text-neutral-400 text-sm">
              {phase === 'completing' ? 'Generating your overall performance analysis...' : 'Generating next unique question...'}
            </p>
          </div>
        ) : phase === 'submitting' ? (
          <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 flex flex-col items-center gap-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            <p className="text-neutral-400 text-sm">MockMate AI is parsing and grading technical accuracy...</p>
          </div>
        ) : phase === 'evaluated' ? (
          <EvaluationCard
            evaluation={evaluation}
            idealAnswer={idealAnswer}
            isLast={isLastQuestion}
            onNext={() => isLastQuestion ? handleComplete() : handleNext()}
          />
        ) : (
          /* Answering phase */
          <div className="space-y-4">
            {/* Answer textarea */}
            <div className="relative">
              <textarea
                rows={7}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your detailed answer here... Or speak your answer naturally using the microphone icon below."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all resize-none leading-relaxed"
              />
              <button
                onClick={toggleVoice}
                title={listening ? 'Stop voice transcription' : 'Record voice answer'}
                className={`absolute bottom-4 right-4 p-2.5 rounded-lg border transition-all cursor-pointer ${
                  listening
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-gold-500 hover:border-gold-500/30'
                }`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              {listening && (
                <div className="absolute top-3 left-4 flex items-center gap-2 text-red-400 text-xs font-semibold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span>Voice Transcription Active...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-neutral-600 text-xs px-1">
              <span>
                {answer.length} characters · {answer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              {currentQuestion.status === 'draft' && (
                <span className="text-gold-500/70 font-semibold italic">Editing Saved Draft</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleSkip}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 text-sm font-semibold transition-all cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip Question</span>
              </button>

              <button
                onClick={handleSaveDraft}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 text-sm font-semibold transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit & Evaluate</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewRoom;
