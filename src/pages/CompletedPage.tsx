import type { Store } from '../store';
import { Trophy, Check } from '../components/Icons';
import { flattenTasks } from '../utils/tasks';

interface Props { store: Store; openProject: (id: string) => void; }

export function CompletedPage({ store, openProject }: Props) {
  const items: { project: any; task: any }[] = [];
  store.state.projects.forEach(p => {
    flattenTasks(p.tasks).forEach(t => {
      if (t.done) items.push({ project: p, task: t });
    });
  });
  items.sort((a, b) => (b.task.completedAt ?? 0) - (a.task.completedAt ?? 0));

  // Group by date
  const groups: Record<string, typeof items> = {};
  items.forEach(item => {
    const d = item.task.completedAt ? new Date(item.task.completedAt) : new Date();
    const key = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    (groups[key] ??= []).push(item);
  });

  const today = new Date(); today.setHours(0,0,0,0);
  const week = new Date(today); week.setDate(week.getDate() - 7);
  const todayCount = items.filter(i => (i.task.completedAt ?? 0) >= today.getTime()).length;
  const weekCount = items.filter(i => (i.task.completedAt ?? 0) >= week.getTime()).length;

  return (
    <div className="cloud-bg min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: 'var(--ink-mute)' }}>Done & Dusted</div>
            <h1 className="text-4xl font-semibold tracking-tight mt-1">Accomplishments</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-soft)' }}>
              You're doing more than you think. Here's the proof.
            </p>
          </div>
          <Trophy width={28} height={28} style={{ color: 'var(--accent)' }} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat label="Today" value={todayCount} />
          <Stat label="Past 7 days" value={weekCount} />
          <Stat label="All time" value={items.length} />
        </div>

        {items.length === 0 ? (
          <div className="card p-12 text-center" style={{ borderStyle: 'dashed' }}>
            <div className="text-5xl mb-3">🌱</div>
            <div className="font-semibold">No completed tasks yet</div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>Check off your first task to see it here.</div>
          </div>
        ) : (
          Object.entries(groups).map(([date, list]) => (
            <div key={date} className="mb-6">
              <div className="text-xs uppercase tracking-wider font-semibold mb-2 px-2" style={{ color: 'var(--ink-mute)' }}>{date} · {list.length}</div>
              <div className="card p-2">
                {list.map(({ project, task }) => (
                  <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-3)] transition group">
                    <div className="checkbox checked"><Check width={12} height={12} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm line-through opacity-70 truncate">{task.title}</div>
                      <button onClick={() => openProject(project.id)} className="text-xs mt-0.5 hover:underline" style={{ color: 'var(--ink-mute)' }}>
                        {project.emoji} {project.name}
                      </button>
                    </div>
                    <button onClick={() => store.toggleTask(project.id, task.id)} className="btn btn-ghost text-xs opacity-0 group-hover:opacity-100">
                      Undo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--ink-mute)' }}>{label}</div>
      <div className="text-3xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
