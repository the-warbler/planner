import { useState } from 'react';
import type { Store } from '../store';
import { Plus, Calendar, X, Archive } from '../components/Icons';
import { projectProgress } from '../utils/tasks';
import { daysUntil, formatRelative, formatNice } from '../utils/dates';

interface Props { store: Store; openProject: (id: string) => void; }

const EMOJIS = ['☁️','✨','🌙','🌿','🔮','🎨','📚','💼','🏃','🧠','🎯','🌊','🍃','🪴','🧘','🎵','🔥','💡','🌸','🍂'];
const COLORS = ['#7c6cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#8b5cf6','#84cc16'];

export function ProjectsPage({ store, openProject }: Props) {
  const [creating, setCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [draft, setDraft] = useState({ name: '', emoji: '☁️', color: COLORS[0], deadline: '' });

  const activeProjects = store.state.projects.filter(p => !p.archived);
  const archivedProjects = store.state.projects.filter(p => p.archived);
  const projects = showArchived ? archivedProjects : activeProjects;

  const create = () => {
    if (!draft.name.trim()) return;
    store.addProject({ name: draft.name.trim(), emoji: draft.emoji, color: draft.color, deadline: draft.deadline || undefined });
    setDraft({ name: '', emoji: '☁️', color: COLORS[0], deadline: '' });
    setCreating(false);
  };

  return (
    <div className="cloud-bg min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: 'var(--ink-mute)' }}>Workspace</div>
            <h1 className="text-4xl font-semibold tracking-tight mt-1">{showArchived ? 'Archived Projects' : 'All Projects'}</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-soft)' }}>
              {projects.length} project{projects.length === 1 ? '' : 's'} · {projects.reduce((acc, p) => acc + projectProgress(p).total, 0)} total tasks
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowArchived(v => !v)} className="btn">
              <Archive /> {showArchived ? 'Show active' : `Archive (${archivedProjects.length})`}
            </button>
            <button onClick={() => setCreating(true)} className="btn btn-primary">
              <Plus /> New Project
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => {
            const prog = projectProgress(p);
            const days = daysUntil(p.deadline);
            const urgency = days === null ? 'normal' : days < 0 ? 'overdue' : days <= 3 ? 'urgent' : days <= 14 ? 'soon' : 'normal';
            const dCol = urgency === 'overdue' ? 'var(--bad)' : urgency === 'urgent' ? 'var(--warn)' : urgency === 'soon' ? 'var(--accent)' : 'var(--ink-mute)';
            return (
              <div key={p.id} onClick={() => openProject(p.id)} role="button" tabIndex={0}
                   onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openProject(p.id); }}
                   className="card p-5 text-left hover:scale-[1.01] transition relative overflow-hidden cursor-pointer"
                   style={{ borderColor: 'var(--line)' }}>
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20"
                     style={{ background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)` }} />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                       style={{ background: `color-mix(in srgb, ${p.color} 15%, transparent)` }}>
                    {p.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs" style={{ color: 'var(--ink-mute)' }}>{prog.done}/{prog.total} tasks done</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); store.updateProject(p.id, { archived: !p.archived }); }}
                    className="btn btn-ghost px-2 relative z-10"
                    title={p.archived ? 'Unarchive project' : 'Archive project'}
                  >
                    <Archive width={15} height={15} />
                    <span className="sr-only">{p.archived ? 'Unarchive' : 'Archive'}</span>
                  </button>
                </div>

                {p.deadline && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-mute)' }}>
                      <Calendar width={12} height={12} /> {formatNice(p.deadline)}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold tabular-nums" style={{ color: dCol }}>
                        {days !== null && days < 0 ? Math.abs(days) : days}
                      </span>
                      <span className="text-xs font-medium" style={{ color: dCol }}>
                        {days !== null && days < 0 ? 'days late' : days === 0 ? 'today!' : days === 1 ? 'day left' : 'days left'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--ink-mute)' }}>
                    <span>Progress</span>
                    <span className="font-semibold" style={{ color: 'var(--ink)' }}>{prog.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${prog.pct}%`, background: p.color }} />
                  </div>
                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 card p-12 text-center" style={{ borderStyle: 'dashed' }}>
              <div className="text-5xl mb-3">☁️</div>
              <div className="font-semibold mb-1">{showArchived ? 'No archived projects' : 'No projects yet'}</div>
              <div className="text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>
                {showArchived ? 'Archived projects will stay out of your active workspace.' : 'Create your first one to get started.'}
              </div>
              {!showArchived && (
                <button onClick={() => setCreating(true)} className="btn btn-primary">
                  <Plus /> Create project
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setCreating(false)}>
          <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">New project</div>
              <button className="btn btn-ghost px-2" onClick={() => setCreating(false)}><X width={14} height={14} /></button>
            </div>

            <label className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>Name</label>
            <input className="input mt-1" placeholder="e.g. Thesis writing" value={draft.name}
                   onChange={e => setDraft({ ...draft, name: e.target.value })}
                   onKeyDown={e => e.key === 'Enter' && create()} autoFocus />

            <label className="text-xs font-medium mt-4 block" style={{ color: 'var(--ink-soft)' }}>Emoji</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setDraft({ ...draft, emoji: e })}
                        className={`w-9 h-9 rounded-xl text-lg transition ${draft.emoji === e ? 'ring-2' : ''}`}
                        style={{ background: 'var(--bg-3)', '--tw-ring-color': 'var(--accent)' } as any}>{e}</button>
              ))}
            </div>

            <label className="text-xs font-medium mt-4 block" style={{ color: 'var(--ink-soft)' }}>Color</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} onClick={() => setDraft({ ...draft, color: c })}
                        className={`w-8 h-8 rounded-full transition ${draft.color === c ? 'ring-2 ring-offset-2' : ''}`}
                        style={{ background: c }} />
              ))}
            </div>

            <label className="text-xs font-medium mt-4 block" style={{ color: 'var(--ink-soft)' }}>Deadline (optional)</label>
            <input type="date" className="input mt-1" value={draft.deadline}
                   onChange={e => setDraft({ ...draft, deadline: e.target.value })} />
            {draft.deadline && (
              <div className="text-xs mt-1.5" style={{ color: 'var(--ink-mute)' }}>{formatRelative(draft.deadline)}</div>
            )}

            <div className="flex gap-2 mt-6">
              <button className="btn flex-1" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={create}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
