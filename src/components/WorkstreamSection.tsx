import React from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Badge,
  Divider,
  Text,
  tokens,
} from '@fluentui/react-components';
import { Workstream, WorkflowStage, FundingSource } from '../types';
import { DemandTable } from './DemandTable';

interface WorkstreamSectionProps {
  workstream: Workstream;
  projectStage: WorkflowStage;
  projectId: string;
  onAllocate?: (workstreamId: string, demandLineId: string) => void;
}

function getFundingBadgeColor(
  source: FundingSource
): 'informative' | 'brand' {
  return source === FundingSource.Sector ? 'informative' : 'brand';
}

export function WorkstreamSection({
  workstream,
  projectStage,
  projectId: _projectId,
  onAllocate,
}: WorkstreamSectionProps) {
  return (
    <Accordion collapsible defaultOpenItems={workstream.id}>
      <AccordionItem value={workstream.id}>
        <AccordionHeader>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacingHorizontalS,
              flexWrap: 'wrap',
            }}
          >
            <Text weight="semibold">{workstream.name}</Text>
            <Badge
              appearance="filled"
              color={getFundingBadgeColor(workstream.fundingSource)}
              size="small"
            >
              {workstream.fundingSource}
            </Badge>
            <Text
              size={200}
              style={{ color: tokens.colorNeutralForeground3 }}
            >
              {workstream.startQuarter === workstream.endQuarter
                ? workstream.startQuarter
                : `${workstream.startQuarter} – ${workstream.endQuarter}`}
            </Text>
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <Divider style={{ marginBottom: tokens.spacingVerticalS }} />
          <DemandTable
            demandLines={workstream.demandLines}
            workstreamId={workstream.id}
            projectStage={projectStage}
            onAllocate={onAllocate}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
