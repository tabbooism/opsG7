/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, ThemeMode } from '../types';
import { DEFAULT_SETTINGS } from '../data/mockData';

interface ThemeContextType {
  settings: AppSettings;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  updatePushSettings: (updates: Partial<AppSettings['pushNotifications']>) => void;
  updateEmailSettings: (updates: Partial<AppSettings['emailNotifications']>) => void;
  updateGeneralSettings: (updates: Partial<Omit<AppSettings, 'pushNotifications' | 'emailNotifications'>>) => void;
  resetSettings: () => void;
  saveToast: string | null;
  showToast: (msg: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'runechain_app_settings';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse app settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast((current) => (current === msg ? null : current));
    }, 3000);
  };

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

    // Update document class for theme
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [settings]);

  const setTheme = (theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }));
    showToast(`Switched to ${theme === 'dark' ? 'Dark Tactical' : 'Light Daytime'} theme`);
  };

  const toggleTheme = () => {
    setTheme(settings.theme === 'dark' ? 'light' : 'dark');
  };

  const updatePushSettings = (updates: Partial<AppSettings['pushNotifications']>) => {
    setSettings((prev) => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        ...updates,
      },
    }));
    showToast('Push notification preferences updated');
  };

  const updateEmailSettings = (updates: Partial<AppSettings['emailNotifications']>) => {
    setSettings((prev) => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        ...updates,
      },
    }));
    showToast('Email notification preferences updated');
  };

  const updateGeneralSettings = (updates: Partial<Omit<AppSettings, 'pushNotifications' | 'emailNotifications'>>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
    showToast('Application configuration saved');
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    showToast('Settings reset to default factory parameters');
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        theme: settings.theme,
        setTheme,
        toggleTheme,
        updatePushSettings,
        updateEmailSettings,
        updateGeneralSettings,
        resetSettings,
        saveToast,
        showToast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
