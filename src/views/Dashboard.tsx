import React, { useState, useMemo } from 'react';
import {
  Card,
  Dropdown,
  Option,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  MessageBar,
  MessageBarBody,
  Text,
  Badge,
  tokens,
} from '@fluentui/react-components';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { getAllDemandLines, getAllocatedFTE } from '../utils/allocation';
import { getSkillById, getThemeForSkill } from '../utils/taxonomy';
import { THEMES } from '../data/taxonomy';
import { QUARTER_ORDER, WorkflowStage, FundingSource } from '../types';

// Stable color array for team members in stacked bar chart (12 members)
const MEMBER_COLORS = [
  '#0078d4', '#107c10', '#d83b01', '#8a2be2', '#008272',
  '#ca5010', '#004b50', '#6b69d6', '#038387', '#b4009e',
  '#e3008c', '#004e8c',
];

// Active project stages for demand calculations
const ACTIVE_STAGES: WorkflowStage[] = [WorkflowStage.Approved, WorkflowStage.Allocated];

// Cell background color for the skills heatmap
function heatmapCellStyle(fte: number): React.CSSProperties {
  if (fte <= 0) return { backgroundColor: '#ffffff' };
  if (fte <= 0.5) return { backgroundColor: '#ddeeff' };
  if (fte <= 1.0) return { backgroundColor: '#aaccff' };
  return { backgroundColor: '#5599dd', color: '#ffffff' };
}

