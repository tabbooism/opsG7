/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Target, 
  FileCode, 
  Terminal, 
  Settings as SettingsIcon, 
  ChevronRight, 
  X,
  Crosshair,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { View } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isSidebarOpen,
  setSidebarOpen,
  isMobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'victims', label: 'Targets & Origin IP', icon: Crosshair },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'payloads', label: 'Payloads', icon: FileCode },
    { id: 'logs', label: 'Audit Logs', icon: Terminal },
    { id: 'settings', label: 'Settings & Config', icon: SettingsIcon },
  ];

  return (
    <aside
      id="app-sidebar"
      className={`fixed left-0 top-0 h-full border-r transition-all duration-300 z-[70] ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isDark 
          ? 'bg-[#080808] border-white/5 text-white' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header Brand */}
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-900/40">
              <Shield size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="font-bold tracking-tighter text-base bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                  RUNECHAIN
                </span>
                <span className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                  OMEGA C2 CONSOLE
                </span>
              </motion.div>
            )}
          </div>

          {isMobileMenuOpen && (
            <button
              id="sidebar-close-mobile-btn"
              onClick={() => setMobileMenuOpen(false)}
              className={`lg:hidden p-1 rounded-md ${isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 mt-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group ${
                  isActive
                    ? isDark
                      ? 'bg-cyan-500/10 text-white border border-cyan-500/30'
                      : 'bg-cyan-50 text-cyan-900 border border-cyan-300 font-semibold'
                    : isDark
                      ? 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                }`}
              >
                <item.icon
                  size={18}
                  className={`shrink-0 ${
                    isActive
                      ? 'text-cyan-500'
                      : isDark
                        ? 'text-white/40 group-hover:text-cyan-400'
                        : 'text-slate-400 group-hover:text-cyan-700'
                  }`}
                />
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <span className="text-xs font-medium tracking-tight truncate">
                    {item.label}
                  </span>
                )}
                {item.id === 'settings' && (isSidebarOpen || isMobileMenuOpen) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        {(isSidebarOpen || isMobileMenuOpen) && (
          <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div className={`p-3 rounded-lg border ${
              isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  {user ? user.name[0] : 'G'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate leading-tight">
                    {user ? user.name : 'Guest Operator'}
                  </p>
                  <p className={`text-[10px] font-mono truncate ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    {user ? user.role : 'Read-only clearance'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle (Desktop) */}
        <div className={`p-3 border-t hidden lg:block ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <button
            id="sidebar-collapse-btn"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
              isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <ChevronRight
              className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}
              size={18}
            />
            {isSidebarOpen && <span className="font-mono text-[10px] uppercase tracking-widest">Minimize</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
