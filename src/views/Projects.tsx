import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Card,
  CardHeader,
  Dropdown,
  Option,
  Text,
  tokens,
} from '@fluentui/react-components';
import { useAppContext } from '../context/AppContext';
import { WorkflowStage } from '../types';

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

const ALL_STAGES = Object.values(WorkflowStage);

export function Projects() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [stageFilter, setStageFilter] = useState<string>('All');

  const filteredProjects = stageFilter === 'All'
    ? state.projects
    : state.projects.filter((p) => p.stage === stageFilter);

  return (
    <div style={{ padding: tokens.spacingVerticalL }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: tokens.spacingHorizontalM,
          marginBottom: tokens.spacingVerticalL,
        }}
      >
        <Text size={700} weight="bold">Projects</Text>

        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
          <Text size={300}>Filter by stage:</Text>
          <Dropdown
            value={stageFilter}
            selectedOptions={[stageFilter]}
            onOptionSelect={(_e, data) => setStageFilter(data.optionValue ?? 'All')}
            style={{ minWidth: 160 }}
          >
            <Option value="All">All</Option>
            {ALL_STAGES.map((stage) => (
              <Option key={stage} value={stage}>{stage}</Option>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Project grid */}
      {filteredProjects.length === 0 ? (
        <Text style={{ color: tokens.colorNeutralForeground3 }}>
          No projects match the selected filter.
        </Text>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: tokens.spacingHorizontalL,
          }}
        >
          {filteredProjects.map((project) => {
            const { color, appearance } = getStageBadge(project.stage);
            const totalFTE = project.workstreams.reduce(
              (sum, ws) => sum + ws.demandLines.reduce((s, dl) => s + dl.fte, 0),
              0
            );

            return (
              <Card
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{
                  cursor: 'pointer',
                  padding: tokens.spacingVerticalM,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacingVerticalS,
                  border: `1px solid ${tokens.colorNeutralStroke2}`,
                  borderRadius: tokens.borderRadiusMedium,
                  transition: 'box-shadow 0.15s ease',
                }}
              >
                <CardHeader
                  header={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Text weight="bold" size={400}>{project.name}</Text>
                      <Text
                        size={200}
                        style={{ color: tokens.colorNeutralForeground3 }}
                      >
                        {project.code}
                      </Text>
                    </div>
                  }
                  action={
                    <Badge color={color} appearance={appearance}>
                      {project.stage}
                    </Badge>
                  }
                />

                {/* Stats row */}
                <div
                  style={{
                    display: 'flex',
                    gap: tokens.spacingHorizontalL,
                    paddingTop: tokens.spacingVerticalXS,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                      Workstreams
                    </Text>
                    <Text size={300} weight="semibold">
                      {project.workstreams.length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                      Total FTE
                    </Text>
                    <Text size={300} weight="semibold">
                      {totalFTE.toFixed(2)}
                    </Text>
                  </div>
                </div>

                {/* Description — 2-line truncation */}
                <Text
                  size={200}
                  style={{
                    color: tokens.colorNeutralForeground2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4',
                  }}
                >
                  {project.description}
                </Text>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
