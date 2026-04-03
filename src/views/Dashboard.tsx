import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button,
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
  ResponsiveContainer,
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { getAllDemandLines, getAllocatedFTE, isQuarterInRange } from '../utils/allocation';
import { getSkillById } from '../utils/taxonomy';
import { THEMES } from '../data/taxonomy';
import { QUARTER_ORDER, WorkflowStage, FundingSource } from '../types';

const ACTIVE_STAGES = [WorkflowStage.Approved, WorkflowStage.Allocated];

const MEMBER_COLORS = [
  '#0078d4', '#107c10', '#d83b01', '#8a2be2', '#008272',
  '#ca5010', '#004b50', '#6b69d6', '#038387', '#b4009e',
  '#e3008c', '#004e8c',
];

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card style={{ padding: '20px 24px', flex: 1, minWidth: 160 }}>
      <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginBottom: 4 }}>
        {label}
      </Text>
      <Text size={700} weight="bold" style={{ color: color ?? tokens.colorNeutralForeground1, display: 'block', lineHeight: 1.1 }}>
        {value}
      </Text>
      {sub && (
        <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>
          {sub}
        </Text>
      )}
    </Card>
  );
}

function WidgetCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: '20px', overflow: 'hidden' }}>
      <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 16 }}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

function heatmapBg(fte: number): string {
  if (fte <= 0) return tokens.colorNeutralBackground1;
  if (fte <= 0.5) return '#dbeeff';
  if (fte <= 1.0) return '#9ac5f5';
  return '#0078d4';
}

