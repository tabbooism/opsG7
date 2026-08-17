# Design Directions — Red Team Ops Coordinator

## Three candidate approaches

### 1. Signal Archive
**Very Brief Intro:** A disciplined intelligence-workbench aesthetic inspired by archival case files, telemetry strips, and command-post materials. It prioritizes calm situational awareness over theatrical “hacker” visuals.

**Probability:** 0.071

### 2. Field Notebook
**Very Brief Intro:** A restrained operational journal combining charcoal substrates with paper-like data panes and annotated map fragments. It feels investigative and tactile rather than technical or aggressive.

**Probability:** 0.034

### 3. Aerial Grid
**Very Brief Intro:** A high-contrast logistics-console language using modular coordinates, bold wayfinding, and terrain-inspired patterning. It evokes a planning table used by a distributed field team.

**Probability:** 0.089

## Chosen approach: Signal Archive

### Design Movement
**Signal Archive** draws from editorial information design, aviation operations rooms, and technical documentation systems. The interface should read like a carefully maintained intelligence workspace, not a cinematic cyberpunk control panel.

### Core Principles
1. **Evidence over spectacle:** Dense information is structured with clear labels, chronologies, and visual hierarchy.
2. **Calm operational confidence:** Dark, low-glare surfaces frame data without excessive glows, gradients, or decorative noise.
3. **Traceable actions:** Each control communicates whether it is view-only, simulated, or locally persisted.
4. **Purposeful asymmetry:** The rail, top status strip, and right-side activity stack create a field-dossier rhythm rather than a centralized card grid.

### Color Philosophy
The near-black graphite substrate reduces glare and supports lengthy review. A cool **Cyanographic Signal** blue identifies intelligence, navigation, and neutral operational state; muted parchment lifts written context; amber flags simulated attention, and oxide red is reserved for explicit risk or expiry. Color must never be the only carrier of status.

### Layout Paradigm
A fixed intelligence rail anchors navigation, a thin longitudinal status strip carries context, and the primary canvas alternates between broad analytical workspaces and narrow dossier stacks. Instead of centering the experience, information sweeps left-to-right from command context to evidence to next action.

### Signature Elements
1. **Coordinate rulers:** Small alphanumeric index labels and fine horizontal rules frame key panels.
2. **Dossier tabs:** Section headers use compact document-tab geometry with a visible category code.
3. **Signal markers:** A small ring-and-dot emblem and restrained status pips reinforce the intelligence-archive theme.

### Interaction Philosophy
Interactions should be practical and legible. Selected navigation uses a quiet tab change, sortable simulation work stays local, and potentially sensitive features present their mock-only status before action. Buttons compress slightly on press; controls never imply live command execution.

### Animation
Use a 160–220ms custom ease-out for hover and panel transitions. Stagger only first-load content by 35–55ms, animate opacity and short horizontal transforms only, and disable non-essential movement for reduced-motion preferences. Status pips may breathe subtly, but no neon pulses or continuous decorative motion.

### Typography System
**Space Grotesk** forms the geometric operational display layer for headings, navigation, and numeric labels. **IBM Plex Mono** is reserved for timestamps, identifiers, compact metadata, and activity log content. Heading scale is intentionally compressed and uppercase sparingly used only for category labels.

### Brand Essence
**A local-first red-team planning workspace for authorized operators who need readable intelligence, simulation planning, and accountable coordination without theatrical tooling.**

**Personality:** measured, methodical, vigilant.

### Brand Voice
Headlines are concise, operational, and evidence-led. CTAs state the local action and never exaggerate capability.

> “Surface the next decision, not more noise.”

> “Create a simulation brief — stored locally.”

### Wordmark & Logo
The mark is a **signal locator**: three offset coordinate lines converge on an open ring and dot, suggesting evidence triangulation and review. The wordmark combines a square index badge with a tightly spaced “OPS / COORDINATOR” label instead of a default text-only treatment.

### Signature Brand Color
**Cyanographic Signal — `#8DD5F7`**. This low-glare cyan identifies neutral intelligence and navigation without drifting toward neon.
