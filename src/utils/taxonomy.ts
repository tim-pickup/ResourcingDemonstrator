import { THEMES } from '../data/taxonomy';
import { Skill, Theme } from '../types';

export function getSkillById(skillId: string): Skill | undefined {
  for (const theme of THEMES) {
    const skill = theme.skills.find((s) => s.id === skillId);
    if (skill) return skill;
  }
  return undefined;
}

export function getThemeForSkill(skillId: string): Theme | undefined {
  return THEMES.find((t) => t.skills.some((s) => s.id === skillId));
}
