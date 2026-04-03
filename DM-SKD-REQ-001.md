# Digital Manufacturing — Skills & Demand Management Tool

## Objective

Build a React single-page application demonstrator for a Digital Manufacturing Skills & Demand Management Tool. The app enables project leads to submit skill-based resource demand, PMO users to approve/reject and allocate team members, and all users to view a portfolio dashboard showing demand, supply, gaps, and team load.

All data is pre-loaded demo data. There is no backend, no API, no database, no authentication.

---

## Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | React | 18+ with functional components and hooks |
| Language | TypeScript | Strict mode enabled |
| Design System | `@fluentui/react-components` | Fluent UI React v9 (Fluent 2 Design System). Wrap root in `<FluentProvider theme={webLightTheme}>` |
| Icons | `@fluentui/react-icons` | Use Fluent system icons throughout |
| Charting | Recharts | For dashboard charts. Style with Fluent 2 colour tokens |
| State Management | React Context + `useReducer` | Single `AppContext` for all application state |
| Routing | React Router v6 | Client-side routing |
| Build Tool | Vite | Default React + TypeScript template |

**Do not use any other UI component libraries.** All buttons, cards, tables, inputs, dialogs, badges, avatars, dropdowns must come from `@fluentui/react-components`.

---

## Project Structure

```
src/
├── main.tsx                    # Entry point, FluentProvider + Router
├── App.tsx                     # Layout shell (sidebar + content area)
├── context/
│   └── AppContext.tsx           # Global state: projects, team, role, dispatch
├── types/
│   └── index.ts                # All TypeScript interfaces and enums
├── data/
│   ├── taxonomy.ts             # Themes, skills, proficiency levels
│   ├── team.ts                 # Team member records
│   └── projects.ts             # Project, workstream, and demand line records
├── components/
│   ├── Sidebar.tsx             # Left navigation with role selector
│   ├── WorkflowStepper.tsx     # Horizontal stage indicator
│   ├── DemandTable.tsx         # Table of demand lines for a workstream
│   ├── AllocationPanel.tsx     # Panel to assign team members to demand lines
│   ├── SkillBadge.tsx          # Skill name + proficiency level badge
│   ├── TeamMemberCard.tsx      # Card showing team member summary
│   ├── WorkstreamSection.tsx   # Collapsible section showing a workstream's details and demand lines
│   └── GapIndicator.tsx        # Visual indicator for unfilled demand
├── views/
│   ├── Dashboard.tsx           # Portfolio dashboard with charts
│   ├── Projects.tsx            # Project list view
│   ├── ProjectDetail.tsx       # Single project with stepper, workstreams, demand, allocation
│   ├── Team.tsx                # Team list view
│   └── TeamDetail.tsx          # Single team member profile
```

---

## Type Definitions

Define these in `src/types/index.ts`:

