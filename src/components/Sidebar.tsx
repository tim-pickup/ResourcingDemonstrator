import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Divider,
  Dropdown,
  Option,
  Text,
  tokens,
} from '@fluentui/react-components';
import {
  BriefcaseFilled,
  GridFilled,
  PeopleFilled,
} from '@fluentui/react-icons';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

const SIDEBAR_WIDTH = 240;

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        borderRadius: tokens.borderRadiusMedium,
        textDecoration: 'none',
        color: isActive
          ? tokens.colorNeutralForegroundOnBrand
          : tokens.colorNeutralForeground1,
        background: isActive ? tokens.colorBrandBackground : 'transparent',
        fontWeight: isActive ? 600 : 400,
        fontSize: 14,
        transition: 'background 0.15s',
      })}
    >
      <span style={{ display: 'flex', alignItems: 'center', fontSize: 18 }}>
        {icon}
      </span>
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  const { state, dispatch } = useAppContext();

  return (
    <aside
      style={{
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        maxWidth: SIDEBAR_WIDTH,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: tokens.colorBrandBackground2,
        borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
        padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalS}`,
        gap: tokens.spacingVerticalM,
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* App title */}
      <div
        style={{
          padding: `0 ${tokens.spacingHorizontalS}`,
          marginBottom: tokens.spacingVerticalS,
        }}
      >
        <Text
          weight="bold"
          size={400}
          style={{ color: tokens.colorBrandForeground1 }}
        >
          DM Skills &amp; Demand
        </Text>
      </div>

      {/* Navigation links */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacingVerticalXS,
        }}
      >
        <NavItem to="/" icon={<GridFilled />} label="Dashboard" />
        <NavItem to="/projects" icon={<BriefcaseFilled />} label="Projects" />
        <NavItem to="/team" icon={<PeopleFilled />} label="Team" />
      </nav>

      <Divider />

      {/* Role selector */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacingVerticalXS,
          padding: `0 ${tokens.spacingHorizontalXS}`,
        }}
      >
        <Text
          size={200}
          weight="semibold"
          style={{ color: tokens.colorNeutralForeground3 }}
        >
          Viewing as
        </Text>
        <Dropdown
          value={state.currentRole}
          onOptionSelect={(_e, data) =>
            dispatch({ type: 'SET_ROLE', role: data.optionValue as UserRole })
          }
          style={{ width: '100%' }}
        >
          {Object.values(UserRole).map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Dropdown>
      </div>
    </aside>
  );
}
