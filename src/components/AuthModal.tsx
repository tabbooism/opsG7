/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Mail, 
  Lock, 
  User as UserIcon, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    openAuthModal, 
    loginWithEmail, 
    signupWithEmail, 
    loginWithGoogle, 
    loginWithFacebook 
  } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        const result = await loginWithEmail(email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Authentication failed. Verify credentials.');
        } else {
          setSuccessMessage('Secure authorization token granted.');
        }
      } else {
        const result = await signupWithEmail(name, email, password);
        if (!result.success) {
          setErrorMessage(result.error || 'Registration failed. Check parameters.');
        } else {
          setSuccessMessage('Operator account successfully registered.');
        }
      }
    } catch (err) {
      setErrorMessage('A network handshake error occurred. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSocialLoading('google');
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(res.error || 'Google authentication interrupted.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setErrorMessage(null);
    setSocialLoading('facebook');
    try {
      const res = await loginWithFacebook();
      if (!res.success) {
        setErrorMessage(res.error || 'Facebook authentication interrupted.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const loadDemoAdmin = async () => {
    setEmail('admin.vance@runechain.internal');
    setPassword('OmegaSecurePass2026!');
    setName('Alex Vance (Admin-01)');
  };

  return (
    <AnimatePresence>
      <div 
        id="auth-modal-backdrop" 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={closeAuthModal}
      >
        <motion.div
          id="auth-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-md rounded-xl p-6 sm:p-8 shadow-2xl border ${
            isDark 
              ? 'bg-[#0B0F17] border-white/10 text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Close button */}
          <button
            id="auth-modal-close-btn"
            onClick={closeAuthModal}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-900/40">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {authModalMode === 'login' ? 'Operator Sign In' : 'New Operator Clearance'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                {authModalMode === 'login' ? 'Authenticate to access C2 telemetry' : 'Create new credential profile for neural bridge'}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className={`grid grid-cols-2 p-1 rounded-lg mb-6 border ${
            isDark ? 'bg-black/40 border-white/5' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => {
                openAuthModal('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                authModalMode === 'login'
                  ? isDark 
                    ? 'bg-white/10 text-cyan-400 shadow-sm' 
                    : 'bg-white text-cyan-700 shadow-sm'
                  : isDark ? 'text-white/40 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                openAuthModal('signup');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                authModalMode === 'signup'
                  ? isDark 
                    ? 'bg-white/10 text-cyan-400 shadow-sm' 
                    : 'bg-white text-cyan-700 shadow-sm'
                  : isDark ? 'text-white/40 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Social Logins */}
          <div className="space-y-2.5 mb-6">
            <button
              id="social-login-google-btn"
              type="button"
              disabled={!!socialLoading || isLoading}
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg text-xs font-semibold border transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                  : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
            >
              {socialLoading === 'google' ? (
                <Loader2 size={16} className="animate-spin text-cyan-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <button
              id="social-login-facebook-btn"
              type="button"
              disabled={!!socialLoading || isLoading}
              onClick={handleFacebookLogin}
              className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg text-xs font-semibold border transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                  : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
            >
              {socialLoading === 'facebook' ? (
                <Loader2 size={16} className="animate-spin text-blue-500" />
              ) : (
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
            <span className={`absolute px-3 text-[10px] uppercase font-mono tracking-widest ${
              isDark ? 'bg-[#0B0F17] text-white/30' : 'bg-white text-slate-400'
            }`}>
              Or with credentials
            </span>
          </div>

          {/* Status Feedback */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-4">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'signup' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                  Operator Call-sign / Name
                </label>
                <div className="relative">
                  <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} size={16} />
                  <input
                    id="auth-input-name"
                    type="text"
                    required
                    placeholder="e.g. Major Thorne"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full py-2 pl-10 pr-3 rounded-lg text-xs border focus:outline-none transition-colors ${
                      isDark 
                        ? 'bg-black/30 border-white/10 focus:border-cyan-500/60 text-white placeholder-white/20' 
                        : 'bg-slate-50 border-slate-300 focus:border-cyan-600 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} size={16} />
                <input
                  id="auth-input-email"
                  type="email"
                  required
                  placeholder="operator@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-2 pl-10 pr-3 rounded-lg text-xs border focus:outline-none transition-colors font-mono ${
                    isDark 
                      ? 'bg-black/30 border-white/10 focus:border-cyan-500/60 text-white placeholder-white/20' 
                      : 'bg-slate-50 border-slate-300 focus:border-cyan-600 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-medium ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                  Passcode / Token
                </label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={loadDemoAdmin}
                    className="text-[10px] font-mono text-cyan-500 hover:underline"
                  >
                    Load Demo Credentials
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} size={16} />
                <input
                  id="auth-input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full py-2 pl-10 pr-10 rounded-lg text-xs border focus:outline-none transition-colors font-mono ${
                    isDark 
                      ? 'bg-black/30 border-white/10 focus:border-cyan-500/60 text-white placeholder-white/20' 
                      : 'bg-slate-50 border-slate-300 focus:border-cyan-600 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
                    isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="auth-remember-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-cyan-600 focus:ring-0 focus:ring-offset-0"
                />
                <span className={`text-[11px] ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
                  Remember this workstation
                </span>
              </label>

              <span className={`text-[11px] font-mono ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                AES-256 Auth
              </span>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading || !!socialLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-xs transition-colors shadow-lg shadow-cyan-900/20 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Neural Clearance...</span>
                </>
              ) : (
                <>
                  <Fingerprint size={16} />
                  <span>{authModalMode === 'login' ? 'Authenticate Session' : 'Register Operator'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer disclaimer */}
          <p className={`text-[10px] text-center mt-6 ${isDark ? 'text-white/20' : 'text-slate-400'} font-mono`}>
            Authorized cybersecurity operations only. All telemetry is hashed and audited.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
