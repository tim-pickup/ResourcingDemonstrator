import { Routes, Route } from 'react-router-dom';
import { tokens } from '@fluentui/react-components';
import { Sidebar } from './components/Sidebar';
import Dashboard from './views/Dashboard';
import { Projects } from './views/Projects';
import { ProjectDetail } from './views/ProjectDetail';
import { Team } from './views/Team';
import { TeamDetail } from './views/TeamDetail';

export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: tokens.colorNeutralBackground2,
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:id" element={<TeamDetail />} />
        </Routes>
      </main>
    </div>
  );
}