```typescript
// Proficiency levels — ordered lowest to highest
export enum ProficiencyLevel {
  Awareness = "Awareness",
  Practitioner = "Practitioner",
  Specialist = "Specialist",
  Lead = "Lead"
}

// For comparison logic: higher number = higher proficiency
export const PROFICIENCY_RANK: Record<ProficiencyLevel, number> = {
  [ProficiencyLevel.Awareness]: 1,
  [ProficiencyLevel.Practitioner]: 2,
  [ProficiencyLevel.Specialist]: 3,
  [ProficiencyLevel.Lead]: 4,
};

export enum WorkflowStage {
  Draft = "Draft",
  Submitted = "Submitted",
  Approved = "Approved",
  Allocated = "Allocated",
  Rejected = "Rejected",
}

export enum UserRole {
  ProjectLead = "Project Lead",
  PMO = "PMO",
  PortfolioViewer = "Portfolio Viewer",
}

export type ThemeId = "MOM" | "MIV";

export interface Skill {
  id: string;            // e.g. "MOM-01", "MIV-03"
  name: string;
  themeId: ThemeId;
}

export interface Theme {
  id: ThemeId;
  name: string;          // "Manufacturing Operations Management" / "Manufacturing Intelligence & Visualisation"
  shortName: string;     // "MOM" / "MI&V"
  skills: Skill[];
}

export interface TeamMemberSkill {
  skillId: string;
  level: ProficiencyLevel;
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  roleTitle: "Digital Manufacturing Engineer" | "Digital Manufacturing Specialist";
  skills: TeamMemberSkill[];
}

export type Quarter = "Q2 2026" | "Q3 2026" | "Q4 2026" | "Q1 2027";

export enum FundingSource {
  Sector = "Sector",
  Project = "Project",
}

export enum WorkstreamName {
  Design = "Design",
  Development = "Development",
  Deployment = "Deployment",
  Support = "Ongoing Support",
}

export interface DemandLine {
  id: string;
  skillId: string;
  requiredLevel: ProficiencyLevel;
  fte: number;           // 0.25, 0.5, 0.75, 1.0
  startQuarter: Quarter;
  endQuarter: Quarter;
  justification: string;
  // Allocation state
  assignedTeamMemberId?: string;
  isGap?: boolean;
}

export interface Workstream {
  id: string;
  name: WorkstreamName;
  fundingSource: FundingSource;
  startQuarter: Quarter;
  endQuarter: Quarter;    // For Support workstreams, use the latest quarter in range. In a real system this would be open-ended.
  demandLines: DemandLine[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  stage: WorkflowStage;
  workstreams: Workstream[];
  rejectionReason?: string;
}

// For allocation calculations
export interface Allocation {
  teamMemberId: string;
  projectId: string;
  workstreamId: string;
  demandLineId: string;
  fte: number;
  startQuarter: Quarter;
  endQuarter: Quarter;
}
```

---

## Demo Data

### Themes & Skills

**Theme: MOM** (Manufacturing Operations Management)

| ID | Skill |
|---|---|
| MOM-01 | MES Design & Configuration |
| MOM-02 | Production Scheduling & Planning (APS) |
| MOM-03 | Quality Management (QMS / SPC) |
| MOM-04 | Material & Inventory Operations |
| MOM-05 | Maintenance Operations Integration |
| MOM-06 | MOM/MES Integration & Architecture |
| MOM-07 | Recipe & Process Management |
| MOM-08 | Compliance & Electronic Records (GxP/eDHR) |

**Theme: MI&V** (Manufacturing Intelligence & Visualisation)

| ID | Skill |
|---|---|
| MIV-01 | Data Historian & Time-Series Management |
| MIV-02 | Data Contextualisation & Modelling |
| MIV-03 | Industrial Connectivity & Data Acquisition |
| MIV-04 | KPI Design & OEE Management |
| MIV-05 | Dashboard & Visualisation Development |
| MIV-06 | Statistical Process Control (SPC) & Process Analytics |
| MIV-07 | Manufacturing Data Integration & ETL |
| MIV-08 | Advanced Analytics & AI/ML for Manufacturing |

### Team Members (12 people)

Create 12 fictitious team members. Each has 2–4 skills at varying proficiency levels. Distribution:

- 6 with primarily MOM skills
- 4 with primarily MI&V skills
- 2 with cross-theme skills (both MOM and MI&V)

All team members have one of two role titles: **"Digital Manufacturing Engineer"** or **"Digital Manufacturing Specialist"**. These are the only two role titles in the team — do not invent other titles. Use "Specialist" for more senior/experienced members (those with Lead or multiple Specialist-level proficiencies) and "Engineer" for the rest.

At least one person must have `Lead` proficiency in a MOM skill, and at least one in a MI&V skill. Generate realistic names.

### Projects (5 projects)

Each project has one or more **workstreams**. Each workstream has a **funding source** (Sector or Project) and contains the demand lines for that workstream. Different workstreams within the same project can have different funding sources — for example, the Design workstream might be funded by the Sector while Development and Deployment are funded by the Project.

