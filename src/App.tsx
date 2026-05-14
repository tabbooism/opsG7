/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Users, 
  Zap, 
  Activity, 
  Settings, 
  ChevronRight, 
  Globe, 
  Cpu, 
  Lock,
  Search,
  LayoutDashboard,
  Target,
  FileCode,
  Bell,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type View = 'dashboard' | 'victims' | 'campaigns' | 'payloads' | 'logs' | 'settings';

interface Victim {
  id: string;
  ip: string;
  os: string;
  status: 'active' | 'idle' | 'lost';
  lastSeen: string;
  country: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  channel: string;
}

// --- Mock Data ---

const MOCK_VICTIMS: Victim[] = [
  { id: 'RC-9921', ip: '192.168.1.4', os: 'Windows 11', status: 'active', lastSeen: '2s ago', country: 'USA' },
  { id: 'RC-8812', ip: '45.12.33.19', os: 'macOS Sonoma', status: 'idle', lastSeen: '12m ago', country: 'Germany' },
  { id: 'RC-7721', ip: '172.16.0.4', os: 'Ubuntu 22.04', status: 'active', lastSeen: 'Just now', country: 'Japan' },
  { id: 'RC-0012', ip: '10.0.0.15', os: 'Windows Server 2022', status: 'lost', lastSeen: '2d ago', country: 'Russia' },
];

const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '10:22:15', type: 'success', message: 'Payload RC-991 executed on target 192.168.1.4', channel: 'EXE-CORE' },
  { id: '2', timestamp: '10:21:44', type: 'info', message: 'New connection from RC-7721 (Japan)', channel: 'BEACON' },
  { id: '3', timestamp: '10:20:01', type: 'critical', message: 'Kernel-level hook detected by EDR on RC-0012', channel: 'KERNEL-MGR' },
  { id: '4', timestamp: '10:19:30', type: 'warning', message: 'C2 domain rotating due to increased telemetry', channel: 'DNS-OP' },
];

// --- Components ---

