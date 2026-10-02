/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crosshair,
  Shield,
  Server,
  Terminal,
  Activity,
  AlertCircle,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  FileCode,
  Tag,
  ArrowRight,
  TrendingUp,
  Cpu,
  Lock,
  Globe,
  Radio,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Payload, Victim } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  VictimSimulationProfile,
  BreachSimulationResult,
  TARGET_SECURITY_PRESETS,
  convertVictimToProfile,
  calculateBreachProbability,
  OperatingSystem,
  EDRSolution,
  WAFSolution,
  PrivilegeLevel,
} from '../utils/breachSimulation';
import { BreachProbabilityGauge } from './BreachProbabilityGauge';

interface PayloadBreachSimulatorProps {
  payloads: Payload[];
  victims?: Victim[];
  selectedPayloadId?: string;
  onSelectPayload?: (id: string) => void;
  onDeployPayload?: (payloadId: string) => void;
  onClose?: () => void;
}

export const PayloadBreachSimulator: React.FC<PayloadBreachSimulatorProps> = ({
  payloads,
  victims = [],
  selectedPayloadId,
  onSelectPayload,
  onDeployPayload,
  onClose,
}) => {
  const { theme, showToast } = useTheme();
  const isDark = theme === 'dark';

  // Active Payload
  const [activePayloadId, setActivePayloadId] = useState<string>(
    selectedPayloadId || (payloads.length > 0 ? payloads[0].id : '')
  );

  useEffect(() => {
    if (selectedPayloadId && selectedPayloadId !== activePayloadId) {
      setActivePayloadId(selectedPayloadId);
    }
  }, [selectedPayloadId]);

  const activePayload = useMemo(() => {
    return payloads.find((p) => p.id === activePayloadId) || payloads[0] || null;
  }, [payloads, activePayloadId]);

  // Target Profile configuration
  const [selectedPresetName, setSelectedPresetName] = useState<string>('Legacy Enterprise Server');
  const [selectedVictimId, setSelectedVictimId] = useState<string>('');

  const [profile, setProfile] = useState<VictimSimulationProfile>(() => {
    if (victims.length > 0) {
      const v = victims[0];
      return convertVictimToProfile(v);
    }
    return TARGET_SECURITY_PRESETS[0].profile;
  });

  // Monte Carlo Simulation state
  const [isSimulatingMonteCarlo, setIsSimulatingMonteCarlo] = useState(false);
  const [monteCarloRuns, setMonteCarloRuns] = useState<{ runIndex: number; simulatedScore: number; status: string }[]>([]);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Active Tab for Simulator Center/Bottom Panel
  const [activeTab, setActiveTab] = useState<'factors' | 'montecarlo' | 'tactical'>('factors');

  // Compute live theoretical breach probability
  const simulationResult: BreachSimulationResult = useMemo(() => {
    if (!activePayload) {
      return {
        score: 0,
        confidenceInterval: [0, 0],
        riskTier: 'Low / Contained',
        factors: [],
        timeToCompromise: 'N/A',
        detectionRisk: 'High',
        primaryBarrier: 'No payload loaded',
        recommendedAction: 'Select a valid payload',
        matchedVulnerabilities: [],
        osCompatibility: 'Incompatible',
      };
    }
    return calculateBreachProbability(activePayload, profile);
  }, [activePayload, profile]);

  // Handle preset selection
  const handleSelectPreset = (presetName: string) => {
    setSelectedPresetName(presetName);
    setSelectedVictimId('');
    const found = TARGET_SECURITY_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setProfile({ ...found.profile });
      showToast(`Loaded security profile: ${presetName}`);
    }
  };

  // Handle Victim node selection
  const handleSelectVictimNode = (victimId: string) => {
    setSelectedVictimId(victimId);
    setSelectedPresetName('Custom Victim Node');
    const v = victims.find((vic) => vic.id === victimId);
    if (v) {
      const converted = convertVictimToProfile(v);
      setProfile(converted);
      showToast(`Imported parameters from victim ${v.id} (${v.domain || v.ip})`);
    }
  };

  // Run Monte Carlo Iterations
  const handleRunMonteCarlo = () => {
    setIsSimulatingMonteCarlo(true);
    setMonteCarloRuns([]);

    const baseScore = simulationResult.score;
    const runsCount = 40;
    const generated: { runIndex: number; simulatedScore: number; status: string }[] = [];

    for (let i = 1; i <= runsCount; i++) {
      // Gaussian jitter around baseScore: +/- 8%
      const jitter = (Math.random() - 0.5) * 16;
      const finalSim = Math.max(2, Math.min(99, Math.round(baseScore + jitter)));
      generated.push({
        runIndex: i,
        simulatedScore: finalSim,
        status: finalSim >= 80 ? 'Breached' : finalSim >= 50 ? 'Partial Access' : 'Blocked',
      });
    }

    setTimeout(() => {
      setMonteCarloRuns(generated);
      setIsSimulatingMonteCarlo(false);
      setActiveTab('montecarlo');
      showToast(`Monte-Carlo completed: 40 trials executed (Mean: ${Math.round(generated.reduce((a, b) => a + b.simulatedScore, 0) / runsCount)}%)`);
    }, 600);
  };

  // Copy assessment to clipboard
  const handleCopyAssessment = () => {
    if (!activePayload) return;
    const summary = `=== THEORETICAL BREACH PROBABILITY REPORT ===
Payload: ${activePayload.name} (${activePayload.id})
Category: ${activePayload.category} | Type: ${activePayload.type}
Target Profile: ${profile.name}
Operating System: ${profile.os}
EDR Defense: ${profile.edr}
Perimeter WAF: ${profile.waf}
Patch Delay: ${profile.patchDelayDays} days | Privilege: ${profile.privilegeLevel}
---------------------------------------------
Breach Probability Score: ${simulationResult.score}% (${simulationResult.riskTier})
Confidence Interval: [${simulationResult.confidenceInterval[0]}% - ${simulationResult.confidenceInterval[1]}%]
Estimated Time-to-Compromise: ${simulationResult.timeToCompromise}
Detection Horizon: ${simulationResult.detectionRisk} Risk
Primary Defense Barrier: ${simulationResult.primaryBarrier}
OS Architecture Synergy: ${simulationResult.osCompatibility}
Tactical Recommendation: ${simulationResult.recommendedAction}
=============================================`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    showToast('Simulation assessment copied to clipboard');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Export JSON
  const handleExportJson = () => {
    if (!activePayload) return;
    const data = {
      timestamp: new Date().toISOString(),
      payload: {
        id: activePayload.id,
        name: activePayload.name,
        type: activePayload.type,
        category: activePayload.category,
        tags: activePayload.tags,
      },
      targetProfile: profile,
      simulationResult,
      monteCarloRuns: monteCarloRuns.length > 0 ? monteCarloRuns : null,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breach-simulation-${activePayload.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Simulation report exported as JSON');
  };

  if (!activePayload) {
    return (
      <div className={`p-8 rounded-xl border text-center ${isDark ? 'bg-[#0A0E17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
        <AlertCircle className="mx-auto mb-2 text-amber-400" size={32} />
        <p className="font-mono text-sm">No payload modules registered in arsenal to simulate.</p>
      </div>
    );
  }

  return (
    <div
      id="payload-breach-simulator-container"
      className={`rounded-xl border overflow-hidden transition-all ${
        isDark ? 'bg-[#070B14] border-cyan-500/20 shadow-2xl shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-md'
      }`}
    >
      {/* Simulator Master Banner */}
      <div
        className={`px-5 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isDark ? 'bg-[#0A101D] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Crosshair size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Breach Probability Simulation Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Live Modeling
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              Predictive theoretical breach scoring based on victim endpoint defenses, WAF proxies, and payload capabilities.
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleRunMonteCarlo}
            disabled={isSimulatingMonteCarlo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSimulatingMonteCarlo
                ? 'bg-cyan-600/50 text-white cursor-wait'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/30'
            }`}
            title="Execute 40 stochastic Monte-Carlo breach iterations"
          >
            <Play size={13} className={isSimulatingMonteCarlo ? 'animate-spin' : ''} />
            <span>{isSimulatingMonteCarlo ? 'Simulating...' : 'Monte Carlo (40x)'}</span>
          </button>

          <button
            onClick={handleCopyAssessment}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono transition-colors ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white/80' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
            title="Copy tactical assessment summary"
          >
            {copiedSummary ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono transition-colors ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white/80' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
            title="Export simulation data as JSON"
          >
            <Download size={13} />
            <span>JSON</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isDark ? 'border-white/10 hover:bg-white/10 text-white/60' : 'border-slate-300 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Back to Table
            </button>
          )}
        </div>
      </div>

      {/* Simulator Payload Selection Bar */}
      <div
        className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark ? 'bg-black/30 border-white/5' : 'bg-slate-100/70 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`font-mono uppercase text-[10px] tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Active Payload:
          </span>
          <select
            id="simulation-payload-select"
            value={activePayload.id}
            onChange={(e) => {
              setActivePayloadId(e.target.value);
              if (onSelectPayload) onSelectPayload(e.target.value);
            }}
            aria-label="Select payload for simulation"
            className={`py-1.5 px-3 rounded-lg border font-mono font-medium focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#0E1626] border-cyan-500/30 text-cyan-300 focus:border-cyan-400'
                : 'bg-white border-cyan-300 text-cyan-900 focus:border-cyan-600 shadow-sm'
            }`}
          >
            {payloads.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.id}] {p.name} ({p.type} • {p.category})
              </option>
            ))}
          </select>
        </div>

        {/* Payload Quick Attributes */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
            isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            Category: <strong className="text-cyan-400">{activePayload.category}</strong>
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
            isDark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            Type: {activePayload.type}
          </span>
          {activePayload.tags && activePayload.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Main Simulation Workbench Layout: Left = Victim Parameters, Right = Gauge & Results */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Victim Parameters Form & Presets (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Target Profile Switcher & Presets */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-[#0A0E1A] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-cyan-400" />
                <h3 className={`text-xs font-mono font-bold tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Target Victim Environment
                </h3>
              </div>

              {victims.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    Active Node:
                  </span>
                  <select
                    value={selectedVictimId}
                    onChange={(e) => handleSelectVictimNode(e.target.value)}
                    aria-label="Load parameters from live victim node"
                    className={`py-1 px-2 text-[11px] rounded border font-mono ${
                      isDark ? 'bg-black/40 border-white/10 text-cyan-300' : 'bg-white border-slate-300 text-cyan-900'
                    }`}
                  >
                    <option value="">-- Choose Live Victim --</option>
                    {victims.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.id} - {v.domain || v.ip} ({v.os})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Presets Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {TARGET_SECURITY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset.name)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                    selectedPresetName === preset.name
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm'
                      : isDark
                      ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Victim Parameters Form Controls */}
          <div className={`p-4 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#0A0E1A] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-white/80' : 'text-slate-800'}`}>
                Victim Telemetry Parameters
              </span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                Dynamic Calculation Enabled
              </span>
            </div>

            {/* Row 1: Operating System & Ingress WAF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                  Target Operating System
                </label>
                <select
                  value={profile.os}
                  onChange={(e) => {
                    setProfile({ ...profile, os: e.target.value as OperatingSystem });
                    setSelectedPresetName('Custom Profile');
                  }}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-black/40 border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-cyan-600'
                  }`}
                >
                  <option value="Windows Server 2022">Windows Server 2022 (Win32/x64)</option>
                  <option value="Windows 11 Enterprise">Windows 11 Enterprise (VBS/Credential Guard)</option>
                  <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS (Linux ELF)</option>
                  <option value="RHEL 9 Enterprise">RHEL 9 Enterprise (SELinux Enforcing)</option>
                  <option value="macOS Sonoma 14.4">macOS Sonoma 14.4 (ARM64 / Gatekeeper)</option>
                  <option value="Kubernetes Pod (Linux)">Kubernetes Pod (Container Runtime)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                  Perimeter / Reverse Proxy WAF
                </label>
                <select
                  value={profile.waf}
                  onChange={(e) => {
                    setProfile({ ...profile, waf: e.target.value as WAFSolution });
                    setSelectedPresetName('Custom Profile');
                  }}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-black/40 border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-cyan-600'
                  }`}
                >
                  <option value="Direct Origin IP (No WAF)">Direct Origin IP (Unproxied / Raw Port)</option>
                  <option value="Cloudflare Enterprise WAF">Cloudflare Enterprise WAF + Bot Shield</option>
                  <option value="Akamai EdgeGuard / Fastly">Akamai EdgeGuard / Fastly Shield</option>
                  <option value="AWS WAF + Shield">AWS WAF + Shield Advanced</option>
                  <option value="Strict Ingress Filtering">Strict Ingress Filtering (Hardened Port Rules)</option>
                </select>
              </div>
            </div>

            {/* Row 2: EDR Solution & Privilege Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                  Endpoint Detection & Response (EDR)
                </label>
                <select
                  value={profile.edr}
                  onChange={(e) => {
                    setProfile({ ...profile, edr: e.target.value as EDRSolution });
                    setSelectedPresetName('Custom Profile');
                  }}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-black/40 border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-cyan-600'
                  }`}
                >
                  <option value="None / Disabled">None / Sensor Disabled</option>
                  <option value="Windows Defender Standard">Windows Defender Standard (Signature Scans)</option>
                  <option value="CrowdStrike Falcon Complete">CrowdStrike Falcon Complete (Kernel Hooks)</option>
                  <option value="SentinelOne Singularity XDR">SentinelOne Singularity XDR (Behavioral)</option>
                  <option value="Microsoft Defender for Endpoint (ATP)">Microsoft Defender ATP (Cloud Heuristics)</option>
                  <option value="Sophos Intercept X">Sophos Intercept X (CryptoGuard)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                  Victim Context Privilege Level
                </label>
                <select
                  value={profile.privilegeLevel}
                  onChange={(e) => {
                    setProfile({ ...profile, privilegeLevel: e.target.value as PrivilegeLevel });
                    setSelectedPresetName('Custom Profile');
                  }}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-black/40 border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-cyan-600'
                  }`}
                >
                  <option value="Domain Admin / SYSTEM">Domain Admin / NT AUTHORITY\SYSTEM</option>
                  <option value="Local Admin / Sudoer">Local Administrator / Sudoer</option>
                  <option value="Standard User">Standard Interactive User</option>
                  <option value="Sandboxed / AppContainer">Sandboxed Restricted AppContainer</option>
                </select>
              </div>
            </div>

            {/* Row 3: Patch Delay Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className={isDark ? 'text-white/60' : 'text-slate-600'}>
                  Patch Lag & Vulnerability Age:
                </span>
                <span className="font-bold text-cyan-400">
                  {profile.patchDelayDays} Days Behind ({profile.patchDelayDays > 90 ? 'Critical Lag' : profile.patchDelayDays > 30 ? 'Moderate' : 'Shielded'})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={profile.patchDelayDays}
                onChange={(e) => {
                  setProfile({ ...profile, patchDelayDays: Number(e.target.value) });
                  setSelectedPresetName('Custom Profile');
                }}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1">
                <span>0d (Day-0 Patched)</span>
                <span>30d (Monthly rollup)</span>
                <span>90d (Quarterly gap)</span>
                <span>180d+ (Severe exposure)</span>
              </div>
            </div>

            {/* Row 4: Security Countermeasures Toggles */}
            <div className="pt-2 border-t border-white/10">
              <span className={`block text-[11px] font-mono uppercase tracking-wider mb-2 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                Active Defense Countermeasures
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <label className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                  profile.activeCveVulnerability
                    ? isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-cyan-50 border-cyan-300 text-cyan-900'
                    : isDark ? 'bg-black/20 border-white/5 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={profile.activeCveVulnerability}
                    onChange={(e) => setProfile({ ...profile, activeCveVulnerability: e.target.checked })}
                    className="w-3.5 h-3.5 accent-cyan-500 rounded"
                  />
                  <span>Target CVE Match Active</span>
                </label>

                <label className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                  profile.mfaEnforced
                    ? isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-300 text-purple-900'
                    : isDark ? 'bg-black/20 border-white/5 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={profile.mfaEnforced}
                    onChange={(e) => setProfile({ ...profile, mfaEnforced: e.target.checked })}
                    className="w-3.5 h-3.5 accent-purple-500 rounded"
                  />
                  <span>MFA / FIDO2 Enforced</span>
                </label>

                <label className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                  profile.networkMicrosegmentation
                    ? isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900'
                    : isDark ? 'bg-black/20 border-white/5 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={profile.networkMicrosegmentation}
                    onChange={(e) => setProfile({ ...profile, networkMicrosegmentation: e.target.checked })}
                    className="w-3.5 h-3.5 accent-amber-500 rounded"
                  />
                  <span>Zero-Trust Microsegmentation</span>
                </label>

                <label className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                  profile.powershellConstrained
                    ? isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-900'
                    : isDark ? 'bg-black/20 border-white/5 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={profile.powershellConstrained}
                    onChange={(e) => setProfile({ ...profile, powershellConstrained: e.target.checked })}
                    className="w-3.5 h-3.5 accent-rose-500 rounded"
                  />
                  <span>PowerShell Constrained Lang</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Breach Probability Gauge & Analysis (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          {/* THE GAUGE CHART */}
          <BreachProbabilityGauge
            simulation={simulationResult}
            isDark={isDark}
            size="lg"
          />

          {/* Tactical Recommendation Card */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-[#0A0E1A] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <Terminal size={14} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Operator Action Directive
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              {simulationResult.recommendedAction}
            </p>

            {onDeployPayload && (
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  Execute staged module
                </span>
                <button
                  onClick={() => onDeployPayload(activePayload.id)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-bold transition-colors shadow-md"
                >
                  <Crosshair size={12} />
                  <span>Launch Attack Run</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel: Tabbed Factor Attribution Matrix & Monte Carlo Trials */}
      <div className={`border-t px-5 py-4 ${isDark ? 'bg-[#090D18] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        {/* Tab switcher */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('factors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'factors'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : isDark ? 'text-white/50 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Factor Attribution Breakdown ({simulationResult.factors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('montecarlo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'montecarlo'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : isDark ? 'text-white/50 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp size={13} />
              <span>Monte-Carlo Trial Distribution ({monteCarloRuns.length > 0 ? monteCarloRuns.length : 'Ready'})</span>
            </button>

            <button
              onClick={() => setActiveTab('tactical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'tactical'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : isDark ? 'text-white/50 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode size={13} />
              <span>Exploit Command & CVE Mappings</span>
            </button>
          </div>

          <span className={`text-[10px] font-mono hidden sm:inline ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            Module Hash: {activePayload.hash || '8f3a9e...'}
          </span>
        </div>

        {/* Tab 1: Contributing Factors Matrix */}
        {activeTab === 'factors' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simulationResult.factors.map((factor, idx) => {
                const isBonus = factor.type === 'bonus';
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                      isBonus
                        ? isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'
                        : isDark ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50/70 border-rose-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold font-mono ${
                          isBonus ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {factor.name}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                          factor.category === 'evasion_synergy'
                            ? 'bg-purple-500/10 text-purple-400'
                            : factor.category === 'payload_capability'
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : factor.category === 'target_exposure'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {factor.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                        {factor.description}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                        isBonus
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {isBonus ? `+${factor.impact}%` : `${factor.impact}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Monte Carlo Stochastic Distribution */}
        {activeTab === 'montecarlo' && (
          <div className="space-y-4">
            {monteCarloRuns.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={28} className="mx-auto text-cyan-400 mb-2 opacity-60" />
                <p className={`text-xs font-mono ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                  No Monte-Carlo simulation executed for this configuration yet.
                </p>
                <button
                  onClick={handleRunMonteCarlo}
                  className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-md"
                >
                  Run 40 Monte-Carlo Simulation Trials
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className={isDark ? 'text-white/70' : 'text-slate-700'}>
                    Distribution of 40 Stochastic Infiltration Trials (Mean: {Math.round(monteCarloRuns.reduce((a, b) => a + b.simulatedScore, 0) / monteCarloRuns.length)}%)
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Breached ({monteCarloRuns.filter((r) => r.status === 'Breached').length})
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Partial ({monteCarloRuns.filter((r) => r.status === 'Partial Access').length})
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Blocked ({monteCarloRuns.filter((r) => r.status === 'Blocked').length})
                    </span>
                  </div>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monteCarloRuns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                      <XAxis dataKey="runIndex" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#0F172A' : '#ffffff',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                        formatter={(val: any) => [`${val}%`, 'Simulated Breach Probability']}
                        labelFormatter={(lbl: any) => `Trial #${lbl}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="simulatedScore"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#simGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Command & CVE Mappings */}
        {activeTab === 'tactical' && (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg border font-mono text-xs ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-1.5 text-[10px] uppercase text-white/50">
                <span>Staged Execution Command</span>
                <span className="text-cyan-400">Encrypted AES-256 Base64 Stager</span>
              </div>
              <code className="text-cyan-300 break-all select-all">
                {activePayload.command}
              </code>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  Target Vulnerabilities Mapped
                </span>
                <div className="space-y-1">
                  {simulationResult.matchedVulnerabilities.map((v, i) => (
                    <div key={i} className="text-xs font-mono text-cyan-400 truncate">
                      • {v}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${
                isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  Payload Evasion Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activePayload.tags && activePayload.tags.length > 0 ? (
                    activePayload.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-white/40 font-mono">No special evasion tags attached</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
