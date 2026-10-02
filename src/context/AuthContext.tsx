/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DEFAULT_USER } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'runechain_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return DEFAULT_USER;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Basic verification
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Simulate network delay
    await new Promise((res) => setTimeout(res, 600));

    const nameFromEmail = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: User = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: nameFromEmail || 'Operator',
      email,
      role: email.includes('admin') ? 'Root Administrator' : 'Security Operator',
      provider: 'email',
      lastLogin: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
    };

    setUser(newUser);
    closeAuthModal();
    return { success: true };
  };

  const signupWithEmail = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) {
      return { success: false, error: 'Operator identification name is required.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters with high entropy.' };
    }

    await new Promise((res) => setTimeout(res, 700));

    const newUser: User = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'Threat Analyst',
      provider: 'email',
      lastLogin: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    };

    setUser(newUser);
    closeAuthModal();
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    await new Promise((res) => setTimeout(res, 800));

    const googleUser: User = {
      id: `GOOG-${Math.floor(10000 + Math.random() * 90000)}`,
      name: 'Dr. Evelyn Reed (Google)',
      email: 'evelyn.reed@sec-intel.io',
      role: 'Root Administrator',
      provider: 'google',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      lastLogin: 'Just now',
      createdAt: '2026-03-20',
    };

    setUser(googleUser);
    closeAuthModal();
    return { success: true };
  };

  const loginWithFacebook = async (): Promise<{ success: boolean; error?: string }> => {
    await new Promise((res) => setTimeout(res, 800));

    const fbUser: User = {
      id: `FB-${Math.floor(10000 + Math.random() * 90000)}`,
      name: 'Marcus Chen (Meta)',
      email: 'marcus.chen@infosec-alliance.net',
      role: 'Security Operator',
      provider: 'facebook',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      lastLogin: 'Just now',
      createdAt: '2026-04-11',
    };

    setUser(fbUser);
    closeAuthModal();
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchUser = (role: User['role']) => {
    if (!user) return;
    setUser({
      ...user,
      role,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        switchUser,
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
