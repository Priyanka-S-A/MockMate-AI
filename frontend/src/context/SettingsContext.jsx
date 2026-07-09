import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    platformName: 'MockMate AI',
    logoUrl: '',
    registrationsEnabled: true,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await api.get('/settings/public');
      setSettings(data);
      if (data.platformName) {
        document.title = data.platformName;
      }
    } catch (error) {
      console.error('Failed to load platform settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