The four workstream types are: **Design**, **Development**, **Deployment**, and **Ongoing Support**. Not every project will have all four. Ongoing Support represents long-running superuser/BAU support that may continue indefinitely (for demo purposes, set its end quarter to the latest quarter in range).

| Project | Code | Stage | Workstreams | Description |
|---|---|---|---|---|
| Line 4 MES Rollout | PRJ-ALPHA | Allocated | Design (Sector funded, Q2 2026), Development (Project funded, Q2–Q3 2026), Deployment (Project funded, Q3–Q4 2026), Ongoing Support (Sector funded, Q4 2026–Q1 2027) | MES deployment for production line 4. Fully allocated with team assignments. |
| OEE Dashboard Programme | PRJ-BETA | Approved | Design (Sector funded, Q2 2026), Development (Project funded, Q3–Q4 2026), Deployment (Project funded, Q1 2027) | Enterprise OEE dashboarding. Ready for allocation — use this to demo the allocation interface. |
| Recipe Management Upgrade | PRJ-GAMMA | Submitted | Design (Sector funded, Q3 2026), Development (Project funded, Q4 2026–Q1 2027) | Recipe/BOM system upgrade. Awaiting PMO review — use this to demo approve/reject. |
| Historian Consolidation | PRJ-DELTA | Draft | Design (Sector funded, Q3 2026), Development (Sector funded, Q4 2026), Deployment (Project funded, Q1 2027) | Consolidating plant historians. In preparation — shows demand composition. |
| Quality System Migration | PRJ-EPSILON | Rejected | Design (Sector funded, Q2 2026), Development (Project funded, Q3–Q4 2026) | QMS platform migration. Rejected with reason: "Budget not approved for FY26. Resubmit in Q1 2027 planning cycle." |

**Demand line requirements:**

- Distribute demand lines across workstreams (1–3 demand lines per workstream is typical).
- At least 2 projects must request skill `MOM-06` (MOM/MES Integration & Architecture) at `Specialist` level in Q3 2026, creating a visible resource contention scenario.
- At least 1 demand line on PRJ-BETA must require a skill/level combination that no team member possesses, forcing a `Gap` scenario during allocation.
- Use a mix of FTE values: 0.25, 0.5, 0.75, and 1.0.
- Demand line time windows must fall within their parent workstream's time window.

**For PRJ-ALPHA (Allocated):** Pre-populate `assignedTeamMemberId` on all demand lines across all workstreams. Ensure assigned team members have the matching skill.

**For PRJ-EPSILON (Rejected):** Set `rejectionReason` on the project.

---

## Application State

Use a single React Context (`AppContext`) with `useReducer`. The state shape:

```typescript
interface AppState {
  projects: Project[];
  teamMembers: TeamMember[];
  currentRole: UserRole;
}
```

### Actions (dispatch)

```typescript
type AppAction =
  | { type: "SET_ROLE"; role: UserRole }
  | { type: "SUBMIT_PROJECT"; projectId: string }
  | { type: "APPROVE_PROJECT"; projectId: string }
  | { type: "REJECT_PROJECT"; projectId: string; reason: string }
  | { type: "ALLOCATE_DEMAND_LINE"; projectId: string; workstreamId: string; demandLineId: string; teamMemberId: string }
  | { type: "FLAG_GAP"; projectId: string; workstreamId: string; demandLineId: string };
```

**Reducer logic:**

- `SUBMIT_PROJECT`: Set project stage to `Submitted`.
- `APPROVE_PROJECT`: Set project stage to `Approved`.
- `REJECT_PROJECT`: Set project stage to `Rejected`, set `rejectionReason`.
- `ALLOCATE_DEMAND_LINE`: Find the demand line within the specified workstream and set `assignedTeamMemberId`. After dispatch, check if ALL demand lines across ALL workstreams on the project are either allocated (`assignedTeamMemberId` set) or flagged (`isGap === true`) — if so, automatically set project stage to `Allocated`.
- `FLAG_GAP`: Find the demand line within the specified workstream and set `isGap: true`. Same auto-transition check as above.