const StatusBadge = ({ status }: { status: Victim['status'] }) => {
  const colors = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    idle: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    lost: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase tracking-wider ${colors[status]}`}>
      {status}
    </span>
  );
};

const MetricCard = ({ label, value, trend, icon: Icon }: any) => (
  <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-lg flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="p-2 bg-white/5 rounded-md">
        <Icon size={18} className="text-white/40" />
      </div>
      <span className={`text-[10px] font-mono ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <div className="mt-2">
      <div className="text-2xl font-semibold tracking-tight text-white/90">{value}</div>
      <div className="text-[10px] font-mono uppercase text-white/30 tracking-widest mt-1">{label}</div>
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#050505] text-white/80 font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full border-r border-white/5 bg-[#080808] transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold tracking-tighter text-lg bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
              >
                RUNECHAIN
              </motion.span>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 mt-4">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'victims', label: 'Victims', icon: Users },
              { id: 'campaigns', label: 'Campaigns', icon: Target },
              { id: 'payloads', label: 'Payloads', icon: FileCode },
              { id: 'logs', label: 'Audit Logs', icon: Terminal },
              { id: 'settings', label: 'C2 Config', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group ${
                  currentView === item.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className={currentView === item.id ? 'text-cyan-400' : 'group-hover:text-cyan-400/70'} />
                {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white"
            >
              <ChevronRight className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} size={20} />
              {isSidebarOpen && <span className="text-xs font-mono uppercase tracking-widest">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search targets, payloads, or hashes..."
                className="w-full bg-white/5 border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/70">Master Server: Online</span>
            </div>
            
            <div className="h-4 w-px bg-white/10" />
            
            <button className="relative text-white/40 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full" />
            </button>
            
            <button className="flex items-center gap-3 pl-4">
              <div className="text-right">
                <div className="text-xs font-semibold text-white/90 leading-tight tracking-tight">Admin-01</div>
                <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest leading-none">Root Access</div>
              </div>
              <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-900 to-black border border-white/10 flex items-center justify-center font-bold text-xs">
                A1
              </div>
            </button>
          </div>
        </header>

        {/* View Layouts */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tighter text-white/95">Global Operations</h1>
                    <p className="text-sm text-white/40 mt-1">Real-time command & control telemetry from 2027 deployments.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium transition-colors">Export Report</button>
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-xs font-medium transition-colors shadow-lg shadow-cyan-900/20">New Campaign</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard label="Total Victims" value="1,284" trend={12.5} icon={Users} />
                  <MetricCard label="Active Beacons" value="482" trend={3.2} icon={Activity} />
                  <MetricCard label="C2 Latency" value="48ms" trend={-8.1} icon={Cpu} />
                  <MetricCard label="Auth Requests" value="2.1M" trend={22.4} icon={Lock} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Active Targets */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Globe size={20} className="text-cyan-400" />
                        Priority Targets
                      </h2>
                      <button className="text-[10px] font-mono text-cyan-400/70 hover:text-cyan-400 border-b border-cyan-400/20 uppercase tracking-widest">View All</button>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-white/5 text-[10px] font-mono uppercase tracking-widest text-white/30">
                          <tr>
                            <th className="px-6 py-4 font-normal">Target ID</th>
                            <th className="px-6 py-4 font-normal">Location</th>
                            <th className="px-6 py-4 font-normal">OS / Plat</th>
                            <th className="px-6 py-4 font-normal">Status</th>
                            <th className="px-6 py-4 font-normal">Last Seen</th>
                            <th className="px-6 py-4 font-normal"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {MOCK_VICTIMS.map((victim) => (
                            <tr key={victim.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-white/80">{victim.id}</div>
                                <div className="text-[10px] font-mono text-white/30">{victim.ip}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/60">{victim.country}</td>
                              <td className="px-6 py-4 text-xs text-white/50">{victim.os}</td>
                              <td className="px-6 py-4"><StatusBadge status={victim.status} /></td>
                              <td className="px-6 py-4 text-[10px] font-mono text-white/40 italic">{victim.lastSeen}</td>
                              <td className="px-6 py-4 text-right">
                                <button className="p-1 hover:bg-white/10 rounded text-white/20 hover:text-white transition-colors">
                                  <MoreVertical size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Terminal size={20} className="text-cyan-400" />
                      Live Feed
                    </h2>
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-6 space-y-6">
                      {MOCK_LOGS.map((log) => (
                        <div key={log.id} className="flex gap-4 group">
                          <div className={`w-px h-auto shrink-0 relative ${
                            log.type === 'critical' ? 'bg-red-500' :
                            log.type === 'success' ? 'bg-emerald-500' :
                            log.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-500/50'
                          }`}>
                            <div className={`absolute top-0 -left-1 w-2 h-2 rounded-full border border-[#0A0A0A] ${
                              log.type === 'critical' ? 'bg-red-500' :
                              log.type === 'success' ? 'bg-emerald-500' :
                              log.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-500/50'
                            }`} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{log.channel}</span>
                              <span className="text-[10px] font-mono text-white/20 italic">{log.timestamp}</span>
                            </div>
                            <p className="text-xs text-white/70 leading-relaxed font-medium transition-colors group-hover:text-white">{log.message}</p>
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-2 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all mt-4">
                        Open Terminal Console
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView !== 'dashboard' && (
              <motion.div 
                key={currentView}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center"
              >
                <div className="p-6 bg-white/5 rounded-full mb-4">
                  <div className="p-4 bg-cyan-900/30 rounded-full">
                    <Activity size={48} className="text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">{currentView} Module</h2>
                <p className="text-white/40 max-w-sm mt-2 font-mono text-xs uppercase tracking-widest leading-relaxed">
                  Initializing module subsystem. Neural pathway secure. Awaiting kernel synchronization...
                </p>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-8 px-6 py-2 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all"
                >
                  Return to Main Bridge
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / System Info Overlay */}
      <footer className="fixed bottom-0 right-0 p-4 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md border border-white/5 rounded-md px-4 py-2 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono uppercase text-white/20 leading-none">Kernel Build</span>
            <span className="text-[10px] font-mono text-cyan-400/60 leading-tight tracking-wider">v7.2.1-OMEGA</span>
          </div>
          <div className="flex flex-col border-l border-white/5 pl-6">
            <span className="text-[8px] font-mono uppercase text-white/20 leading-none">Security Level</span>
            <span className="text-[10px] font-mono text-amber-500/60 leading-tight tracking-wider">RESTRICTED</span>
          </div>
          <div className="flex flex-col border-l border-white/5 pl-6">
            <span className="text-[8px] font-mono uppercase text-white/20 leading-none">Session UUID</span>
            <span className="text-[10px] font-mono text-white/40 leading-tight uppercase tracking-wider">0xBF32...ED19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