export default function Dashboard() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [themeFilter, setThemeFilter] = useState('All');

  const activeDemandLines = useMemo(
    () => getAllDemandLines(state.projects, ACTIVE_STAGES),
    [state.projects]
  );

  const allDemandLines = useMemo(() => getAllDemandLines(state.projects), [state.projects]);

  const filteredSkills = useMemo(() => {
    if (themeFilter === 'All') return THEMES.flatMap((t) => t.skills);
    const t = THEMES.find((th) => th.shortName === themeFilter || th.id === themeFilter);
    return t ? t.skills : [];
  }, [themeFilter]);

  // ── KPI 1: Active Demand ──────────────────────────────────────────────────
  const activeDemandFte = useMemo(
    () => activeDemandLines.reduce((s, dl) => s + dl.fte, 0),
    [activeDemandLines]
  );

  // ── KPI 2: Allocated FTE ─────────────────────────────────────────────────
  const allocatedFte = useMemo(
    () => activeDemandLines.filter((dl) => !!dl.assignedTeamMemberId).reduce((s, dl) => s + dl.fte, 0),
    [activeDemandLines]
  );
  const allocatedPct = activeDemandFte > 0 ? Math.round((allocatedFte / activeDemandFte) * 100) : 0;

  // ── KPI 3: Needs Allocation (Approved, unassigned, not gap) ──────────────
  const needsAllocationLines = useMemo(
    () =>
      getAllDemandLines(state.projects, [WorkflowStage.Approved]).filter(
        (dl) => !dl.assignedTeamMemberId && !dl.isGap
      ),
    [state.projects]
  );

  // ── KPI 4: Over-capacity member×quarter pairs ─────────────────────────────
  const overCapacityCount = useMemo(() => {
    let count = 0;
    for (const m of state.teamMembers) {
      for (const q of QUARTER_ORDER) {
        if (getAllocatedFTE(m.id, q, state.projects) >= 1.0) count++;
      }
    }
    return count;
  }, [state.teamMembers, state.projects]);

  // ── Widget 1: Demand vs Supply ────────────────────────────────────────────
  const demandSupplyData = useMemo(() => {
    return filteredSkills
      .map((skill) => {
        const demand = activeDemandLines
          .filter((dl) => dl.skillId === skill.id)
          .reduce((s, dl) => s + dl.fte, 0);

        const supply = state.teamMembers
          .filter((m) => m.skills.some((s) => s.skillId === skill.id))
          .reduce((sum, member) => {
            const maxAlloc = Math.max(
              ...QUARTER_ORDER.map((q) => getAllocatedFTE(member.id, q, state.projects))
            );
            return sum + Math.max(0, 1.0 - maxAlloc);
          }, 0);

        return {
          skill: skill.id,
          demand: Math.round(demand * 100) / 100,
          supply: Math.round(supply * 100) / 100,
        };
      })
      .filter((d) => d.demand > 0 || d.supply > 0);
  }, [filteredSkills, activeDemandLines, state.teamMembers, state.projects]);

  // ── Widget 2: Team Load by Quarter ────────────────────────────────────────
  const teamLoadData = useMemo(() => {
    return QUARTER_ORDER.map((quarter) => {
      const entry: Record<string, number | string> = { quarter };
      state.teamMembers.forEach((m) => {
        const fte = getAllocatedFTE(m.id, quarter, state.projects);
        if (fte > 0) entry[m.name] = Math.round(fte * 100) / 100;
      });
      return entry;
    });
  }, [state.teamMembers, state.projects]);

  const allocatedMemberNames = useMemo(() => {
    const names = new Set<string>();
    state.projects.forEach((p) =>
      p.workstreams.forEach((ws) =>
        ws.demandLines.forEach((dl) => {
          if (dl.assignedTeamMemberId) {
            const m = state.teamMembers.find((tm) => tm.id === dl.assignedTeamMemberId);
            if (m) names.add(m.name);
          }
        })
      )
    );
    return Array.from(names);
  }, [state.projects, state.teamMembers]);

  // ── Widget 3: Resource Contention ─────────────────────────────────────────
  const contentionData = useMemo(() => {
    const rows: { skill: string; skillName: string; quarter: string; demand: number; supply: number; shortfall: number }[] = [];
    for (const skill of filteredSkills) {
      for (const quarter of QUARTER_ORDER) {
        const qi = QUARTER_ORDER.indexOf(quarter);
        const demand = activeDemandLines
          .filter((dl) => {
            if (dl.skillId !== skill.id) return false;
            const si = QUARTER_ORDER.indexOf(dl.startQuarter);
            const ei = QUARTER_ORDER.indexOf(dl.endQuarter);
            return qi >= si && qi <= ei;
          })
          .reduce((s, dl) => s + dl.fte, 0);

        if (demand === 0) continue;

        const supply = state.teamMembers
          .filter((m) => m.skills.some((s) => s.skillId === skill.id))
          .reduce((sum, m) => {
            const alloc = getAllocatedFTE(m.id, quarter, state.projects);
            return sum + Math.max(0, 1.0 - alloc);
          }, 0);

        const shortfall = Math.round((demand - supply) * 100) / 100;
        if (shortfall > 0) {
          rows.push({
            skill: skill.id,
            skillName: skill.name,
            quarter,
            demand: Math.round(demand * 100) / 100,
            supply: Math.round(supply * 100) / 100,
            shortfall,
          });
        }
      }
    }
    return rows.sort((a, b) => b.shortfall - a.shortfall);
  }, [filteredSkills, activeDemandLines, state.teamMembers, state.projects]);

  // ── Widget 4: Skills Heatmap ──────────────────────────────────────────────
  const heatmapData = useMemo(() => {
    return filteredSkills
      .map((skill) => {
        const row: Record<string, number | string> = { skillId: skill.id };
        let total = 0;
        QUARTER_ORDER.forEach((q) => {
          const qi = QUARTER_ORDER.indexOf(q);
          const fte = activeDemandLines
            .filter((dl) => {
              if (dl.skillId !== skill.id) return false;
              const si = QUARTER_ORDER.indexOf(dl.startQuarter);
              const ei = QUARTER_ORDER.indexOf(dl.endQuarter);
              return qi >= si && qi <= ei;
            })
            .reduce((s, dl) => s + dl.fte, 0);
          const rounded = Math.round(fte * 100) / 100;
          row[q] = rounded;
          total += rounded;
        });
        row['total'] = Math.round(total * 100) / 100;
        return row;
      })
      .filter((row) => (row['total'] as number) > 0);
  }, [filteredSkills, activeDemandLines]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Text size={700} weight="bold">Portfolio Dashboard</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Theme:</Text>
          <Dropdown
            value={themeFilter}
            selectedOptions={[themeFilter]}
            onOptionSelect={(_e, data) => setThemeFilter(data.optionValue ?? 'All')}
            style={{ minWidth: 140 }}
          >
            <Option value="All">All Themes</Option>
            {THEMES.map((t) => (
              <Option key={t.id} value={t.shortName} text={t.shortName}>{t.shortName} — {t.name}</Option>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          label="Active Demand"
          value={`${Math.round(activeDemandFte * 10) / 10} FTE`}
          sub="Approved + Allocated projects"
        />
        <KpiCard
          label="Allocated"
          value={`${Math.round(allocatedFte * 10) / 10} FTE`}
          sub={`${allocatedPct}% of active demand`}
          color={allocatedPct >= 80 ? tokens.colorPaletteGreenForeground1 : tokens.colorBrandForeground1}
        />
        <KpiCard
          label="Needs Allocation"
          value={String(needsAllocationLines.length)}
          sub="Approved lines unassigned"
          color={needsAllocationLines.length > 0 ? tokens.colorPaletteRedForeground3 : tokens.colorPaletteGreenForeground1}
        />
        <KpiCard
          label="Over Capacity"
          value={String(overCapacityCount)}
          sub="Member × quarter at ≥ 1.0 FTE"
          color={overCapacityCount > 0 ? tokens.colorPaletteRedForeground3 : tokens.colorPaletteGreenForeground1}
        />
      </div>

      {/* Row 2: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <WidgetCard title="Demand vs Supply by Skill">
          {demandSupplyData.length === 0 ? (
            <Text style={{ color: tokens.colorNeutralForeground3 }}>No data for selected theme.</Text>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={demandSupplyData} margin={{ top: 0, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="skill" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="demand" fill="#0078d4" name="Demand FTE" radius={[2, 2, 0, 0]} />
                <Bar dataKey="supply" fill="#a8d4f5" name="Available Supply" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </WidgetCard>

        <WidgetCard title="Team Load by Quarter">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={teamLoadData} margin={{ top: 0, right: 8, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RechartsTooltip />
              <ReferenceLine
                y={state.teamMembers.length}
                stroke="#d13438"
                strokeDasharray="5 5"
                label={{ value: 'Full capacity', position: 'insideTopRight', fontSize: 10, fill: '#d13438' }}
              />
              {allocatedMemberNames.map((name, i) => (
                <Bar key={name} dataKey={name} stackId="a" fill={MEMBER_COLORS[i % MEMBER_COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </WidgetCard>
      </div>

      {/* Row 3: Action tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {/* Needs Allocation */}
        <WidgetCard title="Needs Allocation">
          {needsAllocationLines.length === 0 ? (
            <MessageBar intent="success">
              <MessageBarBody>All approved demand lines are allocated or flagged.</MessageBarBody>
            </MessageBar>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Project</TableHeaderCell>
                    <TableHeaderCell>Workstream</TableHeaderCell>
                    <TableHeaderCell>Skill</TableHeaderCell>
                    <TableHeaderCell>Level</TableHeaderCell>
                    <TableHeaderCell>FTE</TableHeaderCell>
                    <TableHeaderCell>Period</TableHeaderCell>
                    <TableHeaderCell></TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {needsAllocationLines.map((dl) => {
                    const skill = getSkillById(dl.skillId);
                    return (
                      <TableRow key={dl.id}>
                        <TableCell><Text size={200}>{dl.projectName}</Text></TableCell>
                        <TableCell><Text size={200}>{dl.workstreamName}</Text></TableCell>
                        <TableCell><Text size={200}>{skill?.id ?? dl.skillId}</Text></TableCell>
                        <TableCell>
                          <Badge size="small" appearance="filled" color="informative">{dl.requiredLevel}</Badge>
                        </TableCell>
                        <TableCell><Text size={200}>{dl.fte}</Text></TableCell>
                        <TableCell>
                          <Text size={200}>
                            {dl.startQuarter === dl.endQuarter ? dl.startQuarter : `${dl.startQuarter}–${dl.endQuarter}`}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Button size="small" appearance="subtle" onClick={() => navigate(`/projects/${dl.projectId}`)}>
                            Open →
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </WidgetCard>

        {/* Resource Contention */}
        <WidgetCard title="Resource Contention">
          {contentionData.length === 0 ? (
            <MessageBar intent="success">
              <MessageBarBody>No resource contention detected for active projects.</MessageBarBody>
            </MessageBar>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Skill</TableHeaderCell>
                    <TableHeaderCell>Quarter</TableHeaderCell>
                    <TableHeaderCell>Demand</TableHeaderCell>
                    <TableHeaderCell>Supply</TableHeaderCell>
                    <TableHeaderCell>Shortfall</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentionData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Text size={200} weight="semibold">{row.skill}</Text>
                      </TableCell>
                      <TableCell><Text size={200}>{row.quarter}</Text></TableCell>
                      <TableCell><Text size={200}>{row.demand} FTE</Text></TableCell>
                      <TableCell><Text size={200}>{row.supply} FTE</Text></TableCell>
                      <TableCell>
                        <Badge
                          size="small"
                          appearance="filled"
                          color={row.shortfall >= 1.0 ? 'danger' : 'warning'}
                        >
                          -{row.shortfall} FTE
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </WidgetCard>
      </div>

      {/* Row 4: Skills Heatmap */}
      <WidgetCard title="Skills Demand Heatmap (Active Projects)">
        {heatmapData.length === 0 ? (
          <Text style={{ color: tokens.colorNeutralForeground3 }}>No demand data for selected theme.</Text>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ minWidth: 80 }}>Skill</TableHeaderCell>
                  {QUARTER_ORDER.map((q) => (
                    <TableHeaderCell key={q} style={{ textAlign: 'center' }}>{q}</TableHeaderCell>
                  ))}
                  <TableHeaderCell style={{ textAlign: 'center', fontWeight: 'bold' }}>Total</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {heatmapData.map((row) => (
                  <TableRow key={row.skillId as string}>
                    <TableCell>
                      <Text size={200} weight="semibold">{row.skillId as string}</Text>
                    </TableCell>
                    {QUARTER_ORDER.map((q) => {
                      const val = (row[q] as number) || 0;
                      return (
                        <TableCell
                          key={q}
                          style={{
                            backgroundColor: heatmapBg(val),
                            textAlign: 'center',
                            color: val > 1.0 ? '#fff' : tokens.colorNeutralForeground1,
                          }}
                        >
                          <Text size={200}>{val > 0 ? val : '—'}</Text>
                        </TableCell>
                      );
                    })}
                    <TableCell style={{ textAlign: 'center', backgroundColor: tokens.colorNeutralBackground3 }}>
                      <Text size={200} weight="semibold">{row['total'] as number}</Text>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {[['≤ 0.5 FTE', '#dbeeff'], ['≤ 1.0 FTE', '#9ac5f5'], ['> 1.0 FTE', '#0078d4']].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 2 }} />
                  <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{label}</Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
