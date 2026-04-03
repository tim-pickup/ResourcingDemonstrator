import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dropdown,
  Option,
  Text,
  tokens,
} from '@fluentui/react-components';
import { useAppContext } from '../context/AppContext';
import { TeamMemberCard } from '../components/TeamMemberCard';
import { THEMES } from '../data/taxonomy';

export function Team() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const [themeFilter, setThemeFilter] = useState<string>('All');
  const [skillFilter, setSkillFilter] = useState<string>('All');

  // Available skills for selected theme
  const availableSkills = useMemo(() => {
    if (themeFilter === 'All') {
      return THEMES.flatMap((t) => t.skills);
    }
    const theme = THEMES.find((t) => t.shortName === themeFilter || t.id === themeFilter);
    return theme ? theme.skills : [];
  }, [themeFilter]);

  // Reset skill filter when theme changes
  function handleThemeChange(value: string) {
    setThemeFilter(value);
    setSkillFilter('All');
  }

  const filteredMembers = useMemo(() => {
    return state.teamMembers.filter((member) => {
      // Theme filter
      if (themeFilter !== 'All') {
        const theme = THEMES.find((t) => t.shortName === themeFilter || t.id === themeFilter);
        if (theme) {
          const themeSkillIds = new Set(theme.skills.map((s) => s.id));
          const hasMOMSkill = member.skills.some((s) => themeSkillIds.has(s.skillId));
          if (!hasMOMSkill) return false;
        }
      }

      // Skill filter
      if (skillFilter !== 'All') {
        const hasSkill = member.skills.some((s) => s.skillId === skillFilter);
        if (!hasSkill) return false;
      }

      return true;
    });
  }, [state.teamMembers, themeFilter, skillFilter]);

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
        <Text size={700} weight="bold">Team</Text>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
            <Text size={300}>Theme:</Text>
            <Dropdown
              value={themeFilter}
              selectedOptions={[themeFilter]}
              onOptionSelect={(_e, data) => handleThemeChange(data.optionValue ?? 'All')}
              style={{ minWidth: 160 }}
            >
              <Option value="All">All</Option>
              {THEMES.map((theme) => (
                <Option key={theme.id} value={theme.shortName}>
                  {theme.shortName}
                </Option>
              ))}
            </Dropdown>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
            <Text size={300}>Skill:</Text>
            <Dropdown
              value={skillFilter}
              selectedOptions={[skillFilter]}
              onOptionSelect={(_e, data) => setSkillFilter(data.optionValue ?? 'All')}
              style={{ minWidth: 220 }}
              disabled={availableSkills.length === 0}
            >
              <Option value="All">All</Option>
              {availableSkills.map((skill) => (
                <Option key={skill.id} value={skill.id} text={`${skill.id} — ${skill.name}`}>
                  {`${skill.id} — ${skill.name}`}
                </Option>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Member count */}
      <Text
        size={300}
        style={{ color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalM, display: 'block' }}
      >
        {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} shown
      </Text>

      {/* Team grid */}
      {filteredMembers.length === 0 ? (
        <Text style={{ color: tokens.colorNeutralForeground3 }}>
          No team members match the selected filters.
        </Text>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: tokens.spacingHorizontalL,
          }}
        >
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onClick={() => navigate(`/team/${member.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
