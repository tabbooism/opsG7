/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Sun, 
  Moon, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Lock, 
  Check, 
  Shield, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { View } from '../types';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenMobileMenu, 
  currentView, 
  setCurrentView 
}) => {
  const { user, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme, settings, showToast } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  return (
    <header 
      id="app-top-navbar"
      className={`h-16 border-b sticky top-0 z-40 transition-colors backdrop-blur-md flex items-center justify-between px-4 sm:px-8 ${
        isDark 
          ? 'bg-[#080808]/80 border-white/5 text-white' 
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Left side: Hamburger & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          id="mobile-menu-toggle-btn"
          onClick={onOpenMobileMenu}
          className={`lg:hidden p-2 -ml-2 rounded-md transition-all ${
            isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
          }`}
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        <div className="relative max-w-sm w-full group hidden sm:block">
          <Search 
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              isDark ? 'text-white/20 group-focus-within:text-cyan-400' : 'text-slate-400 group-focus-within:text-cyan-600'
            }`} 
            size={16} 
          />
          <input 
            id="navbar-search-input"
            type="text" 
            placeholder="Search targets, hashes, origin IPs..."
            className={`w-full rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none transition-all font-mono border ${
              isDark 
                ? 'bg-white/5 border-white/5 focus:border-cyan-500/50 text-white placeholder-white/30' 
                : 'bg-slate-100 border-slate-200 focus:border-cyan-600 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Right side: Status, Theme Toggle, Notifications, Auth User */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Master server status badge */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-medium">
            Node Online
          </span>
        </div>

        <div className={`hidden sm:block h-4 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

        {/* Quick Theme Toggle Button */}
        <button
          id="navbar-theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light Daytime' : 'Dark Tactical'} Theme`}
          className={`p-2 rounded-lg transition-all border ${
            isDark 
              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-400' 
              : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button 
            id="navbar-notifications-btn"
            onClick={() => {
              setIsNotifMenuOpen(!isNotifMenuOpen);
              setIsProfileMenuOpen(false);
            }}
            className={`relative p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-white/60 hover:text-white hover:bg-white/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell size={18} />
            {settings.pushNotifications.enabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-[#080808]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifMenuOpen && (
            <div 
              id="navbar-notifications-popover"
              className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border p-4 z-50 animate-in fade-in zoom-in-95 ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Push Feed</span>
                </div>
                <span className={`text-[10px] font-mono ${settings.pushNotifications.enabled ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {settings.pushNotifications.enabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                <div className={`p-2.5 rounded-lg border text-xs ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                    <span>ORIGIN SCAN</span>
                    <span>2m ago</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium leading-tight">
                    runehall.com origin uncovered: 185.193.125.42 (Cloudflare bypassed)
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg border text-xs ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                    <span>AUTH DISPATCH</span>
                    <span>10m ago</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium leading-tight">
                    Session authorized for {user?.name || 'Operator'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentView('settings');
                  setIsNotifMenuOpen(false);
                }}
                className={`w-full mt-3 py-1.5 text-center text-[10px] font-mono uppercase tracking-wider rounded border transition-colors ${
                  isDark ? 'bg-white/5 border-white/10 text-white/70 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                Configure Notification Preferences
              </button>
            </div>
          )}
        </div>

        <div className={`h-4 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

        {/* User Auth Profile Dropdown */}
        <div className="relative">
          {user ? (
            <button 
              id="navbar-profile-dropdown-btn"
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotifMenuOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 p-1 rounded-lg hover:bg-white/5 transition-all text-left"
            >
              <div className="text-right hidden sm:block">
                <div className={`text-xs font-semibold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.name}
                </div>
                <div className={`text-[10px] font-mono uppercase tracking-widest leading-none ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                  {user.role}
                </div>
              </div>
              
              <div className="relative">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-cyan-500/30 shadow-md"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black" />
              </div>

              <ChevronDown size={14} className={`hidden xs:block ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
            </button>
          ) : (
            <button
              id="navbar-login-trigger-btn"
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
            >
              <Lock size={14} />
              <span>Operator Sign In</span>
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {user && isProfileMenuOpen && (
            <div 
              id="navbar-user-menu"
              className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 ${
                isDark ? 'bg-[#0B0F17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="p-3 border-b border-white/5 mb-1">
                <div className="font-semibold text-xs leading-tight">{user.name}</div>
                <div className={`text-[11px] font-mono truncate mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  {user.email}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                    user.provider === 'google' 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                      : user.provider === 'facebook'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {user.provider} Auth
                  </span>
                </div>
              </div>

              <button
                id="user-menu-settings-btn"
                onClick={() => {
                  setCurrentView('settings');
                  setIsProfileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                  isDark ? 'hover:bg-white/5 text-white/80' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <SettingsIcon size={14} className="text-cyan-400" />
                <span>Settings & Preferences</span>
              </button>

              <button
                id="user-menu-switch-btn"
                onClick={() => {
                  openAuthModal('login');
                  setIsProfileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                  isDark ? 'hover:bg-white/5 text-white/80' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <UserIcon size={14} className="text-cyan-400" />
                <span>Switch / Re-authenticate</span>
              </button>

              <div className={`h-px my-1 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />

              <button
                id="user-menu-logout-btn"
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut size={14} />
                <span>Sign Out Workstation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
