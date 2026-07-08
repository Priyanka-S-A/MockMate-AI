import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldOff } from 'lucide-react';

const Unauthorized403 = () => (
  <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
    <div className="text-center max-w-md space-y-6">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
        <ShieldOff className="w-10 h-10 text-red-400" />
      </div>
      <div>
        <h1 className="text-5xl font-black text-white mb-3">403</h1>
        <h2 className="text-xl font-bold text-red-400 mb-2">Unauthorized Access</h2>
        <p className="text-neutral-500 text-sm">You do not have permission to access this page. This area is restricted to platform administrators only.</p>
      </div>
      <a
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm tracking-wide transition-all"
      >
        Back to Dashboard
      </a>
    </div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
          <span className="text-neutral-500 text-sm font-medium tracking-wide">Syncing session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Unauthorized403 />;
  }

  return children;
};

export default ProtectedRoute;
