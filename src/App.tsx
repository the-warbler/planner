import { useState } from 'react';
import { useStore } from './store';
import { Sidebar } from './components/Sidebar';
import { FocusPage } from './pages/FocusPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectPage } from './pages/ProjectPage';
import { WeekPage } from './pages/WeekPage';
import { DumpPage } from './pages/DumpPage';
import { CompletedPage } from './pages/CompletedPage';
import { SettingsPage } from './pages/SettingsPage';

type Page = 'focus' | 'projects' | 'week' | 'dump' | 'completed' | 'settings' | 'project';

export default function App() {
  const store = useStore();
  const [page, setPage] = useState<Page>('focus');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const openProject = (id: string) => {
    setActiveProjectId(id);
    setPage('project');
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-1)' }}>
      <Sidebar
        page={page}
        setPage={(p) => setPage(p as Page)}
        store={store}
        setActiveProjectId={setActiveProjectId}
      />
      <main className="flex-1 min-w-0">
        {page === 'focus' && <FocusPage store={store} goToProject={openProject} />}
        {page === 'projects' && <ProjectsPage store={store} openProject={openProject} />}
        {page === 'project' && activeProjectId && (
          <ProjectPage store={store} projectId={activeProjectId} back={() => setPage('projects')} />
        )}
        {page === 'week' && <WeekPage store={store} openProject={openProject} />}
        {page === 'dump' && <DumpPage store={store} goToProjects={() => setPage('projects')} />}
        {page === 'completed' && <CompletedPage store={store} openProject={openProject} />}
        {page === 'settings' && <SettingsPage store={store} />}
      </main>
    </div>
  );
}
