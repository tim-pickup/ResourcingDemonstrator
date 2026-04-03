import { useState, useMemo } from 'react';
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
  ResponsiveContainer,
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { getAllDemandLines, getAllocatedFTE } from '../utils/allocation';
import { getSkillById } from '../utils/taxonomy';
import { THEMES } from '../data/taxonomy';
import { QUARTER_ORDER, WorkflowStage, FundingSource } from '../types';

const TEAM_COLORS = [
  '#0078d4', '#8a2be2', '#107c10', '#d83b01', '#00b7c3',
  '#8a6914', '#ca5010', '#038387', '#881798', '#4f6bed',
  '#69797e', '#e3008c',
];

type ThemeFilter = 'All' | 'MOM' | 'MIV';

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: '16px' }}>
      <Text weight="semibold" size={400} style={{ display: 'block', marginBottom: '12px' }}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const { state } = useAppContext();
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>('All');

  const activeDemandLines = useMemo(
    () => getAllDemandLines(state.projects, [WorkflowStage.Approved, WorkflowStage.Allocated]),
    [state.projects]
  );

  // Filter skills by theme
  const filteredSkills = useMemo(() => {
    const allSkills = THEMES.flatMap((t) => t.skills);
    if (themeFilter === 'All') return allSkills;
    return allSkills.filter((s) => s.themeId === themeFilter);
  }, [themeFilter]);

  // Widget 1: Demand vs Supply by Skill
  const demandSupplyData = useMemo(() => {
    return filteredSkills.map((skill) => {
      const demand = activeDemandLines
        .filter((dl) => dl.skillId === skill.id)
        .reduce((sum, dl) => sum + dl.fte, 0);

      const membersWithSkill = state.teamMembers.filter((m) =>
        m.skills.some((s) => s.skillId === skill.id)
      );
      const supply = membersWithSkill.reduce((sum, member) => {
        const avgAllocation =
          QUARTER_ORDER.reduce(
            (qsum, q) => qsum + getAllocatedFTE(member.id, q, state.projects),
            0
          ) / QUARTER_ORDER.length;
        return sum + Math.max(0, 1 - avgAllocation);
      }, 0);

      return { skill: skill.id, demand: Math.round(demand * 100) / 100, supply: Math.round(supply * 100) / 100 };
    }).filter((d) => d.demand > 0 || d.supply > 0);
  }, [filteredSkills, activeDemandLines, state.teamMembers, state.projects]);

  // Widget 2: Team Load by Quarter
  const teamLoadData = useMemo(() => {
    return QUARTER_ORDER.map((quarter) => {
      const entry: Record<string, number | string> = { quarter };
      state.teamMembers.forEach((member) => {
        const fte = getAllocatedFTE(member.id, quarter, state.projects);
        if (fte > 0) entry[member.name] = Math.round(fte * 100) / 100;
      });
      return entry;
    });
  }, [state.teamMembers, state.projects]);

  const allocatedMembers = useMemo(() => {
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

  // Widget 3: Gaps
  const allGaps = useMemo(() => {
    return getAllDemandLines(state.projects)
      .filter((dl) => dl.isGap === true)
      .filter((dl) => {
        if (themeFilter === 'All') return true;
        const skill = getSkillById(dl.skillId);
        return skill?.themeId === themeFilter;
      });
  }, [state.projects, themeFilter]);

  // Widget 4: Skills Heatmap
  const heatmapData = useMemo(() => {
    return filteredSkills
      .map((skill) => {
        const row: Record<string, number | string> = { skill: skill.id };
        QUARTER_ORDER.forEach((q) => {
          const total = activeDemandLines
            .filter(
              (dl) =>
                dl.skillId === skill.id &&
                QUARTER_ORDER.indexOf(q) >= QUARTER_ORDER.indexOf(dl.startQuarter) &&
                QUARTER_ORDER.indexOf(q) <= QUARTER_ORDER.indexOf(dl.endQuarter)
            )
            .reduce((sum, dl) => sum + dl.fte, 0);
          row[q] = Math.round(total * 100) / 100;
        });
        return row;
      })
      .filter((row) => QUARTER_ORDER.some((q) => (row[q] as number) > 0));
  }, [filteredSkills, activeDemandLines]);

  function heatmapColor(value: number): string {
    if (value <= 0) return '#ffffff';
    if (value <= 0.5) return '#ddeeff';
    if (value <= 1.0) return '#aaccff';
    return '#5599dd';
  }

  // Widget 5: Funding breakdown
  const fundingData = useMemo(() => {
    let sector = 0;
    let project = 0;
    activeDemandLines
      .filter((dl) => {
        if (themeFilter === 'All') return true;
        const skill = getSkillById(dl.skillId);
        return skill?.themeId === themeFilter;
      })
      .forEach((dl) => {
        if (dl.fundingSource === FundingSource.Sector) sector += dl.fte;
        else project += dl.fte;
      });
    return [
      { name: 'Sector', value: Math.round(sector * 100) / 100 },
      { name: 'Project', value: Math.round(project * 100) / 100 },
    ];
  }, [activeDemandLines, themeFilter]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Text size={600} weight="bold">Portfolio Dashboard</Text>
        <Dropdown
          value={themeFilter}
          onOptionSelect={(_e, data) => setThemeFilter(data.optionValue as ThemeFilter)}
          style={{ minWidth: '160px' }}
        >
          <Option value="All">All Themes</Option>
          <Option value="MOM">MOM</Option>
          <Option value="MIV">MI&V</Option>
        </Dropdown>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
      >
        {/* Widget 1 */}
        <Widget title="Demand vs Supply by Skill">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={demandSupplyData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="demand" fill="#0078d4" name="Demand FTE" />
              <Bar dataKey="supply" fill="#c7e0f4" name="Supply FTE" />
            </BarChart>
          </ResponsiveContainer>
        </Widget>

        {/* Widget 2 */}
        <Widget title="Team Load by Quarter">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={teamLoadData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <ReferenceLine y={state.teamMembers.length} stroke="#d13438" strokeDasharray="4 4" label={{ value: 'Capacity', position: 'right', fontSize: 10 }} />
              {allocatedMembers.map((name, i) => (
                <Bar key={name} dataKey={name} stackId="a" fill={TEAM_COLORS[i % TEAM_COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Widget>

        {/* Widget 3 */}
        <Widget title="Gaps Summary">
          {allGaps.length === 0 ? (
            <MessageBar intent="success">
              <MessageBarBody>No resource gaps identified.</MessageBarBody>
            </MessageBar>
          ) : (
            <Table size="small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Project</TableHeaderCell>
                  <TableHeaderCell>Workstream</TableHeaderCell>
                  <TableHeaderCell>Skill</TableHeaderCell>
                  <TableHeaderCell>Level</TableHeaderCell>
                  <TableHeaderCell>FTE</TableHeaderCell>
                  <TableHeaderCell>Period</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGaps.map((dl) => {
                  const skill = getSkillById(dl.skillId);
                  return (
                    <TableRow key={dl.id}>
                      <TableCell>{dl.projectName}</TableCell>
                      <TableCell>{dl.workstreamName}</TableCell>
                      <TableCell>{skill?.name ?? dl.skillId}</TableCell>
                      <TableCell>
                        <Badge appearance="filled" color="danger" size="small">
                          {dl.requiredLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{dl.fte}</TableCell>
                      <TableCell>{dl.startQuarter} – {dl.endQuarter}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Widget>

        {/* Widget 4 */}
        <Widget title="Skills Heatmap">
          <div style={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Skill</TableHeaderCell>
                  {QUARTER_ORDER.map((q) => (
                    <TableHeaderCell key={q}>{q}</TableHeaderCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {heatmapData.map((row) => {
                  const skill = getSkillById(row.skill as string);
                  return (
                    <TableRow key={row.skill as string}>
                      <TableCell style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {row.skill as string}
                      </TableCell>
                      {QUARTER_ORDER.map((q) => {
                        const val = (row[q] as number) || 0;
                        return (
                          <TableCell
                            key={q}
                            style={{
                              backgroundColor: heatmapColor(val),
                              textAlign: 'center',
                              fontSize: '12px',
                            }}
                          >
                            {val > 0 ? val : ''}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {heatmapData.length === 0 && (
              <Text style={{ color: '#605e5c', fontSize: '13px' }}>No data for selected theme.</Text>
            )}
          </div>
        </Widget>

        {/* Widget 5 */}
        <Widget title="Funding Source Breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={fundingData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value} FTE`}
              >
                <Cell fill="#0078d4" />
                <Cell fill="#8a2be2" />
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Widget>
      </div>
    </div>
  );
}