---

## UI Layout

### Shell

- **Left sidebar** (fixed width ~240px, collapsible):
  - App title: "DM Skills & Demand"
  - Navigation links: Dashboard, Projects, Team
  - Divider
  - **Role selector**: A Fluent `Dropdown` at the bottom of the sidebar. Options: "Project Lead", "PMO", "Portfolio Viewer". This controls `currentRole` in state. Display the selected role prominently.
- **Main content area**: Fills remaining width. Render the active route's view.

Use Fluent `NavDrawer` or a custom sidebar using Fluent `Card` + `Button` components. Apply Fluent design tokens for background colours and spacing.

### Navigation Routes

| Path | View | Description |
|---|---|---|
| `/` | Dashboard | Portfolio dashboard |
| `/projects` | Projects | Project list |
| `/projects/:id` | ProjectDetail | Single project with stepper, workstreams, demand, allocation |
| `/team` | Team | Team member list |
| `/team/:id` | TeamDetail | Single team member profile |

---

## Views — Detailed Specifications

### Dashboard (`/`)

Display 5 widgets in a responsive grid (2 columns on wide screens, 1 on narrow):

**Widget 1: Demand vs. Supply by Skill**
- Bar chart (Recharts `BarChart`).
- X-axis: skills (use short names if needed). Y-axis: FTE.
- Two bars per skill: total demand FTE (from approved + allocated projects) and total supply FTE (sum of team member availability for that skill — count each person with the skill as 1.0 FTE minus their current allocation).
- Colour: use Fluent brand colour for demand, a lighter tint for supply.

**Widget 2: Team Load by Quarter**
- Stacked bar chart (Recharts `BarChart` with stacked bars).
- X-axis: quarters (Q2 2026 – Q1 2027). Y-axis: FTE.
- Each bar segment = a team member's total allocated FTE for that quarter.
- Include a reference line at the total team capacity.

**Widget 3: Gaps Summary**
- A Fluent `Table` listing all demand lines where `isGap === true`.
- Columns: Project, Workstream, Skill, Required Level, FTE, Quarter.
- If no gaps, show a success MessageBar: "No resource gaps identified."

**Widget 4: Skills Heatmap**
- A grid/table where rows = skills, columns = quarters.
- Each cell shows total demand FTE for that skill+quarter combination.
- Use background colour intensity (white → light blue → dark blue) to indicate volume.
- Implement using a Fluent `Table` with dynamic cell background styles using Fluent colour tokens.

**Widget 5: Funding Source Breakdown**
- A Recharts `PieChart` or stacked bar showing total demand FTE split by funding source (Sector vs. Project).
- Aggregate across all approved + allocated projects.
- Optionally show a secondary breakdown by quarter if using a stacked bar.

**Filter bar** at the top of the dashboard: Fluent `Dropdown` to filter by theme (All / MOM / MI&V). Filtering updates all 5 widgets.

---

### Projects (`/projects`)

- Display projects as Fluent `Card` components in a grid layout.
- Each card shows:
  - Project name (bold) and code (subtle text)
  - Workflow stage as a Fluent `Badge`:
    - Draft → `appearance="outline"` neutral
    - Submitted → `appearance="filled"` warning/orange
    - Approved → `appearance="filled"` success/green
    - Allocated → `appearance="filled"` brand/blue
    - Rejected → `appearance="filled"` danger/red
  - Number of workstreams and total FTE across all workstreams
  - Brief description (truncated to 2 lines)
- **Filter bar**: Fluent `Dropdown` to filter by stage (All / Draft / Submitted / Approved / Allocated / Rejected).
- Clicking a card navigates to `/projects/:id`.

---

### Project Detail (`/projects/:id`)

This is the most complex view. Layout from top to bottom:

**1. Workflow Stepper (always visible at top)**

Build a custom horizontal stepper component (`WorkflowStepper.tsx`). It shows 5 steps in a horizontal line:

```
[Draft] ——— [Submitted] ——— [Approved] ——— [Allocated]
                                  \
                                   [Rejected]
```

