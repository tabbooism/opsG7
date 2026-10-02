/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Target, Shield, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const CampaignsView: React.FC = () => {
  const { theme, showToast } = useTheme();
  const isDark = theme === 'dark';

  const campaigns = [
    {
      id: 'CMP-01',
      name: 'Operation Red Fall',
      target: 'runehall.com (Origin: 185.193.125.42)',
      status: 'Active Infiltration',
      progress: 82,
      beacons: 14,
      lastEvent: 'Bypassed Cloudflare enterprise perimeter',
    },
    {
      id: 'CMP-02',
      name: 'Nightshade Horizon',
      target: 'runewager.com (Origin: 194.38.22.88)',
      status: 'Persistence Established',
      progress: 64,
      beacons: 8,
      lastEvent: 'ShadowDrain.ps1 scheduled in memory',
    },
    {
      id: 'CMP-03',
      name: 'Ghost Protocol Duel',
      target: 'opduel.com (Origin: 45.142.214.19)',
      status: 'Reconnaissance Complete',
      progress: 95,
      beacons: 21,
      lastEvent: 'SSL Certificate historical leak verified',
    },
  ];

  return (
    <motion.div
      id="campaigns-view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Operations Matrix
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Active Threat Campaigns
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Multi-stage APT campaigns mapped across origin IPs and targeted infrastructures.
          </p>
        </div>

        <button
          onClick={() => showToast('New campaign initialization sequence initiated')}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/20 transition-all"
        >
          <Plus size={14} />
          Create New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className={`p-6 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  {c.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {c.status}
                </span>
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {c.name}
              </h3>
              <p className={`text-xs font-mono mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                {c.target}
              </p>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className={isDark ? 'text-white/40' : 'text-slate-500'}>Execution Progress</span>
                  <span className="text-cyan-400 font-bold">{c.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
              isDark ? 'border-white/5 text-white/40' : 'border-slate-100 text-slate-500'
            }`}>
              <span>{c.beacons} Active Beacons</span>
              <span className="truncate max-w-[150px] font-mono text-[10px]">{c.lastEvent}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
