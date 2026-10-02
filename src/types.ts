/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type View = 'dashboard' | 'victims' | 'campaigns' | 'payloads' | 'logs' | 'settings';

export type ThemeMode = 'dark' | 'light';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'Root Administrator' | 'Security Operator' | 'Threat Analyst' | 'Guest Observer';
  provider: 'email' | 'google' | 'facebook';
  lastLogin: string;
  createdAt: string;
}

export interface PushNotificationSettings {
  enabled: boolean;
  criticalIncidents: boolean;
  beaconDropouts: boolean;
  payloadExecutions: boolean;
  suspiciousActivity: boolean;
  soundAlerts: boolean;
  quietHours: boolean;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  emailAddress: string;
  frequency: 'immediate' | 'daily' | 'weekly';
  originIpAlerts: boolean;
  auditLogsBackup: boolean;
  edrEvasionReports: boolean;
  c2FailoverAlerts: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  density: 'compact' | 'normal' | 'spacious';
  autoRefreshInterval: number; // in seconds
  pushNotifications: PushNotificationSettings;
  emailNotifications: EmailNotificationSettings;
  twoFactorEnabled: boolean;
}

export interface Victim {
  id: string;
  ip: string;
  originIp?: string;
  domain?: string;
  os: string;
  status: 'active' | 'idle' | 'lost';
  lastSeen: string;
  country: string;
  city?: string;
  isp?: string;
  ports?: number[];
  proxyProvider?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  channel: string;
}

export interface SuccessRatePoint {
  run: string;
  date: string;
  successRate: number; // 0 - 100 (%)
  attempts: number;
  bypasses: number;
  defenseStatus: string;
  latencyMs: number;
}

export interface VulnerabilityCoverageItem {
  id: string; // e.g. "CVE-2024-21413"
  name: string; // e.g. "NTLM Relay Auth Bypass"
  category: string; // e.g. "Credential Access", "Memory Injection", "WAF Bypass"
  targetSystem: string; // e.g. "Windows Server", "Linux Core", "Cloudflare Origin"
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  coverageRate: number; // 0 - 100 (%)
  cvss: number;
  detectionEvasion: number; // 0 - 100 (%)
}

export interface PayloadTemplateParameter {
  key: string;
  label: string;
  defaultValue: string;
  description?: string;
}

export interface PayloadTemplate {
  id: string;
  name: string;
  description: string;
  type: 'Executable' | 'Script' | 'Library' | 'Document';
  category: 'Infiltration' | 'Persistence' | 'Exfiltration' | 'Destruction';
  tags: string[];
  commandTemplate: string;
  defaultSize?: string;
  parameters?: PayloadTemplateParameter[];
  targetPlatform?: string;
  evasionProfile?: string;
  author?: string;
  createdAt: string;
  usageCount: number;
  isCustom?: boolean;
}

export interface Payload {
  id: string;
  name: string;
  type: 'Executable' | 'Script' | 'Library' | 'Document';
  category: 'Infiltration' | 'Persistence' | 'Exfiltration' | 'Destruction';
  size: string;
  status: 'Ready' | 'Deployed' | 'Deprecated';
  createdAt: string;
  hash: string;
  campaigns: string[];
  command: string;
  tags?: string[];
  successRateTrend?: SuccessRatePoint[];
  vulnerabilityCoverage?: VulnerabilityCoverageItem[];
}

export interface OriginTarget {
  domain: string;
  cloudflareProxy: boolean;
  originIp: string;
  status: 'Resolved' | 'Scanning' | 'Uncovered' | 'Protected';
  nameservers: string[];
  historicalIps: string[];
  latency: string;
  waf: string;
  lastChecked: string;
}
