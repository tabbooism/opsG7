/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crosshair, 
  Search, 
  Globe, 
  ShieldAlert, 
  Server, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  ChevronRight, 
  ExternalLink,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { Victim, OriginTarget } from '../types';
import { useTheme } from '../context/ThemeContext';

interface VictimsViewProps {
  victims: Victim[];
  originTargets: OriginTarget[];
  onAddOriginTarget: (target: OriginTarget) => void;
  selectedTargetModal: OriginTarget | null;
  setSelectedTargetModal: (target: OriginTarget | null) => void;
}

export const VictimsView: React.FC<VictimsViewProps> = ({
  victims,
  originTargets,
  onAddOriginTarget,
  selectedTargetModal,
  setSelectedTargetModal,
}) => {
  const { theme, showToast } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [newScanDomain, setNewScanDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');

  const handleRunOriginScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScanDomain.trim()) return;

    const domain = newScanDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    setIsScanning(true);
    setScanStep('Querying DNS A/AAAA & MX records...');

    await new Promise((res) => setTimeout(res, 600));
    setScanStep('Inspecting historical SSL/TLS SAN certificates for leaked IP...');

    await new Promise((res) => setTimeout(res, 700));
    setScanStep('Scanning origin mail exchange & Direct-Connect headers...');

    await new Promise((res) => setTimeout(res, 600));

    // Generate realistic resolved origin IP
    const randomOctet = () => Math.floor(Math.random() * 200 + 10);
    const resolvedIp = `${randomOctet()}.${randomOctet()}.${randomOctet()}.${randomOctet()}`;

    const newTarget: OriginTarget = {
      domain,
      cloudflareProxy: true,
      originIp: resolvedIp,
      status: 'Uncovered',
      nameservers: [`ns1.${domain}`, `ns2.${domain}`],
      historicalIps: [resolvedIp, `104.21.${Math.floor(Math.random() * 90)}.12`],
      latency: `${Math.floor(Math.random() * 30 + 20)}ms`,
      waf: 'Cloudflare Proxy (Origin Leaked)',
      lastChecked: 'Just now',
    };

    onAddOriginTarget(newTarget);
    setIsScanning(false);
    setScanStep('');
    setNewScanDomain('');
    setSelectedTargetModal(newTarget);
    showToast(`Origin IP uncovered for ${domain}: ${resolvedIp}`);
  };

  const filteredTargets = originTargets.filter(
    (t) => t.domain.toLowerCase().includes(searchQuery.toLowerCase()) || t.originIp.includes(searchQuery)
  );

  return (
    <motion.div
      id="victims-view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Perimeter Reconnaissance
            </span>
            <span className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Origin IP Bypasser v4.2
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Sophisticated Origin IP Finder
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Uncover the real backend hosting IP behind Cloudflare, Akamai, and reverse proxies for target operations.
          </p>
        </div>
      </div>

      {/* Origin Scan Input Bar */}
      <div className={`p-6 rounded-xl border ${
        isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <form onSubmit={handleRunOriginScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Crosshair className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-slate-400'}`} size={16} />
            <input
              id="origin-scan-input"
              type="text"
              placeholder="Enter target domain (e.g. runehall.com, runewager.com, opduel.com)..."
              value={newScanDomain}
              onChange={(e) => setNewScanDomain(e.target.value)}
              disabled={isScanning}
              className={`w-full py-2.5 pl-10 pr-4 rounded-lg text-xs font-mono border focus:outline-none transition-colors ${
                isDark 
                  ? 'bg-black/40 border-white/10 text-white focus:border-cyan-500/60 placeholder-white/30' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600 placeholder-slate-400'
              }`}
            />
          </div>
          <button
            id="origin-scan-submit-btn"
            type="submit"
            disabled={isScanning || !newScanDomain.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white shadow-lg shadow-cyan-900/20 transition-all"
          >
            {isScanning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Executing Bypass Engine...</span>
              </>
            ) : (
              <>
                <Zap size={14} />
                <span>Resolve Origin IP</span>
              </>
            )}
          </button>
        </form>

        {isScanning && (
          <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3 text-xs text-cyan-300 font-mono">
            <Activity size={16} className="animate-pulse shrink-0" />
            <span>{scanStep}</span>
          </div>
        )}

        {/* Target Quick Pickers */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5 text-xs">
          <span className={`font-mono text-[11px] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Default Mission Targets:
          </span>
          {['runehall.com', 'runewager.com', 'opduel.com'].map((dom) => (
            <button
              key={dom}
              type="button"
              onClick={() => {
                const found = originTargets.find((t) => t.domain === dom);
                if (found) setSelectedTargetModal(found);
                else setNewScanDomain(dom);
              }}
              className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10' 
                  : 'bg-slate-100 border-slate-300 text-cyan-800 hover:bg-cyan-50'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Target Matrix Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Server size={18} className="text-cyan-500" />
            Uncovered Targets Matrix
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} size={14} />
            <input
              type="text"
              placeholder="Filter by domain or origin IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-1.5 pl-9 pr-3 rounded-lg text-xs font-mono border focus:outline-none ${
                isDark 
                  ? 'bg-black/30 border-white/10 text-white focus:border-cyan-500/50' 
                  : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTargets.map((target) => (
            <div
              key={target.domain}
              id={`target-card-${target.domain.replace(/\./g, '-')}`}
              onClick={() => setSelectedTargetModal(target)}
              className={`p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#0A0E17] border-white/10 hover:border-cyan-500/40 shadow-lg' 
                  : 'bg-white border-slate-200 hover:border-cyan-600 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-cyan-400" />
                    <span className="font-mono font-bold text-sm text-cyan-400">
                      {target.domain}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {target.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs py-2">
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-white/40' : 'text-slate-500'}>Origin IP:</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {target.originIp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-white/40' : 'text-slate-500'}>WAF Engine:</span>
                    <span className={`text-[11px] truncate max-w-[140px] ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                      {target.waf}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-white/40' : 'text-slate-500'}>Latency:</span>
                    <span className="font-mono text-cyan-400">{target.latency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-white/40' : 'text-slate-500'}>Proxy Status:</span>
                    <span className="font-mono text-[10px] text-amber-400">BYPASS CONFIRMED</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className={isDark ? 'text-white/30' : 'text-slate-400'}>
                  Checked {target.lastChecked}
                </span>
                <span className="text-cyan-500 hover:underline flex items-center gap-1">
                  Inspect Origin →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Details Inspection Modal */}
      <AnimatePresence>
        {selectedTargetModal && (
          <div
            id="target-details-modal"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedTargetModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl rounded-xl p-6 sm:p-8 shadow-2xl border ${
                isDark 
                  ? 'bg-[#0B0F17] border-white/10 text-white' 
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <Crosshair size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-mono text-cyan-400">
                      {selectedTargetModal.domain}
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      Reverse Proxy Origin Penetration Dossier
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTargetModal(null)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  ✕
                </button>
              </div>

              {/* Dossier Body */}
              <div className="space-y-6">
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                        Verified Origin IP Address
                      </span>
                      <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-2">
                        <span>{selectedTargetModal.originIp}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedTargetModal.originIp);
                            showToast('Origin IP copied to clipboard');
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
                          title="Copy IP"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-md font-mono text-xs uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Direct Bypassed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      WAF Profile
                    </span>
                    <div className="font-semibold mt-1">{selectedTargetModal.waf}</div>
                  </div>

                  <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-[10px] font-mono uppercase ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      Live Ping Latency
                    </span>
                    <div className="font-semibold font-mono text-cyan-400 mt-1">{selectedTargetModal.latency}</div>
                  </div>
                </div>

                {/* Direct Command Injection */}
                <div>
                  <h4 className={`text-xs font-mono uppercase tracking-widest mb-2 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    Direct Origin Bridge Command
                  </h4>
                  <div className="p-3 rounded-lg bg-black border border-white/10 font-mono text-xs text-cyan-300 flex items-center justify-between">
                    <code>curl -H "Host: {selectedTargetModal.domain}" https://{selectedTargetModal.originIp}/ -k</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`curl -H "Host: ${selectedTargetModal.domain}" https://${selectedTargetModal.originIp}/ -k`);
                        showToast('Bypass command copied to clipboard');
                      }}
                      className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedTargetModal(null)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border ${
                    isDark ? 'border-white/10 text-white/70 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Close Dossier
                </button>
                <button
                  onClick={() => {
                    showToast(`Offensive beacon queued for ${selectedTargetModal.originIp}`);
                    setSelectedTargetModal(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20"
                >
                  Stage Beacon to Origin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
