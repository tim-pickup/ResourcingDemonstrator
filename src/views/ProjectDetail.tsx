import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
  MessageBar,
  MessageBarBody,
  Text,
  tokens,
} from '@fluentui/react-components';
import { useAppContext } from '../context/AppContext';
import { WorkflowStage, UserRole, DemandLine } from '../types';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { WorkstreamSection } from '../components/WorkstreamSection';
import { AllocationPanel } from '../components/AllocationPanel';

type StageBadgeColor = 'subtle' | 'warning' | 'success' | 'brand' | 'danger';
type StageBadgeAppearance = 'outline' | 'filled';

function getStageBadge(stage: WorkflowStage): { color: StageBadgeColor; appearance: StageBadgeAppearance } {
  switch (stage) {
    case WorkflowStage.Draft:
      return { color: 'subtle', appearance: 'outline' };
    case WorkflowStage.Submitted:
      return { color: 'warning', appearance: 'filled' };
    case WorkflowStage.Approved:
      return { color: 'success', appearance: 'filled' };
    case WorkflowStage.Allocated:
      return { color: 'brand', appearance: 'filled' };
    case WorkflowStage.Rejected:
      return { color: 'danger', appearance: 'filled' };
    default:
      return { color: 'subtle', appearance: 'outline' };
  }
}

interface AllocationTarget {
  workstreamId: string;
  demandLine: DemandLine;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppContext();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [allocationTarget, setAllocationTarget] = useState<AllocationTarget | null>(null);

  const project = state.projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div style={{ padding: tokens.spacingVerticalL }}>
        <Text size={500} weight="semibold">Project not found.</Text>
      </div>
    );
  }

  const { color, appearance } = getStageBadge(project.stage);

  const totalFTE = project.workstreams.reduce(
    (sum, ws) => sum + ws.demandLines.reduce((s, dl) => s + dl.fte, 0),
    0
  );

  const { currentRole } = state;

  function handleSubmit() {
    dispatch({ type: 'SUBMIT_PROJECT', projectId: project!.id });
  }

  function handleApprove() {
    dispatch({ type: 'APPROVE_PROJECT', projectId: project!.id });
  }

  function handleRejectConfirm() {
    if (!rejectReason.trim()) return;
    dispatch({ type: 'REJECT_PROJECT', projectId: project!.id, reason: rejectReason.trim() });
    setRejectDialogOpen(false);
    setRejectReason('');
  }

  function handleAllocate(workstreamId: string, demandLineId: string) {
    const ws = project!.workstreams.find((w) => w.id === workstreamId);
    if (!ws) return;
    const dl = ws.demandLines.find((d) => d.id === demandLineId);
    if (!dl) return;
    setAllocationTarget({ workstreamId, demandLine: dl });
  }

  return (
    <div style={{ padding: tokens.spacingVerticalL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }}>
      {/* 1. Workflow stepper */}
      <WorkflowStepper currentStage={project.stage} />

      {/* 2. Project summary card */}
      <Card style={{ padding: tokens.spacingVerticalM }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
          {/* Name + badge row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: tokens.spacingHorizontalS,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Text size={600} weight="bold">{project.name}</Text>
              <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                {project.code}
              </Text>
            </div>
            <Badge color={color} appearance={appearance} size="large">
              {project.stage}
            </Badge>
          </div>

          {/* Description */}
          <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
            {project.description}
          </Text>

          {/* Stats */}
          <div style={{ display: 'flex', gap: tokens.spacingHorizontalXL, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Total FTE Demand</Text>
              <Text size={400} weight="semibold">{totalFTE.toFixed(2)}</Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Workstreams</Text>
              <Text size={400} weight="semibold">{project.workstreams.length}</Text>
            </div>
          </div>

          {/* Rejection reason */}
          {project.stage === WorkflowStage.Rejected && project.rejectionReason && (
            <MessageBar intent="error">
              <MessageBarBody>
                <Text weight="semibold">Rejection reason: </Text>
                {project.rejectionReason}
              </MessageBarBody>
            </MessageBar>
          )}

          {/* 3. Action buttons */}
          {project.stage === WorkflowStage.Draft && currentRole === UserRole.ProjectLead && (
            <div style={{ display: 'flex', gap: tokens.spacingHorizontalS, marginTop: tokens.spacingVerticalXS }}>
              <Button appearance="primary" onClick={handleSubmit}>
                Submit for Review
              </Button>
            </div>
          )}

          {project.stage === WorkflowStage.Submitted && currentRole === UserRole.PMO && (
            <div style={{ display: 'flex', gap: tokens.spacingHorizontalS, marginTop: tokens.spacingVerticalXS }}>
              <Button appearance="primary" onClick={handleApprove}>
                Approve
              </Button>
              <Button appearance="outline" onClick={() => setRejectDialogOpen(true)}>
                Reject
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Workstream sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
        <Text size={500} weight="semibold">Workstreams</Text>
        {project.workstreams.map((ws) => (
          <WorkstreamSection
            key={ws.id}
            workstream={ws}
            projectStage={project.stage}
            projectId={project.id}
            onAllocate={handleAllocate}
          />
        ))}
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={(_e, data) => { if (!data.open) setRejectDialogOpen(false); }}>
        <DialogSurface style={{ maxWidth: 480, width: '100%' }}>
          <DialogBody>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
                <Text size={300}>
                  Please provide a reason for rejecting <strong>{project.name}</strong>.
                </Text>
                <Input
                  placeholder="Enter rejection reason…"
                  value={rejectReason}
                  onChange={(_e, data) => setRejectReason(data.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
              <Button appearance="outline" onClick={() => { setRejectDialogOpen(false); setRejectReason(''); }}>
                Cancel
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Allocation panel */}
      {allocationTarget && (
        <AllocationPanel
          demandLine={allocationTarget.demandLine}
          projectId={project.id}
          workstreamId={allocationTarget.workstreamId}
          open={true}
          onClose={() => setAllocationTarget(null)}
        />
      )}
    </div>
  );
}
