import { useState } from 'react';
import type { Store } from '../store';
import { TaskRow } from '../components/TaskRow';
import { Plus, Calendar, Trash, Edit, ChevronLeft, X } from '../components/Icons';
import { projectProgress } from '../utils/tasks';
import { daysUntil, formatRelative, formatNice } from '../utils/dates';

interface Props { store: Store; projectId: string; back: () => void; }

const EMOJIS = ['☁️','✨','🌙','🌿','🔮','🎨','📚','💼','🏃','🧠','🎯','🌊','🍃','🪴','🧘','🎵','🔥','💡','🌸','🍂'];
const COLORS = ['#7c6cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#8b5cf6','#84cc16'];

export function ProjectPage({ store, projectId, back }: Props) {
  const project = store.state.projects.find(p => p.id === projectId);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: '', dueDate: '', priority: 'low' as 'low'|'med'|'high' });
  const [editingProject, setEditingProject] = useState(false);
  const [pDraft, setPDraft] = useState(() => ({
    name: project?.name ?? '', emoji: project?.emoji ?? '☁️', deadline: project?.deadline ?? '', color: project?.color ?? '#7c6cf6',
  }));
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('open');

  if (!project) {
    return (
      <div className="p-8 text-center">
        <div>Project not found.</div>
        <button onClick={back} className="btn mt-4">Back</button>
      </div>
    );
  }

  const prog = projectProgress(project);
  const days = daysUntil(project.deadline);
  const dCol = days === null ? 'var(--ink-mute)' : days < 0 ? 'var(--bad)' : days <= 3 ? 'var(--warn)' : days <= 14 ? 'var(--accent)' : 'var(--ink-mute)';

  const filteredTasks = project.tasks.filter(t => filter === 'all' ? true : filter === 'open' ? !t.done : t.done);

  const addRoot = () => {
    if (!draft.title.trim()) return;
    store.addTask(project.id, null, { title: draft.title.trim(), dueDate: draft.dueDate || undefined, priority: draft.priority });
    setDraft({ title: '', dueDate: '', priority: 'low' });
    setAdding(false);
  };

  const saveProject = () => {
    store.updateProject(project.id, { name: pDraft.name.trim() || project.name, emoji: pDraft.emoji, deadline: pDraft.deadline || undefined, color: pDraft.color });
    setEditingProject(false);
  };

  return (
    <div className="cloud-bg min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={back} className="btn btn-ghost mb-4 -ml-2">
          <ChevronLeft width={16} height={16} /> All projects
        </button>

        <div className="card p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
               style={{ background: `radial-gradient(circle, ${project.color} 0%, transparent 70%)` }} />
          <div className="flex items-start justify-between gap-4 relative">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                   style={{ background: `color-mix(in srgb, ${project.color} 15%, transparent)` }}>
                {project.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold tracking-tight truncate">{project.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="chip">{prog.done}/{prog.total} tasks</span>
                  <span className="chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'transparent' }}>{prog.pct}% complete</span>
                  {project.deadline && (
                    <span className="chip" style={{ color: dCol, background: `color-mix(in srgb, ${dCol} 12%, transparent)`, borderColor: 'transparent' }}>
                      <Calendar width={11} height={11} /> {formatNice(project.deadline)} · {formatRelative(project.deadline)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditingProject(true)} className="btn btn-ghost px-2"><Edit width={16} height={16} /></button>
              <button onClick={() => { if (confirm(`Delete project "${project.name}" and all its tasks?`)) { store.deleteProject(project.id); back(); } }}
                      className="btn btn-ghost btn-danger px-2"><Trash width={16} height={16} /></button>
            </div>
          </div>

          {project.deadline && days !== null && (
            <div className="mt-5 p-4 rounded-2xl flex items-center gap-4 relative" style={{ background: `color-mix(in srgb, ${dCol} 10%, transparent)` }}>
              <div className="text-5xl font-light tabular-nums" style={{ color: dCol }}>
                {days < 0 ? Math.abs(days) : days}
              </div>
              <div>
                <div className="font-semibold" style={{ color: dCol }}>
                  {days < 0 ? 'days overdue' : days === 0 ? 'due today' : days === 1 ? 'day until deadline' : 'days until deadline'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                  {formatNice(project.deadline)} · breathe, take it step by step.
                </div>
              </div>
            </div>
          )}

          <div className="mt-5">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${prog.pct}%`, background: project.color }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 mb-3">
          <div className="flex gap-1">
            {(['open', 'all', 'done'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? '' : 'btn-ghost'}`} style={filter === f ? { background: 'var(--bg-3)' } : {}}>
                {f === 'open' ? 'Active' : f === 'all' ? 'All' : 'Done'}
              </button>
            ))}
          </div>
          <button onClick={() => setAdding(true)} className="btn btn-primary"><Plus /> Add task</button>
        </div>

        {adding && (
          <div className="card p-4 mb-3 flex flex-wrap gap-2 items-center">
            <input className="input flex-1 min-w-[220px]" placeholder="What needs to be done?" value={draft.title}
                   onChange={e => setDraft({ ...draft, title: e.target.value })}
                   onKeyDown={e => { if (e.key === 'Enter') addRoot(); if (e.key === 'Escape') setAdding(false); }}
                   autoFocus />
            <input type="date" className="input w-auto" value={draft.dueDate} onChange={e => setDraft({ ...draft, dueDate: e.target.value })} />
            <select className="select w-auto" value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as any })}>
              <option value="low">Low</option><option value="med">Medium</option><option value="high">High</option>
            </select>
            <button className="btn btn-primary" onClick={addRoot}>Add</button>
            <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        )}

        <div className="card p-3">
          {filteredTasks.length === 0 ? (
            <div className="p-10 text-center" style={{ color: 'var(--ink-mute)' }}>
              {filter === 'done' ? 'No completed tasks yet.' : 'No tasks here. Add one above ✨'}
            </div>
          ) : (
            filteredTasks.map(t => (
              <TaskRow key={t.id} task={t} projectId={project.id} store={store} onSetFocus={(id) => store.setFocus(project.id, id)} />
            ))
          )}
        </div>
      </div>

      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setEditingProject(false)}>
          <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">Edit project</div>
              <button className="btn btn-ghost px-2" onClick={() => setEditingProject(false)}><X width={14} height={14} /></button>
            </div>
            <label className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>Name</label>
            <input className="input mt-1" value={pDraft.name} onChange={e => setPDraft({ ...pDraft, name: e.target.value })} />

            <label className="text-xs font-medium mt-4 block" style={{ color: 'var(--ink-soft)' }}>Emoji</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setPDraft({ ...pDraft, emoji: e })}
                        className={`w-9 h-9 rounded-xl text-lg transition ${pDraft.emoji === e ? 'ring-2' : ''}`}
                        style={{ background: 'var(--bg-3)', '--tw-ring-color': 'var(--accent)' } as any}>{e}</button>
              ))}
            </div>

            <label className="text-xs font-medium mt-4 block" style={{ color: 'var(--ink-soft)' }}>Deadline</label>
            <input type="date" className="input mt-1" value={pDraft.deadline} onChange={e => setPDraft({ ...pDraft, deadline: e.target.value })} />

            <label className="text-xs font-medium mt-4 block" style={{ color: 'var(--ink-soft)' }}>Color</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} onClick={() => setPDraft({ ...pDraft, color: c })}
                        className={`w-8 h-8 rounded-full transition ${pDraft.color === c ? 'ring-2 ring-offset-2' : ''}`}
                        style={{ background: c, '--tw-ring-color': c } as any}
                        aria-label={`Use ${c} as project color`} />
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button className="btn flex-1" onClick={() => setEditingProject(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={saveProject}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
