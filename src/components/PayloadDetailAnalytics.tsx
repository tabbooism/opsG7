/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Treemap,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  Layers,
  Flame,
  LayoutGrid,
  BarChart2,
  Info,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Payload, SuccessRatePoint, VulnerabilityCoverageItem } from '../types';
import {
  getPayloadMetrics,
  TARGET_SYSTEMS,
  VULN_CATEGORIES,
  buildHeatMapMatrix,
  getHeatMapColor,
  HeatMapMatrixCell,
} from '../data/payloadMetrics';

interface PayloadDetailAnalyticsProps {
  payload: Payload;
  isDark: boolean;
}

export const PayloadDetailAnalytics: React.FC<PayloadDetailAnalyticsProps> = ({
  payload,
  isDark,
}) => {
  const { successRateTrend, vulnerabilityCoverage } = useMemo(
    () => getPayloadMetrics(payload),
    [payload]
  );

  // Heat map display view toggle: 'matrix' | 'treemap' | 'barchart'
  const [coverageViewMode, setCoverageViewMode] = useState<'matrix' | 'treemap' | 'barchart'>('matrix');
  const [selectedHeatCell, setSelectedHeatCell] = useState<HeatMapMatrixCell | null>(null);
  const [showCveList, setShowCveList] = useState(false);

  // Compute summary stats
  const latestTrend = successRateTrend[successRateTrend.length - 1];
  const firstTrend = successRateTrend[0];
  const trendDelta = latestTrend ? latestTrend.successRate - firstTrend.successRate : 0;
  
  const totalBypasses = useMemo(
    () => successRateTrend.reduce((acc, p) => acc + p.bypasses, 0),
    [successRateTrend]
  );
  const totalAttempts = useMemo(
    () => successRateTrend.reduce((acc, p) => acc + p.attempts, 0),
    [successRateTrend]
  );
  const cumulativeRate = totalAttempts > 0 ? Math.round((totalBypasses / totalAttempts) * 100) : 0;

  const avgVulnerabilityCoverage = useMemo(() => {
    if (vulnerabilityCoverage.length === 0) return 0;
    const sum = vulnerabilityCoverage.reduce((acc, v) => acc + v.coverageRate, 0);
    return Math.round(sum / vulnerabilityCoverage.length);
  }, [vulnerabilityCoverage]);

  const criticalVulnsCount = useMemo(
    () => vulnerabilityCoverage.filter((v) => v.severity === 'Critical').length,
    [vulnerabilityCoverage]
  );

  // Matrix generation
  const heatMapMatrix = useMemo(
    () => buildHeatMapMatrix(vulnerabilityCoverage),
    [vulnerabilityCoverage]
  );

  // Treemap data preparation
  const treemapData = useMemo(() => {
    const grouped: Record<string, { name: string; size: number; coverageRate: number; cve: string; severity: string }[]> = {};
    vulnerabilityCoverage.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push({
        name: `${item.id}: ${item.name}`,
        size: item.coverageRate,
        coverageRate: item.coverageRate,
        cve: item.id,
        severity: item.severity,
      });
    });

    return Object.entries(grouped).map(([category, children]) => ({
      name: category,
      children,
    }));
  }, [vulnerabilityCoverage]);

  // Bar chart data preparation (Target System vs Avg Coverage)
  const systemCoverageBarData = useMemo(() => {
    return TARGET_SYSTEMS.map((system) => {
      const items = vulnerabilityCoverage.filter((v) => v.targetSystem === system);
      const avg = items.length > 0
        ? Math.round(items.reduce((acc, v) => acc + v.coverageRate, 0) / items.length)
        : 0;
      return {
        system,
        coverage: avg,
        vulnsTested: items.length,
      };
    });
  }, [vulnerabilityCoverage]);

  // Custom Treemap Content
  const renderCustomTreemapNode = (props: any) => {
    const { x, y, width, height, name, coverageRate } = props;
    if (width < 30 || height < 20) return null;
    const colorInfo = getHeatMapColor(coverageRate || 75, isDark);

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: colorInfo.hex,
            stroke: isDark ? '#0A0E17' : '#ffffff',
            strokeWidth: 2,
            opacity: 0.85,
            rx: 4,
            ry: 4,
          }}
        />
        {width > 60 && height > 35 && (
          <text
            x={x + 6}
            y={y + 16}
            fill="#ffffff"
            fontSize={10}
            fontFamily="monospace"
            fontWeight="bold"
          >
            {name ? (name.length > 18 ? name.slice(0, 18) + '...' : name) : ''}
          </text>
        )}
        {width > 50 && height > 45 && (
          <text
            x={x + 6}
            y={y + 30}
            fill={isDark ? '#e0f2fe' : '#ffffff'}
            fontSize={9}
            fontFamily="monospace"
          >
            {coverageRate}% Coverage
          </text>
        )}
      </g>
    );
  };

  return (
    <div
      id={`payload-analytics-${payload.id}`}
      className={`mt-4 rounded-xl border p-4 sm:p-5 space-y-6 transition-colors ${
        isDark ? 'bg-[#080C14] border-cyan-500/20' : 'bg-slate-50/80 border-slate-300'
      }`}
    >
      {/* Header telemetry ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Zap size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Telemetry & Exploit Diagnostics
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {payload.id}
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Real-time Recharts visualization of bypass reliability and target vulnerability coverage
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className={`px-3 py-1.5 rounded-lg border text-right ${
            isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Peak Success Rate
            </div>
            <div className="text-sm font-bold font-mono text-cyan-400 flex items-center justify-end gap-1">
              <span>{latestTrend?.successRate || 0}%</span>
              {trendDelta >= 0 ? (
                <span className="text-[10px] text-emerald-400 font-sans">+{trendDelta}%</span>
              ) : (
                <span className="text-[10px] text-red-400 font-sans">{trendDelta}%</span>
              )}
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border text-right ${
            isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Cumulative Bypasses
            </div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {totalBypasses}/{totalAttempts} ({cumulativeRate}%)
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border text-right ${
            isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Target Vuln Coverage
            </div>
            <div className="text-sm font-bold font-mono text-cyan-300">
              {avgVulnerabilityCoverage}% Avg
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SECTION 1: RECHARTS SUCCESS RATE TREND LINE                      */}
      {/* ================================================================ */}
      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-[#0B101B] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" />
            <h5 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              'Success Rate' Trend Line
            </h5>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              {successRateTrend.length} Executions Recorded
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></span>
              Success Rate (%)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 ml-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Confirmed Bypasses
            </span>
          </div>
        </div>

        {/* Recharts Area / Line Chart */}
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={successRateTrend}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`cyanGradient-${payload.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id={`emeraldGradient-${payload.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)'}
                vertical={false}
              />
              <XAxis
                dataKey="run"
                stroke={isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748b'}
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke={isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748b'}
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={({ active, payload: tooltipPayload, label }) => {
                  if (active && tooltipPayload && tooltipPayload.length) {
                    const data = tooltipPayload[0].payload as SuccessRatePoint;
                    return (
                      <div
                        className={`p-3 rounded-lg border shadow-xl text-xs font-mono backdrop-blur-md ${
                          isDark
                            ? 'bg-[#0E1523]/95 border-cyan-500/40 text-white'
                            : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 pb-1.5 mb-1.5 border-b border-white/10 font-bold">
                          <span className="text-cyan-400">{label} ({data.date})</span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">
                            {data.latencyMs}ms Latency
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className={isDark ? 'text-white/60' : 'text-slate-500'}>Success Rate:</span>
                            <span className="font-bold text-cyan-300">{data.successRate}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className={isDark ? 'text-white/60' : 'text-slate-500'}>Confirmed Bypasses:</span>
                            <span className="font-bold text-emerald-400">
                              {data.bypasses} / {data.attempts} attempts
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
                            <span className={isDark ? 'text-white/60' : 'text-slate-500'}>Target Defense:</span>
                            <span className="text-amber-300 text-[11px] max-w-[140px] truncate text-right">
                              {data.defenseStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="successRate"
                name="Success Rate"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#cyanGradient-${payload.id})`}
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
                dot={{ r: 3.5, fill: '#06b6d4', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trend summary narrative */}
        <div className={`mt-3 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono ${
          isDark ? 'border-white/5 text-white/50' : 'border-slate-100 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>
              Initial Run: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{firstTrend?.successRate}%</strong> → Current Hardened: <strong className="text-cyan-400">{latestTrend?.successRate}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-cyan-400" />
            <span>Last Tested Defense: <em>{latestTrend?.defenseStatus}</em></span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SECTION 2: TARGET VULNERABILITY COVERAGE HEAT MAP               */}
      {/* ================================================================ */}
      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-[#0B101B] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              <h5 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                'Target Vulnerability Coverage' Heat Map
              </h5>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {criticalVulnsCount} Critical Vectors
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Matrix representation of exploit readiness and bypass depth across perimeter systems and attack surfaces
            </p>
          </div>

          {/* View mode toggle: Heat Map Matrix vs Treemap vs Bar Chart */}
          <div className="flex items-center gap-1 p-1 rounded-lg border bg-black/20 border-white/10">
            <button
              onClick={() => setCoverageViewMode('matrix')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                coverageViewMode === 'matrix'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : isDark ? 'text-white/50 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="2D Heat Map Matrix"
            >
              <LayoutGrid size={12} />
              <span>Heat Matrix</span>
            </button>
            <button
              onClick={() => setCoverageViewMode('treemap')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                coverageViewMode === 'treemap'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : isDark ? 'text-white/50 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Recharts Treemap"
            >
              <Layers size={12} />
              <span>Treemap</span>
            </button>
            <button
              onClick={() => setCoverageViewMode('barchart')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                coverageViewMode === 'barchart'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : isDark ? 'text-white/50 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Target Systems Bar Chart"
            >
              <BarChart2 size={12} />
              <span>By Target</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Interactive Heat Map Matrix */}
        {coverageViewMode === 'matrix' && (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[620px]">
                <thead>
                  <tr>
                    <th className={`p-2 text-left text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      Attack Vector \ Target
                    </th>
                    {TARGET_SYSTEMS.map((system) => (
                      <th
                        key={system}
                        className={`p-2 text-[10px] font-mono uppercase tracking-wider font-semibold ${isDark ? 'text-cyan-300' : 'text-slate-700'}`}
                      >
                        {system}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {heatMapMatrix.map((row, rowIndex) => {
                    const categoryName = VULN_CATEGORIES[rowIndex];
                    return (
                      <tr key={categoryName}>
                        <td className={`p-2.5 text-left text-[11px] font-mono font-semibold whitespace-nowrap ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                          {categoryName}
                        </td>
                        {row.map((cell) => {
                          const color = getHeatMapColor(cell.coverageRate, isDark);
                          const isSelected =
                            selectedHeatCell?.category === cell.category &&
                            selectedHeatCell?.targetSystem === cell.targetSystem;

                          return (
                            <td key={cell.targetSystem} className="p-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedHeatCell(isSelected ? null : cell)}
                                className={`w-full h-11 sm:h-12 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  color.bg
                                } ${color.border} ${
                                  isSelected
                                    ? 'ring-2 ring-cyan-400 scale-[1.03] shadow-lg shadow-cyan-500/20'
                                    : 'hover:scale-[1.02] hover:brightness-110'
                                }`}
                                title={`${cell.category} on ${cell.targetSystem}: ${cell.coverageRate}% (${cell.vulnCount} tested)`}
                              >
                                <span className={`text-xs font-mono ${color.text}`}>
                                  {cell.coverageRate > 0 ? `${cell.coverageRate}%` : '—'}
                                </span>
                                {cell.vulnCount > 0 && (
                                  <span className={`text-[9px] font-mono opacity-60 ${color.text}`}>
                                    {cell.vulnCount} exploit{cell.vulnCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Heat Map Legend */}
            <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono ${
              isDark ? 'border-white/5 text-white/50' : 'border-slate-100 text-slate-500'
            }`}>
              <span className="flex items-center gap-1.5">
                <Info size={12} className="text-cyan-400" />
                Heat Intensity Scale:
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-400"></span>
                  <span>90-100% (Critical)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/35 border border-emerald-400"></span>
                  <span>75-89% (High)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400"></span>
                  <span>50-74% (Moderate)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-400"></span>
                  <span>1-49% (Partial)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-white/[0.04] border border-white/10"></span>
                  <span>0% (Untested)</span>
                </span>
              </div>
            </div>

            {/* Selected Cell Drilldown Inspector */}
            {selectedHeatCell && (
              <div className={`p-3.5 rounded-lg border text-xs font-mono animate-fadeIn ${
                isDark ? 'bg-black/40 border-cyan-500/40 text-white' : 'bg-cyan-50/70 border-cyan-200 text-cyan-950'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-cyan-400" />
                    <span className="font-bold">
                      {selectedHeatCell.category} on {selectedHeatCell.targetSystem}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedHeatCell(null)}
                    className="text-white/40 hover:text-white text-xs font-bold"
                  >
                    × Close
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] opacity-50 block">COVERAGE SCORE</span>
                    <span className="font-bold text-cyan-400 text-sm">{selectedHeatCell.coverageRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-50 block">TOP EXPLOIT VECTOR</span>
                    <span className="font-bold truncate block">{selectedHeatCell.topVuln}</span>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-50 block">TESTED CVES / ATT&CK</span>
                    <span className="font-bold text-amber-300">
                      {selectedHeatCell.cves.length > 0 ? selectedHeatCell.cves.join(', ') : 'None registered'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode 2: Recharts Treemap */}
        {coverageViewMode === 'treemap' && (
          <div className="space-y-2">
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke={isDark ? '#0A0E17' : '#ffffff'}
                  content={renderCustomTreemapNode}
                />
              </ResponsiveContainer>
            </div>
            <p className={`text-[10px] font-mono text-center ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Area size indicates relative exploit surface density; color represents verified bypass depth percentage.
            </p>
          </div>
        )}

        {/* View Mode 3: Recharts Target System Bar Chart */}
        {coverageViewMode === 'barchart' && (
          <div className="space-y-2">
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={systemCoverageBarData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="system"
                    stroke={isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748b'}
                    fontSize={11}
                    fontFamily="monospace"
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke={isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748b'}
                    fontSize={11}
                    fontFamily="monospace"
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload: tPayload }) => {
                      if (active && tPayload && tPayload.length) {
                        const item = tPayload[0].payload;
                        return (
                          <div className={`p-2.5 rounded-lg border text-xs font-mono ${
                            isDark ? 'bg-[#0E1523] border-cyan-500/40 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-md'
                          }`}>
                            <div className="font-bold text-cyan-400">{item.system}</div>
                            <div className="mt-1 text-emerald-400">Coverage: {item.coverage}%</div>
                            <div className="text-[10px] opacity-70">Vulns Tested: {item.vulnsTested}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
                    {systemCoverageBarData.map((entry) => {
                      const color = getHeatMapColor(entry.coverage, isDark);
                      return <Cell key={entry.system} fill={color.hex} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Expandable Individual CVE Vulnerability Directory */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={() => setShowCveList(!showCveList)}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors ${
              isDark ? 'hover:bg-white/5 text-white/70' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>Inspect All Tested Vulnerabilities ({vulnerabilityCoverage.length} Items)</span>
            </span>
            {showCveList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showCveList && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
              {vulnerabilityCoverage.map((vuln) => {
                const heat = getHeatMapColor(vuln.coverageRate, isDark);
                return (
                  <div
                    key={vuln.id}
                    className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono transition-colors ${
                      isDark ? 'bg-black/20 border-white/5 hover:border-cyan-500/30' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        vuln.severity === 'Critical'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : vuln.severity === 'High'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {vuln.severity}
                      </span>
                      <div>
                        <div className="font-semibold text-cyan-300">
                          {vuln.id} <span className={isDark ? 'text-white/80' : 'text-slate-800'}>- {vuln.name}</span>
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                          Target: {vuln.targetSystem} • Category: {vuln.category} • CVSS: {vuln.cvss}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${vuln.coverageRate}%`,
                            backgroundColor: heat.hex,
                          }}
                        />
                      </div>
                      <span className={`font-bold min-w-[40px] text-right ${heat.text}`}>
                        {vuln.coverageRate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
