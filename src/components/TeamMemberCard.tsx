import React from 'react';
import {
  Avatar,
  Card,
  CardHeader,
  ProgressBar,
  tokens,
  Text,
} from '@fluentui/react-components';
import { TeamMember, QUARTER_ORDER } from '../types';
import { useAppContext } from '../context/AppContext';
import { getAllocatedFTE } from '../utils/allocation';
import { SkillBadge } from './SkillBadge';

interface TeamMemberCardProps {
  member: TeamMember;
  onClick?: () => void;
}

// Generate a stable color index from member id
const AVATAR_COLORS = [
  'dark-red',
  'cranberry',
  'red',
  'pumpkin',
  'peach',
  'marigold',
  'gold',
  'brass',
  'brown',
  'forest',
  'seafoam',
  'dark-green',
  'light-teal',
  'teal',
  'steel',
  'blue',
  'royal-blue',
  'cornflower',
  'navy',
  'lavender',
  'purple',
  'grape',
  'lilac',
  'pink',
  'magenta',
  'plum',
  'beige',
  'mink',
  'platinum',
  'anchor',
] as const;

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  }
  return h;
}

type AvatarColor = (typeof AVATAR_COLORS)[number];

function getAvatarColor(id: string): AvatarColor {
  return AVATAR_COLORS[hashId(id) % AVATAR_COLORS.length];
}

export function TeamMemberCard({ member, onClick }: TeamMemberCardProps) {
  const { state } = useAppContext();

  // Find the peak quarterly allocation across the four quarters
  const quarterAllocations = QUARTER_ORDER.map((q) =>
    getAllocatedFTE(member.id, q, state.projects)
  );
  const peakAllocation = Math.max(...quarterAllocations);

  const allocationPct = Math.min(peakAllocation, 1);
  const allocationLabel = `${Math.round(peakAllocation * 100)}%`;

  const progressColor =
    peakAllocation >= 1
      ? tokens.colorPaletteRedBackground3
      : peakAllocation >= 0.8
      ? tokens.colorPaletteMarigoldBackground3
      : tokens.colorBrandBackground;

  return (
    <Card
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: tokens.spacingVerticalM,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        minWidth: 220,
      }}
    >
      <CardHeader
        image={
          <Avatar
            name={member.name}
            initials={member.initials}
            color={getAvatarColor(member.id)}
            size={36}
          />
        }
        header={
          <Text weight="semibold" style={{ fontSize: 14 }}>
            {member.name}
          </Text>
        }
        description={
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            {member.roleTitle}
          </Text>
        }
      />

      {/* Skill badges */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: tokens.spacingHorizontalXS,
        }}
      >
        {member.skills.map((s) => (
          <SkillBadge key={s.skillId} skillId={s.skillId} level={s.level} size="small" />
        ))}
      </div>

      {/* Allocation bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
            Peak allocation
          </Text>
          <Text
            size={100}
            weight="semibold"
            style={{
              color:
                peakAllocation >= 1
                  ? tokens.colorPaletteRedForeground3
                  : tokens.colorNeutralForeground1,
            }}
          >
            {allocationLabel}
          </Text>
        </div>
        <ProgressBar
          value={allocationPct}
          style={{ '--fui-ProgressBar__bar--background': progressColor } as React.CSSProperties}
        />
      </div>
    </Card>
  );
}
