import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PracticeInterview from './pages/PracticeInterview';
import ResumeInterview from './pages/ResumeInterview';
import CompanySpecific from './pages/CompanySpecific';
import Analytics from './pages/Analytics';
import InterviewHistory from './pages/InterviewHistory';
import AdminPanel from './pages/AdminPanel';
import AdminPortal from './pages/AdminPortal';
import InterviewRoom from './pages/InterviewRoom';
import InterviewSummary from './pages/InterviewSummary';
import DailyChallenge from './pages/DailyChallenge';
import Maintenance from './pages/Maintenance';

function AppRoutes() {
  const { settings, loading: settingsLoading } = useSettings();
  const { user, loading: authLoading } = useAuth();

  if (settingsLoading || authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
          <span className="text-neutral-500 text-sm font-medium tracking-wide">Syncing platform...</span>
        </div>
      </div>
    );
  }

  const isMaintenance = settings?.maintenanceMode;
  const isAdmin = user && user.role === 'admin';

  return (
    <BrowserRouter>
      <Routes>
        {isMaintenance && !isAdmin ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Maintenance />} />
          </>
        ) : (
          <>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <PracticeInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-challenge"
              element={
                <ProtectedRoute>
                  <DailyChallenge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-interview"
              element={
                <ProtectedRoute>
                  <ResumeInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-specific"
              element={
                <ProtectedRoute>
                  <CompanySpecific />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <InterviewHistory />
                </ProtectedRoute>
              }
            />

            {/* Interview Room & Summary */}
            <Route
              path="/interview/:id"
              element={
                <ProtectedRoute>
                  <InterviewRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:id/summary"
              element={
                <ProtectedRoute>
                  <InterviewSummary />
                </ProtectedRoute>
              }
            />

            {/* Hidden Admin Portal — accessible only via direct URL */}
            <Route
              path="/mockmate-control"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPortal />
                </ProtectedRoute>
              }
            />
            {/* Legacy /admin redirect */}
            <Route path="/admin" element={<Navigate to="/mockmate-control" replace />} />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
