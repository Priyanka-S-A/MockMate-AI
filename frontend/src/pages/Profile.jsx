import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/common/AppLayout';
import { User, Mail, Briefcase, FileCode, CheckCircle, Target, Zap, Award, Edit3 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [targetJob, setTargetJob] = useState(user?.profile?.targetJob || '');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(user?.profile?.skills || []);
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    setLoading(true);

    try {
      await updateProfile({
        name,
        profile: {
          bio,
          targetJob,
          skills
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Profile</h1>
          <p className="text-neutral-500 text-sm">Configure your personal information, skills, and check placement progress stats.</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Stats Overview Card */}
          <div className="lg:col-span-1 rounded-2xl border border-neutral-900 bg-neutral-950 p-6 space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 mx-auto mb-4 flex items-center justify-center text-3xl font-bold uppercase">
                {name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white">{name}</h2>
              <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">{user?.email}</p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-gold-500/10 text-gold-500 border border-gold-500/20">
                {user?.subscriptionStatus === 'premium' ? 'Premium member' : 'Free account'}
              </span>
            </div>

            <div className="border-t border-neutral-900 pt-6 grid grid-cols-2 gap-4 text-center">
              <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-900">
                <Target className="w-5 h-5 text-gold-500 mx-auto mb-1.5" />
                <span className="block text-xl font-extrabold text-white">{user?.gamification?.completedInterviewsCount || 0}</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Interviews</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-900">
                <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1.5 fill-yellow-400/10" />
                <span className="block text-xl font-extrabold text-white">{user?.gamification?.points || 0}</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">XP Earned</span>
              </div>
            </div>

            <div className="border-t border-neutral-900 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-gold-500" />
                <span>Achievements & Badges</span>
              </h3>
              
              {user?.gamification?.badges?.length === 0 ? (
                <p className="text-neutral-600 text-xs italic">Complete practice mock interviews to unlock badges.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(user?.gamification?.badges || ['First Practice', 'AI Pioneer']).map((badge) => (
                    <span 
                      key={badge} 
                      className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium"
                    >
                      🏆 {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2 rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Edit3 className="w-4.5 h-4.5 text-gold-500" />
              <span>Edit Profile Details</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Target Job */}
              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Target Career Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    placeholder="e.g. React Front-end Developer, Java Software Engineer"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Skills Tags input */}
              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Skills & Technologies</label>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <FileCode className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="e.g. JavaScript, Spring Boot, PostgreSQL"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleAddSkill}
                    type="button"
                    className="px-6 py-3 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:text-white font-semibold text-sm transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 bg-neutral-900/25 border border-neutral-900/50 p-4 rounded-xl">
                  {skills.length === 0 ? (
                    <span className="text-neutral-600 text-xs italic">No skills added yet. Type a technology above to build your profile portfolio.</span>
                  ) : (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-400 transition-colors font-bold text-xs"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Bio description */}
              <div>
                <label className="block text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Bio / Career Summary</label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell recruiters about your background, projects, or placement goals..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all resize-none"
                />
              </div>

              {/* Action buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 rounded bg-gold-500 hover:bg-gold-400 text-black font-bold tracking-wide text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
