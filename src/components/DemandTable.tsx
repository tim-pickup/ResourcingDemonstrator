import React from 'react';
import {
  Avatar,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Tooltip,
  tokens,
} from '@fluentui/react-components';
import { DemandLine, WorkflowStage } from '../types';
import { useAppContext } from '../context/AppContext';
import { getSkillById, getThemeForSkill } from '../utils/taxonomy';
import { GapIndicator } from './GapIndicator';
import { SkillBadge } from './SkillBadge';

interface DemandTableProps {
  demandLines: DemandLine[];
  workstreamId: string;
  projectStage: WorkflowStage;
  onAllocate?: (workstreamId: string, demandLineId: string) => void;
}

const COLUMNS = [
  { key: 'skill', label: 'Skill' },
  { key: 'level', label: 'Required Level' },
  { key: 'fte', label: 'FTE' },
  { key: 'period', label: 'Period' },
  { key: 'justification', label: 'Justification' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

function getThemeBadgeColor(themeId: string): 'informative' | 'brand' {
  return themeId === 'MOM' ? 'informative' : 'brand';
}

export function DemandTable({
  demandLines,
  workstreamId,
  projectStage,
  onAllocate,
}: DemandTableProps) {
  const { state } = useAppContext();

  return (
    <Table size="small" style={{ width: '100%' }}>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableHeaderCell key={col.key}>
              <Text weight="semibold" size={200}>
                {col.label}
              </Text>
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {demandLines.map((dl) => {
          const skill = getSkillById(dl.skillId);
          const theme = getThemeForSkill(dl.skillId);
          const assignedMember = dl.assignedTeamMemberId
            ? state.teamMembers.find((m) => m.id === dl.assignedTeamMemberId)
            : undefined;

          return (
            <TableRow key={dl.id}>
              {/* Skill */}
              <TableCell>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacingHorizontalXS,
                    flexWrap: 'wrap',
                  }}
                >
                  {theme && (
                    <Badge
                      appearance="outline"
                      color={getThemeBadgeColor(theme.id)}
                      size="small"
                    >
                      {theme.shortName}
                    </Badge>
                  )}
                  <Text size={200}>{skill?.name ?? dl.skillId}</Text>
                </div>
              </TableCell>

              {/* Required Level */}
              <TableCell>
                <SkillBadge level={dl.requiredLevel} size="small" />
              </TableCell>

              {/* FTE */}
              <TableCell>
                <Text size={200}>{dl.fte}</Text>
              </TableCell>

              {/* Period */}
              <TableCell>
                <Text size={200}>
                  {dl.startQuarter === dl.endQuarter
                    ? dl.startQuarter
                    : `${dl.startQuarter} – ${dl.endQuarter}`}
                </Text>
              </TableCell>

              {/* Justification */}
              <TableCell style={{ maxWidth: 200 }}>
                <Tooltip content={dl.justification} relationship="label">
                  <Text
                    size={200}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      cursor: 'default',
                    }}
                  >
                    {dl.justification}
                  </Text>
                </Tooltip>
              </TableCell>

              {/* Status */}
              <TableCell>
                {assignedMember ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacingHorizontalXS,
                    }}
                  >
                    <Avatar
                      name={assignedMember.name}
                      initials={assignedMember.initials}
                      size={20}
                    />
                    <Text size={200}>{assignedMember.name}</Text>
                  </div>
                ) : dl.isGap ? (
                  <GapIndicator />
                ) : (
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                    —
                  </Text>
                )}
              </TableCell>

              {/* Action */}
              <TableCell>
                {projectStage === WorkflowStage.Approved && onAllocate ? (
                  <Button
                    size="small"
                    appearance="primary"
                    onClick={() => onAllocate(workstreamId, dl.id)}
                  >
                    Allocate
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
