import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await api.get('/auth/profile');
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user profile on startup', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        profile: data.profile,
        gamification: data.gamification,
        subscriptionStatus: data.subscriptionStatus,
      });
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/register', { name, email, password });
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyRegisterOtp = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/register-verify', { email, otp });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        profile: data.profile,
        gamification: data.gamification,
        subscriptionStatus: data.subscriptionStatus,
      });
      return data;
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendRegisterOtp = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/register-resend', { email });
      return data;
    } catch (err) {
      setError(err.message || 'Resend OTP failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/auth/google', { idToken });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        profile: data.profile,
        gamification: data.gamification,
        subscriptionStatus: data.subscriptionStatus,
      });
      return data;
    } catch (err) {
      setError(err.message || 'Google Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await api.put('/auth/profile', profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Re-fetch the latest user profile from the server and update local state.
  // Call this after any action that changes gamification (e.g. interview completion).
  const refreshUser = async () => {
    try {
      const userData = await api.get('/auth/profile');
      setUser(userData);
    } catch (err) {
      console.error('refreshUser failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        verifyRegisterOtp,
        resendRegisterOtp,
        googleLogin,
        logout,
        updateProfile,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
