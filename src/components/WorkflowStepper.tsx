import React from 'react';
import { tokens } from '@fluentui/react-components';
import { CheckmarkFilled } from '@fluentui/react-icons';
import { WorkflowStage } from '../types';

interface WorkflowStepperProps {
  currentStage: WorkflowStage;
}

const MAIN_STEPS: WorkflowStage[] = [
  WorkflowStage.Draft,
  WorkflowStage.Submitted,
  WorkflowStage.Approved,
  WorkflowStage.Allocated,
];

function getStepIndex(stage: WorkflowStage): number {
  if (stage === WorkflowStage.Rejected) return 1; // sits after Submitted
  return MAIN_STEPS.indexOf(stage);
}

type StepStatus = 'completed' | 'current' | 'future' | 'rejected';

function getStepStatus(
  stepStage: WorkflowStage,
  currentStage: WorkflowStage
): StepStatus {
  if (stepStage === WorkflowStage.Rejected) {
    return currentStage === WorkflowStage.Rejected ? 'rejected' : 'future';
  }
  const currentIdx = getStepIndex(currentStage);
  const stepIdx = MAIN_STEPS.indexOf(stepStage);
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'current';
  return 'future';
}

interface StepCircleProps {
  label: string;
  status: StepStatus;
}

function StepCircle({ label, status }: StepCircleProps) {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isRejected = status === 'rejected';
  const isFuture = status === 'future';

  let bgColor = 'transparent';
  let borderColor = tokens.colorNeutralStroke2;
  let color = tokens.colorNeutralForeground3;
  let borderStyle = '2px solid';

  if (isCompleted || isCurrent) {
    bgColor = tokens.colorBrandBackground;
    borderColor = tokens.colorBrandBackground;
    color = tokens.colorNeutralForegroundOnBrand;
  } else if (isRejected) {
    bgColor = tokens.colorPaletteRedBackground3;
    borderColor = tokens.colorPaletteRedBackground3;
    color = tokens.colorNeutralForegroundOnBrand;
  }

  const circleStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: bgColor,
    border: `${borderStyle} ${borderColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    marginTop: 6,
    color: isRejected
      ? tokens.colorPaletteRedForeground3
      : isFuture
      ? tokens.colorNeutralForeground3
      : tokens.colorNeutralForeground1,
    fontWeight: isCurrent || isRejected ? 600 : 400,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={circleStyle}>
        {isCompleted ? (
          <CheckmarkFilled fontSize={16} />
        ) : (
          <span style={{ fontSize: 11 }}>{label.charAt(0)}</span>
        )}
      </div>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

interface ConnectorProps {
  completed: boolean;
}

function Connector({ completed }: ConnectorProps) {
  return (
    <div
      style={{
        flex: 1,
        height: 2,
        marginBottom: 18, // align with circle centers
        background: completed ? tokens.colorBrandBackground : 'transparent',
        borderTop: completed
          ? 'none'
          : `2px dashed ${tokens.colorNeutralStroke2}`,
        alignSelf: 'center',
        minWidth: 24,
      }}
    />
  );
}

export function WorkflowStepper({ currentStage }: WorkflowStepperProps) {
  const currentIdx = getStepIndex(currentStage);
  const isRejected = currentStage === WorkflowStage.Rejected;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
        {MAIN_STEPS.map((step, i) => {
          const status = getStepStatus(step, currentStage);
          // Connection before this step (except first)
          const connectorCompleted =
            !isRejected && i > 0 && i <= currentIdx;
          return (
            <React.Fragment key={step}>
              {i > 0 && <Connector completed={connectorCompleted} />}
              <StepCircle label={step} status={status} />
            </React.Fragment>
          );
        })}
      </div>

      {/* Rejected branch — shown below Submitted */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          paddingLeft: 48,
          marginTop: -4,
        }}
      >
        <div
          style={{
            width: 2,
            height: 16,
            background: isRejected
              ? tokens.colorPaletteRedBackground3
              : tokens.colorNeutralStroke2,
            borderLeft: isRejected
              ? 'none'
              : `2px dashed ${tokens.colorNeutralStroke2}`,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 6 }}>
          <StepCircle
            label={WorkflowStage.Rejected}
            status={getStepStatus(WorkflowStage.Rejected, currentStage)}
          />
          {isRejected && (
            <span
              style={{
                fontSize: 11,
                color: tokens.colorPaletteRedForeground3,
                fontStyle: 'italic',
              }}
            >
              (terminal)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

