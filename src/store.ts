import { useEffect, useState, useCallback } from 'react';
import type { AppState, Project, Task, Settings } from './types';
import { DEFAULT_SETTINGS } from './types';

const KEY = 'drift.v1';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        projects: parsed.projects ?? [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
        focusTaskId: parsed.focusTaskId ?? null,
        focusProjectId: parsed.focusProjectId ?? null,
      };
    }
  } catch {}
  return { projects: seedProjects(), settings: DEFAULT_SETTINGS, focusTaskId: null, focusProjectId: null };
}

function save(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function seedProjects(): Project[] {
  const today = new Date();
  const inDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: uid(),
      name: 'Welcome to Drift',
      emoji: '☁️',
      color: '#7c6cf6',
      createdAt: Date.now(),
      deadline: inDays(7),
      tasks: [
        {
          id: uid(),
          title: 'Try the Focus mode (timer on home)',
          done: false,
          createdAt: Date.now(),
          priority: 'med',
          dueDate: inDays(1),
          subtasks: [],
        },
        {
          id: uid(),
          title: 'Add your first real project',
          done: false,
          createdAt: Date.now(),
          priority: 'high',
          dueDate: inDays(2),
          subtasks: [
            { id: uid(), title: 'Give it a name + emoji', done: false, createdAt: Date.now(), priority: 'low', subtasks: [] },
            { id: uid(), title: 'Set a deadline (optional)', done: false, createdAt: Date.now(), priority: 'low', subtasks: [] },
          ],
        },
        {
          id: uid(),
          title: 'Try the Brain Dump page (paste indented text!)',
          done: false,
          createdAt: Date.now(),
          priority: 'low',
          subtasks: [],
        },
      ],
    },
  ];
}

export function useStore() {
  const [state, setState] = useState<AppState>(() => load());

  useEffect(() => { save(state); }, [state]);

  // Apply theme + font to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme === 'cloud' ? '' : state.settings.theme);
    document.documentElement.setAttribute('data-font', state.settings.font);
  }, [state.settings.theme, state.settings.font]);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    setState(prev => updater(prev));
  }, []);

  // ---- project ops
  const addProject = (p: Omit<Project, 'id' | 'createdAt' | 'tasks'> & { tasks?: Task[] }) =>
    update(s => ({ ...s, projects: [...s.projects, { ...p, id: uid(), createdAt: Date.now(), tasks: p.tasks ?? [] }] }));

  const updateProject = (id: string, patch: Partial<Project>) =>
    update(s => ({ ...s, projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p) }));

  const deleteProject = (id: string) =>
    update(s => ({
      ...s,
      projects: s.projects.filter(p => p.id !== id),
      focusProjectId: s.focusProjectId === id ? null : s.focusProjectId,
    }));

  // ---- task ops (recursive)
  const mapTasks = (tasks: Task[], fn: (t: Task) => Task | null): Task[] => {
    const out: Task[] = [];
    for (const t of tasks) {
      const updated = fn(t);
      if (updated === null) continue;
      out.push({ ...updated, subtasks: mapTasks(updated.subtasks, fn) });
    }
    return out;
  };

  const setTaskTreeDone = (task: Task, done: boolean, completedAt?: number): Task => ({
    ...task,
    done,
    completedAt: done ? completedAt : undefined,
    subtasks: task.subtasks.map(sub => setTaskTreeDone(sub, done, completedAt)),
  });

  const addTask = (projectId: string, parentTaskId: string | null, task: Omit<Task, 'id' | 'createdAt' | 'subtasks' | 'done'>) => {
    const newTask: Task = { ...task, id: uid(), createdAt: Date.now(), subtasks: [], done: false };
    update(s => ({
      ...s,
      projects: s.projects.map(p => {
        if (p.id !== projectId) return p;
        if (!parentTaskId) return { ...p, tasks: [...p.tasks, newTask] };
        return { ...p, tasks: mapTasks(p.tasks, t => t.id === parentTaskId ? { ...t, subtasks: [...t.subtasks, newTask] } : t) };
      })
    }));
    return newTask.id;
  };

  const updateTask = (projectId: string, taskId: string, patch: Partial<Task>) => {
    update(s => ({
      ...s,
      projects: s.projects.map(p => {
        if (p.id !== projectId) return p;
        return { ...p, tasks: mapTasks(p.tasks, t => t.id === taskId ? { ...t, ...patch } : t) };
      })
    }));
  };

  const deleteTask = (projectId: string, taskId: string) => {
    update(s => ({
      ...s,
      projects: s.projects.map(p => {
        if (p.id !== projectId) return p;
        return { ...p, tasks: mapTasks(p.tasks, t => t.id === taskId ? null : t) };
      }),
      focusTaskId: s.focusTaskId === taskId ? null : s.focusTaskId,
    }));
  };

  const toggleTask = (projectId: string, taskId: string) => {
    const completedAt = Date.now();
    update(s => ({
      ...s,
      projects: s.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: mapTasks(p.tasks, t => {
            if (t.id !== taskId) return t;
            const nextDone = !t.done;
            return nextDone
              ? setTaskTreeDone(t, true, completedAt)
              : { ...t, done: false, completedAt: undefined };
          })
        };
      })
    }));
  };

  const setSettings = (patch: Partial<Settings>) =>
    update(s => ({ ...s, settings: { ...s.settings, ...patch } }));

  const setFocus = (projectId: string | null, taskId: string | null) =>
    update(s => ({ ...s, focusProjectId: projectId, focusTaskId: taskId }));

  const replaceAll = (next: AppState) => setState(next);

  return {
    state,
    addProject, updateProject, deleteProject,
    addTask, updateTask, deleteTask, toggleTask,
    setSettings, setFocus, replaceAll,
  };
}

export type Store = ReturnType<typeof useStore>;
