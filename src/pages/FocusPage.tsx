import { useEffect, useRef, useState } from 'react';
import type { Store } from '../store';
import { Play, Pause, Reset, Check, Target, Sparkle, X } from '../components/Icons';
import { flattenTasks } from '../utils/tasks';
import { formatRelative, daysUntil } from '../utils/dates';

interface Props { store: Store; goToProject: (id: string) => void; }

export function FocusPage({ store, goToProject }: Props) {
  const { settings } = store.state;
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoroWork * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Reset timer when mode or settings change (only when not running)
  useEffect(() => {
    if (!running) setSecondsLeft((mode === 'work' ? settings.pomodoroWork : settings.pomodoroBreak) * 60);
  }, [mode, settings.pomodoroWork, settings.pomodoroBreak, running]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          // Switch
          const next: 'work' | 'break' = mode === 'work' ? 'break' : 'work';
          if (mode === 'work') setCompletedSessions(c => c + 1);
          setMode(next);
          // Notification
          try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play(); } catch {}
          return (next === 'work' ? settings.pomodoroWork : settings.pomodoroBreak) * 60;
        }
        return s - 1;
      });
    }, 1000) as unknown as number;
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, settings.pomodoroWork, settings.pomodoroBreak]);

  const total = (mode === 'work' ? settings.pomodoroWork : settings.pomodoroBreak) * 60;
  const pct = ((total - secondsLeft) / total) * 100;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  // Find current focus task
  const focusProject = store.state.projects.find(p => p.id === store.state.focusProjectId);
  const focusTask = focusProject ? flattenTasks(focusProject.tasks).find(t => t.id === store.state.focusTaskId) : null;

  const allTasks = store.state.projects.flatMap(p => flattenTasks(p.tasks).filter(t => !t.done).map(t => ({ project: p, task: t })));
  const [picker, setPicker] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = allTasks.filter(({ task, project }) =>
    task.title.toLowerCase().includes(search.toLowerCase()) || project.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 30);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return 'Late night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const todayTasks = store.state.projects.flatMap(p => flattenTasks(p.tasks).filter(t => !t.done && t.dueDate && daysUntil(t.dueDate) !== null && daysUntil(t.dueDate)! <= 0).map(t => ({ p, t })));

  return (
    <div className="cloud-bg min-h-screen p-8">
      <div className="max-w-3xl mx-auto pt-8">
        <div className="text-center mb-2">
          <div className="text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: 'var(--ink-mute)' }}>{greeting}</div>
          <h1 className="text-4xl font-semibold tracking-tight mt-1">One thing at a time.</h1>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: 'var(--ink-soft)' }}>
            Pick one task. Start the timer. Everything else can wait.
          </p>
        </div>

        {/* Timer */}
        <div className="card p-10 mt-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 drift-slower"
               style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full opacity-20 drift-slow"
               style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />

          <div className="flex gap-2 mb-6 relative">
            <button onClick={() => { setMode('work'); setRunning(false); }}
                    className={`btn ${mode === 'work' ? 'btn-primary' : ''}`}>Focus</button>
            <button onClick={() => { setMode('break'); setRunning(false); }}
                    className={`btn ${mode === 'break' ? 'btn-primary' : ''}`}>Break</button>
          </div>

          <div className="relative w-72 h-72 my-2">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--bg-3)" strokeWidth="3" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 46}`}
                      strokeDashoffset={`${2 * Math.PI * 46 * (1 - pct / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className={`absolute inset-6 rounded-full flex flex-col items-center justify-center ${running ? 'pulse-ring' : ''}`}
                 style={{ background: 'var(--card)' }}>
              <div className="text-6xl font-light tracking-tight tabular-nums">{mm}:{ss}</div>
              <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--ink-mute)' }}>
                {mode === 'work' ? 'focus session' : 'break time'}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 relative">
            <button onClick={() => setRunning(r => !r)} className="btn btn-primary px-6">
              {running ? <Pause /> : <Play />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => { setRunning(false); setSecondsLeft(total); }} className="btn">
              <Reset /> Reset
            </button>
          </div>

          <div className="mt-6 text-xs" style={{ color: 'var(--ink-mute)' }}>
            Sessions completed today: <span style={{ color: 'var(--ink)' }}>{completedSessions}</span>
          </div>
        </div>

        {/* Focus task */}
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold">
              <Target width={16} height={16} style={{ color: 'var(--accent)' }} />
              Today's One Thing
            </div>
            {focusTask && (
              <button className="btn btn-ghost" onClick={() => store.setFocus(null, null)}>
                <X width={14} height={14} /> Clear
              </button>
            )}
          </div>

          {focusTask && focusProject ? (
            <div className="flex items-start gap-3">
              <button onClick={() => store.toggleTask(focusProject.id, focusTask.id)}
                      className={`checkbox ${focusTask.done ? 'checked' : ''}`}>
                {focusTask.done && <Check width={12} height={12} />}
              </button>
              <div className="flex-1">
                <div className={`text-lg font-medium ${focusTask.done ? 'line-through opacity-50' : ''}`}>{focusTask.title}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button className="chip" onClick={() => goToProject(focusProject.id)} style={{ cursor: 'pointer' }}>
                    {focusProject.emoji} {focusProject.name}
                  </button>
                  {focusTask.dueDate && <span className="chip">{formatRelative(focusTask.dueDate)}</span>}
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => setPicker(true)} className="btn w-full justify-center" style={{ borderStyle: 'dashed' }}>
              <Sparkle width={14} height={14} /> Pick a task to focus on
            </button>
          )}
        </div>

        {/* Today */}
        {todayTasks.length > 0 && (
          <div className="card p-6 mt-6">
            <div className="font-semibold mb-3">Due Today / Overdue · {todayTasks.length}</div>
            <div className="space-y-1">
              {todayTasks.slice(0, 8).map(({ p, t }) => (
                <div key={t.id} className="flex items-center gap-2 py-1.5">
                  <button onClick={() => store.toggleTask(p.id, t.id)} className={`checkbox ${t.done ? 'checked' : ''}`}>
                    {t.done && <Check width={12} height={12} />}
                  </button>
                  <span className="text-sm flex-1">{t.title}</span>
                  <span className="chip">{p.emoji} {p.name}</span>
                  <button onClick={() => store.setFocus(p.id, t.id)} className="btn btn-ghost px-2"><Target width={14} height={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task picker modal */}
      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setPicker(false)}>
          <div className="card p-5 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Pick a task to focus on</div>
              <button className="btn btn-ghost px-2" onClick={() => setPicker(false)}><X width={14} height={14} /></button>
            </div>
            <input className="input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            <div className="mt-3 max-h-80 overflow-y-auto scroll-soft space-y-1">
              {filtered.length === 0 && <div className="text-sm text-center py-6" style={{ color: 'var(--ink-mute)' }}>No matching tasks.</div>}
              {filtered.map(({ task, project }) => (
                <button key={task.id} onClick={() => { store.setFocus(project.id, task.id); setPicker(false); }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[var(--bg-3)] transition flex items-center gap-2">
                  <span>{project.emoji}</span>
                  <span className="text-sm flex-1 truncate">{task.title}</span>
                  <span className="text-xs" style={{ color: 'var(--ink-mute)' }}>{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
