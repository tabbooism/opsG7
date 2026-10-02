/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Bell, 
  Mail, 
  ShieldCheck, 
  Sliders, 
  Volume2, 
  Check, 
  RotateCcw, 
  Send, 
  Smartphone, 
  Lock, 
  User as UserIcon, 
  LogOut, 
  Radio, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    theme, 
    setTheme, 
    updatePushSettings, 
    updateEmailSettings, 
    updateGeneralSettings, 
    resetSettings, 
    showToast 
  } = useTheme();

  const { user, logout, openAuthModal, switchUser } = useAuth();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'theme' | 'push' | 'email' | 'account'>('theme');
  const [emailInput, setEmailInput] = useState(settings.emailNotifications.emailAddress || user?.email || '');
  const [frequency, setFrequency] = useState(settings.emailNotifications.frequency);
  const [savedBadge, setSavedBadge] = useState(false);

  const handleSaveAll = () => {
    updateEmailSettings({
      emailAddress: emailInput,
      frequency: frequency,
    });
    setSavedBadge(true);
    showToast('All system preferences successfully persisted');
    setTimeout(() => setSavedBadge(false), 2500);
  };

  const handleSendTestPush = () => {
    showToast('🔔 Test Push Notification: [RC-9921] Beacon callback verified on runehall.com origin');
  };

  const handleSendTestEmail = () => {
    showToast(`✉️ Test Digest dispatched to ${emailInput || 'registered email'}`);
  };

  return (
    <motion.div
      id="settings-view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              System Configuration
            </span>
            <span className={`text-xs font-mono ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
              C2-PREF-v7.2
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Application & Telemetry Settings
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            Manage visual themes, push alert thresholds, email reporting, and operator clearances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="settings-reset-btn"
            onClick={resetSettings}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <button
            id="settings-save-all-btn"
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-900/20"
          >
            {savedBadge ? <Check size={14} /> : <Sliders size={14} />}
            {savedBadge ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex flex-wrap gap-2 p-1.5 rounded-xl border ${
        isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          id="settings-tab-theme"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'theme'
              ? isDark 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-white text-cyan-800 shadow-md border border-slate-200'
              : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          <span>Theme & Appearance</span>
        </button>

        <button
          id="settings-tab-push"
          onClick={() => setActiveTab('push')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'push'
              ? isDark 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-white text-cyan-800 shadow-md border border-slate-200'
              : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Bell size={15} />
          <span>Push Notifications</span>
          {settings.pushNotifications.enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          id="settings-tab-email"
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'email'
              ? isDark 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-white text-cyan-800 shadow-md border border-slate-200'
              : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Mail size={15} />
          <span>Email Reporting</span>
          {settings.emailNotifications.enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          id="settings-tab-account"
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'account'
              ? isDark 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-white text-cyan-800 shadow-md border border-slate-200'
              : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Auth & Security Clearance</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* THEME & APPEARANCE TAB */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Color Theme Mode
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'} mt-0.5`}>
                    Switch between the stealth dark tactical console and daytime high-contrast light mode.
                  </p>
                </div>
                <span className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded border ${
                  isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                }`}>
                  Current: {theme === 'dark' ? 'Dark Tactical' : 'Light Daytime'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* Dark Theme Option Card */}
                <div
                  id="theme-option-dark-card"
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                    theme === 'dark'
                      ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-[#06080e]'
                      : isDark 
                        ? 'border-white/10 bg-black/40 hover:border-white/20' 
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner">
                        <Moon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Dark Tactical C2</h4>
                        <p className="text-[11px] text-zinc-400">Deep stealth obsidian palette</p>
                      </div>
                    </div>
                    {theme === 'dark' && (
                      <div className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Visual preview swatch */}
                  <div className="rounded-lg p-3 bg-[#0a0d14] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-16 bg-cyan-500/60 rounded" />
                      <div className="h-2 w-6 bg-emerald-500/60 rounded" />
                    </div>
                    <div className="h-2 w-28 bg-white/20 rounded" />
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <div className="h-4 bg-white/5 rounded border border-white/5" />
                      <div className="h-4 bg-white/5 rounded border border-white/5" />
                      <div className="h-4 bg-cyan-500/20 rounded border border-cyan-500/30" />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-3">
                    Engineered for dark environments, high eye comfort, and prolonged network reconnaissance.
                  </p>
                </div>

                {/* Light Theme Option Card */}
                <div
                  id="theme-option-light-card"
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                    theme === 'light'
                      ? 'border-cyan-600 ring-2 ring-cyan-600/30 bg-white shadow-md'
                      : isDark 
                        ? 'border-white/10 bg-black/40 hover:border-white/20' 
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                        <Sun size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Light Daytime Operational
                        </h4>
                        <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                          Crisp daylight high-contrast UI
                        </p>
                      </div>
                    </div>
                    {theme === 'light' && (
                      <div className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Visual preview swatch */}
                  <div className="rounded-lg p-3 bg-slate-100 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-16 bg-cyan-600 rounded" />
                      <div className="h-2 w-6 bg-emerald-600 rounded" />
                    </div>
                    <div className="h-2 w-28 bg-slate-400 rounded" />
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <div className="h-4 bg-white rounded border border-slate-200" />
                      <div className="h-4 bg-white rounded border border-slate-200" />
                      <div className="h-4 bg-cyan-100 rounded border border-cyan-300" />
                    </div>
                  </div>
                  <p className={`text-[11px] mt-3 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Optimized for high-ambient lighting, audit presentations, and printed report previews.
                  </p>
                </div>
              </div>
            </div>

            {/* Layout Density */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Layers size={18} className="text-cyan-500" />
                <div>
                  <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Display Density & Layout Spacing
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Adjust data compactness across victim grids, logs, and telemetry feeds.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(['compact', 'normal', 'spacious'] as const).map((density) => (
                  <button
                    key={density}
                    id={`density-btn-${density}`}
                    onClick={() => updateGeneralSettings({ density })}
                    className={`py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider border text-center transition-all ${
                      settings.density === density
                        ? isDark
                          ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                          : 'bg-cyan-50 border-cyan-600 text-cyan-800'
                        : isDark
                          ? 'bg-black/30 border-white/5 text-white/50 hover:text-white hover:border-white/10'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PUSH NOTIFICATIONS TAB */}
        {activeTab === 'push' && (
          <div className="space-y-6">
            {/* Master Push Toggle */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Browser & OS Push Notifications
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'} mt-1`}>
                      Instant reactive alerts delivered directly to your workstation or mobile device even when minimized.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-emerald-500">
                        Notification Gateway: Active & Connected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="push-test-trigger-btn"
                    onClick={handleSendTestPush}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70' 
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    Test Alert
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="push-master-toggle"
                      type="checkbox"
                      checked={settings.pushNotifications.enabled}
                      onChange={(e) => updatePushSettings({ enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Granular Push Notification Channels */}
            <div className={`p-6 rounded-xl border divide-y ${
              isDark ? 'bg-[#0A0E17] border-white/10 divide-white/5' : 'bg-white border-slate-200 divide-slate-100 shadow-sm'
            }`}>
              <h4 className={`text-xs font-mono uppercase tracking-widest pb-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                Granular Alert Channels
              </h4>

              {/* Item 1: Critical Incidents */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Critical Incidents & Zero-Day Alerts
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Highest-priority triggers when an EDR hook triggers or a honeypot engages.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="push-sub-critical"
                    type="checkbox"
                    checked={settings.pushNotifications.criticalIncidents}
                    onChange={(e) => updatePushSettings({ criticalIncidents: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              {/* Item 2: Target Heartbeats */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Beacon Dropouts & Lost Connections
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Notify immediately when an active session fails 3 consecutive keep-alive pings.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="push-sub-beacons"
                    type="checkbox"
                    checked={settings.pushNotifications.beaconDropouts}
                    onChange={(e) => updatePushSettings({ beaconDropouts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              {/* Item 3: Payload Executions */}
              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Payload Staging & Execution Events
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Notify when RuneGate or polymorphic modules finish staging in target memory.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="push-sub-payloads"
                    type="checkbox"
                    checked={settings.pushNotifications.payloadExecutions}
                    onChange={(e) => updatePushSettings({ payloadExecutions: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              {/* Item 4: Sound Alerts */}
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-cyan-400" />
                  <div>
                    <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Tactical Sound Feedback
                    </h5>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Audible frequency chimes on critical incoming network events.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="push-sub-sound"
                    type="checkbox"
                    checked={settings.pushNotifications.soundAlerts}
                    onChange={(e) => updatePushSettings({ soundAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL NOTIFICATIONS TAB */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            {/* Master Email Toggle */}
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Encrypted Email Telemetry Digests
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'} mt-1`}>
                      Scheduled SITREP reports, origin IP scan resolutions, and encrypted compliance logs.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="email-test-trigger-btn"
                    onClick={handleSendTestEmail}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70' 
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    Send Test Email
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="email-master-toggle"
                      type="checkbox"
                      checked={settings.emailNotifications.enabled}
                      onChange={(e) => updateEmailSettings({ enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                    Primary Recipient Address
                  </label>
                  <input
                    id="settings-email-address-input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="operator@runechain.internal"
                    className={`w-full py-2 px-3 rounded-lg text-xs border focus:outline-none font-mono ${
                      isDark 
                        ? 'bg-black/30 border-white/10 text-white focus:border-cyan-500/60' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                    }`}
                  />
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    PGP encrypted transmission will automatically apply if key is registered.
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                    Dispatch Frequency
                  </label>
                  <select
                    id="settings-email-frequency-select"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className={`w-full py-2 px-3 rounded-lg text-xs border focus:outline-none ${
                      isDark 
                        ? 'bg-black/30 border-white/10 text-white focus:border-cyan-500/60' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                    }`}
                  >
                    <option value="immediate">Real-time / Instant Alert Delivery</option>
                    <option value="daily">Daily Tactical Digest (08:00 UTC)</option>
                    <option value="weekly">Weekly Executive Briefing (Sundays)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email Topic Filters */}
            <div className={`p-6 rounded-xl border divide-y ${
              isDark ? 'bg-[#0A0E17] border-white/10 divide-white/5' : 'bg-white border-slate-200 divide-slate-100 shadow-sm'
            }`}>
              <h4 className={`text-xs font-mono uppercase tracking-widest pb-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                Email Topic Subscriptions
              </h4>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Origin IP Discovery Alerts
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Receive resolutions for targets like runehall.com, runewager.com, and opduel.com.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="email-sub-origin"
                    type="checkbox"
                    checked={settings.emailNotifications.originIpAlerts}
                    onChange={(e) => updateEmailSettings({ originIpAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Audit Log Archival Snapshots
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Weekly JSON/CSV export of all C2 operator activities and shell commands.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="email-sub-audit"
                    type="checkbox"
                    checked={settings.emailNotifications.auditLogsBackup}
                    onChange={(e) => updateEmailSettings({ auditLogsBackup: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <h5 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    C2 Master Failover Notifications
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    Alert immediately if the primary command node rotates DNS or IP bridges.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="email-sub-failover"
                    type="checkbox"
                    checked={settings.emailNotifications.c2FailoverAlerts}
                    onChange={(e) => updateEmailSettings({ c2FailoverAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT & SECURITY TAB */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${
              isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user?.name || 'Operator'}
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-cyan-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {user ? user.name : 'Unauthenticated Session'}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {user?.role || 'Guest'}
                      </span>
                    </div>
                    <p className={`text-xs font-mono ${isDark ? 'text-white/50' : 'text-slate-500'} mt-1`}>
                      {user?.email || 'No active email linked'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                        user?.provider === 'google' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : user?.provider === 'facebook'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        Provider: {user ? user.provider.toUpperCase() : 'NONE'}
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                        Logged in: {user?.lastLogin || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {user ? (
                    <>
                      <button
                        id="account-switch-role-btn"
                        onClick={() => switchUser(user.role === 'Root Administrator' ? 'Security Operator' : 'Root Administrator')}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                          isDark 
                            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70' 
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        }`}
                      >
                        Toggle Role Clearance
                      </button>
                      <button
                        id="account-signout-btn"
                        onClick={logout}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      id="account-authenticate-btn"
                      onClick={() => openAuthModal('login')}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-900/20"
                    >
                      <Lock size={14} />
                      Operator Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Security Clearance Details */}
            <div className={`p-6 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h4 className={`text-xs font-mono uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                Active Workstation Security Profile
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Two-Factor Status</div>
                  <div className={`text-base font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Enforced (TOTP)</div>
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Hardware FIDO2 Token registered</p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Encryption Suite</div>
                  <div className={`text-base font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>AES-256-GCM</div>
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>End-to-end telemetry tunnel</p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Session Lifetime</div>
                  <div className={`text-base font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>24 Hours Rolling</div>
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Automatic token revocation</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
