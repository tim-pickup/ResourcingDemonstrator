import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  tokens,
} from '@fluentui/react-components';
import { useAppContext } from '../context/AppContext';
import { QUARTER_ORDER } from '../types';
import { getAllocatedFTE } from '../utils/allocation';
import { getSkillById, getThemeForSkill } from '../utils/taxonomy';
import { SkillBadge } from '../components/SkillBadge';

function getAllocationCellStyle(fte: number): React.CSSProperties {
  if (fte <= 0) {
    return { backgroundColor: 'white' };
  }
  if (fte < 0.75) {
    return { backgroundColor: '#d4edda' }; // green
  }
  if (fte < 1.0) {
    return { backgroundColor: '#fff3cd' }; // amber
  }
  return { backgroundColor: '#f8d7da' }; // red
}

export function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppContext();

  const member = state.teamMembers.find((m) => m.id === id);

  if (!member) {
    return (
      <div style={{ padding: tokens.spacingVerticalL }}>
        <Text size={500} weight="semibold">Team member not found.</Text>
      </div>
    );
  }

  // Compute per-quarter FTE allocations
  const quarterAllocations = QUARTER_ORDER.map((q) => ({
    quarter: q,
    fte: getAllocatedFTE(member.id, q, state.projects),
  }));

  // Build per-quarter project/workstream breakdown
  interface QuarterBreakdownItem {
    projectName: string;
    workstreamName: string;
    fte: number;
  }

  const quarterBreakdown: Record<string, QuarterBreakdownItem[]> = {};
  for (const q of QUARTER_ORDER) {
    quarterBreakdown[q] = [];
  }

  for (const project of state.projects) {
    for (const ws of project.workstreams) {
      for (const dl of ws.demandLines) {
        if (dl.assignedTeamMemberId !== member.id) continue;
        const startIdx = QUARTER_ORDER.indexOf(dl.startQuarter);
        const endIdx = QUARTER_ORDER.indexOf(dl.endQuarter);
        for (let i = startIdx; i <= endIdx; i++) {
          const q = QUARTER_ORDER[i];
          quarterBreakdown[q].push({
            projectName: project.name,
            workstreamName: ws.name,
            fte: dl.fte,
          });
        }
      }
    }
  }

  // Current assignments (all assigned demand lines)
  interface AssignmentItem {
    projectName: string;
    workstreamName: string;
    skillName: string;
    fte: number;
    startQuarter: string;
    endQuarter: string;
  }

  const assignments: AssignmentItem[] = [];
  for (const project of state.projects) {
    for (const ws of project.workstreams) {
      for (const dl of ws.demandLines) {
        if (dl.assignedTeamMemberId !== member.id) continue;
        const skill = getSkillById(dl.skillId);
        assignments.push({
          projectName: project.name,
          workstreamName: ws.name,
          skillName: skill?.name ?? dl.skillId,
          fte: dl.fte,
          startQuarter: dl.startQuarter,
          endQuarter: dl.endQuarter,
        });
      }
    }
  }

  return (
    <div
      style={{
        padding: tokens.spacingVerticalL,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXL,
      }}
    >
      {/* 1. Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalL }}>
        <Avatar name={member.name} initials={member.initials} size={72} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text size={700} weight="bold">{member.name}</Text>
          <Text size={400} style={{ color: tokens.colorNeutralForeground3 }}>
            {member.roleTitle}
          </Text>
        </div>
      </div>

      {/* 2. Skills table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
        <Text size={500} weight="semibold">Skills</Text>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell style={{ fontWeight: 600 }}>Theme</TableHeaderCell>
              <TableHeaderCell style={{ fontWeight: 600 }}>Skill</TableHeaderCell>
              <TableHeaderCell style={{ fontWeight: 600 }}>Proficiency</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {member.skills.map((s) => {
              const skill = getSkillById(s.skillId);
              const theme = getThemeForSkill(s.skillId);
              return (
                <TableRow key={s.skillId}>
                  <TableCell>
                    <Badge appearance="outline" color="informative" size="small">
                      {theme?.shortName ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>{skill?.name ?? s.skillId}</Text>
                    <Text
                      size={100}
                      style={{ color: tokens.colorNeutralForeground3, marginLeft: 6 }}
                    >
                      {s.skillId}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <SkillBadge skillId={undefined} level={s.level} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 3. Allocation timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
        <Text size={500} weight="semibold">Allocation Timeline</Text>
        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                {QUARTER_ORDER.map((q) => (
                  <TableHeaderCell key={q} style={{ fontWeight: 600, minWidth: 160 }}>
                    {q}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* FTE total row */}
              <TableRow>
                {QUARTER_ORDER.map((q) => {
                  const fte = getAllocatedFTE(member.id, q, state.projects);
                  const cellStyle = getAllocationCellStyle(fte);
                  return (
                    <TableCell key={q} style={cellStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Text size={300} weight="semibold">
                          {fte > 0 ? `${fte.toFixed(2)} FTE` : '—'}
                        </Text>
                        {quarterBreakdown[q].map((item, idx) => (
                          <Text
                            key={idx}
                            size={100}
                            style={{ color: tokens.colorNeutralForeground3 }}
                          >
                            {item.projectName} / {item.workstreamName} ({item.fte} FTE)
                          </Text>
                        ))}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalM, flexWrap: 'wrap', marginTop: 4 }}>
          {[
            { color: '#d4edda', label: '< 0.75 FTE (available)' },
            { color: '#fff3cd', label: '0.75–0.99 FTE (near capacity)' },
            { color: '#f8d7da', label: '≥ 1.0 FTE (at/over capacity)' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: color,
                  border: '1px solid #ccc',
                  borderRadius: 3,
                  flexShrink: 0,
                }}
              />
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{label}</Text>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Current assignments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
        <Text size={500} weight="semibold">Current Assignments</Text>
        {assignments.length === 0 ? (
          <Text style={{ color: tokens.colorNeutralForeground3 }}>No current assignments.</Text>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ fontWeight: 600 }}>Project</TableHeaderCell>
                <TableHeaderCell style={{ fontWeight: 600 }}>Workstream</TableHeaderCell>
                <TableHeaderCell style={{ fontWeight: 600 }}>Skill</TableHeaderCell>
                <TableHeaderCell style={{ fontWeight: 600 }}>FTE</TableHeaderCell>
                <TableHeaderCell style={{ fontWeight: 600 }}>Period</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Text size={300} weight="semibold">{a.projectName}</Text>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>{a.workstreamName}</Text>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>{a.skillName}</Text>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>{a.fte}</Text>
                  </TableCell>
                  <TableCell>
                    <Text size={300}>
                      {a.startQuarter === a.endQuarter
                        ? a.startQuarter
                        : `${a.startQuarter} – ${a.endQuarter}`}
                    </Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
