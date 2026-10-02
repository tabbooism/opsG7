/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { View, Victim, OriginTarget, Payload } from './types';
import { 
  INITIAL_VICTIMS, 
  INITIAL_LOGS, 
  INITIAL_PAYLOADS, 
  INITIAL_ORIGIN_TARGETS 
} from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { VictimsView } from './components/VictimsView';
import { CampaignsView } from './components/CampaignsView';
import { PayloadsView } from './components/PayloadsView';
import { AuditLogsView } from './components/AuditLogsView';
import { SettingsView } from './components/SettingsView';

function MainApp() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [victims, setVictims] = useState<Victim[]>(INITIAL_VICTIMS);
  const [originTargets, setOriginTargets] = useState<OriginTarget[]>(INITIAL_ORIGIN_TARGETS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [payloads, setPayloads] = useState<Payload[]>(INITIAL_PAYLOADS);
  const [selectedTargetModal, setSelectedTargetModal] = useState<OriginTarget | null>(null);

  const { theme, saveToast } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddOriginTarget = (newTarget: OriginTarget) => {
    setOriginTargets((prev) => [newTarget, ...prev.filter((t) => t.domain !== newTarget.domain)]);
    // Add to logs as well
    setLogs((prev) => [
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: `Origin IP bypass resolved for ${newTarget.domain} -> ${newTarget.originIp} (Cloudflare bypassed)`,
        channel: 'ORIGIN-SCAN',
      },
      ...prev,
    ]);
  };

  const handleDeletePayloads = (ids: string[]) => {
    const targetNames = payloads.filter((p) => ids.includes(p.id)).map((p) => p.name).join(', ');
    setPayloads((prev) => prev.filter((p) => !ids.includes(p.id)));
    setLogs((prev) => [
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        type: 'warning',
        message: `Batch payload purge: Decommissioned ${ids.length} module(s) [${targetNames}] from arsenal`,
        channel: 'PAYLOAD-OP',
      },
      ...prev,
    ]);
  };

  const handleBatchTagPayloads = (ids: string[], tagsToApply: string[], mode: 'add' | 'remove') => {
    setPayloads((prev) =>
      prev.map((p) => {
        if (!ids.includes(p.id)) return p;
        const currentTags = p.tags || [];
        let nextTags: string[];
        if (mode === 'add') {
          nextTags = Array.from(new Set([...currentTags, ...tagsToApply]));
        } else {
          nextTags = currentTags.filter((t) => !tagsToApply.includes(t));
        }
        return { ...p, tags: nextTags };
      })
    );
    setLogs((prev) => [
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: `Batch tagging operation: ${mode === 'add' ? 'Attached' : 'Removed'} tag(s) [${tagsToApply.join(', ')}] across ${ids.length} payload(s)`,
        channel: 'TAG-MGR',
      },
      ...prev,
    ]);
  };

  const handleAddPayload = (newPayload: Payload) => {
    setPayloads((prev) => [newPayload, ...prev]);
    setLogs((prev) => [
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: `Arsenal module registered: ${newPayload.name} (${newPayload.id}) - Category: ${newPayload.category}`,
        channel: 'PAYLOAD-OP',
      },
      ...prev,
    ]);
  };

  const handleUpdatePayload = (updatedPayload: Payload) => {
    setPayloads((prev) => prev.map((p) => (p.id === updatedPayload.id ? updatedPayload : p)));
  };

  const handleDeployPayload = (payloadId: string) => {
    const p = payloads.find((item) => item.id === payloadId);
    setPayloads((prev) =>
      prev.map((item) => (item.id === payloadId ? { ...item, status: 'Deployed' } : item))
    );
    setLogs((prev) => [
      {
        id: String(Date.now()),
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: `Offensive deployment: Executed staged module ${p?.name || payloadId} against active telemetry node`,
        channel: 'EXE-CORE',
      },
      ...prev,
    ]);
  };

  return (
    <div 
      id="app-root-container"
      className={`min-h-screen transition-colors duration-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden ${
        isDark ? 'bg-[#050505] text-white/90' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <DashboardView
                key="dashboard"
                victims={victims}
                logs={logs}
                originTargets={originTargets}
                onNavigate={setCurrentView}
                onOpenTargetModal={setSelectedTargetModal}
              />
            )}

            {currentView === 'victims' && (
              <VictimsView
                key="victims"
                victims={victims}
                originTargets={originTargets}
                onAddOriginTarget={handleAddOriginTarget}
                selectedTargetModal={selectedTargetModal}
                setSelectedTargetModal={setSelectedTargetModal}
              />
            )}

            {currentView === 'campaigns' && (
              <CampaignsView key="campaigns" />
            )}

            {currentView === 'payloads' && (
              <PayloadsView
                key="payloads"
                payloads={payloads}
                victims={victims}
                onDeployPayload={handleDeployPayload}
                onDeletePayloads={handleDeletePayloads}
                onBatchTagPayloads={handleBatchTagPayloads}
                onAddPayload={handleAddPayload}
                onUpdatePayload={handleUpdatePayload}
              />
            )}

            {currentView === 'logs' && (
              <AuditLogsView key="logs" logs={logs} />
            )}

            {currentView === 'settings' && (
              <SettingsView key="settings" />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal />

      {/* Global Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
              isDark 
                ? 'bg-[#0F1420] border-cyan-500/40 text-cyan-300' 
                : 'bg-white border-cyan-600 text-cyan-900'
            }`}
          >
            <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
            <span className="text-xs font-semibold">{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info Overlay */}
      <footer className="fixed bottom-0 right-0 p-3 pointer-events-none z-30">
        <div className={`backdrop-blur-md border rounded-lg px-3.5 py-1.5 flex items-center gap-4 shadow-xl text-[10px] font-mono ${
          isDark 
            ? 'bg-black/80 border-white/10 text-white/50' 
            : 'bg-white/90 border-slate-200 text-slate-600'
        }`}>
          <div>
            <span className="opacity-40 uppercase">Kernel:</span>{' '}
            <span className="text-cyan-500 font-semibold">v7.2.1-OMEGA</span>
          </div>
          <div className="border-l border-white/10 pl-3">
            <span className="opacity-40 uppercase">Auth:</span>{' '}
            <span className={user ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
              {user ? user.provider.toUpperCase() : 'GUEST'}
            </span>
          </div>
          <div className="hidden xs:block border-l border-white/10 pl-3">
            <span className="opacity-40 uppercase">Theme:</span>{' '}
            <span className="text-cyan-500 font-semibold uppercase">{theme}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
