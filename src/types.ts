export type Priority = 'low' | 'med' | 'high';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  done: boolean;
  completedAt?: number;
  createdAt: number;
  dueDate?: string; // ISO yyyy-mm-dd
  priority: Priority;
  subtasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string; // accent color hex
  createdAt: number;
  deadline?: string; // ISO date
  tasks: Task[];
  archived?: boolean;
}

export interface Settings {
  theme: 'cloud' | 'dusk' | 'sand' | 'mint' | 'rose';
  font: 'inter' | 'serif' | 'mono' | 'round' | 'system';
  pomodoroWork: number; // minutes
  pomodoroBreak: number;
  reduceMotion: boolean;
}

export interface AppState {
  projects: Project[];
  settings: Settings;
  focusTaskId?: string | null;
  focusProjectId?: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'cloud',
  font: 'inter',
  pomodoroWork: 25,
  pomodoroBreak: 5,
  reduceMotion: false,
};
