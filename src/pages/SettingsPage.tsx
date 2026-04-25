import { useRef } from 'react';
import type { Store } from '../store';
import { Download, Upload, Trash } from '../components/Icons';
import { DEFAULT_SETTINGS } from '../types';

interface Props { store: Store; }

const THEMES: { id: any; name: string; preview: string[] }[] = [
  { id: 'cloud', name: 'Cloud', preview: ['#f4f7fb', '#7c6cf6', '#1a2236'] },
  { id: 'dusk', name: 'Dusk', preview: ['#161826', '#9b8cff', '#ecedf5'] },
  { id: 'sand', name: 'Sand', preview: ['#faf6f0', '#c8814a', '#2a2418'] },
  { id: 'mint', name: 'Mint', preview: ['#f0f7f4', '#2fb392', '#122520'] },
  { id: 'rose', name: 'Rose', preview: ['#fbf4f6', '#d56a8e', '#2a1820'] },
];

const FONTS: { id: any; name: string; family: string }[] = [
  { id: 'inter', name: 'Inter (default)', family: 'Inter, sans-serif' },
  { id: 'system', name: 'System UI', family: '-apple-system, sans-serif' },
  { id: 'round', name: 'Nunito (rounded)', family: 'Nunito, sans-serif' },
  { id: 'serif', name: 'Lora (serif)', family: 'Lora, serif' },
  { id: 'mono', name: 'JetBrains Mono', family: 'JetBrains Mono, monospace' },
];

export function SettingsPage({ store }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drift-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.projects) throw new Error('Invalid file');
        if (!confirm('This will replace your current data. Continue?')) return;
        store.replaceAll({
          projects: parsed.projects,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
          focusTaskId: parsed.focusTaskId ?? null,
          focusProjectId: parsed.focusProjectId ?? null,
        });
        alert('Imported successfully ✨');
      } catch (e) {
        alert('Could not read file. Make sure it is a Drift JSON export.');
      }
    };
    reader.readAsText(file);
  };

  const wipe = () => {
    if (!confirm('Delete EVERYTHING? This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure?')) return;
    store.replaceAll({ projects: [], settings: DEFAULT_SETTINGS, focusProjectId: null, focusTaskId: null });
    alert('All data cleared.');
  };

  const s = store.state.settings;

  return (
    <div className="cloud-bg min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="text-sm uppercase tracking-[0.2em] font-semibold" style={{ color: 'var(--ink-mute)' }}>Customize</div>
          <h1 className="text-4xl font-semibold tracking-tight mt-1">Settings</h1>
        </div>

        <Section title="Theme" subtitle="Choose what feels good for your eyes today.">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => store.setSettings({ theme: t.id })}
                      className={`card p-4 text-left transition hover:scale-[1.02] ${s.theme === t.id ? 'ring-2' : ''}`}
                      style={{ '--tw-ring-color': 'var(--accent)' } as any}>
                <div className="flex gap-1.5 mb-3">
                  {t.preview.map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-lg" style={{ background: c, border: '1px solid rgba(0,0,0,0.05)' }} />
                  ))}
                </div>
                <div className="font-medium text-sm">{t.name}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Font" subtitle="Pick something easy to read.">
          <div className="space-y-2">
            {FONTS.map(f => (
              <button key={f.id} onClick={() => store.setSettings({ font: f.id })}
                      className={`card w-full p-4 text-left transition flex items-center justify-between ${s.font === f.id ? 'ring-2' : ''}`}
                      style={{ '--tw-ring-color': 'var(--accent)', fontFamily: f.family } as any}>
                <span>{f.name}</span>
                <span className="text-sm" style={{ color: 'var(--ink-mute)' }}>The quick brown fox jumps over the lazy dog 0123</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Pomodoro Timer" subtitle="Tweak your focus and break lengths.">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <label className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>Focus length (minutes)</label>
              <input type="number" min={1} max={120} className="input mt-2" value={s.pomodoroWork}
                     onChange={e => store.setSettings({ pomodoroWork: Math.max(1, Math.min(120, Number(e.target.value) || 25)) })} />
            </div>
            <div className="card p-4">
              <label className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>Break length (minutes)</label>
              <input type="number" min={1} max={60} className="input mt-2" value={s.pomodoroBreak}
                     onChange={e => store.setSettings({ pomodoroBreak: Math.max(1, Math.min(60, Number(e.target.value) || 5)) })} />
            </div>
          </div>
        </Section>

        <Section title="Data" subtitle="Your data lives in your browser. Export to back it up.">
          <div className="card p-5 flex flex-wrap gap-2">
            <button onClick={exportData} className="btn"><Download /> Export JSON</button>
            <button onClick={() => fileRef.current?.click()} className="btn"><Upload /> Import JSON</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden"
                   onChange={e => { const f = e.target.files?.[0]; if (f) importFile(f); e.target.value = ''; }} />
            <div className="flex-1" />
            <button onClick={wipe} className="btn btn-danger"><Trash /> Erase all data</button>
          </div>
        </Section>

        <div className="text-center text-xs mt-12 mb-4" style={{ color: 'var(--ink-mute)' }}>
          Drift · made gently for restless minds.
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}
