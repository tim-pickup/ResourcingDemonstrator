import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Option,
  Text,
  tokens,
} from '@fluentui/react-components';
import { useAppContext } from '../context/AppContext';
import { UserRole, WorkflowStage } from '../types';
import { NewProjectDialog } from '../components/NewProjectDialog';

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
  const [showNewProject, setShowNewProject] = useState(false);

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

        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM }}>
          {state.currentRole === UserRole.ProjectLead && (
            <Button appearance="primary" onClick={() => setShowNewProject(true)}>
              New Project
            </Button>
          )}

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
                  position: 'relative',
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
                {/* Stage badge — top-right absolute */}
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Badge color={color} appearance={appearance}>
                    {project.stage}
                  </Badge>
                </div>

                {/* Name and code — leave right-side space for badge */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 80 }}>
                  <Text size={500} weight="semibold">{project.name}</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                    {project.code}
                  </Text>
                </div>

                {/* Workstreams + FTE summary line */}
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                  {project.workstreams.length} workstream{project.workstreams.length !== 1 ? 's' : ''} · {totalFTE.toFixed(1)} FTE total
                </Text>

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

      <NewProjectDialog
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreated={(id) => {
          setShowNewProject(false);
          navigate(`/projects/${id}`);
        }}
      />
    </div>
  );
}
