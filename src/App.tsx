/**
 * Signal Archive design: calm operational confidence, dossier geometry, and evidence-first hierarchy.
 * This component intentionally models authorized planning and mock-data review only.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowRight,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Globe2,
  LayoutDashboard,
  MapPinned,
  Menu,
  Moon,
  Network,
  Plus,
  Radar,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  UsersRound,
  X,
} from "lucide-react";
import {
  CONFIG,
  type Operation,
  type OperationPhase,
  type OsintItem,
  type Task,
  baseOperations,
  baseOsint,
  baseTasks,
  dataService,
} from "@/lib/dataService";

type View =
  | "Overview"
  | "Operations"
  | "OSINT"
  | "APT Profiles"
  | "Scam Analysis"
  | "Validation Library"
  | "Telemetry Lab"
  | "Team"
  | "Reporting"
  | "Settings";

type Toast = { label: string; note: string } | null;

const navItems: { label: View; icon: typeof LayoutDashboard; code: string }[] = [
  { label: "Overview", icon: LayoutDashboard, code: "00" },
  { label: "Operations", icon: Target, code: "01" },
  { label: "OSINT", icon: Radar, code: "02" },
  { label: "APT Profiles", icon: Archive, code: "03" },
  { label: "Scam Analysis", icon: ShieldCheck, code: "04" },
  { label: "Validation Library", icon: ClipboardCheck, code: "05" },
  { label: "Telemetry Lab", icon: Network, code: "06" },
  { label: "Team", icon: UsersRound, code: "07" },
  { label: "Reporting", icon: FileText, code: "08" },
  { label: "Settings", icon: Settings2, code: "09" },
];

const aptProfiles = [
  { name: "Midnight Blizzard", aliases: "APT29 / Cozy Bear", motivation: "Strategic intelligence", sector: "Government & policy", ttp: "T1566, T1078, T1589", triggers: "Authority cues; trusted collaboration channels", tempo: "Patient, staged, evidence-led" },
  { name: "Lazarus Group", aliases: "Hidden Cobra", motivation: "Financial and strategic", sector: "Finance & technology", ttp: "T1195, T1566, T1027", triggers: "Opportunity framing; role-specific urgency", tempo: "Adaptive, campaign-oriented" },
  { name: "Scattered Spider", aliases: "UNC3944", motivation: "Access and financial gain", sector: "Identity-heavy services", ttp: "T1078, T1566, T1098", triggers: "Service-desk pressure; identity trust", tempo: "Fast-moving, socially adaptive" },
  { name: "Volt Typhoon", aliases: "Bronze Silhouette", motivation: "Strategic positioning", sector: "Critical infrastructure", ttp: "T1070, T1078, T1505", triggers: "Operational continuity; trusted admin paths", tempo: "Low-noise, persistent" },
];

const scamVectors = [
  { name: "AI-assisted spear-phishing awareness", likelihood: 82, impact: 78, complexity: 56, approach: "Use an approved fictional persona, fixed training audience, and no credential collection. Measure reporting and escalation only." },
  { name: "Deepfake vishing resilience", likelihood: 67, impact: 86, complexity: 72, approach: "Run a disclosed tabletop call-verification drill using internal role-play and written stop criteria." },
  { name: "Synthetic identity workflow review", likelihood: 61, impact: 73, complexity: 64, approach: "Validate identity-proofing controls with synthetic records supplied by the business, never real applicants." },
  { name: "QR-code handling exercise", likelihood: 74, impact: 65, complexity: 42, approach: "Use harmless training QR codes that route to an internal education page and record aggregate completion only." },
  { name: "Dependency-change verification", likelihood: 57, impact: 83, complexity: 68, approach: "Tabletop package-maintenance approval paths; do not publish, alter, or execute code." },
];

const team = [
  { name: "M. Rivera", role: "Team Lead", availability: "Available", task: "Northstar coordination", load: 3 },
  { name: "A. Chen", role: "Social Engineering", availability: "Review", task: "Supplier drill design", load: 2 },
  { name: "S. Patel", role: "OSINT Analyst", availability: "Available", task: "Signal triage", load: 4 },
  { name: "J. Okafor", role: "Reporting", availability: "Focus", task: "Cedar closeout", load: 3 },
];

const activity = [
  { time: "14:32Z", title: "Advisory linked", note: "Identity review context added to OP-24-018.", tone: "cyan" },
  { time: "14:16Z", title: "Task moved", note: "Alert-routing evidence is now in progress.", tone: "amber" },
  { time: "13:58Z", title: "Report draft saved", note: "Cedar Cloud Posture remains in quality review.", tone: "green" },
  { time: "13:40Z", title: "Scope checkpoint", note: "Supplier drill consent check is blocked pending review.", tone: "red" },
];

function localGet<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function StatusPill({ value }: { value: string }) {
  const tone = /Active|Available|Completed|Complete|Operational/.test(value)
    ? "pill--good"
    : /Blocked|High|Elevated|Alert/.test(value)
      ? "pill--risk"
      : /Planning|Review|Moderate|Watch|Focus/.test(value)
        ? "pill--watch"
        : "pill--quiet";
  return <span className={`pill ${tone}`}>{value}</span>;
}

function SectionTitle({ code, title, detail, action }: { code: string; title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="section-title">
      <div className="dossier-tab"><span>{code}</span><i /></div>
      <div>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      <div className="section-title__action">{action}</div>
    </div>
  );
}

function MiniLineChart() {
  const points = "0,72 44,59 88,64 132,40 176,47 220,24 264,34 308,16 352,27 396,8";
  return (
    <div className="line-chart" aria-label="Mock attack surface changes chart">
      <div className="chart-grid" />
      <svg viewBox="0 0 396 96" preserveAspectRatio="none" role="img">
        <defs><linearGradient id="surface-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8dd5f7" stopOpacity=".30" /><stop offset="100%" stopColor="#8dd5f7" stopOpacity="0" /></linearGradient></defs>
        <polyline fill="url(#surface-fill)" stroke="none" points={`${points} 396,96 0,96`} />
        <polyline fill="none" stroke="#8dd5f7" strokeWidth="2" vectorEffect="non-scaling-stroke" points={points} />
        <circle cx="308" cy="16" r="4" fill="#0b1015" stroke="#e0b167" strokeWidth="2" />
      </svg>
      <div className="chart-caption"><span>07 AUG</span><span>11 AUG</span><span>15 AUG</span><span>17 AUG</span></div>
    </div>
  );
}

function WorldMap() {
  return (
    <div className="world-map" aria-label="Fictional planning geography">
      <div className="map-art" />
      <div className="map-watermark">FICTIONAL PLANNING GEOGRAPHY</div>
      <button className="map-pin map-pin--a" title="Training region alpha"><span /></button>
      <button className="map-pin map-pin--b" title="Training region beta"><span /></button>
      <button className="map-pin map-pin--c" title="Training region gamma"><span /></button>
      <div className="map-legend"><span><i className="legend-dot legend-dot--cyan" /> Scope review</span><span><i className="legend-dot legend-dot--amber" /> Context signal</span></div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("Overview");
  const [railOpen, setRailOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [utc, setUtc] = useState(new Date().toISOString().slice(11, 19));
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toast, setToast] = useState<Toast>(null);
  const [expired, setExpired] = useState(false);
  const [operations, setOperations] = useState<Operation[]>(() => localGet("sa_operations", baseOperations));
  const [tasks, setTasks] = useState<Task[]>(() => localGet("sa_tasks", baseTasks));
  const [osint, setOsint] = useState<OsintItem[]>(() => localGet("sa_osint", baseOsint));
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [newOperationOpen, setNewOperationOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [osintFilter, setOsintFilter] = useState("All");
  const [osintSearch, setOsintSearch] = useState("");
  const [selectedVector, setSelectedVector] = useState(scamVectors[0]);
  const [reportOperation, setReportOperation] = useState(baseOperations[0].id);
  const [settings, setSettings] = useState(() => localGet("sa_settings", { refresh: 5, threshold: 5, osint: true, dark: true }));

  const notice = (label: string, note: string) => {
    setToast({ label, note });
    window.setTimeout(() => setToast(null), 3400);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    setSettings((current: typeof settings) => ({ ...current, dark }));
  }, [dark]);

  useEffect(() => saveLocal("sa_operations", operations), [operations]);
  useEffect(() => saveLocal("sa_tasks", tasks), [tasks]);
  useEffect(() => saveLocal("sa_osint", osint), [osint]);
  useEffect(() => saveLocal("sa_settings", settings), [settings]);

  useEffect(() => {
    const tick = () => setUtc(new Date().toISOString().slice(11, 19));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setLastUpdated(new Date()), settings.refresh * 1000);
    return () => window.clearInterval(id);
  }, [settings.refresh]);

  useEffect(() => {
    let timeout = 0;
    const reset = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setExpired(true), CONFIG.SESSION_TIMEOUT_MS);
    };
    ["mousemove", "keydown", "touchstart", "click"].forEach((event) => window.addEventListener(event, reset));
    reset();
    return () => {
      window.clearTimeout(timeout);
      ["mousemove", "keydown", "touchstart", "click"].forEach((event) => window.removeEventListener(event, reset));
    };
  }, []);

  useEffect(() => {
    void dataService.getMetrics();
  }, []);

  const filteredOsint = useMemo(() => osint.filter((item) => {
    const sourceMatches = osintFilter === "All" || item.source === osintFilter;
    const textMatches = `${item.summary} ${item.source}`.toLowerCase().includes(osintSearch.toLowerCase());
    return sourceMatches && textMatches;
  }), [osint, osintFilter, osintSearch]);

  const addOperation = (form: FormData) => {
    const name = String(form.get("name") || "Untitled simulation").trim();
    const op: Operation = {
      id: `OP-24-${String(20 + operations.length).padStart(3, "0")}`,
      name,
      sector: String(form.get("sector") || "General"),
      phase: "Recon",
      status: "Planning",
      started: new Date().toISOString().slice(0, 10),
      lead: "Unassigned",
      risk: "Low",
      scope: "Local planning record. Add the written authorization reference before activation.",
      objective: "Document a safe, consent-based validation objective.",
      roe: "No execution, no credential collection, no external targeting, and explicit stop criteria.",
      timeline: ["Planning record created"],
    };
    setOperations((current) => [op, ...current]);
    setNewOperationOpen(false);
    notice("Operation saved", "A local planning record was added; no external action was taken.");
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((current) => [...current, { id: `TK-${String(current.length + 1).padStart(2, "0")}`, title: newTask, phase: "To Do", owner: "Unassigned", priority: "Moderate" }]);
    setNewTask("");
  };

  const moveTask = (id: string, phase: Task["phase"]) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, phase } : task));
  };

  const exportItems = (type: "json" | "csv") => {
    const payload = type === "json"
      ? JSON.stringify(filteredOsint, null, 2)
      : ["timestamp,source,sentiment,relevance,summary,url", ...filteredOsint.map((item) => `${item.timestamp},${item.source},${item.sentiment},${item.relevance},"${item.summary.replaceAll('"', '""')}",${item.url}`)].join("\n");
    const blob = new Blob([payload], { type: type === "json" ? "application/json" : "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `signal-archive-osint.${type}`;
    link.click();
    URL.revokeObjectURL(link.href);
    notice("Export prepared", `The filtered OSINT queue downloaded as ${type.toUpperCase()}.`);
  };

  const downloadReport = () => {
    const op = operations.find((item) => item.id === reportOperation) ?? operations[0];
    const text = `# ${op.name}\n\n> Authorized-use planning report generated locally.\n\n## Scope\n${op.scope}\n\n## Objective\n${op.objective}\n\n## Rules of Engagement\n${op.roe}\n\n## Timeline\n${op.timeline.map((item) => `- ${item}`).join("\n")}\n\n## Findings placeholder\nAdd approved, evidence-based findings here.\n`;
    const blob = new Blob([text], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${op.id.toLowerCase()}-report.md`;
    link.click();
    URL.revokeObjectURL(link.href);
    notice("Report downloaded", "The local Markdown report contains only planning data and placeholders.");
  };

  const clearLocalData = () => {
    ["sa_operations", "sa_tasks", "sa_osint", "sa_settings"].forEach((key) => window.localStorage.removeItem(key));
    setOperations(baseOperations);
    setTasks(baseTasks);
    setOsint(baseOsint);
    notice("Local data reset", "The dashboard returned to its built-in mock records.");
  };

  const renderOverview = () => (
    <div className="view-stack">
      <SectionTitle code="00" title="Operational overview" detail="Local mock data · authorized planning workspace · refreshed ${lastUpdated.toISOString().slice(11, 19)}Z" action={<button className="button button--quiet" onClick={() => notice("Evidence bundle", "A local review checklist is ready to assemble.")}><Archive size={15} /> Review bundle</button>} />
      <div className="metric-strip">
        {[
          ["02", "Active operations", "Within named scope", Target],
          ["18", "Sandbox endpoints", "Mock observability", Network],
          ["04", "Open alerts · 24h", "Needs triage", AlertTriangle],
          ["27", "OSINT signals", "Context queue", Radar],
          ["86%", "Team readiness", "Capability coverage", UsersRound],
          ["03", "Pending reports", "Quality review", FileText],
        ].map(([value, label, note, Icon]) => {
          const CardIcon = Icon as typeof Target;
          return <div className="metric-card" key={label as string}><CardIcon size={16} /><span className="metric-card__value">{value as string}</span><span className="metric-card__label">{label as string}</span><small>{note as string}</small></div>;
        })}
      </div>
      <div className="overview-grid">
        <section className="panel panel--surface"><div className="panel__header"><div><span className="eyebrow">SURFACE TRACE / 30 DAYS</span><h2>Attack surface changes</h2></div><StatusPill value="Mock live" /></div><MiniLineChart /><div className="panel__footer"><span>Context variation</span><span className="text-cyan">+12.4% review volume</span></div></section>
        <section className="panel map-panel"><div className="panel__header"><div><span className="eyebrow">SCOPED GEOGRAPHY</span><h2>Planning regions</h2></div><MapPinned size={18} className="text-cyan" /></div><WorldMap /></section>
        <section className="panel activity-panel"><div className="panel__header"><div><span className="eyebrow">AUDIT TRAIL</span><h2>Live activity</h2></div><button className="icon-button" onClick={() => notice("Activity feed", "This mock activity list is stored in-memory.")}><ChevronRight size={16} /></button></div><div className="activity-list">{activity.map((item) => <div className="activity-row" key={item.time}><span className={`activity-dot activity-dot--${item.tone}`} /><div><div className="activity-row__top"><b>{item.title}</b><code>{item.time}</code></div><p>{item.note}</p></div></div>)}</div><button className="button button--wide button--quiet" onClick={() => setView("Reporting")}>Open audit-ready report <ArrowRight size={14} /></button></section>
      </div>
      <section className="ops-banner"><div><span className="eyebrow">AUTHORISATION CHECKPOINT</span><h2>Surface the next decision, not more noise.</h2><p>Every workflow in this build remains local, mock-data based, and intended for documented exercises and control reviews.</p></div><button className="button button--cyan" onClick={() => setView("Operations")}>Open operation register <ArrowRight size={15} /></button></section>
    </div>
  );

  const renderOperations = () => (
    <div className="view-stack">
      <SectionTitle code="01" title="Operation register" detail="Engagements, rules of engagement, and task-state tracking — stored only in this browser." action={<button className="button button--cyan" onClick={() => setNewOperationOpen(true)}><Plus size={15} /> Add operation</button>} />
      <section className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Operation</th><th>Sector</th><th>Phase</th><th>Status</th><th>Start</th><th>Lead</th><th>Risk</th><th /></tr></thead><tbody>{operations.map((op) => <tr key={op.id}><td><b>{op.name}</b><code>{op.id}</code></td><td>{op.sector}</td><td><span className="phase-mark">{op.phase}</span></td><td><StatusPill value={op.status} /></td><td><code>{op.started}</code></td><td>{op.lead}</td><td><StatusPill value={op.risk} /></td><td><button className="text-button" onClick={() => setSelectedOperation(op)}>View details <ChevronRight size={14} /></button></td></tr>)}</tbody></table></div></section>
      <div className="kanban-heading"><div><span className="eyebrow">LOCAL WORKBOARD</span><h2>Validation task flow</h2></div><div className="add-task"><input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addTask()} placeholder="Add a scoped task" /><button className="button button--quiet" onClick={addTask}><Plus size={14} /> Add</button></div></div>
      <div className="kanban">{(["To Do", "In Progress", "Blocked", "Completed"] as Task["phase"][]).map((phase) => <section className="kanban-column" key={phase}><div className="kanban-column__head"><span>{phase}</span><b>{tasks.filter((task) => task.phase === phase).length}</b></div><div className="kanban-stack">{tasks.filter((task) => task.phase === phase).map((task) => <article className="task-card" key={task.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", task.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); moveTask(event.dataTransfer.getData("text/plain"), phase); }}><div className="task-card__line"><StatusPill value={task.priority} /><code>{task.id}</code></div><b>{task.title}</b><div className="task-card__footer"><span>{task.owner}</span><select aria-label={`Move ${task.title}`} value={task.phase} onChange={(event) => moveTask(task.id, event.target.value as Task["phase"])}><option>To Do</option><option>In Progress</option><option>Blocked</option><option>Completed</option></select></div></article>)}</div></section>)}</div>
    </div>
  );

  const renderOsint = () => (
    <div className="view-stack">
      <SectionTitle code="02" title="OSINT context queue" detail="Mock aggregate signals for analyst workflow design. External retrieval is intentionally disabled in this local build." action={<div className="button-group"><button className="button button--quiet" onClick={() => exportItems("csv")}><Download size={14} /> CSV</button><button className="button button--quiet" onClick={() => exportItems("json")}><Download size={14} /> JSON</button></div>} />
      <div className="filter-bar"><div className="search-field"><Search size={15} /><input value={osintSearch} onChange={(event) => setOsintSearch(event.target.value)} placeholder="Search summaries or sources" /></div><div className="source-chips">{["All", "Advisory", "News", "Code Repo", "Forum", "Social"].map((source) => <button key={source} onClick={() => setOsintFilter(source)} className={osintFilter === source ? "chip chip--active" : "chip"}>{source}</button>)}</div><button className="button button--quiet" onClick={() => notice("Integrations disabled", "Configure endpoint placeholders locally, then implement a reviewed backend before any live retrieval.")}><SlidersHorizontal size={14} /> Sources</button></div>
      <div className="osint-layout"><section className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Timestamp</th><th>Source</th><th>Summary</th><th>Signal</th><th>Relevance</th><th /></tr></thead><tbody>{filteredOsint.map((item) => <tr key={item.id}><td><code>{item.timestamp}</code></td><td><span className="source-label">{item.source}</span></td><td className="table-summary">{item.summary}</td><td><StatusPill value={item.sentiment} /></td><td><div className="score"><i style={{ width: `${item.relevance}%` }} /><span>{item.relevance}</span></div></td><td><a className="text-button" href={item.url} target="_blank" rel="noreferrer">Reference <ExternalLink size={13} /></a></td></tr>)}</tbody></table></div></section><section className="panel source-panel"><div className="panel__header"><div><span className="eyebrow">DISTRIBUTION</span><h2>Source mix</h2></div><Filter size={16} className="text-cyan" /></div><div className="donut" /><div className="source-key"><span><i className="legend-dot legend-dot--cyan" />Advisory / News</span><span><i className="legend-dot legend-dot--amber" />Forums / Social</span><span><i className="legend-dot legend-dot--gray" />Code repositories</span></div><p className="muted-note">Signals represent sample context only; they are not threat attribution or evidence of compromise.</p></section></div>
    </div>
  );

  const renderApt = () => (
    <div className="view-stack"><SectionTitle code="03" title="Threat-actor context profiles" detail="A planning reference for defensive exercises. Profiles describe general behaviors, not live activity or targeting instructions." /><div className="profile-search"><div className="search-field"><Search size={15} /><input placeholder="Filter by actor, motivation, or sector" /></div><span>2026 planning library · informational context</span></div><div className="profile-grid">{aptProfiles.map((profile, index) => <article className="profile-card" key={profile.name}><div className="profile-card__heading"><span className="profile-index">0{index + 1}</span><StatusPill value="Context" /></div><h2>{profile.name}</h2><p className="aliases">{profile.aliases}</p><dl><div><dt>Motivation</dt><dd>{profile.motivation}</dd></div><div><dt>Sector relevance</dt><dd>{profile.sector}</dd></div><div><dt>ATT&CK context</dt><dd>{profile.ttp}</dd></div></dl><div className="mindset"><span>THREAT-ACTOR MINDSET</span><p><b>Triggers:</b> {profile.triggers}</p><p><b>Tempo:</b> {profile.tempo}</p></div><button className="text-button" onClick={() => notice(profile.name, "Profile expanded in the local planning context; no feed connection is active.")}>Review exercise implications <ArrowRight size={14} /></button></article>)}</div></div>
  );

  const renderScamAnalysis = () => (
    <div className="view-stack"><SectionTitle code="04" title="Human-risk simulation planning" detail="Modern fraud patterns translated into consent-based, non-deceptive tabletop and awareness exercise formats." /><div className="scam-layout"><section className="panel vector-panel"><div className="panel__header"><div><span className="eyebrow">EMERGING VECTORS</span><h2>Simulation design queue</h2></div><Sparkles size={17} className="text-cyan" /></div><div className="vector-list">{scamVectors.map((vector) => <button key={vector.name} className={selectedVector.name === vector.name ? "vector-row vector-row--active" : "vector-row"} onClick={() => setSelectedVector(vector)}><div><b>{vector.name}</b><span>Likelihood {vector.likelihood} · Impact {vector.impact}</span></div><ChevronRight size={15} /></button>)}</div></section><section className="panel radar-panel"><div className="panel__header"><div><span className="eyebrow">SELECTED VECTOR</span><h2>{selectedVector.name}</h2></div><StatusPill value="Safe simulation" /></div><div className="radar-wrap"><svg viewBox="0 0 300 250" role="img" aria-label="Relative planning radar chart"><g transform="translate(150 125)"><polygon points="0,-88 84,-27 52,72 -52,72 -84,-27" fill="none" stroke="rgba(255,255,255,.18)" /><polygon points="0,-55 52,-17 32,45 -32,45 -52,-17" fill="none" stroke="rgba(255,255,255,.12)" /><line x1="0" y1="0" x2="0" y2="-94" stroke="rgba(255,255,255,.18)" /><line x1="0" y1="0" x2="89" y2="-29" stroke="rgba(255,255,255,.18)" /><line x1="0" y1="0" x2="55" y2="76" stroke="rgba(255,255,255,.18)" /><line x1="0" y1="0" x2="-55" y2="76" stroke="rgba(255,255,255,.18)" /><line x1="0" y1="0" x2="-89" y2="-29" stroke="rgba(255,255,255,.18)" /><polygon points={`0,${-selectedVector.impact} ${selectedVector.likelihood},${-selectedVector.complexity / 2} ${selectedVector.complexity / 1.6},${selectedVector.impact / 1.4} ${-selectedVector.likelihood / 1.5},${selectedVector.complexity / 1.2} ${-selectedVector.complexity},${-selectedVector.impact / 3}`} fill="rgba(141,213,247,.22)" stroke="#8dd5f7" strokeWidth="2" /></g><text x="143" y="18">Impact</text><text x="245" y="96">Likelihood</text><text x="207" y="226">Complexity</text><text x="12" y="226">Control gap</text><text x="9" y="96">Detectability</text></svg></div><div className="simulation-note"><span className="eyebrow">RECOMMENDED EXERCISE</span><p>{selectedVector.approach}</p><button className="button button--cyan" onClick={() => notice("Simulation plan generated", "A safe, consent-led outline was prepared locally with stop criteria and reporting objectives.")}><ClipboardCheck size={15} /> Generate simulation plan</button></div></section></div></div>
  );

  const renderValidation = () => (
    <div className="view-stack"><SectionTitle code="05" title="Validation library" detail="Safe control-validation plans and public advisory references. This workspace does not generate payloads, initiate sessions, or execute commands." /><div className="validation-hero"><div><span className="eyebrow">SAFE BY DESIGN</span><h2>Evidence-oriented validation,<br />not live exploitation.</h2><p>Use these templates to frame approved control tests, tabletop discussions, and remediation verification without targeting systems or handling credentials.</p><button className="button button--cyan" onClick={() => notice("Validation brief", "A template with scope, evidence, stop criteria, and remediation fields is ready to draft.")}><ClipboardCheck size={15} /> Create validation brief</button></div><div className="validation-cards"><article><span>01</span><b>Identity control review</b><p>Verify alerting and approval evidence using a pre-agreed test record.</p></article><article><span>02</span><b>Web control walkthrough</b><p>Review logs, headers, and remediation owner documentation with the application team.</p></article><article><span>03</span><b>Cloud posture evidence</b><p>Map supplied configuration artifacts to agreed assurance questions.</p></article></div></div><section className="panel advisory-panel"><div className="panel__header"><div><span className="eyebrow">ADVISORY REFERENCE</span><h2>Vulnerability review queue</h2></div><a className="text-button" href="https://nvd.nist.gov/" target="_blank" rel="noreferrer">NVD reference <ExternalLink size={14} /></a></div><div className="advisory-table"><div><code>CVE-2026-EXAMPLE</code><b>Placeholder advisory record</b><span>Vendor / product fields are intentionally illustrative.</span></div><StatusPill value="Review" /><button className="text-button" onClick={() => notice("Reference only", "Review public advisory records with the system owner before any validation work.")}>Open procedure <ChevronRight size={14} /></button></div></section></div>
  );

  const renderTelemetry = () => (
    <div className="view-stack"><SectionTitle code="06" title="Telemetry lab" detail="A harmless visualization of lab-health records. No external hosts, listener controls, beacon logs, or remote commands are connected." /><div className="telemetry-grid"><section className="panel telemetry-map"><div className="panel__header"><div><span className="eyebrow">LAB HEALTH</span><h2>Mock observability nodes</h2></div><StatusPill value="Local only" /></div><WorldMap /></section><section className="panel telemetry-list"><div className="panel__header"><div><span className="eyebrow">NODE REGISTER</span><h2>Training environments</h2></div><button className="icon-button" onClick={() => notice("Node management", "This demo does not expose network controls.")}><Plus size={16} /></button></div>{[["LAB-A", "HTTPS", "Healthy", "13:59Z"], ["LAB-B", "DNS", "Review", "13:48Z"], ["LAB-C", "SMB", "Healthy", "13:31Z"]].map(([name, protocol, status, time]) => <div className="node-row" key={name}><span className="node-mark" /><div><b>{name}</b><p>{protocol} · isolated training environment</p></div><StatusPill value={status} /><code>{time}</code></div>)}</section></div><section className="panel log-viewer"><div className="panel__header"><div><span className="eyebrow">LAB EVENT VIEWER</span><h2>Audit-safe event log</h2></div><button className="text-button" onClick={() => notice("Log copied", "A mock audit-safe summary is available for local review.")}>Copy summary</button></div><div className="log-lines"><p><code>14:03:18Z</code><span>LAB-A</span> Health check completed · no external call</p><p><code>13:58:42Z</code><span>LAB-B</span> Configuration review requested · local mock state</p><p><code>13:55:09Z</code><span>LAB-C</span> Evidence package created · review pending</p></div></section></div>
  );

  const renderTeam = () => (
    <div className="view-stack"><SectionTitle code="07" title="Team readiness" detail="Role coverage and workload visibility for the authorized exercise team." /><div className="team-layout"><section className="panel team-roster"><div className="panel__header"><div><span className="eyebrow">ROSTER</span><h2>Assigned operators</h2></div><UsersRound size={17} className="text-cyan" /></div>{team.map((person) => <div className="person-row" key={person.name}><div className="avatar">{person.name.split(" ").map((part) => part[0]).join("")}</div><div><b>{person.name}</b><p>{person.role}</p></div><div className="person-task"><span>{person.task}</span><StatusPill value={person.availability} /></div></div>)}</section><section className="panel workload"><div className="panel__header"><div><span className="eyebrow">WORKLOAD</span><h2>Tasks by member</h2></div></div><div className="bar-list">{team.map((person) => <div key={person.name}><div><span>{person.name}</span><b>{person.load}</b></div><i><em style={{ width: `${person.load * 20}%` }} /></i></div>)}</div></section></div><section className="panel skill-matrix"><div className="panel__header"><div><span className="eyebrow">SKILL MATRIX</span><h2>Exercise coverage</h2></div><span className="muted-note">1 = Awareness · 5 = Lead capability</span></div><div className="matrix-wrap"><table><thead><tr><th>Capability</th>{team.map((person) => <th key={person.name}>{person.name}</th>)}</tr></thead><tbody>{[["Network review", [4, 3, 3, 2]], ["Web testing", [4, 2, 3, 2]], ["Awareness exercises", [3, 5, 4, 3]], ["OSINT", [4, 3, 5, 3]], ["Report writing", [4, 3, 4, 5]]].map(([skill, values]) => <tr key={skill as string}><td>{skill as string}</td>{(values as number[]).map((value, i) => <td key={i}><span className="skill-dot"><i style={{ width: `${value * 20}%` }} /></span><b>{value}</b></td>)}</tr>)}</tbody></table></div></section></div>
  );

  const renderReporting = () => (
    <div className="view-stack"><SectionTitle code="08" title="Report assembly" detail="Create a local Markdown working copy from stored operation metadata, with clearly marked evidence placeholders." action={<button className="button button--cyan" onClick={downloadReport}><Download size={15} /> Download Markdown</button>} /><div className="report-layout"><section className="report-hero"><div className="report-art" /><div><span className="eyebrow">LOCAL REPORT BUILDER</span><h2>Turn scope into<br />a readable record.</h2><p>Pre-populate a safe working document from planning metadata. Replace placeholders only with approved, evidence-based findings.</p></div></section><section className="panel report-form"><label>Operation<select value={reportOperation} onChange={(event) => setReportOperation(event.target.value)}>{operations.map((op) => <option key={op.id} value={op.id}>{op.name}</option>)}</select></label><label>Template<textarea defaultValue={"# {{operation_name}}\n\n> Authorized-use report generated locally.\n\n## Scope\n{{scope}}\n\n## Findings\n{{findings}}\n\n## Remediation ownership\n{{owners}}"} /></label><div className="template-tokens"><span>{"{{operation_name}}"}</span><span>{"{{scope}}"}</span><span>{"{{findings}}"}</span><span>{"{{owners}}"}</span></div><button className="button button--wide button--quiet" onClick={downloadReport}>Generate local report <ArrowRight size={15} /></button></section></div></div>
  );

  const renderSettings = () => (
    <div className="view-stack"><SectionTitle code="09" title="Local settings" detail="Configuration is browser-local. No API key, connection detail, or remote integration is stored or activated by this build." /><div className="settings-layout"><section className="panel settings-panel"><div className="setting-row"><div><b>Refresh interval</b><p>Refresh visible mock data and UI timestamps.</p></div><select value={settings.refresh} onChange={(event) => setSettings({ ...settings, refresh: Number(event.target.value) })}><option value={5}>5 seconds</option><option value={10}>10 seconds</option><option value={30}>30 seconds</option></select></div><div className="setting-row"><div><b>Context sources</b><p>Keep sample context signals visible in the OSINT queue.</p></div><label className="switch"><input type="checkbox" checked={settings.osint} onChange={(event) => setSettings({ ...settings, osint: event.target.checked })} /><i /></label></div><div className="setting-row"><div><b>Alert threshold</b><p>Set the local visual threshold for the sample queue.</p></div><input type="number" min="1" max="99" value={settings.threshold} onChange={(event) => setSettings({ ...settings, threshold: Number(event.target.value) })} /></div><div className="setting-row"><div><b>Appearance</b><p>Switch the local presentation layer between dark and light.</p></div><button className="button button--quiet" onClick={() => setDark(!dark)}>{dark ? <Sun size={15} /> : <Moon size={15} />}{dark ? "Light view" : "Dark view"}</button></div></section><section className="panel config-panel"><span className="eyebrow">CONFIG OBJECT</span><h2>Integration placeholders</h2><pre>{`const CONFIG = {\n  USE_MOCK_DATA: true,\n  API_ENDPOINTS: {\n    osint: \"\",\n    advisories: \"\",\n    telemetry: \"\"\n  }\n}`}</pre><p className="muted-note">Live integrations require a reviewed, authenticated backend. This static build deliberately leaves endpoints blank.</p><div className="button-group"><button className="button button--quiet" onClick={() => { const data = JSON.stringify(settings, null, 2); const blob = new Blob([data], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "signal-archive-config.json"; link.click(); URL.revokeObjectURL(link.href); }}>Export config</button><button className="button button--risk" onClick={clearLocalData}>Clear all local data</button></div></section></div></div>
  );

  const views: Record<View, () => ReactNode> = { Overview: renderOverview, Operations: renderOperations, OSINT: renderOsint, "APT Profiles": renderApt, "Scam Analysis": renderScamAnalysis, "Validation Library": renderValidation, "Telemetry Lab": renderTelemetry, Team: renderTeam, Reporting: renderReporting, Settings: renderSettings };
  const ActiveView = views[view];

  return (
    <div className="signal-archive">
      <div className="authorised-banner"><ShieldCheck size={14} /> For authorized red-team use only. This build uses local mock data and safe simulation workflows.</div>
      <aside className={railOpen ? "rail" : "rail rail--compact"} aria-label="Primary navigation"><div className="rail-brand"><img src="/manus-storage/signal-archive-logo_83c3c2e5.png" alt="Signal Archive mark" /><div className="rail-brand__text"><span>OPS / ARCHIVE</span><b>Signal Archive</b></div><button className="rail-collapse" onClick={() => setRailOpen(!railOpen)} aria-label="Collapse navigation">{railOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button></div><nav>{navItems.map(({ label, icon: Icon, code }) => <button key={label} onClick={() => { setView(label); setMobileOpen(false); }} className={view === label ? "rail-link rail-link--active" : "rail-link"}><span className="rail-link__code">{code}</span><Icon size={17} /><span className="rail-link__label">{label}</span></button>)}</nav><div className="rail-foot"><div className="operator-dot" /><div><span>LOCAL MODE</span><b>Evidence-first</b></div></div></aside>
      {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
      <main className={railOpen ? "workspace" : "workspace workspace--wide"}><header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={19} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={13} /><b>{view}</b></div><div className="topbar-actions"><button className="top-status"><i /><span>Operational</span><ChevronDown size={12} /></button><div className="utc-clock"><Clock3 size={14} /><span>UTC {utc}</span></div><button className="icon-button" onClick={() => notice("No new notifications", "The local mock workspace has no remote notification service.")}><Bell size={17} /><i className="notification-dot" /></button></div></header><div className="workspace-scroll"><ActiveView /></div></main>
      {selectedOperation && <div className="modal-shell" role="dialog" aria-modal="true" aria-label="Operation detail"><div className="modal"><button className="modal-close" onClick={() => setSelectedOperation(null)}><X size={18} /></button><span className="eyebrow">OPERATION DOSSIER · {selectedOperation.id}</span><h2>{selectedOperation.name}</h2><div className="modal-meta"><StatusPill value={selectedOperation.status} /><StatusPill value={selectedOperation.risk} /><span>{selectedOperation.sector}</span></div><dl className="dossier-grid"><div><dt>Scope</dt><dd>{selectedOperation.scope}</dd></div><div><dt>Objective</dt><dd>{selectedOperation.objective}</dd></div><div><dt>Rules of engagement</dt><dd>{selectedOperation.roe}</dd></div><div><dt>Timeline</dt><dd><ol>{selectedOperation.timeline.map((item) => <li key={item}>{item}</li>)}</ol></dd></div></dl><button className="button button--cyan" onClick={() => { setSelectedOperation(null); setView("Reporting"); }}>Build report <ArrowRight size={15} /></button></div></div>}
      {newOperationOpen && <div className="modal-shell" role="dialog" aria-modal="true" aria-label="Add operation"><form className="modal modal--small" action={(form) => addOperation(form)}><button type="button" className="modal-close" onClick={() => setNewOperationOpen(false)}><X size={18} /></button><span className="eyebrow">LOCAL PLANNING RECORD</span><h2>Add scoped operation</h2><label>Operation name<input name="name" required placeholder="e.g., Horizon Access Review" /></label><label>Target sector<input name="sector" required placeholder="e.g., Technology" /></label><p className="muted-note">The saved record is local-only and defaults to planning status. Add formal authorization outside this demo before any real-world activity.</p><button className="button button--cyan" type="submit">Save local record <ArrowRight size={15} /></button></form></div>}
      {expired && <div className="modal-shell" role="dialog" aria-modal="true" aria-label="Session expired"><div className="modal modal--small session-modal"><AlertTriangle size={25} className="text-amber" /><span className="eyebrow">INACTIVITY TIMEOUT</span><h2>Session expired</h2><p>Your local workspace has timed out after 15 minutes of inactivity. No remote session or external integration was active.</p><button className="button button--cyan" onClick={() => setExpired(false)}>Resume local session</button></div></div>}
      {toast && <div className="toast"><div className="toast-mark"><ShieldCheck size={16} /></div><div><b>{toast.label}</b><p>{toast.note}</p></div></div>}
    </div>
  );
}