export default function Dashboard() {
  const { state } = useAppContext();
  const [themeFilter, setThemeFilter] = useState<string>('All');

  // Demand lines for approved+allocated projects only
  const activeDemandLines = useMemo(
    () => getAllDemandLines(state.projects, ACTIVE_STAGES),
    [state.projects]
  );

  // All demand lines across all stages (for gaps — gaps can be flagged on any project)
  const allDemandLines = useMemo(
    () => getAllDemandLines(state.projects),
    [state.projects]
  );

  // Skills filtered by selected theme
  const filteredSkills = useMemo(() => {
    if (themeFilter === 'All') return THEMES.flatMap((t) => t.skills);
    const theme = THEMES.find((t) => t.shortName === themeFilter || t.id === themeFilter);
    return theme ? theme.skills : [];
  }, [themeFilter]);

  // ── Widget 1: Demand vs Supply by Skill ─────────────────────────────────────
  const demandSupplyData = useMemo(() => {
    return filteredSkills.map((skill) => {
      // Total demand FTE from approved+allocated projects for this skill
      const demandFte = activeDemandLines
        .filter((dl) => dl.skillId === skill.id)
        .reduce((sum, dl) => sum + dl.fte, 0);

      // Supply: each team member with the skill contributes (1.0 - average allocated FTE)
      const membersWithSkill = state.teamMembers.filter((m) =>
        m.skills.some((s) => s.skillId === skill.id)
      );
      const supplyFte = membersWithSkill.reduce((sum, member) => {
        const avgAllocated =
          QUARTER_ORDER.reduce(
            (acc, q) => acc + getAllocatedFTE(member.id, q, state.projects),
            0
          ) / QUARTER_ORDER.length;
        return sum + Math.max(0, 1.0 - avgAllocated);
      }, 0);

      return {
        skill: skill.id,
        demand: Math.round(demandFte * 100) / 100,
        supply: Math.round(supplyFte * 100) / 100,
      };
    });
  }, [filteredSkills, activeDemandLines, state.teamMembers, state.projects]);

  // ── Widget 2: Team Load by Quarter ──────────────────────────────────────────
  const teamLoadData = useMemo(() => {
    return QUARTER_ORDER.map((quarter) => {
      const entry: Record<string, number | string> = { quarter };
      state.teamMembers.forEach((member) => {
        entry[member.id] = Math.round(getAllocatedFTE(member.id, quarter, state.projects) * 100) / 100;
      });
      return entry;
    });
  }, [state.teamMembers, state.projects]);

  // ── Widget 3: Gaps Summary ───────────────────────────────────────────────────
  const gapLines = useMemo(
    () => allDemandLines.filter((dl) => dl.isGap === true),
    [allDemandLines]
  );

  // ── Widget 4: Skills Heatmap ─────────────────────────────────────────────────
  const heatmapData = useMemo(() => {
    return filteredSkills.map((skill) => {
      const row: Record<string, number | string> = { skillId: skill.id, skillName: skill.name };
      QUARTER_ORDER.forEach((q) => {
        const qi = QUARTER_ORDER.indexOf(q);
        const totalFte = activeDemandLines
          .filter((dl) => {
            if (dl.skillId !== skill.id) return false;
            const si = QUARTER_ORDER.indexOf(dl.startQuarter);
            const ei = QUARTER_ORDER.indexOf(dl.endQuarter);
            return qi >= si && qi <= ei;
          })
          .reduce((sum, dl) => sum + dl.fte, 0);
        row[q] = Math.round(totalFte * 100) / 100;
      });
      return row;
    });
  }, [filteredSkills, activeDemandLines]);

  // ── Widget 5: Funding Source Breakdown ───────────────────────────────────────
  const fundingData = useMemo(() => {
    const totals: Record<string, number> = {
      [FundingSource.Sector]: 0,
      [FundingSource.Project]: 0,
    };
    for (const dl of activeDemandLines) {
      totals[dl.fundingSource] = (totals[dl.fundingSource] ?? 0) + dl.fte;
    }
    return [FundingSource.Sector, FundingSource.Project]
      .map((name) => ({ name, value: Math.round((totals[name] ?? 0) * 100) / 100 }))
      .filter((d) => d.value > 0);
  }, [activeDemandLines]);

  const fundingColors: Record<string, string> = {
    [FundingSource.Sector]: '#0078d4',
    [FundingSource.Project]: '#8a2be2',
  };

  return (
    <div style={{ padding: tokens.spacingVerticalL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }}>
      {/* Header + theme filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: tokens.spacingHorizontalM,
        }}
      >
        <Text size={700} weight="bold">Dashboard</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
          <Text size={300}>Theme:</Text>
          <Dropdown
            value={themeFilter}
            selectedOptions={[themeFilter]}
            onOptionSelect={(_e, data) => setThemeFilter(data.optionValue ?? 'All')}
            style={{ minWidth: 160 }}
          >
            <Option value="All">All</Option>
            {THEMES.map((t) => (
              <Option key={t.id} value={t.shortName} text={t.shortName}>
                {t.shortName}
              </Option>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Widget grid — 2 columns on wide screens */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
      >
        {/* ── Widget 1: Demand vs Supply by Skill ── */}
        <Card style={{ padding: tokens.spacingVerticalM, overflow: 'hidden' }}>
          <Text size={500} weight="semibold" style={{ display: 'block', marginBottom: tokens.spacingVerticalS }}>
            Demand vs Supply by Skill
          </Text>
          {demandSupplyData.length === 0 ? (
            <Text style={{ color: tokens.colorNeutralForeground3 }}>No skills to display.</Text>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <BarChart
                width={Math.max(400, demandSupplyData.length * 64 + 80)}
                height={280}
                data={demandSupplyData}
                margin={{ top: 8, right: 16, left: 0, bottom: 56 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="skill"
                  tick={{ fontSize: 10 }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  label={{
                    value: 'FTE',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: { fontSize: 11 },
                  }}
                />
                <RechartsTooltip formatter={(value) => [`${value} FTE`]} />
                <Legend verticalAlign="top" />
                <Bar dataKey="demand" name="Demand FTE" fill="#0078d4" />
                <Bar dataKey="supply" name="Supply FTE" fill="#c7e0f4" />
              </BarChart>
            </div>
          )}
        </Card>

        {/* ── Widget 2: Team Load by Quarter ── */}
        <Card style={{ padding: tokens.spacingVerticalM, overflow: 'hidden' }}>
          <Text size={500} weight="semibold" style={{ display: 'block', marginBottom: tokens.spacingVerticalS }}>
            Team Load by Quarter
          </Text>
          <div style={{ overflowX: 'auto' }}>
            <BarChart
              width={480}
              height={280}
              data={teamLoadData}
              margin={{ top: 8, right: 80, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{
                  value: 'FTE',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { fontSize: 11 },
                }}
              />
              <RechartsTooltip
                formatter={(value, memberId) => {
                  const member = state.teamMembers.find((m) => m.id === memberId);
                  return [`${value} FTE`, member ? member.name : String(memberId)];
                }}
              />
              <ReferenceLine
                y={state.teamMembers.length}
                stroke="#d13438"
                strokeDasharray="4 2"
                label={{
                  value: `${state.teamMembers.length} (100% cap)`,
                  position: 'right',
                  fontSize: 10,
                  fill: '#d13438',
                }}
              />
              {state.teamMembers.map((member, idx) => (
                <Bar
                  key={member.id}
                  dataKey={member.id}
                  name={member.name}
                  stackId="load"
                  fill={MEMBER_COLORS[idx % MEMBER_COLORS.length]}
                />
              ))}
            </BarChart>
          </div>
          <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>
            Each segment = one team member's allocated FTE for the quarter.
          </Text>
        </Card>

        {/* ── Widget 3: Gaps Summary ── */}
        <Card style={{ padding: tokens.spacingVerticalM }}>
          <Text size={500} weight="semibold" style={{ display: 'block', marginBottom: tokens.spacingVerticalS }}>
            Gaps Summary
          </Text>
          {gapLines.length === 0 ? (
            <MessageBar intent="success">
              <MessageBarBody>No resource gaps identified.</MessageBarBody>
            </MessageBar>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell style={{ fontWeight: 600 }}>Project</TableHeaderCell>
                    <TableHeaderCell style={{ fontWeight: 600 }}>Workstream</TableHeaderCell>
                    <TableHeaderCell style={{ fontWeight: 600 }}>Skill</TableHeaderCell>
                    <TableHeaderCell style={{ fontWeight: 600 }}>Required Level</TableHeaderCell>
                    <TableHeaderCell style={{ fontWeight: 600 }}>FTE</TableHeaderCell>
                    <TableHeaderCell style={{ fontWeight: 600 }}>Quarter</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gapLines.map((dl) => {
                    const skill = getSkillById(dl.skillId);
                    return (
                      <TableRow key={`${dl.projectId}-${dl.id}`}>
                        <TableCell>
                          <Text size={300} weight="semibold">{dl.projectName}</Text>
                        </TableCell>
                        <TableCell>
                          <Text size={300}>{dl.workstreamName}</Text>
                        </TableCell>
                        <TableCell>
                          <Text size={300}>{skill?.name ?? dl.skillId}</Text>
                        </TableCell>
                        <TableCell>
                          <Badge appearance="filled" color="warning" size="small">
                            {dl.requiredLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Text size={300}>{dl.fte}</Text>
                        </TableCell>
                        <TableCell>
                          <Text size={300}>
                            {dl.startQuarter === dl.endQuarter
                              ? dl.startQuarter
                              : `${dl.startQuarter} – ${dl.endQuarter}`}
                          </Text>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* ── Widget 4: Skills Heatmap ── */}
        <Card style={{ padding: tokens.spacingVerticalM }}>
          <Text size={500} weight="semibold" style={{ display: 'block', marginBottom: tokens.spacingVerticalS }}>
            Skills Heatmap (Demand FTE — Approved &amp; Allocated)
          </Text>
          {heatmapData.length === 0 ? (
            <Text style={{ color: tokens.colorNeutralForeground3 }}>No skills to display.</Text>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell style={{ fontWeight: 600, minWidth: 160 }}>Skill</TableHeaderCell>
                    {QUARTER_ORDER.map((q) => (
                      <TableHeaderCell key={q} style={{ fontWeight: 600, minWidth: 86, textAlign: 'center' }}>
                        {q}
                      </TableHeaderCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heatmapData.map((row) => {
                    const skillId = row.skillId as string;
                    const theme = getThemeForSkill(skillId);
                    return (
                      <TableRow key={skillId}>
                        <TableCell>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Badge appearance="outline" color="informative" size="small">
                                {theme?.shortName ?? '—'}
                              </Badge>
                              <Text size={200} weight="semibold">{skillId}</Text>
                            </div>
                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                              {row.skillName as string}
                            </Text>
                          </div>
                        </TableCell>
                        {QUARTER_ORDER.map((q) => {
                          const fte = (row[q] as number) ?? 0;
                          return (
                            <TableCell
                              key={q}
                              style={{
                                ...heatmapCellStyle(fte),
                                textAlign: 'center',
                                padding: '6px 8px',
                              }}
                            >
                              <Text size={200}>{fte > 0 ? fte.toFixed(2) : '—'}</Text>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* Heatmap color legend */}
              <div style={{ display: 'flex', gap: tokens.spacingHorizontalM, flexWrap: 'wrap', marginTop: 8 }}>
                {[
                  { bg: '#ffffff', border: '1px solid #ccc', label: '0 FTE' },
                  { bg: '#ddeeff', border: 'none', label: '0.01–0.5 FTE' },
                  { bg: '#aaccff', border: 'none', label: '0.5–1.0 FTE' },
                  { bg: '#5599dd', border: 'none', label: '> 1.0 FTE' },
                ].map(({ bg, border, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor: bg,
                        border: border || '1px solid #ccc',
                        borderRadius: 3,
                        flexShrink: 0,
                      }}
                    />
                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{label}</Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ── Widget 5: Funding Source Breakdown ── */}
        <Card style={{ padding: tokens.spacingVerticalM }}>
          <Text size={500} weight="semibold" style={{ display: 'block', marginBottom: tokens.spacingVerticalS }}>
            Funding Source Breakdown
          </Text>
          {fundingData.length === 0 ? (
            <Text style={{ color: tokens.colorNeutralForeground3 }}>No active demand to display.</Text>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXL, flexWrap: 'wrap' }}>
              <PieChart width={260} height={260}>
                <Pie
                  data={fundingData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }: { name: string; percent: number }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {fundingData.map((entry) => (
                    <Cell key={entry.name} fill={fundingColors[entry.name] ?? '#888'} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} FTE`]} />
              </PieChart>

              {/* Manual legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
                {fundingData.map((entry) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor: fundingColors[entry.name] ?? '#888',
                        borderRadius: 3,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text size={300} weight="semibold">{entry.name}</Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        {entry.value} FTE
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
