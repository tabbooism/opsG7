/**
 * Data model for the Signal Archive dashboard.
 * All records are mock planning data. No live systems, credentials, or execution channels are contacted.
 */

export const CONFIG = {
  USE_MOCK_DATA: true,
  REFRESH_INTERVAL_MS: 5000,
  OSINT_REFRESH_INTERVAL_MS: 10000,
  SESSION_TIMEOUT_MS: 15 * 60 * 1000,
  API_ENDPOINTS: {
    osint: "",
    advisories: "",
    telemetry: "",
  },
} as const;

export type OperationPhase =
  | "Recon"
  | "Validation"
  | "Delivery Simulation"
  | "Access Review"
  | "Detection"
  | "Reporting";

export type OperationStatus = "Active" | "Planning" | "Paused" | "Complete";

export interface Operation {
  id: string;
  name: string;
  sector: string;
  phase: OperationPhase;
  status: OperationStatus;
  started: string;
  lead: string;
  risk: "Low" | "Moderate" | "High";
  scope: string;
  objective: string;
  roe: string;
  timeline: string[];
}

export interface Task {
  id: string;
  title: string;
  phase: "To Do" | "In Progress" | "Blocked" | "Completed";
  owner: string;
  priority: "Low" | "Moderate" | "High";
}

export interface OsintItem {
  id: string;
  timestamp: string;
  source: "News" | "Code Repo" | "Forum" | "Social" | "Advisory";
  sentiment: "Neutral" | "Watch" | "Elevated";
  relevance: number;
  summary: string;
  url: string;
}

export const baseOperations: Operation[] = [
  {
    id: "OP-24-018",
    name: "Northstar Access Review",
    sector: "Fintech",
    phase: "Validation",
    status: "Active",
    started: "2026-08-11",
    lead: "M. Rivera",
    risk: "Moderate",
    scope: "Approved identity, endpoint, and cloud-control validation for a named pilot group.",
    objective: "Measure control visibility across pre-approved access paths without collecting credentials or altering systems.",
    roe: "Written authorization; stop on unapproved assets; observation-only evidence; daily client checkpoint.",
    timeline: ["Scope approved", "Evidence plan issued", "Validation window active"],
  },
  {
    id: "OP-24-017",
    name: "Meridian Supplier Drill",
    sector: "Manufacturing",
    phase: "Delivery Simulation",
    status: "Planning",
    started: "2026-08-18",
    lead: "A. Chen",
    risk: "Low",
    scope: "Consent-based awareness simulation across the supplier-management training cohort.",
    objective: "Assess reporting paths and decision latency around synthetic supplier-change requests.",
    roe: "No external delivery; no credential prompts; approved audience only; immediate stop on confusion or distress.",
    timeline: ["Scenario drafted", "Legal review pending", "Participant list pending"],
  },
  {
    id: "OP-24-013",
    name: "Cedar Cloud Posture",
    sector: "Healthcare",
    phase: "Reporting",
    status: "Complete",
    started: "2026-07-29",
    lead: "S. Patel",
    risk: "High",
    scope: "Authorized review of configuration evidence supplied by the client security team.",
    objective: "Prioritize cloud-control gaps and document remediation ownership.",
    roe: "Evidence-only review; no production modification; client data remains within client-approved systems.",
    timeline: ["Evidence intake complete", "Control review complete", "Report in quality review"],
  },
];

export const baseTasks: Task[] = [
  { id: "TK-01", title: "Confirm named-scope inventory", phase: "To Do", owner: "M. Rivera", priority: "High" },
  { id: "TK-02", title: "Review alert-routing evidence", phase: "In Progress", owner: "S. Patel", priority: "Moderate" },
  { id: "TK-03", title: "Resolve training audience consent", phase: "Blocked", owner: "A. Chen", priority: "High" },
  { id: "TK-04", title: "Package remediation narrative", phase: "Completed", owner: "J. Okafor", priority: "Low" },
];

export const baseOsint: OsintItem[] = [
  { id: "SIG-481", timestamp: "14:32:08Z", source: "Advisory", sentiment: "Elevated", relevance: 92, summary: "Identity-provider advisory tagged for review against the current access-validation scope.", url: "https://example.invalid/advisory" },
  { id: "SIG-480", timestamp: "14:20:45Z", source: "News", sentiment: "Watch", relevance: 76, summary: "Sector reporting highlights renewed emphasis on third-party change verification workflows.", url: "https://example.invalid/news" },
  { id: "SIG-479", timestamp: "13:58:12Z", source: "Code Repo", sentiment: "Neutral", relevance: 64, summary: "Dependency-maintenance discussion identified for awareness review; no customer linkage asserted.", url: "https://example.invalid/code" },
  { id: "SIG-478", timestamp: "13:40:09Z", source: "Forum", sentiment: "Watch", relevance: 58, summary: "Credential-hygiene discussion added to analyst queue as a general pattern, not an attribution claim.", url: "https://example.invalid/forum" },
  { id: "SIG-477", timestamp: "13:15:20Z", source: "Social", sentiment: "Neutral", relevance: 45, summary: "Public conversation on synthetic identity screening added as a context signal.", url: "https://example.invalid/social" },
];

export const dataService = {
  async getMetrics() {
    return {
      activeOperations: 2,
      sandboxEndpoints: 18,
      openAlerts: 4,
      osintSignals: 27,
      teamReadiness: 86,
      pendingReports: 3,
    };
  },
  async getOperations() {
    return baseOperations;
  },
  async getTasks() {
    return baseTasks;
  },
  async getOsintFeed() {
    return baseOsint;
  },
};
