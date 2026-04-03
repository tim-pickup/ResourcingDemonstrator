import { Badge } from '@fluentui/react-components';
import { ProficiencyLevel } from '../types';

interface SkillBadgeProps {
  skillId?: string;
  level: ProficiencyLevel;
  size?: 'small' | 'medium' | 'large';
}

export function SkillBadge({ skillId, level, size = 'medium' }: SkillBadgeProps) {
  const label = skillId ? `${skillId} · ${level}` : level;

  switch (level) {
    case ProficiencyLevel.Awareness:
      return (
        <Badge appearance="outline" color="subtle" size={size}>
          {label}
        </Badge>
      );
    case ProficiencyLevel.Practitioner:
      return (
        <Badge appearance="filled" color="informative" size={size}>
          {label}
        </Badge>
      );
    case ProficiencyLevel.Specialist:
      return (
        <Badge appearance="filled" color="brand" size={size}>
          {label}
        </Badge>
      );
    case ProficiencyLevel.Lead:
      return (
        <Badge appearance="filled" color="success" size={size}>
          {label}
        </Badge>
      );
    default:
      return (
        <Badge appearance="outline" color="subtle" size={size}>
          {label}
        </Badge>
      );
  }
}
