import type { Task, Project } from '../types';

export function flattenTasks(tasks: Task[]): Task[] {
  const out: Task[] = [];
  const walk = (ts: Task[]) => {
    for (const t of ts) {
      out.push(t);
      if (t.subtasks?.length) walk(t.subtasks);
    }
  };
  walk(tasks);
  return out;
}

export function projectProgress(p: Project): { done: number; total: number; pct: number } {
  const flat = flattenTasks(p.tasks);
  const total = flat.length;
  const done = flat.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

export function findTask(p: Project, id: string): Task | null {
  for (const t of flattenTasks(p.tasks)) if (t.id === id) return t;
  return null;
}

/**
 * Parse indented text into a task tree.
 * First non-indented line of a block can be a project name (if starts with #) -> creates project.
 * Otherwise lines are tasks; deeper indentation = subtasks.
 * Tab or 2/4 spaces count as one level.
 *
 * Special inline tokens:
 *   !high !med !low  -> priority
 *   @YYYY-MM-DD      -> due date
 *   @today @tomorrow @+3d  -> relative dates
 */
export function parseDump(text: string): Array<{ projectName: string; emoji: string; tasks: Task[] }> {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (!lines.length) return [];

  // Determine indent unit (prefer tab; otherwise smallest non-zero leading space count)
  const usesTab = lines.some(l => /^\t/.test(l));
  let spaceUnit = 2;
  if (!usesTab) {
    const indents = lines.map(l => (l.match(/^ +/)?.[0].length ?? 0)).filter(n => n > 0);
    if (indents.length) spaceUnit = Math.min(...indents);
    if (spaceUnit < 2) spaceUnit = 2;
  }

  const indentOf = (l: string) => {
    const m = l.match(/^[\t ]+/);
    if (!m) return 0;
    const s = m[0];
    let level = 0;
    let i = 0;
    while (i < s.length) {
      if (s[i] === '\t') { level++; i++; }
      else {
        // count run of spaces of size spaceUnit
        let count = 0;
        while (i < s.length && s[i] === ' ') { count++; i++; }
        level += Math.max(1, Math.round(count / spaceUnit));
      }
    }
    return level;
  };

  const now = Date.now();
  const groups: Array<{ projectName: string; emoji: string; tasks: Task[] }> = [];
  let current: { projectName: string; emoji: string; tasks: Task[] } | null = null;
  // Stack of { task, level }
  const stack: Array<{ task: Task; level: number }> = [];

  const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  const parseLine = (raw: string): { title: string; priority: 'low' | 'med' | 'high'; dueDate?: string } => {
    let s = raw.trim().replace(/^[-*•]\s*/, '').replace(/^\[\s?\]\s*/, '');
    let priority: 'low' | 'med' | 'high' = 'low';
    let dueDate: string | undefined;

    s = s.replace(/!high\b/i, () => { priority = 'high'; return ''; })
         .replace(/!med(ium)?\b/i, () => { priority = 'med'; return ''; })
         .replace(/!low\b/i, () => { priority = 'low'; return ''; });

    s = s.replace(/@today\b/i, () => { const d = new Date(); dueDate = d.toISOString().slice(0,10); return ''; })
         .replace(/@tomorrow\b/i, () => { const d = new Date(); d.setDate(d.getDate()+1); dueDate = d.toISOString().slice(0,10); return ''; })
         .replace(/@\+(\d+)d\b/i, (_m, n) => { const d = new Date(); d.setDate(d.getDate()+Number(n)); dueDate = d.toISOString().slice(0,10); return ''; })
         .replace(/@(\d{4}-\d{2}-\d{2})\b/, (_m, iso) => { dueDate = iso; return ''; });

    return { title: s.trim().replace(/\s{2,}/g, ' '), priority, dueDate };
  };

  for (const raw of lines) {
    const level = indentOf(raw);
    const stripped = raw.trim();

    // Project header
    if (stripped.startsWith('#')) {
      let header = stripped.replace(/^#+\s*/, '');
      // Try to extract leading emoji
      const emojiMatch = header.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
      let emoji = '☁️';
      if (emojiMatch) {
        emoji = emojiMatch[0].trim();
        header = header.slice(emojiMatch[0].length);
      }
      current = { projectName: header.trim() || 'Untitled', emoji, tasks: [] };
      groups.push(current);
      stack.length = 0;
      continue;
    }

    if (!current) {
      current = { projectName: 'Brain Dump', emoji: '🧠', tasks: [] };
      groups.push(current);
    }

    const parsed = parseLine(raw);
    if (!parsed.title) continue;

    const task: Task = {
      id: newId(),
      title: parsed.title,
      done: false,
      createdAt: now,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      subtasks: [],
    };

    // Pop stack until we find parent at level - 1
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();

    if (stack.length === 0) {
      current.tasks.push(task);
    } else {
      stack[stack.length - 1].task.subtasks.push(task);
    }
    stack.push({ task, level });
  }

  return groups;
}
