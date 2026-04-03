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
  id: string;
  name: string;
  themeId: ThemeId;
}

export interface Theme {
  id: ThemeId;
  name: string;
  shortName: string;
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

export const QUARTER_ORDER: Quarter[] = ["Q2 2026", "Q3 2026", "Q4 2026", "Q1 2027"];

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
  fte: number;
  startQuarter: Quarter;
  endQuarter: Quarter;
  justification: string;
  assignedTeamMemberId?: string;
  isGap?: boolean;
}

export interface Workstream {
  id: string;
  name: WorkstreamName;
  fundingSource: FundingSource;
  startQuarter: Quarter;
  endQuarter: Quarter;
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

export interface Allocation {
  teamMemberId: string;
  projectId: string;
  workstreamId: string;
  demandLineId: string;
  fte: number;
  startQuarter: Quarter;
  endQuarter: Quarter;
}
