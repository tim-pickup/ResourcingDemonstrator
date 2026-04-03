import {
  TeamMember,
  Project,
  Quarter,
  ProficiencyLevel,
  PROFICIENCY_RANK,
  QUARTER_ORDER,
  WorkflowStage,
  FundingSource,
  DemandLine,
} from '../types';

export function isQuarterInRange(quarter: Quarter, start: Quarter, end: Quarter): boolean {
  const qi = QUARTER_ORDER.indexOf(quarter);
  const si = QUARTER_ORDER.indexOf(start);
  const ei = QUARTER_ORDER.indexOf(end);
  return qi >= si && qi <= ei;
}

export function getAllocatedFTE(
  teamMemberId: string,
  quarter: Quarter,
  projects: Project[]
): number {
  let total = 0;
  for (const project of projects) {
    for (const ws of project.workstreams) {
      for (const dl of ws.demandLines) {
        if (
          dl.assignedTeamMemberId === teamMemberId &&
          isQuarterInRange(quarter, dl.startQuarter, dl.endQuarter)
        ) {
          total += dl.fte;
        }
      }
    }
  }
  return total;
}

export function getCandidatesForSkill(
  skillId: string,
  teamMembers: TeamMember[]
): TeamMember[] {
  return teamMembers.filter((m) => m.skills.some((s) => s.skillId === skillId));
}

export function meetsRequiredLevel(
  memberLevel: ProficiencyLevel,
  requiredLevel: ProficiencyLevel
): boolean {
  return PROFICIENCY_RANK[memberLevel] >= PROFICIENCY_RANK[requiredLevel];
}

export interface EnrichedDemandLine extends DemandLine {
  projectId: string;
  projectName: string;
  workstreamId: string;
  workstreamName: string;
  fundingSource: FundingSource;
}

export function getAllDemandLines(
  projects: Project[],
  stageFilter?: WorkflowStage[]
): EnrichedDemandLine[] {
  const results: EnrichedDemandLine[] = [];
  for (const project of projects) {
    if (stageFilter && !stageFilter.includes(project.stage)) continue;
    for (const ws of project.workstreams) {
      for (const dl of ws.demandLines) {
        results.push({
          ...dl,
          projectId: project.id,
          projectName: project.name,
          workstreamId: ws.id,
          workstreamName: ws.name,
          fundingSource: ws.fundingSource,
        });
      }
    }
  }
  return results;
}
