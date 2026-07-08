import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
          <Routes>
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
          </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
