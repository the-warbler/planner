import { useState } from 'react';
import type { Store } from '../store';
import { ChevronLeft, ChevronRight, Check, Plus } from '../components/Icons';
import { addDays, isoDate, startOfWeek, weekLabel } from '../utils/dates';
import { flattenTasks } from '../utils/tasks';

interface Props { store: Store; openProject: (id: string) => void; }

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekPage({ store, openProject }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const today = isoDate(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const projects = store.state.projects.filter(p => !p.archived);

  const tasksFor = (projectId: string, dayIso: string) => {
    const p = projects.find(x => x.id === projectId);
    if (!p) return [];
    return flattenTasks(p.tasks).filter(t => t.dueDate === dayIso);
  };

  const isCurrentWeek = isoDate(weekStart) === isoDate(startOfWeek(new Date()));

  const [quickAdd, setQuickAdd] = useState<{ projectId: string; dayIso: string } | null>(null);
  const [quickTitle, setQuickTitle] = useState('');

  const submitQuickAdd = () => {
    if (!quickAdd || !quickTitle.trim()) return;
    store.addTask(quickAdd.projectId, null, { title: quickTitle.trim(), dueDate: quickAdd.dayIso, priority: 'low' });
    setQuickTitle('');
    setQuickAdd(null);
  };

  const dropTaskOnDay = (e: React.DragEvent<HTMLDivElement>, dayIso: string) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { projectId: string; taskId: string };
      if (data.projectId && data.taskId) store.updateTask(data.projectId, data.taskId, { dueDate: dayIso });
    } catch {
      // Ignore drags that did not come from a Drift task.
    } finally {
      setDraggingTaskId(null);
    }
  };

  return (
    <div className="cloud-bg min-h-screen p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: 'var(--ink-mute)' }}>Calendar</div>
            <h1 className="text-4xl font-semibold tracking-tight mt-1">{weekLabel(weekStart)}</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--ink-soft)' }}>
              {isCurrentWeek ? 'This week' : 'Future week preview'} · drag tasks between days to change due dates
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft width={16} height={16} /> Prev</button>
            <button className="btn" onClick={() => setWeekStart(startOfWeek(new Date()))}>Today</button>
            <button className="btn" onClick={() => setWeekStart(addDays(weekStart, 7))}>Next <ChevronRight width={16} height={16} /></button>
          </div>
        </div>

        <div className="card overflow-hidden">
          {/* Day header */}
          <div className="grid" style={{ gridTemplateColumns: '180px repeat(7, 1fr)' }}>
            <div className="p-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-mute)', borderRight: '1px solid var(--line)' }}>
              Project
            </div>
            {days.map((d, i) => {
              const iso = isoDate(d);
              const isToday = iso === today;
              return (
                <div key={iso} className="p-3 text-center" style={{ borderRight: i < 6 ? '1px solid var(--line)' : undefined, background: isToday ? 'var(--accent-soft)' : 'transparent' }}>
                  <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: isToday ? 'var(--accent)' : 'var(--ink-mute)' }}>{DAY_LABELS[i]}</div>
                  <div className="text-xl font-semibold mt-0.5" style={{ color: isToday ? 'var(--accent)' : 'var(--ink)' }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          <div className="divider" />

          {projects.length === 0 && (
            <div className="p-12 text-center" style={{ color: 'var(--ink-mute)' }}>
              No projects yet. Create one to start scheduling.
            </div>
          )}

          {projects.map(p => (
            <div key={p.id} className="grid border-t" style={{ gridTemplateColumns: '180px repeat(7, 1fr)', borderColor: 'var(--line)' }}>
              <button onClick={() => openProject(p.id)} className="p-3 flex items-center gap-2 text-left hover:bg-[var(--bg-3)] transition" style={{ borderRight: '1px solid var(--line)' }}>
                <span className="text-lg">{p.emoji}</span>
                <span className="text-sm font-medium truncate">{p.name}</span>
              </button>
              {days.map((d, i) => {
                const iso = isoDate(d);
                const tasks = tasksFor(p.id, iso);
                const isToday = iso === today;
                return (
                  <div key={iso} className="p-2 min-h-[90px] group/cell relative transition-colors"
                       onDragOver={e => e.preventDefault()}
                       onDrop={e => dropTaskOnDay(e, iso)}
                       style={{ borderRight: i < 6 ? '1px solid var(--line)' : undefined, background: draggingTaskId ? 'color-mix(in srgb, var(--accent) 7%, transparent)' : isToday ? 'color-mix(in srgb, var(--accent) 4%, transparent)' : 'transparent' }}>
                    <div className="space-y-1">
                      {tasks.map(t => (
                        <div key={t.id}
                             draggable
                             onDragStart={e => {
                               setDraggingTaskId(t.id);
                               e.dataTransfer.effectAllowed = 'move';
                               e.dataTransfer.setData('application/json', JSON.stringify({ projectId: p.id, taskId: t.id }));
                             }}
                             onDragEnd={() => setDraggingTaskId(null)}
                             className="text-xs p-1.5 rounded-lg flex items-start gap-1.5 cursor-grab active:cursor-grabbing transition hover:scale-[1.01]"
                             title="Drag to another day to reschedule"
                             style={{ background: draggingTaskId === t.id ? 'var(--accent-soft)' : 'var(--bg-3)', opacity: draggingTaskId === t.id ? 0.65 : 1 }}>
                          <button onClick={() => store.toggleTask(p.id, t.id)} className={`checkbox ${t.done ? 'checked' : ''}`} style={{ width: 14, height: 14, borderRadius: 4 }}>
                            {t.done && <Check width={9} height={9} />}
                          </button>
                          <span className={`flex-1 leading-tight ${t.done ? 'line-through opacity-50' : ''}`} title={t.title}>{t.title}</span>
                        </div>
                      ))}
                    </div>
                    {quickAdd && quickAdd.projectId === p.id && quickAdd.dayIso === iso ? (
                      <div className="mt-1.5 flex gap-1">
                        <input className="input text-xs" style={{ padding: '4px 6px' }} value={quickTitle}
                               onChange={e => setQuickTitle(e.target.value)}
                               onKeyDown={e => { if (e.key === 'Enter') submitQuickAdd(); if (e.key === 'Escape') { setQuickAdd(null); setQuickTitle(''); } }}
                               autoFocus />
                      </div>
                    ) : (
                      <button onClick={() => setQuickAdd({ projectId: p.id, dayIso: iso })}
                              className="opacity-0 group-hover/cell:opacity-100 transition w-full mt-1 py-1 rounded-md flex items-center justify-center text-[10px]"
                              style={{ color: 'var(--ink-mute)' }}>
                        <Plus width={10} height={10} /> add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
