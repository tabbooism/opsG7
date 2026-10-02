/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Search, Filter, Download, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AuditLogsViewProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const { theme, showToast } = useTheme();
  const isDark = theme === 'dark';

  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterType === 'all' || log.type === filterType;
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.channel.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      id="logs-view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Audit Stream
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Cryptographic Audit & Telemetry Log
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Immutable event journal for payload deliveries, origin reconnaissance, and operator sessions.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => showToast('Audit logs exported to formatted CSV')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-medium transition-colors ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <Download size={14} />
            Export Log
          </button>
        </div>
      </div>

      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-3 items-center justify-between ${
        isDark ? 'bg-[#0A0E17] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} size={14} />
          <input
            type="text"
            placeholder="Search event messages or channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full py-1.5 pl-9 pr-3 text-xs font-mono rounded-lg border focus:outline-none ${
              isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="opacity-40" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`py-1.5 px-3 text-xs rounded-lg border focus:outline-none ${
              isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="all">All Event Severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Terminal View Container */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-black font-mono text-xs shadow-2xl">
        <div className="bg-[#111622] px-4 py-2.5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-white/40 ml-2">/var/log/runechain/audit.stream</span>
          </div>
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest">
            {filteredLogs.length} Records Loaded
          </span>
        </div>

        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-2 hover:bg-white/5 p-2 rounded transition-colors">
              <span className="text-white/30 text-[10px] sm:w-20 shrink-0">
                [{log.timestamp}]
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                log.type === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                log.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                log.type === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                {log.channel}
              </span>
              <span className="text-white/80 leading-relaxed break-all">
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
