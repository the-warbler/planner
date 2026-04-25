export function startOfWeek(d: Date): Date {
  // Sunday = 0
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - out.getDay());
  return out;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const aa = new Date(a); aa.setHours(0,0,0,0);
  const bb = new Date(b); bb.setHours(0,0,0,0);
  return Math.round((bb.getTime() - aa.getTime()) / ms);
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  return daysBetween(new Date(), parseISO(iso));
}

export function formatRelative(iso?: string): string {
  if (!iso) return '';
  const n = daysUntil(iso);
  if (n === null) return '';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n < 0) return `${Math.abs(n)}d overdue`;
  if (n < 7) return `In ${n}d`;
  if (n < 30) return `In ${Math.round(n/7)}w`;
  return `In ${Math.round(n/30)}mo`;
}

export function formatNice(iso?: string): string {
  if (!iso) return '';
  const d = parseISO(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function weekLabel(start: Date): string {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const sm = start.toLocaleDateString(undefined, { month: 'short' });
  const em = end.toLocaleDateString(undefined, { month: 'short' });
  if (sameMonth) return `${sm} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  return `${sm} ${start.getDate()} – ${em} ${end.getDate()}, ${end.getFullYear()}`;
}