Implementation:
- Each step is a circle (or Fluent `Badge`) with label text below.
- **Completed steps**: Filled brand colour with a checkmark icon (`CheckmarkFilled` from `@fluentui/react-icons`).
- **Current step**: Filled brand colour, larger or outlined, with a pulsing/highlight effect.
- **Future steps**: Grey outline, muted text.
- **Rejected step**: If the project is rejected, show steps 1-2 as completed, then show step 5 (Rejected) branching off with a red/danger colour. Steps 3-4 should appear greyed/skipped.
- Connect steps with horizontal lines. Completed connections = solid brand colour. Incomplete = dashed grey.

**2. Project Summary Card**

A Fluent `Card` below the stepper showing:
- Project name, code, description
- Current stage badge
- Total FTE demand (sum of all demand lines across all workstreams)
- If rejected: display the `rejectionReason` in a Fluent `MessageBar` with `intent="error"`.

**3. Action Buttons (role-dependent)**

Render action buttons based on project stage AND current user role:

| Stage | Role | Buttons |
|---|---|---|
| Draft | Project Lead | `Submit for Review` (primary) |
| Submitted | PMO | `Approve` (primary, green), `Reject` (outline, red) |
| Approved | PMO | No top-level buttons (allocation happens per demand line) |
| Allocated | Any | No buttons (terminal state) |
| Rejected | Any | No buttons (terminal state) |

- Hide buttons entirely for roles that cannot act.
- `Submit for Review` → dispatch `SUBMIT_PROJECT`.
- `Reject` → open a Fluent `Dialog` prompting for a rejection reason (required text input). On confirm, dispatch `REJECT_PROJECT`.

**4. Workstreams & Demand Lines**

The project detail view organises demand lines by workstream. For each workstream, render a `WorkstreamSection` component:

- **Workstream header**: Show the workstream name (e.g. "Design"), funding source as a Fluent `Badge` (Sector → teal/informative badge, Project → purple/brand badge), and the workstream time window (e.g. "Q2 2026 – Q3 2026").
- **Demand lines table** within the workstream: A Fluent `Table` with columns:

| Column | Content |
|---|---|
| Skill | Theme badge (MOM/MI&V) + skill name |
| Required Level | Proficiency badge |
| FTE | Number |
| Period | Start quarter – End quarter |
| Justification | Text (truncated, expandable on hover via Tooltip) |
| Status | Allocated: show assigned person's Avatar + name. Gap: show red "Gap" badge. Unallocated: show "—" |
| Action | If stage is Approved and role is PMO: show "Allocate" button. Clicking opens the AllocationPanel for this demand line. |

Workstream sections should be visually separated (e.g. using Fluent `Divider` or `Card` containers) and collapsible using Fluent `Accordion` or a toggle.

**5. Allocation Panel**

When the user clicks "Allocate" on a demand line (project must be Approved, role must be PMO), show the `AllocationPanel` as a Fluent `Drawer` (side panel) or a `Dialog`.

The panel shows:
- The demand line details at the top (workstream name, funding source, skill, level, FTE, period).
- A list of **candidate team members** — everyone who has the required skill (regardless of level):
  - Show: Avatar, name, their proficiency level for this skill, their current allocation % for the demand line's time window.
  - **Meets requirement**: If the team member's proficiency level >= the required level, show a green `Badge` or checkmark.
  - **Below requirement**: If their proficiency level < required level, show an amber/warning indicator.
  - **Unavailable**: If their total allocated FTE during the time window >= 1.0, show them greyed out with an "Unavailable" label.
  - Sort order: Meets requirement + available first, then meets requirement + partially available, then below requirement, then unavailable.
- A "Select" button next to each available candidate. Clicking dispatches `ALLOCATE_DEMAND_LINE` with the `workstreamId`.
- A "Flag as Gap" button at the bottom. Dispatches `FLAG_GAP` with the `workstreamId`.

