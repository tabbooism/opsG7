/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Payload, SuccessRatePoint, VulnerabilityCoverageItem } from '../types';

export const TARGET_SYSTEMS = [
  'Windows Server',
  'Linux Enterprise',
  'Cloudflare Edge',
  'Active Directory',
  'Kubernetes Pods',
] as const;

export const VULN_CATEGORIES = [
  'Memory & Kernel',
  'Auth & Credential',
  'WAF & Perimeter',
  'EDR Evasion',
  'Persistence & C2',
] as const;

export interface HeatMapMatrixCell {
  targetSystem: string;
  category: string;
  coverageRate: number; // 0 to 100
  vulnCount: number;
  cves: string[];
  topVuln: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

// Tailored metrics for default arsenal payloads
export const PAYLOAD_METRICS_MAP: Record<
  string,
  {
    successRateTrend: SuccessRatePoint[];
    vulnerabilityCoverage: VulnerabilityCoverageItem[];
  }
> = {
  'PL-001': {
    // RuneGate.exe (Persistence, Zero-Day, EDR-Bypass)
    successRateTrend: [
      { run: 'Run #1', date: '05/01', successRate: 74, attempts: 28, bypasses: 21, defenseStatus: 'Baseline Defender', latencyMs: 142 },
      { run: 'Run #2', date: '05/03', successRate: 79, attempts: 34, bypasses: 27, defenseStatus: 'EDR Standard Mode', latencyMs: 128 },
      { run: 'Run #3', date: '05/06', successRate: 85, attempts: 40, bypasses: 34, defenseStatus: 'CrowdStrike Falcon 7.1', latencyMs: 95 },
      { run: 'Run #4', date: '05/09', successRate: 88, attempts: 45, bypasses: 40, defenseStatus: 'SentinelOne Deep Inspect', latencyMs: 88 },
      { run: 'Run #5', date: '05/11', successRate: 94, attempts: 52, bypasses: 49, defenseStatus: 'Multi-EDR Guard', latencyMs: 76 },
      { run: 'Run #6', date: '05/14', successRate: 96, attempts: 60, bypasses: 58, defenseStatus: 'Zero-Trust Hardened', latencyMs: 64 },
    ],
    vulnerabilityCoverage: [
      { id: 'CVE-2023-38606', name: 'Kernel Memory Corrupt Bypass', category: 'Memory & Kernel', targetSystem: 'Windows Server', severity: 'Critical', coverageRate: 96, cvss: 9.8, detectionEvasion: 94 },
      { id: 'CVE-2024-21413', name: 'Outlook NTLM Relay Auth Bypass', category: 'Auth & Credential', targetSystem: 'Active Directory', severity: 'Critical', coverageRate: 92, cvss: 9.8, detectionEvasion: 88 },
      { id: 'ATT&CK-T1055', name: 'Process Hollowing Injection', category: 'Memory & Kernel', targetSystem: 'Windows Server', severity: 'High', coverageRate: 94, cvss: 8.6, detectionEvasion: 92 },
      { id: 'ATT&CK-T1574', name: 'DLL Search Order Hijack', category: 'Persistence & C2', targetSystem: 'Windows Server', severity: 'High', coverageRate: 90, cvss: 8.2, detectionEvasion: 91 },
      { id: 'CVE-2024-3400', name: 'GlobalProtect Perimeter Command Injection', category: 'WAF & Perimeter', targetSystem: 'Cloudflare Edge', severity: 'Critical', coverageRate: 85, cvss: 10.0, detectionEvasion: 82 },
      { id: 'ATT&CK-T1562', name: 'EDR Hook Unhooking (NTDLL)', category: 'EDR Evasion', targetSystem: 'Windows Server', severity: 'Critical', coverageRate: 98, cvss: 9.4, detectionEvasion: 97 },
      { id: 'ATT&CK-T1053', name: 'Scheduled Task Persistence', category: 'Persistence & C2', targetSystem: 'Active Directory', severity: 'High', coverageRate: 88, cvss: 7.8, detectionEvasion: 86 },
      { id: 'CVE-2024-1709', name: 'ScreenConnect Auth Bypass', category: 'Auth & Credential', targetSystem: 'Linux Enterprise', severity: 'Critical', coverageRate: 84, cvss: 10.0, detectionEvasion: 89 },
      { id: 'ATT&CK-T1021', name: 'Lateral SMB WinRM Relaying', category: 'Auth & Credential', targetSystem: 'Active Directory', severity: 'High', coverageRate: 89, cvss: 8.5, detectionEvasion: 85 },
      { id: 'ATT&CK-T1543', name: 'Kubernetes DaemonSet Backdoor', category: 'Persistence & C2', targetSystem: 'Kubernetes Pods', severity: 'Medium', coverageRate: 72, cvss: 7.2, detectionEvasion: 79 },
      { id: 'ATT&CK-T1003', name: 'LSASS Memory Credential Extraction', category: 'Auth & Credential', targetSystem: 'Windows Server', severity: 'High', coverageRate: 91, cvss: 8.9, detectionEvasion: 90 },
      { id: 'ATT&CK-T1205', name: 'Port Knocking Stealth C2 Beacon', category: 'Persistence & C2', targetSystem: 'Linux Enterprise', severity: 'High', coverageRate: 87, cvss: 8.1, detectionEvasion: 93 },
    ],
  },
  'PL-002': {
    // ShadowDrain.ps1 (Exfiltration, PowerShell, Stealth)
    successRateTrend: [
      { run: 'Run #1', date: '05/04', successRate: 82, attempts: 20, bypasses: 16, defenseStatus: 'Audit Mode', latencyMs: 210 },
      { run: 'Run #2', date: '05/07', successRate: 85, attempts: 32, bypasses: 27, defenseStatus: 'PowerShell Constrained Lang', latencyMs: 185 },
      { run: 'Run #3', date: '05/09', successRate: 89, attempts: 45, bypasses: 40, defenseStatus: 'AMSI Guard v2', latencyMs: 160 },
      { run: 'Run #4', date: '05/11', successRate: 92, attempts: 54, bypasses: 50, defenseStatus: 'DLP Content Inspection', latencyMs: 140 },
      { run: 'Run #5', date: '05/13', successRate: 94, attempts: 68, bypasses: 64, defenseStatus: 'Encrypted Proxy Guard', latencyMs: 115 },
      { run: 'Run #6', date: '05/15', successRate: 97, attempts: 75, bypasses: 73, defenseStatus: 'Full Egress Sandbox', latencyMs: 98 },
    ],
    vulnerabilityCoverage: [
      { id: 'ATT&CK-T1562.001', name: 'AMSI In-Memory Patching', category: 'EDR Evasion', targetSystem: 'Windows Server', severity: 'Critical', coverageRate: 95, cvss: 9.2, detectionEvasion: 96 },
      { id: 'ATT&CK-T1048', name: 'Exfiltration Over Alternative Protocol (DNS/DoH)', category: 'Persistence & C2', targetSystem: 'Cloudflare Edge', severity: 'High', coverageRate: 94, cvss: 8.7, detectionEvasion: 95 },
      { id: 'CVE-2023-46805', name: 'Ivanti Connect Secure Exfil Flaw', category: 'WAF & Perimeter', targetSystem: 'Cloudflare Edge', severity: 'Critical', coverageRate: 91, cvss: 9.8, detectionEvasion: 90 },
      { id: 'ATT&CK-T1567', name: 'Cloud Storage Secret Staging', category: 'Persistence & C2', targetSystem: 'Active Directory', severity: 'High', coverageRate: 88, cvss: 8.0, detectionEvasion: 89 },
      { id: 'ATT&CK-T1005', name: 'Local SQL Data Shadow Scraping', category: 'Auth & Credential', targetSystem: 'Windows Server', severity: 'High', coverageRate: 93, cvss: 8.5, detectionEvasion: 92 },
      { id: 'ATT&CK-T1059.001', name: 'Obfuscated PowerShell IEX Memory Exec', category: 'Memory & Kernel', targetSystem: 'Windows Server', severity: 'High', coverageRate: 89, cvss: 8.4, detectionEvasion: 91 },
      { id: 'ATT&CK-T1041', name: 'Encrypted C2 Channel Chunking', category: 'Persistence & C2', targetSystem: 'Linux Enterprise', severity: 'Medium', coverageRate: 86, cvss: 7.5, detectionEvasion: 94 },
      { id: 'CVE-2024-23897', name: 'Jenkins Arbitrary File Exfiltration', category: 'WAF & Perimeter', targetSystem: 'Kubernetes Pods', severity: 'Critical', coverageRate: 87, cvss: 9.8, detectionEvasion: 85 },
    ],
  },
  'PL-003': {
    // GhostHook.dll (Infiltration, DLL-Injection, Kernel-Mode)
    successRateTrend: [
      { run: 'Run #1', date: '05/08', successRate: 68, attempts: 25, bypasses: 17, defenseStatus: 'Windows Defender ATP', latencyMs: 180 },
      { run: 'Run #2', date: '05/10', successRate: 77, attempts: 38, bypasses: 29, defenseStatus: 'Kernel Hook Protection', latencyMs: 145 },
      { run: 'Run #3', date: '05/12', successRate: 86, attempts: 48, bypasses: 41, defenseStatus: 'Symantec EDR 4.8', latencyMs: 110 },
      { run: 'Run #4', date: '05/14', successRate: 93, attempts: 58, bypasses: 54, defenseStatus: 'Direct Syscall Hooks', latencyMs: 82 },
      { run: 'Run #5', date: '05/15', successRate: 98, attempts: 70, bypasses: 69, defenseStatus: 'Hardware Hypervisor Guard', latencyMs: 65 },
    ],
    vulnerabilityCoverage: [
      { id: 'ATT&CK-T1055.001', name: 'Dynamic DLL Injection into svchost', category: 'Memory & Kernel', targetSystem: 'Windows Server', severity: 'Critical', coverageRate: 99, cvss: 9.6, detectionEvasion: 98 },
      { id: 'ATT&CK-T1106', name: 'Native Native API Syscall Masking', category: 'EDR Evasion', targetSystem: 'Windows Server', severity: 'Critical', coverageRate: 97, cvss: 9.4, detectionEvasion: 99 },
      { id: 'CVE-2024-21338', name: 'AppLocker Driver Privilege Elevation', category: 'Memory & Kernel', targetSystem: 'Windows Server', severity: 'Critical', coverageRate: 95, cvss: 8.8, detectionEvasion: 94 },
      { id: 'ATT&CK-T1055.012', name: 'Process Ghosting File Payload Launch', category: 'EDR Evasion', targetSystem: 'Active Directory', severity: 'High', coverageRate: 92, cvss: 8.6, detectionEvasion: 96 },
      { id: 'ATT&CK-T1078', name: 'Valid Accounts Session Hijacking', category: 'Auth & Credential', targetSystem: 'Active Directory', severity: 'High', coverageRate: 88, cvss: 8.2, detectionEvasion: 87 },
      { id: 'CVE-2023-38606', name: 'Kernel Arbitrary Read/Write', category: 'Memory & Kernel', targetSystem: 'Linux Enterprise', severity: 'High', coverageRate: 84, cvss: 8.9, detectionEvasion: 89 },
      { id: 'ATT&CK-T1611', name: 'Container Escape via cgroups v1', category: 'WAF & Perimeter', targetSystem: 'Kubernetes Pods', severity: 'Critical', coverageRate: 91, cvss: 9.3, detectionEvasion: 90 },
    ],
  },
  'PL-004': {
    // WipeAll.sh (Destruction, Emergency)
    successRateTrend: [
      { run: 'Run #1', date: '04/20', successRate: 95, attempts: 15, bypasses: 14, defenseStatus: 'Standard Linux Auditing', latencyMs: 45 },
      { run: 'Run #2', date: '04/25', successRate: 97, attempts: 22, bypasses: 21, defenseStatus: 'SELinux Enforcing', latencyMs: 40 },
      { run: 'Run #3', date: '05/01', successRate: 98, attempts: 35, bypasses: 34, defenseStatus: 'AppArmor Strict Profile', latencyMs: 38 },
      { run: 'Run #4', date: '05/10', successRate: 99, attempts: 50, bypasses: 49, defenseStatus: 'Zero-Log Hardened Node', latencyMs: 32 },
    ],
    vulnerabilityCoverage: [
      { id: 'ATT&CK-T1485', name: 'Data Destruction & Raw Disk Overwrite', category: 'Persistence & C2', targetSystem: 'Linux Enterprise', severity: 'Critical', coverageRate: 99, cvss: 9.9, detectionEvasion: 92 },
      { id: 'ATT&CK-T1070.002', name: 'Clear Linux auth.log, wtmp, btmp', category: 'EDR Evasion', targetSystem: 'Linux Enterprise', severity: 'High', coverageRate: 98, cvss: 8.9, detectionEvasion: 97 },
      { id: 'ATT&CK-T1490', name: 'Inhibit System Recovery & Volume Purge', category: 'Persistence & C2', targetSystem: 'Kubernetes Pods', severity: 'Critical', coverageRate: 96, cvss: 9.2, detectionEvasion: 88 },
      { id: 'ATT&CK-T1529', name: 'Kernel Panic Forcible Shutdown', category: 'Memory & Kernel', targetSystem: 'Linux Enterprise', severity: 'High', coverageRate: 97, cvss: 8.0, detectionEvasion: 95 },
      { id: 'CVE-2023-32243', name: 'Essential Addons Elementor Exploit', category: 'WAF & Perimeter', targetSystem: 'Cloudflare Edge', severity: 'Medium', coverageRate: 65, cvss: 7.2, detectionEvasion: 70 },
    ],
  },
  'PL-005': {
    // BeaconTunnel.go (Infiltration, Cloudflare-Bypass, Direct-Origin)
    successRateTrend: [
      { run: 'Run #1', date: '05/12', successRate: 80, attempts: 30, bypasses: 24, defenseStatus: 'Cloudflare Managed Rules', latencyMs: 85 },
      { run: 'Run #2', date: '05/13', successRate: 88, attempts: 42, bypasses: 37, defenseStatus: 'Cloudflare Bot Management', latencyMs: 72 },
      { run: 'Run #3', date: '05/14', successRate: 94, attempts: 58, bypasses: 55, defenseStatus: 'Direct Origin Strict SSL', latencyMs: 58 },
      { run: 'Run #4', date: '05/15', successRate: 97, attempts: 72, bypasses: 70, defenseStatus: 'TLS Fingerprint Verification', latencyMs: 44 },
    ],
    vulnerabilityCoverage: [
      { id: 'CVE-2024-ORIGIN', name: 'Cloudflare Direct IP Origin Leak Bypass', category: 'WAF & Perimeter', targetSystem: 'Cloudflare Edge', severity: 'Critical', coverageRate: 98, cvss: 9.9, detectionEvasion: 97 },
      { id: 'ATT&CK-T1090.003', name: 'Multi-hop Proxy C2 Tunneling (WSS)', category: 'Persistence & C2', targetSystem: 'Cloudflare Edge', severity: 'Critical', coverageRate: 96, cvss: 9.4, detectionEvasion: 98 },
      { id: 'ATT&CK-T1573.002', name: 'TLS Pinning & JA3/JA4 Fingerprint Spoofing', category: 'EDR Evasion', targetSystem: 'Cloudflare Edge', severity: 'High', coverageRate: 97, cvss: 8.8, detectionEvasion: 99 },
      { id: 'CVE-2024-3400', name: 'PAN-OS Command Injection Perimeter', category: 'WAF & Perimeter', targetSystem: 'Linux Enterprise', severity: 'Critical', coverageRate: 92, cvss: 10.0, detectionEvasion: 91 },
      { id: 'ATT&CK-T1021.006', name: 'Windows Remote Management (WinRM) Tunnel', category: 'Auth & Credential', targetSystem: 'Windows Server', severity: 'High', coverageRate: 90, cvss: 8.4, detectionEvasion: 92 },
      { id: 'ATT&CK-T1071.001', name: 'Standard Port 443/8443 Masquerading', category: 'Persistence & C2', targetSystem: 'Kubernetes Pods', severity: 'High', coverageRate: 94, cvss: 8.5, detectionEvasion: 96 },
    ],
  },
  'PL-006': {
    // OriginProbe.py (Persistence, Recon, Direct-Origin, Stealth)
    successRateTrend: [
      { run: 'Run #1', date: '05/14', successRate: 72, attempts: 24, bypasses: 17, defenseStatus: 'Public DNS Probing', latencyMs: 195 },
      { run: 'Run #2', date: '05/14', successRate: 85, attempts: 40, bypasses: 34, defenseStatus: 'Subdomain Brute / Cert Logs', latencyMs: 140 },
      { run: 'Run #3', date: '05/15', successRate: 93, attempts: 55, bypasses: 51, defenseStatus: 'Historical IP Correlation', latencyMs: 98 },
      { run: 'Run #4', date: '05/15', successRate: 96, attempts: 70, bypasses: 67, defenseStatus: 'Direct Socket Verification', latencyMs: 62 },
    ],
    vulnerabilityCoverage: [
      { id: 'CVE-2024-DNS-LEAK', name: 'Subject Alternative Name (SAN) Leakage', category: 'WAF & Perimeter', targetSystem: 'Cloudflare Edge', severity: 'Critical', coverageRate: 97, cvss: 9.1, detectionEvasion: 96 },
      { id: 'ATT&CK-T1596', name: 'Public Historical DNS Record Mining', category: 'WAF & Perimeter', targetSystem: 'Cloudflare Edge', severity: 'High', coverageRate: 96, cvss: 8.5, detectionEvasion: 98 },
      { id: 'ATT&CK-T1046', name: 'Network Service Scanning on Origin IPs', category: 'Memory & Kernel', targetSystem: 'Linux Enterprise', severity: 'Medium', coverageRate: 91, cvss: 7.8, detectionEvasion: 93 },
      { id: 'ATT&CK-T1592', name: 'Gather Victim Host Information', category: 'Auth & Credential', targetSystem: 'Active Directory', severity: 'Medium', coverageRate: 84, cvss: 7.2, detectionEvasion: 90 },
      { id: 'ATT&CK-T1590', name: 'Gather Victim Network Topology', category: 'WAF & Perimeter', targetSystem: 'Windows Server', severity: 'High', coverageRate: 88, cvss: 8.1, detectionEvasion: 92 },
    ],
  },
};

/**
 * Returns or generates deterministic realistic telemetry data for any payload
 */
export function getPayloadMetrics(payload: Payload): {
  successRateTrend: SuccessRatePoint[];
  vulnerabilityCoverage: VulnerabilityCoverageItem[];
} {
  if (payload.successRateTrend && payload.vulnerabilityCoverage) {
    return {
      successRateTrend: payload.successRateTrend,
      vulnerabilityCoverage: payload.vulnerabilityCoverage,
    };
  }

  if (PAYLOAD_METRICS_MAP[payload.id]) {
    return PAYLOAD_METRICS_MAP[payload.id];
  }

  // Generate deterministic metrics based on payload attributes
  const seed = payload.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseSuccess = 70 + (seed % 20);

  const successRateTrend: SuccessRatePoint[] = [
    { run: 'Run #1', date: '05/02', successRate: baseSuccess, attempts: 20, bypasses: Math.round(20 * (baseSuccess / 100)), defenseStatus: 'Standard Defense', latencyMs: 140 },
    { run: 'Run #2', date: '05/05', successRate: Math.min(99, baseSuccess + 6), attempts: 32, bypasses: Math.round(32 * ((baseSuccess + 6) / 100)), defenseStatus: 'EDR Profile Active', latencyMs: 118 },
    { run: 'Run #3', date: '05/09', successRate: Math.min(99, baseSuccess + 12), attempts: 45, bypasses: Math.round(45 * ((baseSuccess + 12) / 100)), defenseStatus: 'Hardened Sandbox', latencyMs: 95 },
    { run: 'Run #4', date: '05/13', successRate: Math.min(99, baseSuccess + 17), attempts: 60, bypasses: Math.round(60 * ((baseSuccess + 17) / 100)), defenseStatus: 'Strict Egress Guard', latencyMs: 78 },
    { run: 'Run #5', date: '05/15', successRate: Math.min(99, baseSuccess + 21), attempts: 75, bypasses: Math.round(75 * ((baseSuccess + 21) / 100)), defenseStatus: 'Zero-Day Shield Active', latencyMs: 60 },
  ];

  const categoryBias = payload.category;
  const vulnerabilityCoverage: VulnerabilityCoverageItem[] = [
    {
      id: 'CVE-2024-21413',
      name: 'NTLM Relay & Credential Elevation',
      category: 'Auth & Credential',
      targetSystem: 'Active Directory',
      severity: 'Critical',
      coverageRate: Math.min(99, 78 + (seed % 20)),
      cvss: 9.8,
      detectionEvasion: 90,
    },
    {
      id: 'CVE-2023-38606',
      name: 'Kernel Memory Corrupt Bypass',
      category: 'Memory & Kernel',
      targetSystem: 'Windows Server',
      severity: 'Critical',
      coverageRate: categoryBias === 'Infiltration' ? 95 : 82,
      cvss: 9.8,
      detectionEvasion: 93,
    },
    {
      id: 'CVE-2024-ORIGIN',
      name: 'Cloudflare Origin Uncloaking',
      category: 'WAF & Perimeter',
      targetSystem: 'Cloudflare Edge',
      severity: 'Critical',
      coverageRate: payload.tags?.includes('Cloudflare-Bypass') || payload.tags?.includes('Direct-Origin') ? 98 : 74,
      cvss: 9.6,
      detectionEvasion: 95,
    },
    {
      id: 'ATT&CK-T1562',
      name: 'EDR Sensor Hook Patching',
      category: 'EDR Evasion',
      targetSystem: 'Windows Server',
      severity: 'Critical',
      coverageRate: payload.tags?.includes('EDR-Bypass') ? 97 : 80,
      cvss: 9.4,
      detectionEvasion: 96,
    },
    {
      id: 'ATT&CK-T1055',
      name: 'In-Memory Process Injection',
      category: 'Memory & Kernel',
      targetSystem: 'Linux Enterprise',
      severity: 'High',
      coverageRate: 88,
      cvss: 8.6,
      detectionEvasion: 91,
    },
    {
      id: 'ATT&CK-T1090',
      name: 'Encrypted Reverse Beacon Tunnel',
      category: 'Persistence & C2',
      targetSystem: 'Kubernetes Pods',
      severity: 'High',
      coverageRate: 85,
      cvss: 8.2,
      detectionEvasion: 90,
    },
    {
      id: 'ATT&CK-T1078',
      name: 'Privileged Service Account Hijacking',
      category: 'Auth & Credential',
      targetSystem: 'Active Directory',
      severity: 'High',
      coverageRate: 89,
      cvss: 8.5,
      detectionEvasion: 87,
    },
    {
      id: 'CVE-2024-3400',
      name: 'Palo Alto Perimeter Arbitrary Command',
      category: 'WAF & Perimeter',
      targetSystem: 'Linux Enterprise',
      severity: 'Critical',
      coverageRate: 91,
      cvss: 10.0,
      detectionEvasion: 89,
    },
  ];

  return { successRateTrend, vulnerabilityCoverage };
}

/**
 * Builds a 2D Heat Map Matrix [Category x TargetSystem] from the vulnerability coverage list
 */
export function buildHeatMapMatrix(
  coverageList: VulnerabilityCoverageItem[]
): HeatMapMatrixCell[][] {
  return VULN_CATEGORIES.map((category) => {
    return TARGET_SYSTEMS.map((targetSystem) => {
      const matching = coverageList.filter(
        (item) => item.category === category && item.targetSystem === targetSystem
      );

      if (matching.length === 0) {
        return {
          targetSystem,
          category,
          coverageRate: 0,
          vulnCount: 0,
          cves: [],
          topVuln: 'No specific coverage tested',
          severity: 'Low',
        };
      }

      const avgCoverage = Math.round(
        matching.reduce((acc, m) => acc + m.coverageRate, 0) / matching.length
      );
      const top = matching.sort((a, b) => b.coverageRate - a.coverageRate)[0];

      return {
        targetSystem,
        category,
        coverageRate: avgCoverage,
        vulnCount: matching.length,
        cves: matching.map((m) => m.id),
        topVuln: `${top.id}: ${top.name}`,
        severity: top.severity,
      };
    });
  });
}

/**
 * Maps a coverage rate percentage (0 - 100) to heat map styling classes & hex colors
 */
export function getHeatMapColor(
  rate: number,
  isDark: boolean
): { bg: string; text: string; border: string; hex: string; levelLabel: string } {
  if (rate >= 90) {
    return {
      bg: isDark ? 'bg-cyan-500/40' : 'bg-cyan-500/30',
      text: isDark ? 'text-cyan-200 font-bold' : 'text-cyan-900 font-bold',
      border: isDark ? 'border-cyan-400/60' : 'border-cyan-500',
      hex: '#06b6d4',
      levelLabel: 'Critical Bypass (90-100%)',
    };
  }
  if (rate >= 75) {
    return {
      bg: isDark ? 'bg-emerald-500/35' : 'bg-emerald-500/25',
      text: isDark ? 'text-emerald-200 font-semibold' : 'text-emerald-900 font-semibold',
      border: isDark ? 'border-emerald-400/50' : 'border-emerald-500',
      hex: '#10b981',
      levelLabel: 'High Coverage (75-89%)',
    };
  }
  if (rate >= 50) {
    return {
      bg: isDark ? 'bg-amber-500/30' : 'bg-amber-500/20',
      text: isDark ? 'text-amber-200' : 'text-amber-900',
      border: isDark ? 'border-amber-400/40' : 'border-amber-400',
      hex: '#f59e0b',
      levelLabel: 'Moderate Coverage (50-74%)',
    };
  }
  if (rate > 0) {
    return {
      bg: isDark ? 'bg-indigo-500/20' : 'bg-indigo-500/15',
      text: isDark ? 'text-indigo-300' : 'text-indigo-800',
      border: isDark ? 'border-indigo-400/30' : 'border-indigo-300',
      hex: '#6366f1',
      levelLabel: 'Partial Surface (1-49%)',
    };
  }
  return {
    bg: isDark ? 'bg-white/[0.02]' : 'bg-slate-100/60',
    text: isDark ? 'text-white/20' : 'text-slate-400',
    border: isDark ? 'border-white/5' : 'border-slate-200',
    hex: isDark ? '#1e293b' : '#e2e8f0',
    levelLabel: 'Untested / No Exploit',
  };
}
