import React, { createContext, useContext, useReducer } from 'react';
import { Project, TeamMember, UserRole, WorkflowStage, Workstream, DemandLine } from '../types';
import { PROJECTS } from '../data/projects';
import { TEAM_MEMBERS } from '../data/team';

interface AppState {
  projects: Project[];
  teamMembers: TeamMember[];
  currentRole: UserRole;
}

type AppAction =
  | { type: 'SET_ROLE'; role: UserRole }
  | { type: 'SUBMIT_PROJECT'; projectId: string }
  | { type: 'APPROVE_PROJECT'; projectId: string }
  | { type: 'REJECT_PROJECT'; projectId: string; reason: string }
  | { type: 'ALLOCATE_DEMAND_LINE'; projectId: string; workstreamId: string; demandLineId: string; teamMemberId: string }
  | { type: 'FLAG_GAP'; projectId: string; workstreamId: string; demandLineId: string }
  | { type: 'CREATE_PROJECT'; project: Project }
  | { type: 'ADD_WORKSTREAM'; projectId: string; workstream: Workstream }
  | { type: 'ADD_DEMAND_LINE'; projectId: string; workstreamId: string; demandLine: DemandLine }
  | { type: 'REMOVE_DEMAND_LINE'; projectId: string; workstreamId: string; demandLineId: string };

function isProjectFullyResolved(project: Project): boolean {
  if (project.workstreams.length === 0) return false;
  for (const ws of project.workstreams) {
    if (ws.demandLines.length === 0) continue;
    for (const dl of ws.demandLines) {
      if (!dl.assignedTeamMemberId && !dl.isGap) return false;
    }
  }
  // At least one demand line must exist to auto-transition
  const totalDemandLines = project.workstreams.reduce((sum, ws) => sum + ws.demandLines.length, 0);
  return totalDemandLines > 0;
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.role };

    case 'SUBMIT_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, stage: WorkflowStage.Submitted } : p
        ),
      };

    case 'APPROVE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, stage: WorkflowStage.Approved } : p
        ),
      };

    case 'REJECT_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? { ...p, stage: WorkflowStage.Rejected, rejectionReason: action.reason }
            : p
        ),
      };

    case 'ALLOCATE_DEMAND_LINE': {
      const projects = state.projects.map((p) => {
        if (p.id !== action.projectId) return p;
        const workstreams = p.workstreams.map((ws) => {
          if (ws.id !== action.workstreamId) return ws;
          return {
            ...ws,
            demandLines: ws.demandLines.map((dl) =>
              dl.id === action.demandLineId
                ? { ...dl, assignedTeamMemberId: action.teamMemberId, isGap: false }
                : dl
            ),
          };
        });
        const updated = { ...p, workstreams };
        if (isProjectFullyResolved(updated)) {
          return { ...updated, stage: WorkflowStage.Allocated };
        }
        return updated;
      });
      return { ...state, projects };
    }

    case 'FLAG_GAP': {
      const projects = state.projects.map((p) => {
        if (p.id !== action.projectId) return p;
        const workstreams = p.workstreams.map((ws) => {
          if (ws.id !== action.workstreamId) return ws;
          return {
            ...ws,
            demandLines: ws.demandLines.map((dl) =>
              dl.id === action.demandLineId
                ? { ...dl, isGap: true, assignedTeamMemberId: undefined }
                : dl
            ),
          };
        });
        const updated = { ...p, workstreams };
        if (isProjectFullyResolved(updated)) {
          return { ...updated, stage: WorkflowStage.Allocated };
        }
        return updated;
      });
      return { ...state, projects };
    }

    case 'CREATE_PROJECT':
      return { ...state, projects: [...state.projects, action.project] };

    case 'ADD_WORKSTREAM':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? { ...p, workstreams: [...p.workstreams, action.workstream] }
            : p
        ),
      };

    case 'ADD_DEMAND_LINE':
      return {
        ...state,
        projects: state.projects.map((p) => {
          if (p.id !== action.projectId) return p;
          return {
            ...p,
            workstreams: p.workstreams.map((ws) =>
              ws.id !== action.workstreamId
                ? ws
                : { ...ws, demandLines: [...ws.demandLines, action.demandLine] }
            ),
          };
        }),
      };

    case 'REMOVE_DEMAND_LINE':
      return {
        ...state,
        projects: state.projects.map((p) => {
          if (p.id !== action.projectId) return p;
          return {
            ...p,
            workstreams: p.workstreams.map((ws) =>
              ws.id !== action.workstreamId
                ? ws
                : { ...ws, demandLines: ws.demandLines.filter((dl) => dl.id !== action.demandLineId) }
            ),
          };
        }),
      };

    default:
      return state;
  }
}

const initialState: AppState = {
  projects: PROJECTS,
  teamMembers: TEAM_MEMBERS,
  currentRole: UserRole.ProjectLead,
};

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