After allocation or gap flagging, the panel closes and the demand line table updates. If all lines across all workstreams are now allocated/gap-flagged, the project auto-transitions to Allocated.

---

### Team (`/team`)

- Display team members as Fluent `Card` components in a grid.
- Each card shows:
  - Fluent `Avatar` with initials and a colour (vary colours across members)
  - Name (bold), role title (subtitle — either "Digital Manufacturing Engineer" or "Digital Manufacturing Specialist")
  - Skills as a row of `SkillBadge` components (small badges showing skill short-name + level)
  - Utilisation bar: a horizontal bar showing total allocation % across all projects. Use Fluent `ProgressBar`. 0% = empty, 100% = full/red.
- **Filter bar**: Dropdowns to filter by theme, skill, and proficiency level.
- Clicking a card navigates to `/team/:id`.

---

### Team Detail (`/team/:id`)

- Large `Avatar` with name and role title.
- **Skills table**: Fluent `Table` listing all skills with columns: Theme, Skill Name, Proficiency Level (as badge).
- **Allocation timeline**: A table or chart showing the team member's allocations by quarter:
  - Columns: Q2 2026, Q3 2026, Q4 2026, Q1 2027.
  - Each cell shows the project(s) and workstream(s) they're allocated to and the FTE. Colour-code cells by load (green < 0.75, amber 0.75–0.99, red >= 1.0).
- **Current assignments**: List of projects they're assigned to, with project name, workstream name, skill, and FTE.

---

## Component Specifications

### `WorkflowStepper`

Props:
```typescript
interface WorkflowStepperProps {
  currentStage: WorkflowStage;
}
```

Renders a horizontal step indicator. See the detailed spec in the Project Detail section above.

### `WorkstreamSection`

Props:
```typescript
interface WorkstreamSectionProps {
  workstream: Workstream;
  projectStage: WorkflowStage;
  onAllocate?: (workstreamId: string, demandLineId: string) => void;
}
```

Renders a collapsible section for a single workstream, including its header (name, funding source badge, time window) and the demand lines table within it.

### `SkillBadge`

Props:
```typescript
interface SkillBadgeProps {
  skillId: string;
  level: ProficiencyLevel;
}
```

Renders a small Fluent `Badge` with the skill short name and proficiency level. Colour by level:
- Awareness → neutral/grey
- Practitioner → informative/blue
- Specialist → brand/dark blue
- Lead → success/green or a distinct accent

### `GapIndicator`

A small component rendering a red Fluent `Badge` with text "Gap" and a warning icon.

### `DemandTable`

Props:
```typescript
interface DemandTableProps {
  demandLines: DemandLine[];
  workstreamId: string;
  projectStage: WorkflowStage;
  onAllocate?: (workstreamId: string, demandLineId: string) => void;
}
```

### `AllocationPanel`

Props:
```typescript
interface AllocationPanelProps {
  demandLine: DemandLine;
  projectId: string;
  workstreamId: string;
  open: boolean;
  onClose: () => void;
}
```

Fetches candidate team members from context, calculates availability, and renders the allocation UI as described above.

### `TeamMemberCard`

Props:
```typescript
interface TeamMemberCardProps {
  member: TeamMember;
  onClick?: () => void;
}
```

---

## Utility Functions

Create a `src/utils/` folder with:

### `allocation.ts`

```typescript
// Calculate a team member's total allocated FTE for a given quarter
// Must iterate across all projects → workstreams → demand lines
function getAllocatedFTE(
  teamMemberId: string,
  quarter: Quarter,
  projects: Project[]
): number;

// Get all team members who have a given skill
function getCandidatesForSkill(
  skillId: string,
  teamMembers: TeamMember[]
): TeamMember[];

// Check if a team member meets or exceeds a required proficiency level
function meetsRequiredLevel(
  memberLevel: ProficiencyLevel,
  requiredLevel: ProficiencyLevel
): boolean;

// Check if a quarter falls within a start–end range
function isQuarterInRange(
  quarter: Quarter,
  start: Quarter,
  end: Quarter
): boolean;

// Get all demand lines across all projects and workstreams for aggregation
function getAllDemandLines(
  projects: Project[],
  stageFilter?: WorkflowStage[]
): Array<DemandLine & { projectId: string; projectName: string; workstreamId: string; workstreamName: string; fundingSource: FundingSource }>;
```

