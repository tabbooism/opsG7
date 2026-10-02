/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Payload, Victim } from '../types';

export type OperatingSystem =
  | 'Windows Server 2022'
  | 'Windows 11 Enterprise'
  | 'Ubuntu 24.04 LTS'
  | 'RHEL 9 Enterprise'
  | 'macOS Sonoma 14.4'
  | 'Kubernetes Pod (Linux)';

export type EDRSolution =
  | 'None / Disabled'
  | 'Windows Defender Standard'
  | 'CrowdStrike Falcon Complete'
  | 'SentinelOne Singularity XDR'
  | 'Microsoft Defender for Endpoint (ATP)'
  | 'Sophos Intercept X';

export type WAFSolution =
  | 'Direct Origin IP (No WAF)'
  | 'Cloudflare Enterprise WAF'
  | 'Akamai EdgeGuard / Fastly'
  | 'AWS WAF + Shield'
  | 'Strict Ingress Filtering';

export type PrivilegeLevel =
  | 'Domain Admin / SYSTEM'
  | 'Local Admin / Sudoer'
  | 'Standard User'
  | 'Sandboxed / AppContainer';

export interface VictimSimulationProfile {
  id?: string;
  name: string;
  os: OperatingSystem;
  edr: EDRSolution;
  waf: WAFSolution;
  patchDelayDays: number; // 0 to 180
  privilegeLevel: PrivilegeLevel;
  mfaEnforced: boolean;
  networkMicrosegmentation: boolean;
  powershellConstrained: boolean;
  activeCveVulnerability: boolean;
  isolatedQuarantine: boolean;
}

export interface BreachFactor {
  name: string;
  impact: number; // e.g. +18 or -22
  description: string;
  category: 'payload_capability' | 'defense_mitigation' | 'target_exposure' | 'evasion_synergy';
  type: 'bonus' | 'penalty' | 'neutral';
}

export interface BreachSimulationResult {
  score: number; // 0 - 100
  confidenceInterval: [number, number];
  riskTier: 'Critical / Imminent' | 'High Risk' | 'Moderate Risk' | 'Low / Contained';
  factors: BreachFactor[];
  timeToCompromise: string;
  detectionRisk: 'Low' | 'Medium' | 'High' | 'Guaranteed';
  primaryBarrier: string;
  recommendedAction: string;
  matchedVulnerabilities: string[];
  osCompatibility: 'Optimal' | 'Partial / Emulated' | 'Incompatible';
}

