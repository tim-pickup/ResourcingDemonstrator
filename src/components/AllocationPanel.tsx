import React from 'react';
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Text,
  tokens,
} from '@fluentui/react-components';
import { DemandLine, QUARTER_ORDER } from '../types';
import { useAppContext } from '../context/AppContext';
import {
  getAllocatedFTE,
  getCandidatesForSkill,
  meetsRequiredLevel,
} from '../utils/allocation';
import { getSkillById } from '../utils/taxonomy';

interface AllocationPanelProps {
  demandLine: DemandLine;
  projectId: string;
  workstreamId: string;
  open: boolean;
  onClose: () => void;
}

type CandidateTier = 'meets-available' | 'meets-busy' | 'partial' | 'below' | 'unavailable';

function getCandidateTier(
  meetsReq: boolean,
  isFullyUnavailable: boolean,
  peakAllocation: number
): CandidateTier {
  if (isFullyUnavailable) return 'unavailable';
  if (meetsReq && peakAllocation < 1) return 'meets-available';
  if (meetsReq) return 'meets-busy';
  if (peakAllocation < 1) return 'partial';
  return 'below';
}

const TIER_ORDER: CandidateTier[] = [
  'meets-available',
  'meets-busy',
  'partial',
  'below',
  'unavailable',
];

export function AllocationPanel({
  demandLine,
  projectId,
  workstreamId,
  open,
  onClose,
}: AllocationPanelProps) {
  const { state, dispatch } = useAppContext();

  const skill = getSkillById(demandLine.skillId);

  // Quarters in the demand window
  const demandQuarters = QUARTER_ORDER.filter((q) => {
    const qi = QUARTER_ORDER.indexOf(q);
    const si = QUARTER_ORDER.indexOf(demandLine.startQuarter);
    const ei = QUARTER_ORDER.indexOf(demandLine.endQuarter);
    return qi >= si && qi <= ei;
  });

  const candidates = getCandidatesForSkill(demandLine.skillId, state.teamMembers);

  interface CandidateInfo {
    member: (typeof state.teamMembers)[0];
    memberSkillLevel: import('../types').ProficiencyLevel | null;
    meetsReq: boolean;
    peakAllocation: number;
    isFullyUnavailable: boolean;
    tier: CandidateTier;
  }

  const candidateInfos: CandidateInfo[] = candidates.map((member) => {
    const memberSkillEntry = member.skills.find((s) => s.skillId === demandLine.skillId);
    const memberSkillLevel = memberSkillEntry?.level ?? null;
    const meetsReq = memberSkillLevel
      ? meetsRequiredLevel(memberSkillLevel, demandLine.requiredLevel)
      : false;

    const quarterAllocations = demandQuarters.map((q) =>
      getAllocatedFTE(member.id, q, state.projects)
    );
    const peakAllocation = Math.max(...quarterAllocations, 0);
    const isFullyUnavailable =
      demandQuarters.length > 0 &&
      demandQuarters.every((q) => getAllocatedFTE(member.id, q, state.projects) >= 1);

    const tier = getCandidateTier(meetsReq, isFullyUnavailable, peakAllocation);

    return {
      member,
      memberSkillLevel,
      meetsReq,
      peakAllocation,
      isFullyUnavailable,
      tier,
    };
  });

  candidateInfos.sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  );

  function handleSelect(teamMemberId: string) {
    dispatch({
      type: 'ALLOCATE_DEMAND_LINE',
      projectId,
      workstreamId,
      demandLineId: demandLine.id,
      teamMemberId,
    });
    onClose();
  }

  function handleFlagGap() {
    dispatch({
      type: 'FLAG_GAP',
      projectId,
      workstreamId,
      demandLineId: demandLine.id,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(_e, data) => { if (!data.open) onClose(); }}>
      <DialogSurface style={{ maxWidth: 560, width: '100%' }}>
        <DialogBody>
          <DialogTitle>Allocate Resource</DialogTitle>
          <DialogContent>
            {/* Demand line summary */}
            <div
              style={{
                background: tokens.colorNeutralBackground2,
                borderRadius: tokens.borderRadiusMedium,
                padding: tokens.spacingVerticalS,
                marginBottom: tokens.spacingVerticalM,
                display: 'flex',
                flexWrap: 'wrap',
                gap: tokens.spacingHorizontalS,
              }}
            >
              <Text size={200}>
                <strong>Skill:</strong> {skill?.name ?? demandLine.skillId}
              </Text>
              <Text size={200}>
                <strong>Level:</strong> {demandLine.requiredLevel}
              </Text>
              <Text size={200}>
                <strong>FTE:</strong> {demandLine.fte}
              </Text>
              <Text size={200}>
                <strong>Period:</strong>{' '}
                {demandLine.startQuarter === demandLine.endQuarter
                  ? demandLine.startQuarter
                  : `${demandLine.startQuarter} – ${demandLine.endQuarter}`}
              </Text>
            </div>

            {/* Candidate list */}
            {candidateInfos.length === 0 ? (
              <Text style={{ color: tokens.colorNeutralForeground3 }}>
                No team members have this skill.
              </Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
                {candidateInfos.map(
                  ({
                    member,
                    memberSkillLevel,
                    meetsReq,
                    peakAllocation,
                    isFullyUnavailable,
                    tier,
                  }) => {
                    const allocationPct = Math.round(peakAllocation * 100);

                    return (
                      <div
                        key={member.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacingHorizontalS,
                          padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
                          borderRadius: tokens.borderRadiusMedium,
                          background: isFullyUnavailable
                            ? tokens.colorNeutralBackground2
                            : tokens.colorNeutralBackground1,
                          opacity: isFullyUnavailable ? 0.6 : 1,
                          border: `1px solid ${tokens.colorNeutralStroke2}`,
                        }}
                      >
                        <Avatar name={member.name} initials={member.initials} size={32} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text weight="semibold" size={200}>
                            {member.name}
                          </Text>
                          <div
                            style={{
                              display: 'flex',
                              gap: tokens.spacingHorizontalXS,
                              marginTop: 2,
                              flexWrap: 'wrap',
                              alignItems: 'center',
                            }}
                          >
                            {memberSkillLevel && (
                              <Badge
                                appearance={meetsReq ? 'filled' : 'outline'}
                                color={meetsReq ? 'success' : 'warning'}
                                size="small"
                              >
                                {memberSkillLevel}
                              </Badge>
                            )}
                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                              Peak alloc: {allocationPct}%
                            </Text>
                            {isFullyUnavailable && (
                              <Badge appearance="filled" color="danger" size="small">
                                Unavailable
                              </Badge>
                            )}
                            {!meetsReq && !isFullyUnavailable && (
                              <Badge appearance="outline" color="warning" size="small">
                                Below required level
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          size="small"
                          appearance="primary"
                          disabled={isFullyUnavailable}
                          onClick={() => handleSelect(member.id)}
                        >
                          Select
                        </Button>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </DialogContent>

          <DialogActions>
            <Button appearance="secondary" onClick={handleFlagGap}>
              Flag as Gap
            </Button>
            <Button appearance="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