### `taxonomy.ts`

```typescript
// Lookup skill by ID
function getSkillById(skillId: string): Skill | undefined;

// Get theme for a skill
function getThemeForSkill(skillId: string): Theme | undefined;
```

---

## Styling & Theming

- Use `webLightTheme` from `@fluentui/react-components` as the base theme.
- Use Fluent design tokens for all colours: `tokens.colorBrandBackground`, `tokens.colorPaletteRedBackground3`, `tokens.colorNeutralBackground1`, etc.
- **Do not hard-code hex colour values.** Always use Fluent tokens.
- Use `makeStyles` from `@fluentui/react-components` (Griffel) for custom styles.
- Use Fluent `tokens.fontSizeBase*` and `tokens.fontWeightSemibold` etc. for typography.
- Spacing: use Fluent spacing tokens or consistent rem/px values.
- Dashboard charts (Recharts): extract Fluent token colour values at render time and pass to Recharts as fill/stroke props.

---

## Behaviour Notes

- **Role selector affects the entire app.** When the role changes, action buttons appear/disappear across all views. The data displayed does not change — all roles see the same projects and team.
- **Auto-transition to Allocated.** After every `ALLOCATE_DEMAND_LINE` or `FLAG_GAP` dispatch, the reducer must check: are ALL demand lines across ALL workstreams on this project either allocated (`assignedTeamMemberId` set) or flagged (`isGap === true`)? If yes, set the project stage to `Allocated`.
- **Quarter ordering.** Quarters follow this fixed sequence: Q2 2026 → Q3 2026 → Q4 2026 → Q1 2027. Implement a `QUARTER_ORDER` constant for comparison.
- **Workstream time windows constrain demand lines.** A demand line's start/end quarters must fall within its parent workstream's start/end quarters.
- **Funding source is informational.** It does not affect allocation logic — it is displayed in the UI for visibility and is available on the dashboard for aggregation/filtering.
- **No persistence.** Refreshing the browser resets all state to the initial demo data.
- **No form validation beyond basics.** The rejection reason dialog should require non-empty text. All other data is pre-loaded.

---

## Acceptance Criteria

The demonstrator is complete when:

1. The app loads with the sidebar, role selector, and Dashboard view.
2. Switching roles in the sidebar changes available actions throughout the app.
3. The Projects view shows all 5 projects as cards with correct stage badges, filterable by stage.
4. Opening a project shows the WorkflowStepper with the correct current stage visually highlighted.
5. The project detail view displays workstreams as distinct, collapsible sections, each showing its funding source badge and time window.
6. Demand lines are grouped under their parent workstream, not shown as a flat list.
7. For PRJ-GAMMA (Submitted): switching to PMO role shows Approve/Reject buttons. Clicking Approve transitions to Approved. Clicking Reject opens a dialog, entering a reason transitions to Rejected.
8. For PRJ-BETA (Approved): switching to PMO role shows "Allocate" buttons on demand lines within each workstream. The allocation panel opens, shows candidates sorted by suitability, and allows assignment or gap flagging.
9. After allocating all demand lines across all workstreams on a project, it auto-transitions to Allocated.
10. The Team view shows all 12 team members with skills, proficiency badges, and utilisation bars.
11. The Team Detail view shows a team member's skills and allocation timeline by quarter, including which project and workstream each allocation belongs to.
12. The Dashboard shows all 5 widgets (demand vs supply, team load, gaps summary, skills heatmap, funding breakdown) with accurate data from the current state.
13. The Dashboard filter by theme correctly updates all widgets.
14. The entire UI uses Fluent UI React v9 components with the Fluent 2 design language — no unstyled HTML or third-party component libraries.