export const TARGET_SECURITY_PRESETS: { name: string; description: string; profile: VictimSimulationProfile }[] = [
  {
    name: 'Legacy Enterprise Server',
    description: 'Unpatched Windows Server 2022 with minimal EDR and weak perimeter isolation',
    profile: {
      name: 'Legacy Enterprise Server',
      os: 'Windows Server 2022',
      edr: 'Windows Defender Standard',
      waf: 'Direct Origin IP (No WAF)',
      patchDelayDays: 95,
      privilegeLevel: 'Local Admin / Sudoer',
      mfaEnforced: false,
      networkMicrosegmentation: false,
      powershellConstrained: false,
      activeCveVulnerability: true,
      isolatedQuarantine: false,
    },
  },
  {
    name: 'Cloudflare Protected Web Origin',
    description: 'Direct origin web server fronted by Cloudflare CDN with delayed patching',
    profile: {
      name: 'Cloudflare Protected Web Origin',
      os: 'Ubuntu 24.04 LTS',
      edr: 'None / Disabled',
      waf: 'Cloudflare Enterprise WAF',
      patchDelayDays: 45,
      privilegeLevel: 'Standard User',
      mfaEnforced: true,
      networkMicrosegmentation: false,
      powershellConstrained: false,
      activeCveVulnerability: true,
      isolatedQuarantine: false,
    },
  },
  {
    name: 'Hardened Zero-Trust Bank Node',
    description: 'Tier-0 workstation running CrowdStrike Falcon with microsegmentation and FIDO2 MFA',
    profile: {
      name: 'Hardened Zero-Trust Bank Node',
      os: 'Windows 11 Enterprise',
      edr: 'CrowdStrike Falcon Complete',
      waf: 'Strict Ingress Filtering',
      patchDelayDays: 7,
      privilegeLevel: 'Standard User',
      mfaEnforced: true,
      networkMicrosegmentation: true,
      powershellConstrained: true,
      activeCveVulnerability: false,
      isolatedQuarantine: false,
    },
  },
  {
    name: 'Active Directory Domain Controller',
    description: 'High-value identity target with Defender ATP and NTLM relay exposure',
    profile: {
      name: 'Active Directory Domain Controller',
      os: 'Windows Server 2022',
      edr: 'Microsoft Defender for Endpoint (ATP)',
      waf: 'Direct Origin IP (No WAF)',
      patchDelayDays: 60,
      privilegeLevel: 'Domain Admin / SYSTEM',
      mfaEnforced: false,
      networkMicrosegmentation: true,
      powershellConstrained: false,
      activeCveVulnerability: true,
      isolatedQuarantine: false,
    },
  },
  {
    name: 'Production Kubernetes Cluster Node',
    description: 'Cloud container environment running Linux with minimal container escape guards',
    profile: {
      name: 'Production Kubernetes Cluster Node',
      os: 'Kubernetes Pod (Linux)',
      edr: 'SentinelOne Singularity XDR',
      waf: 'AWS WAF + Shield',
      patchDelayDays: 30,
      privilegeLevel: 'Local Admin / Sudoer',
      mfaEnforced: true,
      networkMicrosegmentation: false,
      powershellConstrained: false,
      activeCveVulnerability: false,
      isolatedQuarantine: false,
    },
  },
];

/**
 * Converts a Victim instance from app state into a simulation profile
 */
export function convertVictimToProfile(victim: Victim): VictimSimulationProfile {
  let os: OperatingSystem = 'Windows 11 Enterprise';
  if (victim.os.toLowerCase().includes('server')) {
    os = 'Windows Server 2022';
  } else if (victim.os.toLowerCase().includes('ubuntu') || victim.os.toLowerCase().includes('linux')) {
    os = 'Ubuntu 24.04 LTS';
  } else if (victim.os.toLowerCase().includes('macos')) {
    os = 'macOS Sonoma 14.4';
  }

  let waf: WAFSolution = 'Direct Origin IP (No WAF)';
  if (victim.proxyProvider?.toLowerCase().includes('cloudflare')) {
    waf = 'Cloudflare Enterprise WAF';
  } else if (victim.proxyProvider?.toLowerCase().includes('akamai')) {
    waf = 'Akamai EdgeGuard / Fastly';
  }

  const isLost = victim.status === 'lost';
  const isIdle = victim.status === 'idle';

  return {
    id: victim.id,
    name: `${victim.id} (${victim.domain || victim.ip})`,
    os,
    edr: isLost ? 'CrowdStrike Falcon Complete' : isIdle ? 'Microsoft Defender for Endpoint (ATP)' : 'Windows Defender Standard',
    waf,
    patchDelayDays: isLost ? 14 : isIdle ? 35 : 75,
    privilegeLevel: isLost ? 'Standard User' : 'Local Admin / Sudoer',
    mfaEnforced: isLost,
    networkMicrosegmentation: isLost,
    powershellConstrained: isLost,
    activeCveVulnerability: !isLost,
    isolatedQuarantine: isLost,
  };
}

/**
 * Theoretical Breach Probability calculation engine
 */
