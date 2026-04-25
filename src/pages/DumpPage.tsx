import { useRef, useState } from 'react';
import type { Store } from '../store';
import { Brain, Sparkle, Plus } from '../components/Icons';
import { parseDump } from '../utils/tasks';

interface Props { store: Store; goToProjects: () => void; }

const PLACEHOLDER = `# 🎨 Side Project
  Design landing page  !high  @+3d
    Pick a color palette
    Sketch hero section
  Set up domain  @tomorrow
  Email list
    Choose provider
    Write welcome email  !med

# 📚 Reading
  Finish current book  @+7d
  Take notes on chapter 4`;

export function DumpPage({ store, goToProjects }: Props) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseDump>>([]);
  const [showPreview, setShowPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Insert tab character on Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = ref.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;

      if (start === end) {
        const next = val.slice(0, start) + '\t' + val.slice(end);
        setText(next);
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
      } else {
        // Indent/dedent selection lines
        const before = val.slice(0, start);
        const after = val.slice(end);
        const lineStart = before.lastIndexOf('\n') + 1;
        const block = val.slice(lineStart, end);
        let updated: string;
        if (e.shiftKey) {
          updated = block.replace(/^(\t| {1,4})/gm, '');
        } else {
          updated = block.replace(/^/gm, '\t');
        }
        const next = val.slice(0, lineStart) + updated + after;
        setText(next);
        requestAnimationFrame(() => {
          ta.selectionStart = lineStart;
          ta.selectionEnd = lineStart + updated.length;
        });
      }
    }
  };

  const doPreview = () => {
    const parsed = parseDump(text);
    setPreview(parsed);
    setShowPreview(true);
  };

  const importAll = () => {
    const parsed = preview.length ? preview : parseDump(text);
    if (!parsed.length) {
      alert('Nothing to import. Add some text first!');
      return;
    }
    let count = 0;
    parsed.forEach(group => {
      const colors = ['#7c6cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899'];
      store.addProject({
        name: group.projectName,
        emoji: group.emoji,
        color: colors[Math.floor(Math.random() * colors.length)],
        tasks: group.tasks,
      });
      count++;
    });
    setText('');
    setPreview([]);
    setShowPreview(false);
    alert(`Created ${count} project${count === 1 ? '' : 's'} ✨`);
    goToProjects();
  };

  const totalTasksInPreview = preview.reduce((sum, g) => sum + countTasks(g.tasks), 0);

  return (
    <div className="cloud-bg min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: 'var(--ink-mute)' }}>Brain Dump</div>
            <h1 className="text-4xl font-semibold tracking-tight mt-1">Get it out of your head.</h1>
            <p className="text-sm mt-2 max-w-xl" style={{ color: 'var(--ink-soft)' }}>
              Type freely. Use <kbd className="chip">Tab</kbd> to indent for subtasks. Lines starting with <kbd className="chip">#</kbd> become projects.
            </p>
          </div>
          <Brain width={28} height={28} style={{ color: 'var(--accent)' }} />
        </div>

        <div className="card p-5">
          <textarea
            ref={ref}
            value={text}
            onChange={e => { setText(e.target.value); setShowPreview(false); }}
            onKeyDown={handleKey}
            placeholder={PLACEHOLDER}
            className="textarea"
            style={{ minHeight: 320, fontFamily: 'ui-monospace, monospace', fontSize: 13, lineHeight: 1.6 }}
            spellCheck={false}
          />

          <div className="flex flex-wrap gap-2 mt-4 items-center">
            <button onClick={doPreview} className="btn"><Sparkle width={14} height={14} /> Preview</button>
            <button onClick={importAll} className="btn btn-primary"><Plus /> Import to Projects</button>
            <button onClick={() => setText('')} className="btn btn-ghost">Clear</button>
            <button onClick={() => setText(PLACEHOLDER)} className="btn btn-ghost">Load example</button>
            <div className="ml-auto text-xs" style={{ color: 'var(--ink-mute)' }}>
              Tip: <code>!high !med !low</code> for priority · <code>@today @tomorrow @+5d @2026-01-15</code> for dates
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="card p-5 mt-5 fade-in">
            <div className="font-semibold mb-3">
              Preview · {preview.length} project{preview.length === 1 ? '' : 's'}, {totalTasksInPreview} task{totalTasksInPreview === 1 ? '' : 's'}
            </div>
            {preview.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--ink-mute)' }}>No content detected. Try writing something above.</div>
            ) : preview.map((group, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="font-medium flex items-center gap-2 mb-2">
                  <span className="text-xl">{group.emoji}</span> {group.projectName}
                </div>
                <div className="pl-4 border-l-2" style={{ borderColor: 'var(--line)' }}>
                  <RenderTasks tasks={group.tasks} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RenderTasks({ tasks }: { tasks: any[] }) {
  return (
    <div>
      {tasks.map((t: any) => (
        <div key={t.id} className="py-1">
          <div className="text-sm flex items-center gap-2">
            <span>•</span>
            <span>{t.title}</span>
            {t.priority && t.priority !== 'low' && <span className={`chip priority-${t.priority}`}>{t.priority}</span>}
            {t.dueDate && <span className="chip">{t.dueDate}</span>}
          </div>
          {t.subtasks?.length > 0 && (
            <div className="pl-5 border-l-2 ml-1.5" style={{ borderColor: 'var(--line)' }}>
              <RenderTasks tasks={t.subtasks} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function countTasks(tasks: any[]): number {
  return tasks.reduce((acc, t) => acc + 1 + countTasks(t.subtasks ?? []), 0);
}
