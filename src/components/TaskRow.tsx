import { useState } from 'react';
import type { Task } from '../types';
import type { Store } from '../store';
import { Check, ChevronDown, ChevronRight, Plus, Trash, Edit, Target, Flag } from './Icons';
import { formatRelative, daysUntil } from '../utils/dates';

interface Props {
  task: Task;
  projectId: string;
  store: Store;
  depth?: number;
  onSetFocus?: (taskId: string) => void;
}

export function TaskRow({ task, projectId, store, depth = 0, onSetFocus }: Props) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: task.title, dueDate: task.dueDate ?? '', priority: task.priority });
  const [subDraft, setSubDraft] = useState('');

  const days = daysUntil(task.dueDate);
  const dueColor = days === null ? 'var(--ink-mute)' : days < 0 ? 'var(--bad)' : days <= 1 ? 'var(--warn)' : days <= 5 ? 'var(--accent)' : 'var(--ink-mute)';

  const priorityClass = task.priority === 'high' ? 'priority-high' : task.priority === 'med' ? 'priority-med' : 'priority-low';

  const saveEdit = () => {
    store.updateTask(projectId, task.id, { title: draft.title.trim() || task.title, dueDate: draft.dueDate || undefined, priority: draft.priority });
    setEditing(false);
  };

  const addSub = () => {
    const t = subDraft.trim();
    if (!t) return;
    store.addTask(projectId, task.id, { title: t, priority: 'low' });
    setSubDraft('');
    setAdding(false);
    setOpen(true);
  };

  return (
    <div className="fade-in">
      <div className="group flex items-start gap-2.5 py-2 px-2 rounded-xl hover:bg-[var(--bg-3)] transition" style={{ marginLeft: depth * 18 }}>
        {task.subtasks.length > 0 ? (
          <button onClick={() => setOpen(!open)} className="mt-0.5 text-[var(--ink-mute)] hover:text-[var(--ink)]">
            {open ? <ChevronDown width={14} height={14} /> : <ChevronRight width={14} height={14} />}
          </button>
        ) : <span className="w-3.5" />}

        <button
          onClick={() => store.toggleTask(projectId, task.id)}
          className={`checkbox mt-0.5 ${task.done ? 'checked' : ''}`}
          aria-label="toggle"
        >
          {task.done && <Check width={12} height={12} />}
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-wrap gap-2 items-center">
              <input className="input flex-1 min-w-[180px]" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}
                     onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus />
              <input type="date" className="input w-auto" value={draft.dueDate} onChange={e => setDraft({ ...draft, dueDate: e.target.value })} />
              <select className="select w-auto" value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as any })}>
                <option value="low">Low</option><option value="med">Medium</option><option value="high">High</option>
              </select>
              <button className="btn btn-primary" onClick={saveEdit}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm leading-snug ${task.done ? 'line-through opacity-50' : ''}`}>
                {task.title}
              </span>
              {task.dueDate && (
                <span className="chip" style={{ color: dueColor, borderColor: 'transparent', background: `color-mix(in srgb, ${dueColor} 12%, transparent)` }}>
                  {formatRelative(task.dueDate)}
                </span>
              )}
              <span className={`chip ${priorityClass}`} style={{ border: 'none' }}>
                <Flag width={10} height={10} />
                {task.priority}
              </span>
              {task.subtasks.length > 0 && (
                <span className="chip">
                  {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
          {onSetFocus && (
            <button onClick={() => onSetFocus(task.id)} className="btn btn-ghost px-2" title="Focus on this">
              <Target width={14} height={14} />
            </button>
          )}
          <button onClick={() => setAdding(!adding)} className="btn btn-ghost px-2" title="Add subtask">
            <Plus width={14} height={14} />
          </button>
          <button onClick={() => setEditing(!editing)} className="btn btn-ghost px-2" title="Edit">
            <Edit width={14} height={14} />
          </button>
          <button onClick={() => { if (confirm('Delete this task and its subtasks?')) store.deleteTask(projectId, task.id); }}
                  className="btn btn-ghost btn-danger px-2" title="Delete">
            <Trash width={14} height={14} />
          </button>
        </div>
      </div>

      {adding && (
        <div className="flex gap-2 mt-1 mb-2" style={{ marginLeft: (depth + 1) * 18 + 24 }}>
          <input className="input flex-1" placeholder="New subtask..." value={subDraft}
                 onChange={e => setSubDraft(e.target.value)}
                 onKeyDown={e => { if (e.key === 'Enter') addSub(); if (e.key === 'Escape') setAdding(false); }}
                 autoFocus />
          <button className="btn btn-primary" onClick={addSub}>Add</button>
        </div>
      )}

      {open && task.subtasks.map(sub => (
        <TaskRow key={sub.id} task={sub} projectId={projectId} store={store} depth={depth + 1} onSetFocus={onSetFocus} />
      ))}
    </div>
  );
}