export function calculateBreachProbability(
  payload: Payload,
  profile: VictimSimulationProfile
): BreachSimulationResult {
  const factors: BreachFactor[] = [];
  let score = 50; // Neutral baseline

  const tags = payload.tags || [];
  const payloadCmd = payload.command.toLowerCase();

  // 1. Intrinsic Payload Capability
  if (payload.category === 'Infiltration') {
    score += 8;
    factors.push({
      name: 'Category: Infiltration Module',
      impact: 8,
      description: 'Engineered specifically for perimeter penetration and entry',
      category: 'payload_capability',
      type: 'bonus',
    });
  } else if (payload.category === 'Destruction') {
    score += 5;
    factors.push({
      name: 'Category: Destructive Payload',
      impact: 5,
      description: 'Aggressive execution behavior with minimal stealth fallback',
      category: 'payload_capability',
      type: 'bonus',
    });
  } else if (payload.category === 'Exfiltration') {
    score += 6;
    factors.push({
      name: 'Category: Exfiltration Engine',
      impact: 6,
      description: 'Optimized for stealth data staging and covert tunneling',
      category: 'payload_capability',
      type: 'bonus',
    });
  }

  // Tags & Exploit Features
  if (tags.includes('Zero-Day')) {
    score += 16;
    factors.push({
      name: 'Zero-Day Weaponization',
      impact: 16,
      description: 'Leverages undisclosed or unpatched vulnerability logic',
      category: 'payload_capability',
      type: 'bonus',
    });
  }

  if (tags.includes('EDR-Bypass') || tags.includes('Kernel-Mode')) {
    score += 15;
    factors.push({
      name: 'EDR Hook Unhooking & Kernel Elevation',
      impact: 15,
      description: 'Neutralizes sensor inline API hooks (NTDLL masking / direct syscalls)',
      category: 'payload_capability',
      type: 'bonus',
    });
  }

  if (tags.includes('Direct-Origin') || tags.includes('Cloudflare-Bypass')) {
    score += 14;
    factors.push({
      name: 'Direct Origin Uncloaking',
      impact: 14,
      description: 'Bypasses reverse-proxy WAFs by connecting directly to exposed origin socket',
      category: 'payload_capability',
      type: 'bonus',
    });
  }

  if (tags.includes('Memory-Only') || tags.includes('Stealth')) {
    score += 10;
    factors.push({
      name: 'Memory-Resident Execution (Fileless)',
      impact: 10,
      description: 'Zero disk artifacts minimize static antivirus inspection detection',
      category: 'payload_capability',
      type: 'bonus',
    });
  }

  // 2. OS Compatibility Matrix
  let osCompatibility: 'Optimal' | 'Partial / Emulated' | 'Incompatible' = 'Optimal';

  const isWindowsTarget = profile.os.includes('Windows');
  const isLinuxTarget = profile.os.includes('Ubuntu') || profile.os.includes('RHEL') || profile.os.includes('Linux');
  const isMacTarget = profile.os.includes('macOS');
  const isK8sTarget = profile.os.includes('Kubernetes');

  const isWindowsPayload = payload.type === 'Executable' || payloadCmd.includes('.exe') || payloadCmd.includes('.dll') || payloadCmd.includes('powershell');
  const isShellPayload = payloadCmd.includes('.sh') || payloadCmd.includes('bash');
  const isPythonOrGo = payloadCmd.includes('python') || payloadCmd.includes('beacontunnel');

  if (isWindowsTarget && isWindowsPayload) {
    score += 10;
    factors.push({
      name: 'Native Windows Binary Architecture',
      impact: 10,
      description: 'Direct Win32/PE runtime execution synergy',
      category: 'evasion_synergy',
      type: 'bonus',
    });
  } else if ((isLinuxTarget || isK8sTarget) && isShellPayload) {
    score += 12;
    factors.push({
      name: 'Native Linux Shell Scripting Synergy',
      impact: 12,
      description: 'Direct execution via standard POSIX shell interpreter',
      category: 'evasion_synergy',
      type: 'bonus',
    });
  } else if (isPythonOrGo) {
    score += 8;
    factors.push({
      name: 'Cross-Platform Runtime (Go/Python)',
      impact: 8,
      description: 'High portability across operating systems and container nodes',
      category: 'evasion_synergy',
      type: 'bonus',
    });
  } else if (isLinuxTarget && isWindowsPayload) {
    score -= 45;
    osCompatibility = 'Incompatible';
    factors.push({
      name: 'OS Architecture Mismatch',
      impact: -45,
      description: 'Windows binary execution cannot launch natively on Linux target',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  } else if (isWindowsTarget && isShellPayload) {
    score -= 30;
    osCompatibility = 'Partial / Emulated';
    factors.push({
      name: 'Shell Script on Windows Target',
      impact: -30,
      description: 'Requires WSL, Cygwin, or Git Bash layer to interpret POSIX commands',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  } else if (isMacTarget && !isPythonOrGo) {
    score -= 20;
    osCompatibility = 'Partial / Emulated';
    factors.push({
      name: 'macOS Gatekeeper / ARM64 Translation',
      impact: -20,
      description: 'Apple Silicon notarization barrier impedes unsigned payloads',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  }

  // 3. EDR Mitigation & Evasion Checks
  if (profile.edr === 'CrowdStrike Falcon Complete') {
    if (tags.includes('EDR-Bypass') || tags.includes('Kernel-Mode')) {
      score -= 8;
      factors.push({
        name: 'CrowdStrike Falcon (Evaded via NTDLL Hooks)',
        impact: -8,
        description: 'Advanced sensor active, but mitigated by direct syscall evasion',
        category: 'evasion_synergy',
        type: 'penalty',
      });
    } else {
      score -= 32;
      factors.push({
        name: 'CrowdStrike Falcon Complete Active',
        impact: -32,
        description: 'Kernel behavioral heuristics block unmasked process hollowing',
        category: 'defense_mitigation',
        type: 'penalty',
      });
    }
  } else if (profile.edr === 'SentinelOne Singularity XDR') {
    if (tags.includes('Memory-Only') || tags.includes('EDR-Bypass')) {
      score -= 7;
      factors.push({
        name: 'SentinelOne XDR (Memory Masking Active)',
        impact: -7,
        description: 'Static heuristic evasion prevents immediate quarantine',
        category: 'evasion_synergy',
        type: 'penalty',
      });
    } else {
      score -= 26;
      factors.push({
        name: 'SentinelOne Singularity XDR Interception',
        impact: -26,
        description: 'Behavioral engine flags unauthorized child process spawning',
        category: 'defense_mitigation',
        type: 'penalty',
      });
    }
  } else if (profile.edr === 'Microsoft Defender for Endpoint (ATP)') {
    score -= 16;
    factors.push({
      name: 'Microsoft Defender ATP Cloud Heuristics',
      impact: -16,
      description: 'Cloud-delivered protection examines file hashes and parent lineage',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  } else if (profile.edr === 'Windows Defender Standard') {
    score -= 8;
    factors.push({
      name: 'Baseline Antivirus Signature Scanning',
      impact: -8,
      description: 'Basic on-access scanner with standard definition catalog',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  } else if (profile.edr === 'None / Disabled') {
    score += 15;
    factors.push({
      name: 'Zero Host EDR Protection',
      impact: 15,
      description: 'No runtime sensor or behavioral telemetry running on victim host',
      category: 'target_exposure',
      type: 'bonus',
    });
  }

  // 4. Perimeter & WAF Checks
  if (profile.waf === 'Cloudflare Enterprise WAF' || profile.waf === 'Akamai EdgeGuard / Fastly') {
    if (tags.includes('Direct-Origin') || tags.includes('Cloudflare-Bypass')) {
      score += 10;
      factors.push({
        name: 'Edge WAF Bypassed (Direct Origin Route)',
        impact: 10,
        description: 'Connecting directly to host origin IP circumvents edge rules',
        category: 'evasion_synergy',
        type: 'bonus',
      });
    } else {
      score -= 25;
      factors.push({
        name: 'Enterprise Edge Reverse-Proxy WAF',
        impact: -25,
        description: 'TLS fingerprinting and Bot Management intercept inbound payloads',
        category: 'defense_mitigation',
        type: 'penalty',
      });
    }
  } else if (profile.waf === 'Direct Origin IP (No WAF)') {
    score += 14;
    factors.push({
      name: 'Unprotected Direct Ingress',
      impact: 14,
      description: 'Direct layer 4 access with no reverse proxy or inspection shield',
      category: 'target_exposure',
      type: 'bonus',
    });
  } else if (profile.waf === 'Strict Ingress Filtering') {
    score -= 18;
    factors.push({
      name: 'Hardened Firewall Port Whitelisting',
      impact: -18,
      description: 'Non-standard port beacons and reverse listeners blocked',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  }

  // 5. Patch Cadence & Known CVE Exposure
  if (profile.patchDelayDays >= 90) {
    score += 18;
    factors.push({
      name: `Critical Patch Lag (${profile.patchDelayDays} Days)`,
      impact: 18,
      description: 'System lacks quarterly rollups; known CVE exploits remain viable',
      category: 'target_exposure',
      type: 'bonus',
    });
  } else if (profile.patchDelayDays >= 30) {
    score += 8;
    factors.push({
      name: `Moderate Patch Delay (${profile.patchDelayDays} Days)`,
      impact: 8,
      description: 'N-Day vulnerability exposure window open',
      category: 'target_exposure',
      type: 'bonus',
    });
  } else if (profile.patchDelayDays <= 7) {
    score -= 14;
    factors.push({
      name: 'Prompt Patch Cadence (Zero-Day Shielded)',
      impact: -14,
      description: 'All public CVE definitions and microcode mitigations current',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  }

  if (profile.activeCveVulnerability) {
    score += 12;
    factors.push({
      name: 'Active Target CVE Match Confirmed',
      impact: 12,
      description: 'Target profile matches known vulnerability exploited by payload',
      category: 'target_exposure',
      type: 'bonus',
    });
  }

  // 6. Access Privilege Level
  if (profile.privilegeLevel === 'Domain Admin / SYSTEM') {
    score += 16;
    factors.push({
      name: 'Tier-0 Execution Context (SYSTEM/Domain Admin)',
      impact: 16,
      description: 'Payload inherits full administrative access and token impersonation',
      category: 'target_exposure',
      type: 'bonus',
    });
  } else if (profile.privilegeLevel === 'Local Admin / Sudoer') {
    score += 8;
    factors.push({
      name: 'Local Administrative Context',
      impact: 8,
      description: 'Privilege elevation barrier already cleared',
      category: 'target_exposure',
      type: 'bonus',
    });
  } else if (profile.privilegeLevel === 'Sandboxed / AppContainer') {
    score -= 22;
    factors.push({
      name: 'Sandboxed Restricted Shell / Low-Integrity',
      impact: -22,
      description: 'Process restricted from inter-process memory injection or raw disk IO',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  }

  // 7. Security Hardening Toggles
  if (profile.mfaEnforced) {
    score -= 10;
    factors.push({
      name: 'FIDO2 / Hardware MFA Enforced',
      impact: -10,
      description: 'Prevents credential re-use or automated lateral pass-the-hash',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  }

  if (profile.networkMicrosegmentation) {
    score -= 12;
    factors.push({
      name: 'Zero-Trust Microsegmentation Active',
      impact: -12,
      description: 'Lateral egress blocked to neighboring subnets and identity controllers',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  }

  if (profile.powershellConstrained && payloadCmd.includes('powershell')) {
    score -= 20;
    factors.push({
      name: 'PowerShell Constrained Language Mode',
      impact: -20,
      description: 'Disables direct Win32 API invocation and custom object instantiation',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  }

  if (profile.isolatedQuarantine) {
    score -= 35;
    factors.push({
      name: 'Host in Incident Isolation / Quarantine',
      impact: -35,
      description: 'Inbound and outbound sockets disconnected by security response team',
      category: 'defense_mitigation',
      type: 'penalty',
    });
  }

  // Clamp score to realistic range: 2% to 99%
  const finalScore = Math.max(2, Math.min(99, Math.round(score)));

  // Compute confidence interval
  const margin = Math.max(3, Math.min(7, Math.round(10 - (factors.length / 4))));
  const lowBound = Math.max(1, finalScore - margin);
  const highBound = Math.min(99, finalScore + margin);

  // Determine Risk Tier
  let riskTier: BreachSimulationResult['riskTier'] = 'Low / Contained';
  if (finalScore >= 80) {
    riskTier = 'Critical / Imminent';
  } else if (finalScore >= 60) {
    riskTier = 'High Risk';
  } else if (finalScore >= 35) {
    riskTier = 'Moderate Risk';
  }

  // Compute Time to Compromise (TTC)
  let timeToCompromise = 'Indefinite / Blocked';
  if (finalScore >= 90) {
    timeToCompromise = '< 18 seconds';
  } else if (finalScore >= 80) {
    timeToCompromise = '1.2 - 2.5 minutes';
  } else if (finalScore >= 65) {
    timeToCompromise = '6 - 12 minutes';
  } else if (finalScore >= 45) {
    timeToCompromise = '45 - 90 minutes';
  } else if (finalScore >= 25) {
    timeToCompromise = '4 - 8 hours';
  }

  // Compute Detection Horizon
  let detectionRisk: BreachSimulationResult['detectionRisk'] = 'Guaranteed';
  if (tags.includes('Stealth') || tags.includes('Memory-Only')) {
    detectionRisk = finalScore > 75 ? 'Low' : 'Medium';
  } else if (finalScore > 85) {
    detectionRisk = 'Low';
  } else if (finalScore > 50) {
    detectionRisk = 'Medium';
  } else {
    detectionRisk = 'High';
  }

  // Primary defensive barrier
  let primaryBarrier = 'None (Clear Vector)';
  const topPenalty = factors
    .filter((f) => f.type === 'penalty')
    .sort((a, b) => a.impact - b.impact)[0];
  if (topPenalty) {
    primaryBarrier = `${topPenalty.name} (${topPenalty.impact}%)`;
  }

  // Tactical Recommendations
  let recommendedAction = 'Maintain standard monitoring and threat telemetry';
  if (finalScore >= 80) {
    recommendedAction = 'Deploy immediate egress killswitch and revoke active Kerberos TGT tickets';
  } else if (finalScore >= 60) {
    recommendedAction = 'Enforce host microsegmentation and isolate direct origin DNS records';
  } else if (osCompatibility === 'Incompatible') {
    recommendedAction = 'Switch to a cross-platform (Go/Python) or native architecture payload';
  } else if (profile.waf.includes('Cloudflare') && !tags.includes('Direct-Origin')) {
    recommendedAction = 'Target uncloaked direct origin IP to bypass Cloudflare reverse-proxy';
  } else if (profile.edr.includes('CrowdStrike') && !tags.includes('EDR-Bypass')) {
    recommendedAction = 'Compile module with NTDLL direct syscall unhooking or kernel driver';
  }

  // Matched CVEs
  const matchedVulnerabilities = payload.vulnerabilityCoverage
    ? payload.vulnerabilityCoverage.slice(0, 3).map((v) => `${v.id}: ${v.name}`)
    : ['CVE-2024-ORIGIN: Cloudflare Origin Leak', 'ATT&CK-T1055: Process Injection'];

  return {
    score: finalScore,
    confidenceInterval: [lowBound, highBound],
    riskTier,
    factors,
    timeToCompromise,
    detectionRisk,
    primaryBarrier,
    recommendedAction,
    matchedVulnerabilities,
    osCompatibility,
  };
}
