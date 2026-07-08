import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Mic, 
  TrendingUp, 
  FileSearch, 
  Briefcase, 
  HelpCircle,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "MockMate AI mock interview rooms",
      desc: "Practice with custom interviewers that generate questions dynamically for Java, SQL, Python, Web Dev, and HR domains.",
      icon: Terminal,
    },
    {
      title: "Speech-to-text answers",
      desc: "Speak your answers naturally using voice recognition, simulating a real live interview session.",
      icon: Mic,
    },
    {
      title: "Resume-based tests",
      desc: "Upload your resume in PDF format. The AI reads your skills, internship info, and projects to generate custom tests.",
      icon: FileSearch,
    },
    {
      title: "Company-specific modes",
      desc: "Simulate interview styles from recruiters at top tech firms like TCS, Oracle, Accenture, Infosys, and Wipro.",
      icon: Briefcase,
    },
    {
      title: "Analytical dashboards",
      desc: "Track scores, skill metrics, difficulty improvements, daily practice streaks, and weekly activity charts.",
      icon: TrendingUp,
    },
    {
      title: "Streaks & Achievements",
      desc: "Earn points, unlock milestones, and keep up daily practice challenges to stay motivated for placement sessions.",
      icon: Award,
    }
  ];

  const steps = [
    { num: "01", title: "Select Domain & Difficulty", desc: "Choose topics ranging from DSA and SQL to company-specific templates, picking timed or untimed trials." },
    { num: "02", title: "Take Mock Interview", desc: "Respond via voice transcriptions or typing. AI generates subsequent questions based on selection." },
    { num: "03", title: "Get Granular Evaluations", desc: "Receive immediate scores out of 10, accuracy scores, completeness lists, and custom learning roadmaps." },
  ];

  const faqs = [
    { q: "How does the AI grade my response?", a: "The AI evaluates response completeness, technical accuracy, missing edge cases, and provides strengths, weaknesses, and a detailed ideal answer." },
    { q: "Is the voice speech-to-text input reliable?", a: "Yes, it leverages the native Web Speech API built directly into modern browsers, providing real-time speech-to-text conversion without extra latency." },
    { q: "Does the system support PDF resumes?", a: "Yes! The backend parses uploaded PDF files to discover projects, technologies, and academic histories to custom-tailor mock interviews." },
    { q: "Can I review past reports?", a: "Absolutely. Every completed mock session stores a full report history in the database. You can search, filter, read summaries, and download reports as PDFs." }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-gold-500 selection:text-black">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[35%] h-[50%] bg-gold-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold uppercase tracking-wider text-gold-500 mb-6 animate-pulse">
          <Flame className="w-3.5 h-3.5 fill-gold-500/20" />
          <span>Next-Generation Mock Interviews</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Ace technical & HR placement rounds with <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500">MockMate AI</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-neutral-400 text-base sm:text-lg mb-10 leading-relaxed">
          Unlock customized interactive mock rooms. Practice coding languages, SQL, HR, or custom resume queries. Receive comprehensive technical grading, roadmaps, and analytics reports.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-gold-500 text-black hover:bg-gold-400 font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2"
          >
            <span>Start Practicing Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-700 font-semibold tracking-wide transition-colors"
          >
            Sign In to Account
          </Link>
        </div>
      </header>

      {/* Feature Showcase Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-neutral-900">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Advanced features designed for placements
          </h2>
          <p className="text-neutral-500 max-w-md mx-auto text-sm">
            Everything you need to test, analyze, and optimize your interview performance under realistic test-room settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.title} 
                className="p-6 rounded-xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-sm transition-glow"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 capitalize">{feat.title}</h3>
                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works Roadmap */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-neutral-900 bg-neutral-950/20 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Simple 3-step workflow
          </h2>
          <p className="text-neutral-500 text-sm">
            Accelerate your mock preparations in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((st) => (
            <div key={st.num} className="relative p-6 rounded-xl bg-neutral-900/20 border border-neutral-900">
              <span className="absolute top-4 right-6 text-3xl font-extrabold font-mono text-neutral-800">
                {st.num}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">{st.title}</h3>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-neutral-900">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 flex items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-gold-500" />
            <span>Frequently Asked Questions</span>
          </h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-neutral-900 bg-neutral-900/20">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer block */}
      <footer className="relative z-10 border-t border-neutral-900 bg-neutral-950/80 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="font-bold text-lg text-white mb-2 tracking-wider">
              <span className="text-gold-500">MockMate</span> AI
            </div>
            <p className="text-neutral-500 text-xs max-w-sm leading-relaxed">
              Unlock placement success using our dynamic technical and HR interview platform. Powered by our intelligent interview analysis.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link to="/login" className="hover:text-gold-500 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-gold-500 transition-colors">Register</Link>
            <a href="#docs" className="hover:text-gold-500 transition-colors">Docs</a>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-600 text-xs">© 2026 MockMate AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
