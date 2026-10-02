/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Activity, 
  Cpu, 
  Lock, 
  Globe, 
  Terminal, 
  MoreVertical, 
  ArrowUpRight,
  Shield, 
  ExternalLink,
  Zap,
  Crosshair
} from 'lucide-react';
import { Victim, LogEntry, OriginTarget, View } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DashboardViewProps {
  victims: Victim[];
  logs: LogEntry[];
  originTargets: OriginTarget[];
  onNavigate: (view: View) => void;
  onOpenTargetModal: (target: OriginTarget) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  victims,
  logs,
  originTargets,
  onNavigate,
  onOpenTargetModal,
}) => {
  const { theme, showToast } = useTheme();
  const isDark = theme === 'dark';

  const MetricCard = ({ label, value, trend, icon: Icon, unit }: any) => (
    <div className={`p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-all ${
      isDark ? 'bg-[#0A0E17] border-white/5' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/5 text-cyan-400' : 'bg-cyan-50 text-cyan-700'}`}>
          <Icon size={18} />
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
          trend > 0 
            ? 'text-emerald-500 bg-emerald-500/10' 
            : 'text-red-500 bg-red-500/10'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <div className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </div>
          {unit && <span className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{unit}</span>}
        </div>
        <div className={`text-[10px] font-mono uppercase tracking-widest mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
          {label}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      id="dashboard-view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-semibold">
              Telemetry Synchronized
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Global Command Telemetry
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Live C2 beacons, origin IP resolutions, and automated payload staging across target perimeters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="dashboard-export-report-btn"
            onClick={() => showToast('Telemetry SITREP report exported to encrypted JSON')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            Export SITREP
          </button>
          <button
            id="dashboard-origin-finder-btn"
            onClick={() => onNavigate('victims')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20 transition-all"
          >
            <Crosshair size={14} />
            <span>Origin IP Scanner</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Active Targets" value="1,284" trend={12.5} icon={Users} />
        <MetricCard label="Origin IPs Uncovered" value="342" trend={18.9} icon={Crosshair} />
        <MetricCard label="C2 Bridge Latency" value="38" unit="ms" trend={-14.2} icon={Cpu} />
        <MetricCard label="Active Beacons" value="482" trend={5.4} icon={Activity} />
      </div>

      {/* Origin Targets Showcase (runehall.com, runewager.com, opduel.com) */}
      <div className={`p-5 rounded-xl border ${
        isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crosshair size={18} className="text-cyan-500" />
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              High-Value Origin Resolution Targets
            </h2>
          </div>
          <button
            onClick={() => onNavigate('victims')}
            className="text-xs font-mono text-cyan-500 hover:underline flex items-center gap-1"
          >
            <span>Scan Matrix</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {originTargets.map((target) => (
            <div
              key={target.domain}
              onClick={() => onOpenTargetModal(target)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                isDark 
                  ? 'bg-black/30 border-white/5 hover:border-cyan-500/40' 
                  : 'bg-slate-50 border-slate-200 hover:border-cyan-600 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-cyan-400">
                  {target.domain}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {target.status}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/40' : 'text-slate-500'}>Origin IP:</span>
                  <span className="font-mono font-semibold text-emerald-400">{target.originIp}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/40' : 'text-slate-500'}>Proxy WAF:</span>
                  <span className={`truncate max-w-[140px] ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                    {target.waf}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/40' : 'text-slate-500'}>Ping:</span>
                  <span className="font-mono text-cyan-400">{target.latency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dual Column: Active Victims + Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Active Victims Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Globe size={18} className="text-cyan-400" />
              Active Target Endpoints
            </h2>
            <button
              onClick={() => onNavigate('victims')}
              className="text-[11px] font-mono text-cyan-500 hover:underline uppercase tracking-wider"
            >
              Full Target Registry →
            </button>
          </div>

          <div className={`border rounded-xl overflow-hidden ${
            isDark ? 'bg-[#0A0E17] border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className={`text-[10px] font-mono uppercase tracking-widest border-b ${
                  isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  <tr>
                    <th className="px-5 py-3 font-medium">Target / Host</th>
                    <th className="px-5 py-3 font-medium">Origin IP</th>
                    <th className="px-5 py-3 font-medium">Country</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Last Seen</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                  {victims.map((v) => (
                    <tr key={v.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-cyan-400 font-mono">{v.id}</div>
                        <div className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{v.domain || v.ip}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-emerald-400 font-medium">
                        {v.originIp || v.ip}
                      </td>
                      <td className="px-5 py-3.5">{v.country}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                          v.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : v.status === 'idle'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-[11px] opacity-70">
                        {v.lastSeen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Terminal size={18} className="text-cyan-400" />
              Real-time C2 Log
            </h2>
            <button
              onClick={() => onNavigate('logs')}
              className="text-[11px] font-mono text-cyan-500 hover:underline uppercase tracking-wider"
            >
              Full Log →
            </button>
          </div>

          <div className={`p-5 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#0A0E17] border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex gap-3 text-xs group">
                <div className={`w-1 rounded-full shrink-0 ${
                  log.type === 'critical' ? 'bg-red-500' :
                  log.type === 'success' ? 'bg-emerald-500' :
                  log.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'
                }`} />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                      {log.channel}
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                      {log.timestamp}
                    </span>
                  </div>
                  <p className={`leading-relaxed text-[11px] ${isDark ? 'text-white/70 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    {log.message}
                  </p>
                </div>
              </div>
            ))}

            <button
              onClick={() => onNavigate('logs')}
              className={`w-full py-2 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              Open Audit Terminal Console
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
