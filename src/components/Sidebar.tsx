import type { Store } from '../store';
import type { Project } from '../types';
import { Home, Layers, Calendar, Brain, Trophy, Settings, Cloud, Target } from './Icons';
import { daysUntil, formatRelative } from '../utils/dates';
import { projectProgress } from '../utils/tasks';

type Page = 'focus' | 'projects' | 'week' | 'dump' | 'completed' | 'settings' | 'project';

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  store: Store;
  setActiveProjectId: (id: string | null) => void;
}

export function Sidebar({ page, setPage, store, setActiveProjectId }: Props) {
  const upcoming: Project[] = [...store.state.projects]
    .filter(p => !p.archived && p.deadline)
    .sort((a, b) => (daysUntil(a.deadline) ?? 9999) - (daysUntil(b.deadline) ?? 9999))
    .slice(0, 5);

  const nav: { id: Page; label: string; icon: any }[] = [
    { id: 'focus', label: 'Focus', icon: Target },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'week', label: 'Week View', icon: Calendar },
    { id: 'dump', label: 'Brain Dump', icon: Brain },
    { id: 'completed', label: 'Accomplishments', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 p-4 flex flex-col gap-4 border-r" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center gap-2 px-2 pt-1">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white drift-slow"
             style={{ background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, white))' }}>
          <Cloud width={20} height={20} />
        </div>
        <div>
          <div className="font-semibold tracking-tight">Drift</div>
          <div className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>calm tasks</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setPage(id); if (id !== 'project') setActiveProjectId(null); }}
            className={`nav-item ${page === id ? 'active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="divider" />

      <div className="flex flex-col gap-2 min-h-0">
        <div className="px-2 text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--ink-mute)' }}>
          Upcoming Deadlines
        </div>
        <div className="flex flex-col gap-1.5 overflow-y-auto scroll-soft pr-1">
          {upcoming.length === 0 && (
            <div className="px-2 text-xs" style={{ color: 'var(--ink-mute)' }}>
              No deadlines yet. Add one to a project.
            </div>
          )}
          {upcoming.map(p => {
            const days = daysUntil(p.deadline);
            const prog = projectProgress(p);
            const urgency = days === null ? 'normal' : days < 0 ? 'overdue' : days <= 2 ? 'urgent' : days <= 7 ? 'soon' : 'normal';
            const color = urgency === 'overdue' ? 'var(--bad)' : urgency === 'urgent' ? 'var(--warn)' : urgency === 'soon' ? 'var(--accent)' : 'var(--ink-mute)';
            return (
              <button key={p.id}
                onClick={() => { setActiveProjectId(p.id); setPage('project'); }}
                className="text-left rounded-xl p-2.5 transition hover:bg-[var(--bg-3)]"
                style={{ border: '1px solid var(--line)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{p.emoji}</span>
                  <span className="text-sm font-medium truncate flex-1">{p.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] font-semibold" style={{ color }}>
                    {formatRelative(p.deadline)}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>
                    {prog.pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${prog.pct}%`, background: color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-2">
        <button onClick={() => setPage('focus')} className="nav-item w-full justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Home />
          <span>Back to Focus</span>
        </button>
      </div>
    </aside>
  );
}
