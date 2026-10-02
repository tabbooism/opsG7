/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useId } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, EyeOff, ShieldCheck, Zap } from 'lucide-react';
import { BreachSimulationResult } from '../utils/breachSimulation';

interface BreachProbabilityGaugeProps {
  simulation: BreachSimulationResult;
  isDark: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BreachProbabilityGauge: React.FC<BreachProbabilityGaugeProps> = ({
  simulation,
  isDark,
  size = 'md',
}) => {
  const gradientId = useId();
  const { score, confidenceInterval, riskTier, timeToCompromise, detectionRisk, primaryBarrier } = simulation;

  // Calculate needle angle
  // Gauge spans 180 degrees:
  // 0% -> 180° (left, -X)
  // 50% -> 90° (top, -Y)
  // 100% -> 0° (right, +X)
  // In standard SVG math centered at (cx, cy):
  // Angle in radians = PI - (score / 100) * PI
  const needleAngleDeg = 180 - (score / 100) * 180;
  const needleRad = (needleAngleDeg * Math.PI) / 180;

  // Radius configuration
  const cx = 150;
  const cy = 135;
  const rOuter = 110;
  const rInner = 88;
  const needleLen = 85;

  const needleX = cx + needleLen * Math.cos(needleRad);
  const needleY = cy - needleLen * Math.sin(needleRad);

  // Determine colors based on tier
  const getTierTheme = () => {
    if (score >= 80) {
      return {
        text: 'text-rose-400',
        badgeBg: isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200',
        accentHex: '#f43f5e',
        glowClass: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
        icon: <ShieldAlert size={15} className="text-rose-400" />,
      };
    }
    if (score >= 60) {
      return {
        text: 'text-orange-400',
        badgeBg: isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200',
        accentHex: '#f97316',
        glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
        icon: <AlertTriangle size={15} className="text-orange-400" />,
      };
    }
    if (score >= 35) {
      return {
        text: 'text-amber-400',
        badgeBg: isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200',
        accentHex: '#f59e0b',
        glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        icon: <Zap size={15} className="text-amber-400" />,
      };
    }
    return {
      text: 'text-emerald-400',
      badgeBg: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentHex: '#10b981',
      glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      icon: <CheckCircle2 size={15} className="text-emerald-400" />,
    };
  };

  const themeConfig = getTierTheme();

  // Tick marks: 0%, 25%, 50%, 75%, 100%
  const ticks = [0, 25, 50, 75, 100].map((tick) => {
    const angleDeg = 180 - (tick / 100) * 180;
    const rad = (angleDeg * Math.PI) / 180;
    const x1 = cx + (rOuter + 3) * Math.cos(rad);
    const y1 = cy - (rOuter + 3) * Math.sin(rad);
    const x2 = cx + (rOuter + 9) * Math.cos(rad);
    const y2 = cy - (rOuter + 9) * Math.sin(rad);
    const textX = cx + (rOuter + 18) * Math.cos(rad);
    const textY = cy - (rOuter + 18) * Math.sin(rad) + 4;
    return { tick, x1, y1, x2, y2, textX, textY };
  });

  return (
    <div
      id="breach-probability-gauge-card"
      className={`rounded-xl border p-5 flex flex-col items-center justify-between transition-all relative overflow-hidden ${
        isDark ? 'bg-[#0A0F1D] border-white/10' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Background ambient glow according to score */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl opacity-15 pointer-events-none rounded-full"
        style={{ backgroundColor: themeConfig.accentHex }}
      />

      {/* Header Label */}
      <div className="w-full flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {themeConfig.icon}
          <span className={`text-xs font-mono font-bold tracking-wider uppercase ${isDark ? 'text-white/80' : 'text-slate-800'}`}>
            Theoretical Breach Probability
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${themeConfig.badgeBg}`}>
          {riskTier}
        </span>
      </div>

      {/* Radial Gauge SVG */}
      <div className="relative w-full max-w-[320px] aspect-[300/175] flex items-center justify-center">
        <svg
          viewBox="0 0 300 170"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label={`Breach Probability Gauge showing ${score}%`}
        >
          <defs>
            {/* Color spectrum gradient along the semi-circle */}
            <linearGradient id={`${gradientId}-gaugeGradient`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" /> {/* Emerald */}
              <stop offset="35%" stopColor="#f59e0b" /> {/* Amber */}
              <stop offset="70%" stopColor="#f97316" /> {/* Orange */}
              <stop offset="100%" stopColor="#f43f5e" /> {/* Rose / Red */}
            </linearGradient>

            <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc (Greyed) */}
          <path
            d={`M ${cx - rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 1 ${cx + rOuter} ${cy}`}
            fill="none"
            stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}
            strokeWidth={rOuter - rInner}
            strokeLinecap="round"
          />

          {/* Colored Risk Band Arc with gradient */}
          <path
            d={`M ${cx - (rOuter + rInner) / 2} ${cy} A ${(rOuter + rInner) / 2} ${(rOuter + rInner) / 2} 0 0 1 ${cx + (rOuter + rInner) / 2} ${cy}`}
            fill="none"
            stroke={`url(#${gradientId}-gaugeGradient)`}
            strokeWidth={rOuter - rInner}
            strokeLinecap="round"
            opacity={0.9}
          />

          {/* Tick marks and percentage labels */}
          {ticks.map(({ tick, x1, y1, x2, y2, textX, textY }) => (
            <g key={tick}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
                strokeWidth={1.5}
              />
              <text
                x={textX}
                y={textY}
                fill={isDark ? 'rgba(255, 255, 255, 0.5)' : '#64748b'}
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {tick}%
              </text>
            </g>
          ))}

          {/* Target needle pointer */}
          <g style={{ transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {/* Needle Line */}
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke={themeConfig.accentHex}
              strokeWidth={3}
              strokeLinecap="round"
              filter={`url(#${gradientId}-glow)`}
            />

            {/* Glowing Pointer Tip */}
            <circle
              cx={needleX}
              cy={needleY}
              r={3.5}
              fill="#ffffff"
              stroke={themeConfig.accentHex}
              strokeWidth={1.5}
            />

            {/* Center Pivot Hub */}
            <circle
              cx={cx}
              cy={cy}
              r={12}
              fill={isDark ? '#0F172A' : '#ffffff'}
              stroke={themeConfig.accentHex}
              strokeWidth={3}
            />
            <circle
              cx={cx}
              cy={cy}
              r={5}
              fill={themeConfig.accentHex}
            />
          </g>
        </svg>

        {/* Digital Readout Center Floating Text */}
        <div className="absolute bottom-2 flex flex-col items-center text-center">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight ${themeConfig.text}`}
            >
              {score}%
            </span>
          </div>
          <div className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            Confidence: [{confidenceInterval[0]}% - {confidenceInterval[1]}%]
          </div>
        </div>
      </div>

      {/* Primary KPI Diagnostics Grid */}
      <div className="w-full grid grid-cols-3 gap-2 pt-3 mt-1 border-t border-white/10 text-center">
        <div className={`p-2 rounded-lg border ${
          isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-center gap-1 text-[9px] font-mono uppercase text-white/50 mb-0.5">
            <Clock size={10} className="text-cyan-400" />
            <span>Est. TTC</span>
          </div>
          <div className="text-xs font-bold font-mono text-cyan-300 truncate" title={timeToCompromise}>
            {timeToCompromise}
          </div>
        </div>

        <div className={`p-2 rounded-lg border ${
          isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-center gap-1 text-[9px] font-mono uppercase text-white/50 mb-0.5">
            <EyeOff size={10} className="text-amber-400" />
            <span>Detection</span>
          </div>
          <div className={`text-xs font-bold font-mono truncate ${
            detectionRisk === 'Low' ? 'text-emerald-400' : detectionRisk === 'Medium' ? 'text-amber-400' : 'text-rose-400'
          }`} title={`${detectionRisk} Detection Probability`}>
            {detectionRisk} Risk
          </div>
        </div>

        <div className={`p-2 rounded-lg border ${
          isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-center gap-1 text-[9px] font-mono uppercase text-white/50 mb-0.5">
            <ShieldCheck size={10} className="text-purple-400" />
            <span>Vector Efficacy</span>
          </div>
          <div className="text-xs font-bold font-mono text-purple-300 truncate">
            {simulation.osCompatibility}
          </div>
        </div>
      </div>

      {/* Primary Defense Barrier Footnote */}
      <div className={`w-full mt-3 pt-2 text-[10px] font-mono border-t flex items-center justify-between ${
        isDark ? 'border-white/5 text-white/40' : 'border-slate-100 text-slate-500'
      }`}>
        <span className="truncate max-w-[170px]" title={`Primary Defense Barrier: ${primaryBarrier}`}>
          Barrier: <strong className={isDark ? 'text-white/70' : 'text-slate-700'}>{primaryBarrier}</strong>
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
          simulation.osCompatibility === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
          OS: {simulation.osCompatibility}
        </span>
      </div>
    </div>
  );
};
